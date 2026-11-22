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
		add_action( self::HOOK_NAME, array( __CLASS__, 'execute_sync' ) );

		// Ensure scheduled action exists on init
		add_action( 'init', array( __CLASS__, 'ensure_scheduled' ) );

		// Register WP-CLI command if running under CLI
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			WP_CLI::add_command( 'ikan-sync', array( __CLASS__, 'cli_command' ) );
		}
	}

	/**
	 * Ensure the scheduled action exists in Action Scheduler queue.
	 */
	public static function ensure_scheduled() {
		if ( ! function_exists( 'as_has_scheduled_action' ) || ! function_exists( 'as_schedule_recurring_action' ) ) {
			return;
		}

		if ( ! as_has_scheduled_action( self::HOOK_NAME ) ) {
			as_schedule_recurring_action(
				time() + 180,
				self::RECURRENCE_SEC,
				self::HOOK_NAME,
				array(),
				self::ACTION_GROUP
			);
		}
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
	 * Execute the background sync across all channels.
	 *
	 * @return array Sync summary counts.
	 */
	public static function execute_sync() {
		$start_time = microtime( true );

		// Ensure destination tables exist
		if ( class_exists( 'Ikan_DB_Schema' ) ) {
			Ikan_DB_Schema::create_tables();
		}

		$log = array(
			'started_at'   => current_time( 'mysql' ),
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
			}
		}

		return $counts;
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

			// Compute approximate score and severity band
			$score = 0;
			$severity = 'normal';
			if ( ! empty( $r['snapshot']['score'] ) ) {
				$score = intval( $r['snapshot']['score'] );
			} elseif ( isset( $r['answers'] ) && is_array( $r['answers'] ) ) {
				foreach ( $r['answers'] as $ans_val ) {
					if ( is_numeric( $ans_val ) ) {
						$score += intval( $ans_val );
					}
				}
			}

			if ( ! empty( $r['snapshot']['band'] ) ) {
				$severity = sanitize_text_field( strtolower( $r['snapshot']['band'] ) );
			} elseif ( ! empty( $r['snapshot']['severity'] ) ) {
				$severity = sanitize_text_field( strtolower( $r['snapshot']['severity'] ) );
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

			// FluentCRM Tagging & Meta
			if ( ! empty( $user_info['fc_sub_id'] ) ) {
				self::add_fluentcrm_tag( $user_info['fc_sub_id'], "assess:{$slug}:{$severity}" );
				self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'latest_assessment', $slug );
				self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'latest_score', $score );
				self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'latest_severity', $severity );

				if ( 'severe' === $severity ) {
					self::add_fluentcrm_tag( $user_info['fc_sub_id'], 'clinical:high-risk' );
					self::add_fluentcrm_note(
						$user_info['fc_sub_id'],
						sprintf( 'High-Risk Alert: Member completed %s with score %d (Severe)', strtoupper( $slug ), $score )
					);
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

			if ( null === $latest_date || $entry_date > $latest_date ) {
				$latest_date = $entry_date;
			}
			$count++;
		}

		if ( $latest_date && ! empty( $user_info['fc_sub_id'] ) ) {
			self::add_fluentcrm_tag( $user_info['fc_sub_id'], 'journal:active' );
			self::update_fluentcrm_meta( $user_info['fc_sub_id'], 'last_journal_date', $latest_date );
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

		return $count;
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

		if ( ! empty( $assoc_args['import-backup'] ) ) {
			$file = $assoc_args['import-backup'];
			if ( ! file_exists( $file ) ) {
				WP_CLI::error( "File not found: $file" );
			}
			$rows = json_decode( file_get_contents( $file ), true );
			if ( ! is_array( $rows ) ) {
				WP_CLI::error( "Invalid JSON in $file" );
			}

			WP_CLI::line( sprintf( '--> Importing %d user state records from backup file...', count( $rows ) ) );
			$res = self::sync_all_user_state( $rows );
			WP_CLI::success( sprintf(
				'Import complete. Profiles: %d, Assessments: %d, Programs: %d, Journals: %d, Wellness: %d',
				$res['profiles'],
				$res['assessments'],
				$res['programs'],
				$res['journals'],
				$res['wellness']
			) );
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
