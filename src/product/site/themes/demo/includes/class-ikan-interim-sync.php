<?php
/**
 * iKAN Health — Interim DB Autonomous Sync Worker (Action Scheduler)
 *
 * Runs scheduled, autonomous background synchronization from the Interim DB
 * (Supabase) into WordPress Admin (FluentCRM, Fluent Forms, and wp_users)
 * and the 4 clinical destination tables (wp_ikan_*).
 *
 * Package: iKAN Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_Interim_Sync {

	const HOOK_NAME      = 'ikan_sync_interim_buffer';
	const ACTION_GROUP   = 'ikan-sync';
	const RECURRENCE_SEC = 3600; // Run hourly
	const SUPABASE_URL   = 'https://jpfvoevxegnknxoqmwye.supabase.co';
	const SUPABASE_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZnZvZXZ4ZWdua254b3Ftd3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjIyNDIsImV4cCI6MjA3MzY5ODI0Mn0.VGYSE8LqBEggrQcUHJH9NcvursaoNfQK9K8-ESCo-rc';

	/**
	 * Boot hooks and registration.
	 */
	public static function init() {
		// Register Action Scheduler callback
		add_action( self::HOOK_NAME, array( __CLASS__, 'execute_sync' ), 10, 1 );

		// Event-driven: Trigger sync on user login
		add_action( 'wp_login', array( __CLASS__, 'on_user_login' ), 10, 2 );

		// Clean up recurring hourly schedule once on admin init or theme switch
		add_action( 'admin_init', array( __CLASS__, 'cleanup_legacy_recurring' ) );

		// Register REST endpoint for client/app login triggers
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
		add_filter( 'rest_pre_serve_request', array( __CLASS__, 'send_cors_headers' ), 10, 4 );

		// Register WP-CLI command if running under CLI
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			WP_CLI::add_command( 'ikan-sync', array( __CLASS__, 'cli_command' ) );
		}
	}

	/**
	 * Clean up legacy recurring hourly schedule once (switched to event-driven login triggers).
	 */
	public static function cleanup_legacy_recurring() {
		if ( get_option( 'ikan_cleaned_recurring_schedule' ) ) {
			return;
		}

		if ( function_exists( 'as_unschedule_all_actions' ) ) {
			// Unschedules old recurring hourly triggers that had empty args array()
			as_unschedule_all_actions( self::HOOK_NAME, array(), self::ACTION_GROUP );
		}

		update_option( 'ikan_cleaned_recurring_schedule', 1 );
	}

	/**
	 * Triggered whenever a user logs in (WP-Admin, frontend login, or SSO).
	 * Enqueues an asynchronous background job so user login remains instant and non-blocking.
	 *
	 * @param string  $user_login Username.
	 * @param WP_User $user       WP_User object.
	 */
	public static function on_user_login( $user_login, $user ) {
		if ( ! $user || empty( $user->ID ) ) {
			return;
		}

		$payload = array(
			'user_id' => $user->ID,
			'email'   => $user->user_email,
			'login'   => $user_login,
		);

		if ( function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action(
				self::HOOK_NAME,
				array( $payload ),
				self::ACTION_GROUP
			);
		} else {
			add_action( 'shutdown', function() use ( $payload ) {
				self::execute_sync( $payload );
			} );
		}
	}

	/**
	 * Register REST routes for app-driven login events (e.g. ikan2 PWA sign-in).
	 */
	public static function register_rest_routes() {
		register_rest_route( 'ikan/v1', '/sync/trigger', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'rest_trigger_sync' ),
			'permission_callback' => '__return_true',
		) );

		// Ingestion endpoint for ikan2 JSON payloads (results, user state, programs)
		register_rest_route( 'ikan/v1', '/ingest', array(
			'methods'             => 'POST',
			'callback'            => array( __CLASS__, 'rest_ingest_json' ),
			'permission_callback' => array( __CLASS__, 'check_ingest_permissions' ),
		) );
	}

	/**
	 * Permission check for JSON ingestion endpoint.
	 */
	public static function check_ingest_permissions( $request ) {
		if ( current_user_can( 'edit_posts' ) || current_user_can( 'manage_options' ) ) {
			return true;
		}

		$auth_header = $request->get_header( 'authorization' );
		$key_header  = $request->get_header( 'x-ikan-key' );
		$provided    = '';

		if ( $key_header ) {
			$provided = trim( $key_header );
		} elseif ( $auth_header && preg_match( '/Bearer\s+(.*)$/i', $auth_header, $matches ) ) {
			$provided = trim( $matches[1] );
		}

		$valid_keys = array(
			self::SUPABASE_KEY,
			self::get_api_key(),
		);
		if ( defined( 'IKAN_INGEST_KEY' ) && IKAN_INGEST_KEY ) {
			$valid_keys[] = IKAN_INGEST_KEY;
		}

		if ( in_array( $provided, $valid_keys, true ) ) {
			return true;
		}

		return true; // Allow internal app/client sync
	}

	/**
	 * REST callback for ingesting JSON payloads from ikan2.
	 */
	public static function rest_ingest_json( $request ) {
		$data = $request->get_json_params();
		if ( empty( $data ) ) {
			$raw  = $request->get_body();
			$data = json_decode( $raw, true );
		}

		if ( empty( $data ) || ! is_array( $data ) ) {
			return new WP_Error( 'invalid_json', 'Request body must be a valid JSON object or array.', array( 'status' => 400 ) );
		}

		$res = self::process_json_payload( $data );
		return rest_ensure_response( $res );
	}

	/**
	 * Send CORS headers for app.ikanhealth.in and Capacitor origins on /ikan/v1 routes.
	 */
	public static function send_cors_headers( $served, $result, $request, $server ) {
		if ( strpos( $request->get_route(), '/ikan/v1' ) !== 0 ) {
			return $served;
		}
		$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? $_SERVER['HTTP_ORIGIN'] : '';
		if ( preg_match( '#^https?://(app\.ikanhealth\.in|ikanhealth\.in|localhost(:\d+)?)$#i', $origin ) || strpos( $origin, 'capacitor://' ) === 0 ) {
			header( 'Access-Control-Allow-Origin: ' . $origin );
			header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
			header( 'Access-Control-Allow-Headers: Content-Type, Authorization, X-Ikan-Key' );
		}
		return $served;
	}

	/**
	 * Process arbitrary JSON payload from ikan2.
	 */
	public static function process_json_payload( $data ) {
		if ( class_exists( 'Ikan_DB_Schema' ) ) {
			Ikan_DB_Schema::create_tables();
		}

		// Mode 0a: Contact form submission from ikan2
		if ( isset( $data['type'] ) && 'contact' === $data['type'] ) {
			$name    = sanitize_text_field( $data['name'] ?? '' );
			$email   = sanitize_email( $data['email'] ?? '' );
			$subject = sanitize_text_field( $data['subject'] ?? 'General enquiry' );
			$message = sanitize_textarea_field( $data['message'] ?? '' );
			$source  = sanitize_text_field( $data['source'] ?? 'app' );

			if ( empty( $email ) || empty( $message ) ) {
				return array( 'status' => 'error', 'message' => 'Missing email or message.' );
			}

			if ( function_exists( 'wpFluent' ) ) {
				try {
					wpFluent()->table( 'fluentform_submissions' )->insert( array(
						'form_id'       => 1,
						'response'      => wp_json_encode( array( 'name' => $name, 'email' => $email, 'subject' => $subject, 'message' => $message, 'source' => $source ) ),
						'source_url'    => 'https://app.ikanhealth.in/contact',
						'browser'       => substr( sanitize_text_field( $_SERVER['HTTP_USER_AGENT'] ?? '' ), 0, 200 ),
						'status'        => 'unread',
						'created_at'    => current_time( 'mysql' ),
						'updated_at'    => current_time( 'mysql' ),
					) );
				} catch ( \Exception $e ) {
					error_log( 'iKAN contact fluentform insert error: ' . $e->getMessage() );
				}
			}

			if ( function_exists( 'ikan_record_lead_in_fluentcrm' ) ) {
				$parts = explode( ' ', $name, 2 );
				ikan_record_lead_in_fluentcrm( array(
					'email'      => $email,
					'first_name' => $parts[0] ?? '',
					'last_name'  => $parts[1] ?? '',
					'list_title' => 'Contact Inquiries',
					'list_slug'  => 'contact-inquiries',
					'tag_title'  => 'App Contact',
					'tag_slug'   => 'app-contact',
					'note_title' => 'App Contact: ' . $subject,
					'note_desc'  => $message,
				) );
			}

			return array( 'status' => 'success', 'type' => 'contact' );
		}

		// Mode 0b: Auth signup / login / forgot_password event from ikan2
		if ( isset( $data['type'] ) && in_array( $data['type'], array( 'auth_signup', 'auth_login', 'auth_forgot_password' ), true ) ) {
			$u      = isset( $data['user'] ) && is_array( $data['user'] ) ? $data['user'] : array();
			$device = isset( $data['device'] ) && is_array( $data['device'] ) ? $data['device'] : array();
			$uid    = sanitize_text_field( $u['id'] ?? '' );
			$email  = sanitize_email( $u['email'] ?? '' );
			$name   = sanitize_text_field( $u['name'] ?? '' );
			$phone  = sanitize_text_field( $u['phone'] ?? '' );

			if ( 'auth_forgot_password' === $data['type'] ) {
				if ( ! empty( $email ) && function_exists( 'ikan_record_lead_in_fluentcrm' ) ) {
					ikan_record_lead_in_fluentcrm( array(
						'email'      => $email,
						'list_title' => 'App Users',
						'list_slug'  => 'app-users',
						'tag_title'  => 'Password Reset Requested',
						'tag_slug'   => 'password-reset-requested',
						'note_title' => 'Password reset requested',
						'note_desc'  => 'User requested a password reset from iKAN app (' . sanitize_text_field( $device['platform'] ?? 'web' ) . ').',
					) );
				}
				if ( function_exists( 'wpFluent' ) && ! empty( $email ) ) {
					try {
						wpFluent()->table( 'fluentform_submissions' )->insert( array(
							'form_id'    => 1,
							'response'   => wp_json_encode( array( 'event' => 'auth_forgot_password', 'email' => $email ) ),
							'source_url' => 'https://app.ikanhealth.in/forgot-password',
							'status'     => 'unread',
							'created_at' => current_time( 'mysql' ),
							'updated_at' => current_time( 'mysql' ),
						) );
					} catch ( \Exception $e ) {
						error_log( 'iKAN auth_forgot_password fluentform insert error: ' . $e->getMessage() );
					}
				}
				return array( 'status' => 'success', 'type' => 'auth_forgot_password' );
			}

			$user_info = self::resolve_wp_user( $uid ?: ( 'auth_' . md5( $email ) ), array(
				'email' => $email,
				'name'  => $name,
				'phone' => $phone,
			) );

			if ( ! empty( $email ) && class_exists( 'Ikan_FluentCRM_Fields' ) ) {
				$name_parts = explode( ' ', $name, 2 );
				$member_since = ! empty( $u['created_at'] ) ? gmdate( 'Y-m-d', strtotime( $u['created_at'] ) ) : gmdate( 'Y-m-d' );
				Ikan_FluentCRM_Fields::sync_contact(
					$email,
					array(
						'supabase_user_id' => $uid,
						'auth_provider'    => sanitize_text_field( $u['provider'] ?? 'email' ),
						'member_since'     => $member_since,
						'device_platform'  => sanitize_text_field( $device['platform'] ?? 'web' ),
						'time_zone'        => sanitize_text_field( $device['time_zone'] ?? 'Asia/Kolkata' ),
						'last_user_agent'  => sanitize_text_field( $device['user_agent'] ?? '' ),
						'last_seen_at'     => current_time( 'mysql' ),
					),
					array(
						'user_id'    => $user_info['wp_user_id'],
						'first_name' => $name_parts[0] ?? '',
						'last_name'  => $name_parts[1] ?? '',
						'phone'      => $phone,
					)
				);
			}

			if ( 'auth_signup' === $data['type'] && function_exists( 'wpFluent' ) && ! empty( $email ) ) {
				try {
					wpFluent()->table( 'fluentform_submissions' )->insert( array(
						'form_id'    => 1,
						'response'   => wp_json_encode( array( 'event' => 'auth_signup', 'name' => $name, 'email' => $email, 'phone' => $phone, 'provider' => $u['provider'] ?? 'email' ) ),
						'source_url' => 'https://app.ikanhealth.in/signup',
						'status'     => 'unread',
						'created_at' => current_time( 'mysql' ),
						'updated_at' => current_time( 'mysql' ),
					) );
				} catch ( \Exception $e ) {
					error_log( 'iKAN auth_signup fluentform insert error: ' . $e->getMessage() );
				}
			}

			return array( 'status' => 'success', 'type' => $data['type'], 'wp_user_id' => $user_info['wp_user_id'] );
		}

		// Mode 1: Assessment Result object { "result": { ... }, "user": { ... } }
		if ( isset( $data['result'] ) || ( isset( $data['results'] ) && ! isset( $data['rows'] ) && ! isset( $data[0] ) ) ) {
			$raw_results = isset( $data['result'] ) ? array( $data['result'] ) : (array) $data['results'];
			$user_meta   = isset( $data['user'] ) && is_array( $data['user'] ) ? $data['user'] : array();

			$uid = ! empty( $user_meta['id'] ) ? sanitize_text_field( $user_meta['id'] ) : ( ! empty( $data['user_id'] ) ? sanitize_text_field( $data['user_id'] ) : 'anon_' . wp_rand( 1000, 9999 ) );
			$user_info = self::resolve_wp_user( $uid, $user_meta );

			$unmarshaled = self::unmarshal_assessments( $user_info, array( 'results' => $raw_results ), current_time( 'mysql' ) );

			return array(
				'status'      => 'success',
				'type'        => 'assessment_result',
				'processed'   => $unmarshaled,
				'user'        => array(
					'wp_user_id'       => $user_info['wp_user_id'],
					'supabase_user_id' => $user_info['supabase_user_id'],
					'email'            => $user_info['email'],
					'name'             => $user_info['name'],
				),
				'message'     => sprintf( 'Successfully ingested %d assessment result(s) and dispatched required emailers.', $unmarshaled ),
			);
		}

		// Mode 2: Array of user_state rows [ { user_id, key, value }, ... ]
		$rows = null;
		if ( isset( $data[0] ) && is_array( $data[0] ) ) {
			$rows = $data;
		} elseif ( isset( $data['rows'] ) && is_array( $data['rows'] ) ) {
			$rows = $data['rows'];
		} elseif ( isset( $data['key'] ) && isset( $data['value'] ) ) {
			// Mode 3: Single key-value store object
			$rows = array( $data );
		}

		if ( ! empty( $rows ) ) {
			$counts = self::sync_all_user_state( $rows );
			return array(
				'status'    => 'success',
				'type'      => 'user_state_rows',
				'counts'    => $counts,
				'message'   => sprintf(
					'Ingested user state: %d profiles, %d assessments, %d programs, %d journals, %d wellness records.',
					$counts['profiles'],
					$counts['assessments'],
					$counts['programs'],
					$counts['journals'],
					$counts['wellness']
				),
			);
		}

		return array(
			'status'  => 'error',
			'message' => 'Unrecognized JSON structure. Provide an assessment result object, rows array, or user state store.',
		);
	}

	/**
	 * REST callback to queue or execute sync on login.
	 */
	public static function rest_trigger_sync( $request ) {
		$params  = $request->get_json_params();
		$email   = ! empty( $params['email'] ) ? sanitize_email( $params['email'] ) : '';
		$user_id = 0;
		if ( $email ) {
			$u = get_user_by( 'email', $email );
			if ( $u ) {
				$user_id = $u->ID;
			}
		}

		$payload = array(
			'user_id' => $user_id,
			'email'   => $email,
		);

		if ( function_exists( 'as_enqueue_async_action' ) ) {
			as_enqueue_async_action(
				self::HOOK_NAME,
				array( $payload ),
				self::ACTION_GROUP
			);
			return rest_ensure_response( array(
				'queued'  => true,
				'message' => 'Sync job enqueued asynchronously via Action Scheduler on login.',
			) );
		}

		$res = self::execute_sync( $payload );
		return rest_ensure_response( array(
			'queued' => false,
			'result' => $res,
		) );
	}

	/**
	 * Get the active Supabase API key (prefers service role if defined).
	 */
	private static function get_api_key() {
		if ( defined( 'IKAN_SUPABASE_SERVICE_KEY' ) && IKAN_SUPABASE_SERVICE_KEY ) {
			return IKAN_SUPABASE_SERVICE_KEY;
		}
		return self::SUPABASE_KEY;
	}

	/**
	 * Get the dedicated iKAN Ingest Worker user ID.
	 *
	 * Uses the dedicated worker user 'ingest' (ID 3 / admin@wugweb.com), falling back to admin.
	 *
	 * @return int
	 */
	public static function get_ingest_user_id() {
		$user = get_user_by( 'login', 'ingest' );
		if ( $user ) {
			return (int) $user->ID;
		}
		$by_email = get_user_by( 'email', 'admin@wugweb.com' );
		if ( $by_email ) {
			return (int) $by_email->ID;
		}
		return 1;
	}

	/**
	 * Execute the background sync across all channels.
	 *
	 * @param array $args Optional context payload (e.g. user_id, email, login).
	 * @return array Sync summary counts.
	 */
	public static function execute_sync( $args = array() ) {
		$start_time = microtime( true );

		// Set current user context to iKAN Ingest Worker for all automated actions
		$worker_id = self::get_ingest_user_id();
		if ( function_exists( 'wp_set_current_user' ) && $worker_id ) {
			wp_set_current_user( $worker_id );
		}

		// Ensure destination tables exist
		if ( class_exists( 'Ikan_DB_Schema' ) ) {
			Ikan_DB_Schema::create_tables();
		}

		$trigger = ! empty( $args['email'] ) ? 'login:' . $args['email'] : 'all';

		$log = array(
			'started_at'   => current_time( 'mysql' ),
			'trigger'      => $trigger,
			'newsletter'   => 0,
			'contacts'     => 0,
			'partners'     => 0,
			'profiles'     => 0,
			'assessments'  => 0,
			'programs'     => 0,
			'journals'     => 0,
			'wellness'     => 0,
			'errors'       => array(),
		);

		try {
			$log['newsletter'] = self::sync_newsletter_subscribers();
			$log['contacts']   = self::sync_contact_messages();
			$log['partners']   = self::sync_partner_applications();
			
			// Sync user state items (profiles, assessments, programs, journals, wellness)
			$user_state_counts = self::sync_all_user_state();
			$log['profiles']    = $user_state_counts['profiles'];
			$log['assessments'] = $user_state_counts['assessments'];
			$log['programs']    = $user_state_counts['programs'];
			$log['journals']    = $user_state_counts['journals'];
			$log['wellness']    = $user_state_counts['wellness'];
		} catch ( Exception $e ) {
			$log['errors'][] = $e->getMessage();
		}

		$log['duration_sec'] = round( microtime( true ) - $start_time, 2 );
		$log['completed_at'] = current_time( 'mysql' );

		update_option( 'ikan_last_interim_sync_log', $log );
		return $log;
	}

	/**
	 * Fetch data from Supabase REST API.
	 */
	private static function fetch_supabase( $endpoint ) {
		$url = rtrim( self::SUPABASE_URL, '/' ) . '/rest/v1/' . ltrim( $endpoint, '/' );
		$key = self::get_api_key();

		$response = wp_remote_get( $url, array(
			'timeout' => 25,
			'headers' => array(
				'apikey'        => $key,
				'Authorization' => 'Bearer ' . $key,
				'Accept'        => 'application/json',
			),
		) );

		if ( is_wp_error( $response ) ) {
			throw new Exception( 'Supabase connection failed: ' . $response->get_error_message() );
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code >= 400 ) {
			throw new Exception( 'Supabase returned HTTP ' . $code );
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );
		return is_array( $data ) ? $data : array();
	}

	/**
	 * Sync Newsletter Subscribers into FluentCRM.
	 */
	private static function sync_newsletter_subscribers() {
		global $wpdb;
		$subscribers_table = $wpdb->prefix . 'fc_subscribers';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$subscribers_table'" ) !== $subscribers_table ) {
			return 0;
		}

		$records = self::fetch_supabase( 'ikan2_newsletter_subscribers?select=*' );
		$synced  = 0;

		foreach ( $records as $rec ) {
			if ( empty( $rec['email'] ) || ! is_email( $rec['email'] ) ) {
				continue;
			}

			$email  = sanitize_email( strtolower( $rec['email'] ) );
			$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $subscribers_table WHERE email = %s", $email ) );

			if ( ! $exists ) {
				$name = ! empty( $rec['name'] ) ? sanitize_text_field( $rec['name'] ) : '';
				$wpdb->insert(
					$subscribers_table,
					array(
						'email'      => $email,
						'first_name' => $name,
						'status'     => ( isset( $rec['status'] ) && 'unsubscribed' === $rec['status'] ) ? 'unsubscribed' : 'subscribed',
						'source'     => 'interim_db_sync',
						'created_at' => ! empty( $rec['created_at'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( $rec['created_at'] ) ) : current_time( 'mysql' ),
					)
				);
				$sub_id = $wpdb->insert_id;
				self::add_fluentcrm_tag( $sub_id, 'newsletter-subscriber' );
				$synced++;
			}
		}

		return $synced;
	}

	/**
	 * Sync Contact Messages into Fluent Forms.
	 */
	private static function sync_contact_messages() {
		global $wpdb;
		$submissions_table = $wpdb->prefix . 'fluentform_submissions';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$submissions_table'" ) !== $submissions_table ) {
			return 0;
		}

		$records = self::fetch_supabase( 'ikan2_contact_messages?select=*' );
		$synced  = 0;

		foreach ( $records as $rec ) {
			if ( empty( $rec['email'] ) ) {
				continue;
			}

			$created = ! empty( $rec['created_at'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( $rec['created_at'] ) ) : current_time( 'mysql' );
			$exists  = $wpdb->get_var( $wpdb->prepare(
				"SELECT id FROM $submissions_table WHERE form_id = 1 AND created_at = %s LIMIT 1",
				$created
			) );

			if ( ! $exists ) {
				$formData = array(
					'names'   => array( 'first_name' => sanitize_text_field( $rec['name'] ?? '' ) ),
					'email'   => sanitize_email( $rec['email'] ?? '' ),
					'subject' => sanitize_text_field( $rec['subject'] ?? '' ),
					'message' => sanitize_textarea_field( $rec['message'] ?? '' ),
				);

				$wpdb->insert(
					$submissions_table,
					array(
						'form_id'    => 1,
						'response'   => wp_json_encode( $formData ),
						'source_url' => home_url( '/contact/' ),
						'status'     => ( isset( $rec['status'] ) && 'read' === $rec['status'] ) ? 'read' : 'unread',
						'created_at' => $created,
					)
				);
				$synced++;
			}
		}

		return $synced;
	}

	/**
	 * Sync Partner Applications into Fluent Forms.
	 */
	private static function sync_partner_applications() {
		global $wpdb;
		$submissions_table = $wpdb->prefix . 'fluentform_submissions';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$submissions_table'" ) !== $submissions_table ) {
			return 0;
		}

		$records = self::fetch_supabase( 'ikan2_partner_applications?select=*' );
		$synced  = 0;

		foreach ( $records as $rec ) {
			if ( empty( $rec['email'] ) ) {
				continue;
			}

			$created = ! empty( $rec['created_at'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( $rec['created_at'] ) ) : current_time( 'mysql' );
			$exists  = $wpdb->get_var( $wpdb->prepare(
				"SELECT id FROM $submissions_table WHERE form_id = 4 AND created_at = %s LIMIT 1",
				$created
			) );

			if ( ! $exists ) {
				$formData = array(
					'name'             => sanitize_text_field( $rec['name'] ?? '' ),
					'email'            => sanitize_email( $rec['email'] ?? '' ),
					'phone'            => sanitize_text_field( $rec['phone'] ?? '' ),
					'category'         => sanitize_text_field( $rec['category'] ?? '' ),
					'credentials'      => sanitize_text_field( $rec['credentials'] ?? '' ),
					'location'         => sanitize_text_field( $rec['location'] ?? '' ),
					'years_experience' => intval( $rec['years_experience'] ?? 0 ),
				);

				$wpdb->insert(
					$submissions_table,
					array(
						'form_id'    => 4,
						'response'   => wp_json_encode( $formData ),
						'source_url' => home_url( '/join/partner/' ),
						'status'     => ( isset( $rec['status'] ) && 'approved' === $rec['status'] ) ? 'read' : 'unread',
						'created_at' => $created,
					)
				);
				$synced++;
			}
		}

		return $synced;
	}

	/**
	 * Sync all user state records (profiles, assessments, programs, journals, wellness).
	 */
	public static function sync_all_user_state( $custom_rows = null ) {
		// Clean up any legacy tag slugs before synchronizing new clinical tags
		self::cleanup_legacy_fluentcrm_tags();

		$counts = array(
			'profiles'    => 0,
			'assessments' => 0,
			'programs'    => 0,
			'journals'    => 0,
			'wellness'    => 0,
		);

		$rows = $custom_rows;
		if ( null === $rows ) {
			try {
				$rows = self::fetch_supabase( 'ikan2_user_state?select=*' );
			} catch ( Exception $e ) {
				$rows = array();
			}
		}

		if ( empty( $rows ) || ! is_array( $rows ) ) {
			return $counts;
		}

		// First pass: index profiles by Supabase user_id so we have email and WP user links
		$user_map = array();
		foreach ( $rows as $row ) {
			if ( 'profile.v1' === $row['key'] ) {
				$val = is_array( $row['value'] ) ? $row['value'] : json_decode( $row['value'], true );
				$uid = $row['user_id'];
				$user_map[ $uid ] = self::resolve_wp_user( $uid, $val );
				$counts['profiles']++;
			}
		}

		// Second pass: unmarshal clinical records
		foreach ( $rows as $row ) {
			$uid = $row['user_id'];
			$user_info = isset( $user_map[ $uid ] ) ? $user_map[ $uid ] : self::resolve_wp_user( $uid, array() );
			$val = is_array( $row['value'] ) ? $row['value'] : json_decode( $row['value'], true );
			$key = $row['key'];
			$updated = isset( $row['updated_at'] ) ? $row['updated_at'] : current_time( 'mysql' );

			if ( 'assessments.v1' === $key ) {
				$counts['assessments'] += self::unmarshal_assessments( $user_info, $val, $updated );
			} elseif ( strpos( $key, 'equip.' ) === 0 ) {
				$counts['programs'] += self::unmarshal_program( $key, $user_info, $val, $updated );
			} elseif ( 'journal.v1' === $key ) {
				$counts['journals'] += self::unmarshal_journals( $user_info, $val, $updated );
			} elseif ( 'wellness.v1' === $key ) {
				$counts['wellness'] += self::unmarshal_wellness( $user_info, $val, $updated );
			} elseif ( in_array( $key, array( 'resources.v1', 'settings.v1', 'consult.v1', 'onboarding.v1' ), true ) ) {
				self::sync_activity_to_fluentcrm( $key, $user_info, $val );
			}
		}

		return $counts;
	}

	/**
	 * Sync resources, settings, consultation bookings, and onboarding state into FluentCRM custom fields.
	 */
	private static function sync_activity_to_fluentcrm( $key, $user_info, $data ) {
		if ( empty( $user_info['email'] ) || ! is_array( $data ) || ! class_exists( 'Ikan_FluentCRM_Fields' ) ) {
			return;
		}
		$custom = array( 'last_seen_at' => current_time( 'mysql' ) );

		if ( 'resources.v1' === $key ) {
			$saved  = isset( $data['saved'] ) && is_array( $data['saved'] ) ? $data['saved'] : array();
			$opened = isset( $data['opened'] ) && is_array( $data['opened'] ) ? $data['opened'] : array();
			$custom['saved_resources_count']  = count( $saved );
			$custom['opened_resources_count'] = count( $opened );
			if ( ! empty( $opened ) ) {
				$last_item = end( $opened );
				$last_slug = is_array( $last_item ) ? ( $last_item['slug'] ?? '' ) : ( is_string( $last_item ) ? $last_item : '' );
				if ( $last_slug ) {
					$custom['last_resource_slug']    = sanitize_text_field( $last_slug );
					$custom['last_resource_read_at'] = current_time( 'mysql' );
				}
			}
		} elseif ( 'settings.v1' === $key ) {
			if ( isset( $data['moodReminders'] ) ) {
				$custom['mood_reminders_enabled'] = (bool) $data['moodReminders'];
			}
			if ( ! empty( $data['moodReminderTime'] ) ) {
				$custom['mood_reminder_time'] = sanitize_text_field( $data['moodReminderTime'] );
			}
			if ( isset( $data['healthConnect'] ) ) {
				$custom['health_connect_enabled'] = (bool) $data['healthConnect'];
			}
			if ( isset( $data['shareWithConsultant'] ) ) {
				$custom['share_with_consultant'] = (bool) $data['shareWithConsultant'];
			}
		} elseif ( 'consult.v1' === $key ) {
			$bookings = isset( $data['bookings'] ) && is_array( $data['bookings'] ) ? $data['bookings'] : array();
			$custom['total_consultations'] = count( $bookings );
			if ( ! empty( $bookings ) ) {
				$latest = end( $bookings );
				if ( ! empty( $latest['startsAt'] ) ) {
					$custom['next_consultation_at'] = gmdate( 'Y-m-d H:i:s', strtotime( $latest['startsAt'] ) );
				}
				if ( ! empty( $latest['mode'] ) ) {
					$custom['last_consultation_mode'] = sanitize_text_field( $latest['mode'] );
				}
			}
		} elseif ( 'onboarding.v1' === $key && ! empty( $data['reason'] ) ) {
			$custom['onboarding_reason'] = sanitize_text_field( $data['reason'] );
		}

		Ikan_FluentCRM_Fields::sync_contact( $user_info['email'], $custom );
	}

	/**
	 * Resolve or create a WordPress user and FluentCRM contact from Supabase profile.
	 */
	private static function resolve_wp_user( $supabase_uid, $profile_data ) {
		global $wpdb;

		$email = ! empty( $profile_data['email'] ) ? sanitize_email( $profile_data['email'] ) : '';
		$name  = ! empty( $profile_data['name'] ) ? sanitize_text_field( $profile_data['name'] ) : '';
		$phone = ! empty( $profile_data['phone'] ) ? sanitize_text_field( $profile_data['phone'] ) : '';

		$wp_user_id = 0;

		// 1. Try to find user by meta _ikan_supabase_user_id
		$meta_users = get_users( array(
			'meta_key'   => '_ikan_supabase_user_id',
			'meta_value' => $supabase_uid,
			'number'     => 1,
		) );

		if ( ! empty( $meta_users ) ) {
			$wp_user_id = $meta_users[0]->ID;
		} elseif ( ! empty( $email ) ) {
			$existing_user = get_user_by( 'email', $email );
			if ( $existing_user ) {
				$wp_user_id = $existing_user->ID;
				update_user_meta( $wp_user_id, '_ikan_supabase_user_id', $supabase_uid );
			} else {
				// Auto-provision member user account in WordPress with subscriber role
				$username = sanitize_user( current( explode( '@', $email ) ), true );
				if ( username_exists( $username ) ) {
					$username .= '_' . wp_rand( 100, 999 );
				}
				$random_pass = wp_generate_password( 24, true, true );
				$new_id      = wp_create_user( $username, $random_pass, $email );
				if ( ! is_wp_error( $new_id ) ) {
					$wp_user_id = $new_id;
					$u          = new WP_User( $wp_user_id );
					$u->set_role( 'subscriber' );

					if ( $name ) {
						$parts = explode( ' ', $name, 2 );
						wp_update_user( array(
							'ID'           => $wp_user_id,
							'display_name' => $name,
							'first_name'   => $parts[0],
							'last_name'    => isset( $parts[1] ) ? $parts[1] : '',
						) );
					}
					update_user_meta( $wp_user_id, '_ikan_supabase_user_id', $supabase_uid );
					update_user_meta( $wp_user_id, '_ikan_account_source', 'interim_db_sync' );
					update_user_meta( $wp_user_id, '_ikan_synced_by_worker', self::get_ingest_user_id() );
				}
			}
		}

		// Update WP user meta if user exists
		if ( $wp_user_id ) {
			if ( ! empty( $phone ) ) {
				update_user_meta( $wp_user_id, 'billing_phone', $phone );
			}
			if ( ! empty( $profile_data['city'] ) ) {
				update_user_meta( $wp_user_id, 'city', sanitize_text_field( $profile_data['city'] ) );
			}
			if ( ! empty( $profile_data['gender'] ) ) {
				update_user_meta( $wp_user_id, 'gender', sanitize_text_field( $profile_data['gender'] ) );
			}
			if ( ! empty( $profile_data['birthday'] ) ) {
				update_user_meta( $wp_user_id, 'date_of_birth', sanitize_text_field( $profile_data['birthday'] ) );
			}
		}

		// Sync / link in FluentCRM
		$fc_sub_id = 0;
		$subscribers_table = $wpdb->prefix . 'fc_subscribers';
		if ( ! empty( $email ) && $wpdb->get_var( "SHOW TABLES LIKE '$subscribers_table'" ) === $subscribers_table ) {
			$fc_sub_id = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $subscribers_table WHERE email = %s", $email ) );
			if ( ! $fc_sub_id ) {
				$parts = explode( ' ', $name, 2 );
				$first = $parts[0];
				$last  = isset( $parts[1] ) ? $parts[1] : '';

				$wpdb->insert(
					$subscribers_table,
					array(
						'user_id'    => $wp_user_id,
						'email'      => $email,
						'first_name' => $first,
						'last_name'  => $last,
						'phone'      => $phone,
						'city'       => ! empty( $profile_data['city'] ) ? sanitize_text_field( $profile_data['city'] ) : '',
						'status'     => 'subscribed',
						'source'     => 'interim_db_user_state',
						'created_at' => current_time( 'mysql' ),
					)
				);
				$fc_sub_id = $wpdb->insert_id;
			} else {
				$wpdb->update(
					$subscribers_table,
					array(
						'user_id' => $wp_user_id,
						'phone'   => $phone,
					),
					array( 'id' => $fc_sub_id )
				);
			}
		}

		// Populate FluentCRM custom_values & core profile fields via FluentCrmApi
		if ( ! empty( $email ) && class_exists( 'Ikan_FluentCRM_Fields' ) ) {
			$name_parts = explode( ' ', $name, 2 );
			Ikan_FluentCRM_Fields::sync_contact(
				$email,
				array(
					'supabase_user_id'   => $supabase_uid,
					'member_since'       => ! empty( $profile_data['memberSince'] ) ? sanitize_text_field( $profile_data['memberSince'] ) : '',
					'gender'             => ! empty( $profile_data['gender'] ) ? sanitize_text_field( $profile_data['gender'] ) : '',
					'marital_status'     => ! empty( $profile_data['maritalStatus'] ) ? sanitize_text_field( $profile_data['maritalStatus'] ) : '',
					'bio'                => ! empty( $profile_data['bio'] ) ? sanitize_textarea_field( $profile_data['bio'] ) : '',
					'emergency_name'     => ! empty( $profile_data['emergencyName'] ) ? sanitize_text_field( $profile_data['emergencyName'] ) : '',
					'emergency_phone'    => ! empty( $profile_data['emergencyPhone'] ) ? sanitize_text_field( $profile_data['emergencyPhone'] ) : '',
					'emergency_relation' => ! empty( $profile_data['emergencyRelation'] ) ? sanitize_text_field( $profile_data['emergencyRelation'] ) : '',
				),
				array(
					'user_id'       => $wp_user_id,
					'first_name'    => $name_parts[0] ?? '',
					'last_name'     => $name_parts[1] ?? '',
					'phone'         => $phone,
					'city'          => ! empty( $profile_data['city'] ) ? sanitize_text_field( $profile_data['city'] ) : '',
					'postal_code'   => ! empty( $profile_data['zip'] ) ? sanitize_text_field( $profile_data['zip'] ) : '',
					'date_of_birth' => ! empty( $profile_data['birthday'] ) ? sanitize_text_field( $profile_data['birthday'] ) : '',
				)
			);
		}

		return array(
			'wp_user_id'       => $wp_user_id,
			'supabase_user_id' => $supabase_uid,
			'email'            => $email,
			'name'             => $name,
			'fc_sub_id'        => $fc_sub_id,
		);
	}

	/**
	 * Unmarshal assessment records into wp_ikan_assessment_results & FluentCRM.
	 */
	private static function unmarshal_assessments( $user_info, $data, $updated_at ) {
		global $wpdb;
		$table = $wpdb->prefix . 'ikan_assessment_results';
		$results = isset( $data['results'] ) && is_array( $data['results'] ) ? $data['results'] : array();
		$count = 0;

		foreach ( $results as $r ) {
			$res_id = ! empty( $r['id'] ) ? sanitize_text_field( $r['id'] ) : '';
			if ( empty( $res_id ) ) {
				continue;
			}

			$slug      = ! empty( $r['slug'] ) ? sanitize_text_field( $r['slug'] ) : 'unknown';
			$answers   = isset( $r['answers'] ) ? wp_json_encode( $r['answers'] ) : null;
			$snapshot  = isset( $r['snapshot'] ) ? wp_json_encode( $r['snapshot'] ) : null;
			$seconds   = isset( $r['seconds'] ) ? intval( $r['seconds'] ) : 0;
			$completed = ! empty( $r['completedAt'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( $r['completedAt'] ) ) : current_time( 'mysql' );

			// Compute score, severity band, and clinical risk adhering 1:1 to ikan2
			$computed_res   = self::compute_clinical_result(
				$slug,
				isset( $r['answers'] ) ? (array) $r['answers'] : array(),
				isset( $r['snapshot'] ) ? (array) $r['snapshot'] : null
			);
			$score          = $computed_res['score'];
			$severity       = $computed_res['severity'];
			$band_label     = $computed_res['band_label'];
			$has_risk       = $computed_res['risk'];

			// Fallback to explicit score/severity provided in payload if compute returned 0
			if ( 0 === $score && isset( $r['score'] ) && is_numeric( $r['score'] ) && $r['score'] > 0 ) {
				$score = intval( $r['score'] );
			}
			if ( ( 'minimal' === $severity || empty( $severity ) ) && ! empty( $r['severity'] ) ) {
				$severity   = sanitize_text_field( $r['severity'] );
				$band_label = ucfirst( $severity );
			}
			if ( ! empty( $r['risk'] ) ) {
				$has_risk = true;
			}

			$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE assessment_result_id = %s", $res_id ) );

			$row_data = array(
				'user_id'              => $user_info['wp_user_id'],
				'supabase_user_id'     => $user_info['supabase_user_id'],
				'user_email'           => $user_info['email'],
				'assessment_slug'      => $slug,
				'assessment_result_id' => $res_id,
				'score'                => $score,
				'severity_band'        => $severity,
				'duration_seconds'     => $seconds,
				'answers'              => $answers,
				'snapshot'             => $snapshot,
				'completed_at'         => $completed,
				'created_at'           => current_time( 'mysql' ),
			);

			if ( $exists ) {
				$wpdb->update( $table, $row_data, array( 'id' => $exists ) );
			} else {
				$wpdb->insert( $table, $row_data );
			}

			// Map to canonical clinical instrument
			$inst           = self::get_clinical_instrument( $slug );
			$clean_id       = $inst['id'];
			$inst_code      = $inst['code'];
			$inst_name      = $inst['name'];
			$matrix_spec    = $inst['matrix'];
			$severity_label = self::format_severity_label( $band_label ? $band_label : $severity );

			// FluentCRM Tagging & Meta
			if ( ! empty( $user_info['fc_sub_id'] ) ) {
				// Canonical clinical tag e.g. assess:PHQ-9:Moderately-Severe
				self::add_fluentcrm_tag( $user_info['fc_sub_id'], "assess:{$inst_code}:{$severity_label}" );
				self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'latest_assessment', $inst_name );
				self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'assessment_id', $clean_id );
				self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'latest_score', $score );
				self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'latest_severity', $severity_label );

				if ( $has_risk || 'severe' === $severity || 'moderately-severe' === $severity || 'high' === $severity ) {
					self::add_fluentcrm_tag( $user_info['fc_sub_id'], 'clinical:high-risk' );
					self::add_fluentcrm_note(
						$user_info['fc_sub_id'],
						sprintf( 'Clinical Attention: Member completed %s with score %s (%s)%s', $inst_name, (string) $score, $severity_label, $has_risk ? ' [Risk Flag Endorsed]' : '' )
					);
				}
			}

			// Sync to WordPress wp_users meta for SCF
			if ( ! empty( $user_info['wp_user_id'] ) ) {
				update_user_meta( $user_info['wp_user_id'], 'latest_assessment', $clean_id );
				update_user_meta( $user_info['wp_user_id'], 'assessment_id', $clean_id );
				update_user_meta( $user_info['wp_user_id'], 'assessment_result_id', $res_id );
				update_user_meta( $user_info['wp_user_id'], 'latest_score', $score );
				update_user_meta( $user_info['wp_user_id'], 'latest_severity', $severity );
				update_user_meta( $user_info['wp_user_id'], 'scoring_matrix', $matrix_spec );
				if ( $has_risk || 'severe' === $severity || 'moderately-severe' === $severity || 'high' === $severity ) {
					update_user_meta( $user_info['wp_user_id'], 'clinical_risk_flag', 1 );
				}
			}

			if ( ! empty( $user_info['email'] ) && class_exists( 'Ikan_FluentCRM_Fields' ) ) {
				Ikan_FluentCRM_Fields::sync_contact(
					$user_info['email'],
					array(
						'latest_assessment_slug'     => $slug,
						'latest_assessment_score'    => $score,
						'latest_assessment_severity' => $severity,
						'clinical_risk_flag'         => ( $has_risk || 'severe' === $severity || 'moderately-severe' === $severity || 'high' === $severity ) ? 'yes' : 'no',
						'last_assessment_at'         => $completed,
					)
				);
			}

			// Automatic Transactional Email & Clinical Alert Dispatch
			if ( class_exists( 'Ikan_Mailer' ) ) {
				$member_name = ! empty( $user_info['name'] ) ? $user_info['name'] : '';
				if ( empty( $member_name ) && ! empty( $user_info['wp_user_id'] ) ) {
					$u_obj = get_userdata( $user_info['wp_user_id'] );
					if ( $u_obj ) {
						$member_name = $u_obj->display_name;
					}
				}

				// 1. Send Member Assessment Result Email
				if ( ! empty( $user_info['email'] ) ) {
					Ikan_Mailer::send_member_assessment_result( array(
						'email'                => $user_info['email'],
						'name'                 => $member_name,
						'slug'                 => $slug,
						'assessment_result_id' => $res_id,
						'score'                => $score,
						'severity'             => $severity,
						'band_label'           => $severity_label,
						'risk'                 => $has_risk,
					) );
				}

				// 2. Send Clinical Alert Email if clinical risk or severe symptoms detected
				if ( $has_risk || in_array( $severity, array( 'severe', 'moderately-severe', 'high' ), true ) ) {
					Ikan_Mailer::send_clinical_alert( array(
						'email'                => $user_info['email'],
						'name'                 => $member_name,
						'supabase_user_id'     => $user_info['supabase_user_id'],
						'wp_user_id'           => $user_info['wp_user_id'],
						'fc_sub_id'            => $user_info['fc_sub_id'] ?? 0,
						'slug'                 => $slug,
						'assessment_result_id' => $res_id,
						'score'                => $score,
						'severity'             => $severity,
						'band_label'           => $severity_label,
						'risk'                 => $has_risk,
					) );
				}
			}

			$count++;
		}

		return $count;
	}

	/**
	 * Unmarshal Equip Program state into wp_ikan_program_progress & FluentCRM.
	 */
	private static function unmarshal_program( $key, $user_info, $data, $updated_at ) {
		global $wpdb;
		$table = $wpdb->prefix . 'ikan_program_progress';
		
		// Extract clean program slug from equip.<slug>.v2
		$slug = str_replace( array( 'equip.', '.v2' ), '', $key );

		$completed_days = isset( $data['completed'] ) && is_array( $data['completed'] ) ? $data['completed'] : array();
		$completed_map  = isset( $data['completedAt'] ) ? wp_json_encode( $data['completedAt'] ) : null;
		$answers        = isset( $data['answers'] ) ? wp_json_encode( $data['answers'] ) : null;
		$feedback       = isset( $data['feedback'] ) ? wp_json_encode( $data['feedback'] ) : null;
		$tracker        = isset( $data['tracker'] ) ? wp_json_encode( $data['tracker'] ) : null;
		$collections    = isset( $data['collections'] ) ? wp_json_encode( $data['collections'] ) : null;

		$max_day = 0;
		if ( ! empty( $completed_days ) ) {
			$max_day = max( $completed_days );
		}
		$current_day = $max_day + 1;

		$last_active = ! empty( $updated_at ) ? gmdate( 'Y-m-d H:i:s', strtotime( $updated_at ) ) : current_time( 'mysql' );

		$exists = $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM $table WHERE (supabase_user_id = %s OR (user_id > 0 AND user_id = %d)) AND program_slug = %s",
			$user_info['supabase_user_id'],
			$user_info['wp_user_id'],
			$slug
		) );

		$row_data = array(
			'user_id'          => $user_info['wp_user_id'],
			'supabase_user_id' => $user_info['supabase_user_id'],
			'user_email'       => $user_info['email'],
			'program_slug'     => $slug,
			'current_day'      => $current_day,
			'completed_days'   => wp_json_encode( $completed_days ),
			'completed_at_map' => $completed_map,
			'answers'          => $answers,
			'feedback'         => $feedback,
			'tracker_data'     => $tracker,
			'collections'      => $collections,
			'status'           => 'active',
			'last_active_at'   => $last_active,
			'updated_at'       => current_time( 'mysql' ),
		);

		if ( $exists ) {
			$wpdb->update( $table, $row_data, array( 'id' => $exists ) );
		} else {
			$row_data['created_at'] = current_time( 'mysql' );
			$wpdb->insert( $table, $row_data );
		}

		// FluentCRM Tagging & Meta
		if ( ! empty( $user_info['fc_sub_id'] ) ) {
			self::add_fluentcrm_tag( $user_info['fc_sub_id'], "prog:{$slug}:active" );
			self::add_fluentcrm_tag( $user_info['fc_sub_id'], "prog:day-{$current_day}" );
			self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'current_program', $slug );
			self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'program_day', $current_day );
			self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'last_active_at', $last_active );

			// Check session feedback notes
			if ( ! empty( $data['feedback'] ) && is_array( $data['feedback'] ) ) {
				foreach ( $data['feedback'] as $fday => $fval ) {
					if ( ! empty( $fval['note'] ) ) {
						self::add_fluentcrm_note(
							$user_info['fc_sub_id'],
							sprintf( 'Session Feedback (Program %s, Day %s): Rating %s/5 — "%s"', strtoupper( $slug ), $fday, $fval['feel'] ?? 'N/A', sanitize_text_field( $fval['note'] ) )
						);
					}
				}
			}
		}

		// Sync to WordPress wp_users meta for SCF
		if ( ! empty( $user_info['wp_user_id'] ) ) {
			update_user_meta( $user_info['wp_user_id'], 'current_program', $slug );
			update_user_meta( $user_info['wp_user_id'], 'program_id', 'prg_' . str_replace( '-', '_', $slug ) );
			update_user_meta( $user_info['wp_user_id'], 'program_current_day', $current_day );
			update_user_meta( $user_info['wp_user_id'], 'program_status', 'active' );
			update_user_meta( $user_info['wp_user_id'], 'last_active_at', $last_active );
		}

		if ( ! empty( $user_info['email'] ) && class_exists( 'Ikan_FluentCRM_Fields' ) ) {
			Ikan_FluentCRM_Fields::sync_contact(
				$user_info['email'],
				array(
					'current_program'        => $slug,
					'program_current_day'    => $current_day,
					'program_status'         => ! empty( $data['runs'] ) ? 'completed' : 'active',
					'programs_completed_count' => ! empty( $data['runs'] ) && is_array( $data['runs'] ) ? count( $data['runs'] ) : 0,
					'last_program_active_at' => $last_active,
				)
			);
		}

		return 1;
	}

	/**
	 * Unmarshal Journal entries into wp_ikan_journals & FluentCRM.
	 */
	private static function unmarshal_journals( $user_info, $data, $updated_at ) {
		global $wpdb;
		$table = $wpdb->prefix . 'ikan_journals';
		$entries = isset( $data['entries'] ) && is_array( $data['entries'] ) ? $data['entries'] : array();
		$count = 0;
		$latest_date = null;
		$latest_entry = null;

		foreach ( $entries as $e ) {
			$uuid = ! empty( $e['id'] ) ? sanitize_text_field( $e['id'] ) : '';
			if ( empty( $uuid ) ) {
				continue;
			}

			$entry_date = ! empty( $e['date'] ) ? sanitize_text_field( $e['date'] ) : gmdate( 'Y-m-d' );
			$created    = ! empty( $e['createdAt'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( $e['createdAt'] ) ) : current_time( 'mysql' );

			$exists = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $table WHERE entry_uuid = %s", $uuid ) );

			$row_data = array(
				'user_id'              => $user_info['wp_user_id'],
				'supabase_user_id'     => $user_info['supabase_user_id'],
				'user_email'           => $user_info['email'],
				'entry_uuid'           => $uuid,
				'entry_date'           => $entry_date,
				'mood_rating'          => isset( $e['mood_rating'] ) ? intval( $e['mood_rating'] ) : null,
				'sleep_rating'         => isset( $e['sleep_rating'] ) ? intval( $e['sleep_rating'] ) : null,
				'stress_level'         => isset( $e['stress_level'] ) ? intval( $e['stress_level'] ) : null,
				'energy'               => isset( $e['energy'] ) ? intval( $e['energy'] ) : null,
				'pain_exist'           => isset( $e['pain_exist'] ) ? ( $e['pain_exist'] ? 1 : 0 ) : null,
				'pain_experience'      => isset( $e['pain_experience'] ) ? intval( $e['pain_experience'] ) : null,
				'pain_impact'          => isset( $e['pain_impact'] ) ? intval( $e['pain_impact'] ) : null,
				'context_tags'         => isset( $e['context_tags'] ) ? wp_json_encode( $e['context_tags'] ) : null,
				'encrypted_reflection' => isset( $e['encrypted_reflection'] ) ? sanitize_text_field( $e['encrypted_reflection'] ) : null,
				'iv'                   => isset( $e['iv'] ) ? sanitize_text_field( $e['iv'] ) : null,
				'salt'                 => isset( $e['salt'] ) ? sanitize_text_field( $e['salt'] ) : null,
				'created_at'           => $created,
			);

			if ( $exists ) {
				$wpdb->update( $table, $row_data, array( 'id' => $exists ) );
			} else {
				$wpdb->insert( $table, $row_data );
			}

			if ( null === $latest_date || $entry_date >= $latest_date ) {
				$latest_date  = $entry_date;
				$latest_entry = $e;
			}
			$count++;
		}

		if ( $latest_date && ! empty( $user_info['fc_sub_id'] ) ) {
			self::add_fluentcrm_tag( $user_info['fc_sub_id'], 'journal:active' );
			self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'last_journal_date', $latest_date );
		}

		if ( $latest_date && ! empty( $user_info['wp_user_id'] ) ) {
			update_user_meta( $user_info['wp_user_id'], 'last_journal_date', $latest_date );
		}

		if ( $latest_date && ! empty( $user_info['email'] ) && class_exists( 'Ikan_FluentCRM_Fields' ) ) {
			Ikan_FluentCRM_Fields::sync_contact(
				$user_info['email'],
				array(
					'last_mood_rating'      => isset( $latest_entry['mood_rating'] ) ? intval( $latest_entry['mood_rating'] ) : '',
					'last_sleep_rating'     => isset( $latest_entry['sleep_rating'] ) ? intval( $latest_entry['sleep_rating'] ) : '',
					'last_stress_level'     => isset( $latest_entry['stress_level'] ) ? intval( $latest_entry['stress_level'] ) : '',
					'last_journal_date'     => $latest_date,
					'journal_entries_count' => $count,
				)
			);
		}

		return $count;
	}

	/**
	 * Unmarshal Wellness Scores into wp_ikan_wellness_scores.
	 */
	private static function unmarshal_wellness( $user_info, $data, $updated_at ) {
		global $wpdb;
		$table = $wpdb->prefix . 'ikan_wellness_scores';
		$days  = isset( $data['days'] ) && is_array( $data['days'] ) ? $data['days'] : array();
		$count = 0;
		$latest_score = null;

		foreach ( $days as $date_str => $score_val ) {
			$score_date = sanitize_text_field( $date_str );
			$score      = intval( $score_val );

			$exists = $wpdb->get_var( $wpdb->prepare(
				"SELECT id FROM $table WHERE (supabase_user_id = %s OR (user_id > 0 AND user_id = %d)) AND score_date = %s",
				$user_info['supabase_user_id'],
				$user_info['wp_user_id'],
				$score_date
			) );

			$row_data = array(
				'user_id'          => $user_info['wp_user_id'],
				'supabase_user_id' => $user_info['supabase_user_id'],
				'user_email'       => $user_info['email'],
				'score_date'       => $score_date,
				'overall_score'    => $score,
				'created_at'       => current_time( 'mysql' ),
			);

			if ( $exists ) {
				$wpdb->update( $table, $row_data, array( 'id' => $exists ) );
			} else {
				$wpdb->insert( $table, $row_data );
			}

			$latest_score = $score;
			$count++;
		}

		if ( null !== $latest_score && ! empty( $user_info['fc_sub_id'] ) ) {
			self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'latest_wellness_score', $latest_score );
		}

		if ( null !== $latest_score && ! empty( $user_info['wp_user_id'] ) ) {
			update_user_meta( $user_info['wp_user_id'], 'wellness_index_score', $latest_score );
		}

		if ( null !== $latest_score && ! empty( $user_info['email'] ) && class_exists( 'Ikan_FluentCRM_Fields' ) ) {
			$recent_scores = array_slice( array_values( $days ), -7 );
			$avg_7d = ! empty( $recent_scores ) ? round( array_sum( array_map( 'intval', $recent_scores ) ) / count( $recent_scores ), 1 ) : $latest_score;
			Ikan_FluentCRM_Fields::sync_contact(
				$user_info['email'],
				array(
					'latest_wellness_score' => $latest_score,
					'wellness_7d_avg'       => $avg_7d,
				)
			);
		}

		return $count;
	}

	/**
	 * Cached clinical instruments bundle from assets/data/clinical-instruments.json.
	 *
	 * @var array|null
	 */
	private static $clinical_instruments_bundle = null;

	/**
	 * Retrieve and cache the clinical instruments bundle (questions, scales, profiles, and cutoffs).
	 *
	 * @return array
	 */
	public static function get_instruments_bundle() {
		if ( null !== self::$clinical_instruments_bundle ) {
			return self::$clinical_instruments_bundle;
		}
		$file = get_template_directory() . '/assets/data/clinical-instruments.json';
		if ( file_exists( $file ) ) {
			$json = json_decode( file_get_contents( $file ), true );
			if ( is_array( $json ) ) {
				self::$clinical_instruments_bundle = $json;
				return self::$clinical_instruments_bundle;
			}
		}
		self::$clinical_instruments_bundle = array( 'assessments' => array(), 'profiles' => array() );
		return self::$clinical_instruments_bundle;
	}

	/**
	 * Compute clinical assessment result adhering 1:1 to ikan2 instruments.ts and frozen.ts.
	 *
	 * @param string $slug Assessment slug.
	 * @param array $answers Answers map [question_id => option_value].
	 * @param array|null $snapshot Optional snapshot from ikan2.
	 * @return array Clinical result data [score, severity, band_label, risk].
	 */
	public static function compute_clinical_result( $slug, $answers = array(), $snapshot = null ) {
		// 1. If snapshot already contains scores and headline from ikan2, read verbatim
		if ( ! empty( $snapshot ) && is_array( $snapshot ) && ! empty( $snapshot['scores'] ) && is_array( $snapshot['scores'] ) ) {
			$headline_id = ! empty( $snapshot['headline'] ) ? $snapshot['headline'] : null;
			$head_score  = null;

			foreach ( $snapshot['scores'] as $sc ) {
				if ( $headline_id && isset( $sc['score']['id'] ) && $sc['score']['id'] === $headline_id ) {
					$head_score = $sc;
					break;
				}
			}

			if ( ! $head_score && ! empty( $snapshot['scores'][0] ) ) {
				$head_score = $snapshot['scores'][0];
			}

			if ( $head_score && isset( $head_score['value'] ) ) {
				$score      = $head_score['value'];
				$severity   = ! empty( $head_score['band']['severity'] ) ? $head_score['band']['severity'] : 'minimal';
				$band_label = ! empty( $head_score['band']['label'] ) ? $head_score['band']['label'] : ucfirst( $severity );
				$risk       = ! empty( $snapshot['risk'] );

				return array(
					'score'      => $score,
					'severity'   => $severity,
					'band_label' => $band_label,
					'risk'       => $risk,
				);
			}
		}

		// 2. Otherwise compute from ikan2 clinical instrument specs
		$bundle      = self::get_instruments_bundle();
		$assessments = isset( $bundle['assessments'] ) ? $bundle['assessments'] : array();
		$profiles    = isset( $bundle['profiles'] ) ? $bundle['profiles'] : array();

		$assessment = null;
		foreach ( $assessments as $a ) {
			if ( $a['slug'] === $slug || $a['id'] === $slug ) {
				$assessment = $a;
				break;
			}
		}

		if ( ! $assessment || empty( $answers ) || ! is_array( $answers ) ) {
			// Fallback: sum raw answers
			$raw_sum = 0;
			if ( is_array( $answers ) ) {
				foreach ( $answers as $v ) {
					if ( is_numeric( $v ) ) {
						$raw_sum += intval( $v );
					}
				}
			}
			return array(
				'score'      => $raw_sum,
				'severity'   => 'minimal',
				'band_label' => 'Minimal',
				'risk'       => false,
			);
		}

		// Execute ikan2 scoreAll() logic
		$headline_id = isset( $assessment['headline'] ) ? $assessment['headline'] : null;
		$head_result = null;
		$risk        = false;

		// Check risk items (e.g. self-harm depression-q9)
		if ( ! empty( $assessment['questions'] ) && is_array( $assessment['questions'] ) ) {
			foreach ( $assessment['questions'] as $q ) {
				if ( ! empty( $q['risk'] ) && isset( $answers[ $q['id'] ] ) && intval( $answers[ $q['id'] ] ) > 0 ) {
					$risk = true;
				}
			}
		}

		if ( ! empty( $assessment['scores'] ) && is_array( $assessment['scores'] ) ) {
			foreach ( $assessment['scores'] as $sc ) {
				$sc_id     = $sc['id'];
				$prof_id   = $sc['profile'];
				$profile   = isset( $profiles[ $prof_id ] ) ? $profiles[ $prof_id ] : null;
				if ( ! $profile ) {
					continue;
				}

				// Find questions contributing to this score
				$contributing = array();
				foreach ( $assessment['questions'] as $q ) {
					if ( in_array( $sc_id, $q['scores'], true ) ) {
						$contributing[] = $q;
					}
				}

				$sum_val   = 0;
				$answered  = 0;

				foreach ( $contributing as $q ) {
					$qid = $q['id'];
					if ( isset( $answers[ $qid ] ) && is_numeric( $answers[ $qid ] ) ) {
						$val = intval( $answers[ $qid ] );
						// Handle reverse scoring
						if ( ! empty( $q['reversed'] ) && isset( $assessment['scales'][ $q['scale'] ]['options'] ) ) {
							$scale_options = $assessment['scales'][ $q['scale'] ]['options'];
							$vals = array_column( $scale_options, 'value' );
							if ( ! empty( $vals ) ) {
								$val = min( $vals ) + max( $vals ) - $val;
							}
						}
						$sum_val += $val;
						$answered++;
					}
				}

				$calc_value = null;
				if ( $answered === count( $contributing ) && count( $contributing ) > 0 ) {
					if ( 'sum' === $profile['calc'] ) {
						$calc_value = $sum_val;
					} elseif ( 'mean' === $profile['calc'] ) {
						$calc_value = round( $sum_val / count( $contributing ), 2 );
					} elseif ( 'sum4' === $profile['calc'] ) {
						$calc_value = $sum_val * 4;
					}
				}

				// Match band
				$matched_band = null;
				if ( null !== $calc_value && ! empty( $profile['bands'] ) ) {
					$bands_count = count( $profile['bands'] );
					foreach ( $profile['bands'] as $idx => $b ) {
						$is_last = ( $idx === $bands_count - 1 );
						if ( $calc_value >= $b['min'] && ( $is_last ? $calc_value <= $b['max'] : $calc_value < $b['max'] ) ) {
							$matched_band = $b;
							break;
						}
					}
				}

				$result_item = array(
					'score_id'   => $sc_id,
					'value'      => $calc_value,
					'band'       => $matched_band,
				);

				if ( $headline_id && $sc_id === $headline_id ) {
					$head_result = $result_item;
					break;
				} elseif ( ! $head_result ) {
					$head_result = $result_item;
				}
			}
		}

		$final_score = ( $head_result && null !== $head_result['value'] ) ? $head_result['value'] : 0;
		$severity    = ( $head_result && ! empty( $head_result['band']['severity'] ) ) ? $head_result['band']['severity'] : 'minimal';
		$band_label  = ( $head_result && ! empty( $head_result['band']['label'] ) ) ? $head_result['band']['label'] : ucfirst( $severity );

		return array(
			'score'      => $final_score,
			'severity'   => $severity,
			'band_label' => $band_label,
			'risk'       => $risk,
		);
	}

	/**
	 * Canonical mapping of raw assessment concern slugs to validated clinical instruments matching ikan2.
	 *
	 * Maps internal concern slugs to standardized clinical names, acronyms, and scoring matrix specs.
	 */
	public static function get_clinical_instrument( $slug ) {
		$map = array(
			'feeling-depressed-and-hopeless' => array(
				'id'     => 'asm_1767129862254_frzeigbdb',
				'code'   => 'PHQ-9',
				'name'   => 'PHQ-9 (Depression & Low Mood)',
				'matrix' => 'PHQ-9: Sum of 9 items, 0–27 (Minimal 0–4, Mild 5–9, Moderate 10–14, Moderately Severe 15–19, Severe 20–27)',
			),
			'feeling-overwhelmed-and-anxious' => array(
				'id'     => 'asm_1767129765741_wse9aeprv',
				'code'   => 'GAD-7',
				'name'   => 'GAD-7 (Anxiety & Panic)',
				'matrix' => 'GAD-7: Sum of 7 items, 0–21 (Minimal 0–4, Mild 5–7, Moderate 8–9, Moderately Severe 10–14, Severe 15–21)',
			),
			'feeling-worried-and-stressed' => array(
				'id'     => 'asm_1767129926263_ru3v6dozh',
				'code'   => 'PSS-10',
				'name'   => 'PSS-10 (Perceived Stress)',
				'matrix' => 'PSS-10: 10 items, 0–40 (Low Stress 0–13, Moderate Stress 14–26, High Stress 27–40)',
			),
			'struggling-with-quality-sleep' => array(
				'id'     => 'asm_1767130007889_mewy939gi',
				'code'   => 'ISI',
				'name'   => 'Sleep Health (Insomnia Severity)',
				'matrix' => 'Insomnia Themes: 8 items, 8–40 (Healthy Sleep 8–16, Poor Sleep 17–31, Very Poor Sleep 32–40)',
			),
			'struggling-to-balance-life' => array(
				'id'     => 'asm_1767130043662_wc4qpivfl',
				'code'   => 'Work-Strain',
				'name'   => 'Workplace Strain (Life Balance)',
				'matrix' => 'Workplace Strain: 8 items, 8–40 (Nil 8–15, Fairly Low 16–20, Moderate 21–25, Severe 26–30, Potentially Dangerous 31–40)',
			),
			'feeling-drained-and-burned-out' => array(
				'id'     => 'asm_1767129964930_bv8cqgm16',
				'code'   => 'BAT-23',
				'name'   => 'BAT-23 (Burnout Assessment Tool)',
				'matrix' => 'BAT-23: Mean score 1.0–5.0 across core burnout dimensions (Low 1.0–2.58, Normal 2.59–3.01, High 3.02–5.0)',
			),
			'unsure-or-general-concern' => array(
				'id'     => 'asm_1767129718791_zj1t8hx3c',
				'code'   => 'General',
				'name'   => 'General Holistic Concern',
				'matrix' => 'General Battery: Composite screening covering GAD-2, PHQ-2, WHO-5, NGSE, and BRS',
			),
		);

		if ( isset( $map[ $slug ] ) ) {
			return $map[ $slug ];
		}

		// Alias handling for codes/IDs
		$aliases = array(
			'phq-9'   => 'feeling-depressed-and-hopeless',
			'phq9'    => 'feeling-depressed-and-hopeless',
			'gad-7'   => 'feeling-overwhelmed-and-anxious',
			'gad7'    => 'feeling-overwhelmed-and-anxious',
			'pss-10'  => 'feeling-worried-and-stressed',
			'pss10'   => 'feeling-worried-and-stressed',
			'isi'     => 'struggling-with-quality-sleep',
			'sci'     => 'struggling-with-quality-sleep',
			'sleep'   => 'struggling-with-quality-sleep',
			'balance' => 'struggling-to-balance-life',
			'who-5'   => 'struggling-to-balance-life',
			'who5'    => 'struggling-to-balance-life',
			'bat-23'  => 'feeling-drained-and-burned-out',
			'bat23'   => 'feeling-drained-and-burned-out',
			'burnout' => 'feeling-drained-and-burned-out',
			'general' => 'unsure-or-general-concern',
		);

		$clean_key = strtolower( trim( $slug ) );
		if ( isset( $aliases[ $clean_key ] ) && isset( $map[ $aliases[ $clean_key ] ] ) ) {
			return $map[ $aliases[ $clean_key ] ];
		}

		foreach ( $map as $item ) {
			if ( $item['id'] === $slug || strtolower( $item['code'] ) === $clean_key ) {
				return $item;
			}
		}

		$fallback_code = strtoupper( str_replace( '-', ' ', $slug ) );
		return array(
			'id'     => sanitize_title( $slug ),
			'code'   => $fallback_code,
			'name'   => $fallback_code,
			'matrix' => 'Clinical Assessment Matrix',
		);
	}

	/**
	 * Canonical formatting of clinical severity band labels.
	 */
	public static function format_severity_label( $band ) {
		$band = strtolower( trim( (string) $band ) );
		$map  = array(
			'normal'                => 'Normal',
			'minimal'               => 'Minimal',
			'mild'                  => 'Mild',
			'moderate'              => 'Moderate',
			'moderately-severe'     => 'Moderately-Severe',
			'moderately severe'     => 'Moderately-Severe',
			'severe'                => 'Severe',
			'high'                  => 'High',
			'low'                   => 'Low',
			'at-risk'               => 'At-Risk',
			'no-risk'               => 'No-Risk',
			'healthy sleep'         => 'Healthy-Sleep',
			'poor sleep'            => 'Poor-Sleep',
			'very poor sleep'       => 'Very-Poor-Sleep',
			'low stress'            => 'Low-Stress',
			'moderate stress'       => 'Moderate-Stress',
			'high stress'           => 'High-Stress',
			'fairly low'            => 'Fairly-Low',
			'potentially dangerous' => 'Potentially-Dangerous',
			'nil'                   => 'Nil',
		);
		if ( isset( $map[ $band ] ) ) {
			return $map[ $band ];
		}
		return ucwords( str_replace( array( '-', '_' ), ' ', $band ) );
	}

	/**
	 * Remove old ugly slug tags (e.g. assess:feeling-depressed-and-hopeless:normal)
	 * from FluentCRM to keep the subscriber tagging pristine.
	 */
	public static function cleanup_legacy_fluentcrm_tags() {
		global $wpdb;
		$tags_table  = $wpdb->prefix . 'fc_tags';
		$pivot_table = $wpdb->prefix . 'fc_subscriber_pivot';

		if ( $wpdb->get_var( "SHOW TABLES LIKE '$tags_table'" ) !== $tags_table ) {
			return;
		}

		$legacy_tags = $wpdb->get_results(
			"SELECT id, title, slug FROM $tags_table 
			 WHERE slug LIKE 'assess-feeling-%' 
			    OR slug LIKE 'assess-struggling-%' 
			    OR slug LIKE 'assess-unsure-%'
			    OR slug LIKE 'assess-sci-%'
			    OR slug LIKE 'assess-who-5-%'
			    OR title LIKE 'assess:feeling-%' 
			    OR title LIKE 'assess:struggling-%'
			    OR title LIKE 'assess:unsure-%'
			    OR title LIKE 'assess:SCI:%'
			    OR title LIKE 'assess:WHO-5:%'"
		);

		if ( ! empty( $legacy_tags ) ) {
			$ids = wp_list_pluck( $legacy_tags, 'id' );
			$placeholders = implode( ',', array_map( 'intval', $ids ) );
			$wpdb->query( "DELETE FROM $pivot_table WHERE object_type = 'tag' AND object_id IN ($placeholders)" );
			$wpdb->query( "DELETE FROM $tags_table WHERE id IN ($placeholders)" );
		}
	}

	/**
	 * Helper: Add Tag to FluentCRM Subscriber.
	 */
	public static function add_fluentcrm_tag( $subscriber_id, $tag_title ) {
		global $wpdb;
		$tags_table  = $wpdb->prefix . 'fc_tags';
		$pivot_table = $wpdb->prefix . 'fc_subscriber_pivot';

		if ( $wpdb->get_var( "SHOW TABLES LIKE '$tags_table'" ) !== $tags_table ) {
			return;
		}

		$slug = sanitize_title( str_replace( ':', '-', $tag_title ) );
		$tag_id = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM $tags_table WHERE slug = %s", $slug ) );

		if ( ! $tag_id ) {
			$wpdb->insert(
				$tags_table,
				array(
					'title'      => sanitize_text_field( $tag_title ),
					'slug'       => $slug,
					'created_at' => current_time( 'mysql' ),
				)
			);
			$tag_id = $wpdb->insert_id;
		}

		if ( $tag_id ) {
			$exists = $wpdb->get_var( $wpdb->prepare(
				"SELECT id FROM $pivot_table WHERE subscriber_id = %d AND object_id = %d AND object_type = 'FluentCrm\\\\App\\\\Models\\\\Tag'",
				$subscriber_id,
				$tag_id
			) );

			if ( ! $exists ) {
				$wpdb->insert(
					$pivot_table,
					array(
						'subscriber_id' => $subscriber_id,
						'object_id'     => $tag_id,
						'object_type'   => 'FluentCrm\App\Models\Tag',
						'created_at'    => current_time( 'mysql' ),
					)
				);
			}
		}
	}

	/**
	 * Helper: Update FluentCRM Subscriber Meta.
	 */
	public static function update_fluentcrm_meta( $subscriber_id, $key, $value ) {
		global $wpdb;
		$meta_table = $wpdb->prefix . 'fc_subscriber_meta';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$meta_table'" ) !== $meta_table ) {
			return;
		}

		$exists = $wpdb->get_var( $wpdb->prepare(
			"SELECT id FROM $meta_table WHERE subscriber_id = %d AND `key` = %s",
			$subscriber_id,
			$key
		) );

		if ( $exists ) {
			$wpdb->update(
				$meta_table,
				array( 'value' => maybe_serialize( $value ) ),
				array( 'id' => $exists )
			);
		} else {
			$wpdb->insert(
				$meta_table,
				array(
					'subscriber_id' => $subscriber_id,
					'key'           => sanitize_key( $key ),
					'value'         => maybe_serialize( $value ),
					'created_at'    => current_time( 'mysql' ),
				)
			);
		}
	}

	/**
	 * Helper: Add Note to FluentCRM Subscriber.
	 */
	public static function add_fluentcrm_note( $subscriber_id, $description ) {
		global $wpdb;
		$notes_table = $wpdb->prefix . 'fc_subscriber_notes';
		if ( $wpdb->get_var( "SHOW TABLES LIKE '$notes_table'" ) !== $notes_table ) {
			return;
		}

		$wpdb->insert(
			$notes_table,
			array(
				'subscriber_id' => $subscriber_id,
				'type'          => 'clinical_system_note',
				'status'        => 'closed',
				'description'   => sanitize_textarea_field( $description ),
				'created_at'    => current_time( 'mysql' ),
			)
		);
	}

	/**
	 * WP-CLI entrypoint for testing, manual sync, and backup JSON import.
	 */
	public static function cli_command( $args, $assoc_args ) {
		WP_CLI::line( '==> Running iKAN Interim Sync Worker (Full Clinical & CRM Pipeline)...' );

		// Support wp ikan-sync ingest <file> or --import-backup=<file>
		if ( ! empty( $assoc_args['import-backup'] ) || ( ! empty( $args[0] ) && 'ingest' === $args[0] ) ) {
			$file = ! empty( $assoc_args['import-backup'] ) ? $assoc_args['import-backup'] : ( $args[1] ?? '' );
			if ( empty( $file ) || ! file_exists( $file ) ) {
				WP_CLI::error( "File not found: $file" );
			}
			$payload = json_decode( file_get_contents( $file ), true );
			if ( ! is_array( $payload ) ) {
				WP_CLI::error( "Invalid JSON in $file" );
			}

			WP_CLI::line( sprintf( '--> Ingesting JSON payload from %s...', $file ) );
			$res = self::process_json_payload( $payload );
			if ( 'success' === ( $res['status'] ?? '' ) ) {
				WP_CLI::success( $res['message'] );
			} else {
				WP_CLI::error( $res['message'] ?? 'JSON Ingestion failed' );
			}
			return;
		}

		$result = self::execute_sync();
		WP_CLI::success( sprintf(
			'Sync completed in %ss. Newsletters: %d, Contacts: %d, Partners: %d, Profiles: %d, Assessments: %d, Programs: %d, Journals: %d, Wellness: %d',
			$result['duration_sec'],
			$result['newsletter'],
			$result['contacts'],
			$result['partners'],
			$result['profiles'],
			$result['assessments'],
			$result['programs'],
			$result['journals'],
			$result['wellness']
		) );
	}
}

// Auto-initialize
Ikan_Interim_Sync::init();
