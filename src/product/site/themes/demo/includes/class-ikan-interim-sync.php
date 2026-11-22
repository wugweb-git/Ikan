<?php
/**
 * iKAN Health — Interim DB Autonomous Sync Worker (Action Scheduler)
 *
 * Runs scheduled, autonomous background synchronization from the Interim DB
 * (Supabase) into WordPress Admin (FluentCRM, Fluent Forms, and wp_users).
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
	 * Execute the background sync for Part 1 items.
	 *
	 * @return array Sync summary counts.
	 */
	public static function execute_sync() {
		$start_time = microtime( true );
		$log = array(
			'started_at' => current_time( 'mysql' ),
			'newsletter' => 0,
			'contacts'   => 0,
			'partners'   => 0,
			'profiles'   => 0,
			'errors'     => array(),
		);

		try {
			$log['newsletter'] = self::sync_newsletter_subscribers();
			$log['contacts']   = self::sync_contact_messages();
			$log['partners']   = self::sync_partner_applications();
			$log['profiles']   = self::sync_member_profiles();
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
		$response = wp_remote_get( $url, array(
			'timeout' => 20,
			'headers' => array(
				'apikey'        => self::SUPABASE_KEY,
				'Authorization' => 'Bearer ' . self::SUPABASE_KEY,
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

			$email = sanitize_email( strtolower( $rec['email'] ) );
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

			$email = sanitize_email( $rec['email'] );
			$msg   = isset( $rec['message'] ) ? sanitize_textarea_field( $rec['message'] ) : '';

			// Check if already logged by matching email and created timestamp
			$created = ! empty( $rec['created_at'] ) ? gmdate( 'Y-m-d H:i:s', strtotime( $rec['created_at'] ) ) : current_time( 'mysql' );
			$exists  = $wpdb->get_var( $wpdb->prepare(
				"SELECT id FROM $submissions_table WHERE form_id = 1 AND created_at = %s LIMIT 1",
				$created
			) );

			if ( ! $exists ) {
				$formData = array(
					'names'   => array( 'first_name' => sanitize_text_field( $rec['name'] ?? '' ) ),
					'email'   => $email,
					'subject' => sanitize_text_field( $rec['subject'] ?? 'General enquiry' ),
					'message' => $msg,
				);

				$wpdb->insert(
					$submissions_table,
					array(
						'form_id'    => 1,
						'response'   => wp_json_encode( $formData ),
						'source_url' => home_url( '/contact-us/' ),
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
	 * Sync Partner Applications into Fluent Forms Form ID 4.
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
	 * Sync Member Profile Basics into wp_usermeta.
	 */
	private static function sync_member_profiles() {
		$records = self::fetch_supabase( 'ikan2_user_state?key=eq.profile.v1&select=*' );
		$synced  = 0;

		foreach ( $records as $row ) {
			$val = is_array( $row['value'] ) ? $row['value'] : json_decode( $row['value'], true );
			if ( empty( $val['email'] ) ) {
				continue;
			}

			$user = get_user_by( 'email', $val['email'] );
			if ( $user ) {
				if ( ! empty( $val['phone'] ) ) {
					update_user_meta( $user->ID, 'billing_phone', sanitize_text_field( $val['phone'] ) );
				}
				if ( ! empty( $val['city'] ) ) {
					update_user_meta( $user->ID, 'city', sanitize_text_field( $val['city'] ) );
				}
				if ( ! empty( $val['gender'] ) ) {
					update_user_meta( $user->ID, 'gender', sanitize_text_field( $val['gender'] ) );
				}
				if ( ! empty( $val['birthday'] ) ) {
					update_user_meta( $user->ID, 'date_of_birth', sanitize_text_field( $val['birthday'] ) );
				}
				$synced++;
			}
		}

		return $synced;
	}

	/**
	 * WP-CLI entrypoint for testing and on-demand trigger.
	 */
	public static function cli_command( $args, $assoc_args ) {
		WP_CLI::line( '==> Running iKAN Interim Sync Worker (Part 1)...' );
		$result = self::execute_sync();
		WP_CLI::success( sprintf(
			'Sync completed in %ss. Newsletter: %d, Contacts: %d, Partners: %d, Profiles: %d',
			$result['duration_sec'],
			$result['newsletter'],
			$result['contacts'],
			$result['partners'],
			$result['profiles']
		) );
	}
}

// Auto-initialize
Ikan_Interim_Sync::init();
