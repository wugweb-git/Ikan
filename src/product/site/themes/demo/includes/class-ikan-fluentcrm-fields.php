<?php
/**
 * iKAN Health — FluentCRM Custom Contact Fields & Sync Helper.
 *
 * Performs a one-time idempotent registration of all iKAN member custom fields
 * in FluentCRM (contact_custom_fields) and provides a helper to sync
 * custom_values via FluentCrmApi('contacts')->createOrUpdate().
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_FluentCRM_Fields {

	const SCHEMA_VERSION = '1.0.0';
	const OPTION_KEY     = 'ikan_fluentcrm_fields_version';

	/**
	 * Boot hooks.
	 */
	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'maybe_push_custom_fields' ), 25 );
	}

	/**
	 * Full iKAN -> FluentCRM custom contact field definitions, grouped by domain.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_field_definitions() {
		return array(
			// 1. Identity & Auth
			array( 'slug' => 'supabase_user_id', 'label' => 'Supabase User ID', 'type' => 'text', 'group' => 'Identity & Auth' ),
			array( 'slug' => 'auth_provider', 'label' => 'Auth Provider', 'type' => 'select-one', 'options' => array( 'email', 'google', 'phone' ), 'group' => 'Identity & Auth' ),
			array( 'slug' => 'google_sub', 'label' => 'Google Subject ID', 'type' => 'text', 'group' => 'Identity & Auth' ),
			array( 'slug' => 'member_since', 'label' => 'Member Since', 'type' => 'date', 'group' => 'Identity & Auth' ),
			array( 'slug' => 'onboarding_reason', 'label' => 'Onboarding Reason', 'type' => 'text', 'group' => 'Identity & Auth' ),

			// 2. Demographics & Emergency
			array( 'slug' => 'gender', 'label' => 'Gender', 'type' => 'text', 'group' => 'Demographics & Emergency' ),
			array( 'slug' => 'marital_status', 'label' => 'Marital Status', 'type' => 'text', 'group' => 'Demographics & Emergency' ),
			array( 'slug' => 'bio', 'label' => 'Bio', 'type' => 'textarea', 'group' => 'Demographics & Emergency' ),
			array( 'slug' => 'emergency_name', 'label' => 'Emergency Contact Name', 'type' => 'text', 'group' => 'Demographics & Emergency' ),
			array( 'slug' => 'emergency_phone', 'label' => 'Emergency Contact Phone', 'type' => 'text', 'group' => 'Demographics & Emergency' ),
			array( 'slug' => 'emergency_relation', 'label' => 'Emergency Contact Relation', 'type' => 'text', 'group' => 'Demographics & Emergency' ),

			// 3. Latest Assessment & Triage
			array( 'slug' => 'latest_assessment_slug', 'label' => 'Latest Assessment Slug', 'type' => 'text', 'group' => 'Latest Assessment & Triage' ),
			array( 'slug' => 'latest_assessment_score', 'label' => 'Latest Assessment Score', 'type' => 'number', 'group' => 'Latest Assessment & Triage' ),
			array( 'slug' => 'latest_assessment_severity', 'label' => 'Latest Assessment Severity', 'type' => 'select-one', 'options' => array( 'normal', 'mild', 'moderate', 'moderately-severe', 'severe' ), 'group' => 'Latest Assessment & Triage' ),
			array( 'slug' => 'clinical_risk_flag', 'label' => 'Clinical Risk Flag', 'type' => 'select-one', 'options' => array( 'yes', 'no' ), 'group' => 'Latest Assessment & Triage' ),
			array( 'slug' => 'last_assessment_at', 'label' => 'Last Assessment At', 'type' => 'date_time', 'group' => 'Latest Assessment & Triage' ),

			// 4. Equip Programme & Pacing
			array( 'slug' => 'current_program', 'label' => 'Current Program', 'type' => 'select-one', 'options' => array( 'sleep-tight', 'unburn', 'stress-buster', 'productivity-reset' ), 'group' => 'Equip Programme & Pacing' ),
			array( 'slug' => 'program_current_day', 'label' => 'Program Current Day', 'type' => 'number', 'group' => 'Equip Programme & Pacing' ),
			array( 'slug' => 'program_status', 'label' => 'Program Status', 'type' => 'select-one', 'options' => array( 'active', 'paused', 'completed', 'stalled' ), 'group' => 'Equip Programme & Pacing' ),
			array( 'slug' => 'programs_completed_count', 'label' => 'Programs Completed Count', 'type' => 'number', 'group' => 'Equip Programme & Pacing' ),
			array( 'slug' => 'last_program_active_at', 'label' => 'Last Program Active At', 'type' => 'date_time', 'group' => 'Equip Programme & Pacing' ),

			// 5. Mood Journal & Wellness Score
			array( 'slug' => 'latest_wellness_score', 'label' => 'Latest Wellness Score', 'type' => 'number', 'group' => 'Mood Journal & Wellness Score' ),
			array( 'slug' => 'wellness_7d_avg', 'label' => 'Wellness 7-Day Average', 'type' => 'number', 'group' => 'Mood Journal & Wellness Score' ),
			array( 'slug' => 'wellness_trend', 'label' => 'Wellness Trend', 'type' => 'select-one', 'options' => array( 'improving', 'stable', 'declining' ), 'group' => 'Mood Journal & Wellness Score' ),
			array( 'slug' => 'last_mood_rating', 'label' => 'Last Mood Rating', 'type' => 'number', 'group' => 'Mood Journal & Wellness Score' ),
			array( 'slug' => 'last_sleep_rating', 'label' => 'Last Sleep Rating', 'type' => 'number', 'group' => 'Mood Journal & Wellness Score' ),
			array( 'slug' => 'last_stress_level', 'label' => 'Last Stress Level', 'type' => 'number', 'group' => 'Mood Journal & Wellness Score' ),
			array( 'slug' => 'last_journal_date', 'label' => 'Last Journal Date', 'type' => 'date', 'group' => 'Mood Journal & Wellness Score' ),
			array( 'slug' => 'journal_entries_count', 'label' => 'Journal Entries Count', 'type' => 'number', 'group' => 'Mood Journal & Wellness Score' ),

			// 6. Reading & Activity
			array( 'slug' => 'saved_resources_count', 'label' => 'Saved Resources Count', 'type' => 'number', 'group' => 'Reading & Activity' ),
			array( 'slug' => 'opened_resources_count', 'label' => 'Opened Resources Count', 'type' => 'number', 'group' => 'Reading & Activity' ),
			array( 'slug' => 'last_resource_slug', 'label' => 'Last Resource Slug', 'type' => 'text', 'group' => 'Reading & Activity' ),
			array( 'slug' => 'last_resource_read_at', 'label' => 'Last Resource Read At', 'type' => 'date_time', 'group' => 'Reading & Activity' ),

			// 7. Consultations & Case
			array( 'slug' => 'assigned_clinician', 'label' => 'Assigned Clinician', 'type' => 'text', 'group' => 'Consultations & Case' ),
			array( 'slug' => 'next_consultation_at', 'label' => 'Next Consultation At', 'type' => 'date_time', 'group' => 'Consultations & Case' ),
			array( 'slug' => 'last_consultation_mode', 'label' => 'Last Consultation Mode', 'type' => 'select-one', 'options' => array( 'video', 'call', 'chat' ), 'group' => 'Consultations & Case' ),
			array( 'slug' => 'total_consultations', 'label' => 'Total Consultations', 'type' => 'number', 'group' => 'Consultations & Case' ),

			// 8. Settings & Push
			array( 'slug' => 'mood_reminders_enabled', 'label' => 'Mood Reminders Enabled', 'type' => 'select-one', 'options' => array( 'yes', 'no' ), 'group' => 'Settings & Push' ),
			array( 'slug' => 'mood_reminder_time', 'label' => 'Mood Reminder Time', 'type' => 'text', 'group' => 'Settings & Push' ),
			array( 'slug' => 'push_kind', 'label' => 'Push Kind', 'type' => 'select-one', 'options' => array( 'webpush', 'fcm', 'none' ), 'group' => 'Settings & Push' ),
			array( 'slug' => 'health_connect_enabled', 'label' => 'Health Connect Enabled', 'type' => 'select-one', 'options' => array( 'yes', 'no' ), 'group' => 'Settings & Push' ),
			array( 'slug' => 'share_with_consultant', 'label' => 'Share With Consultant', 'type' => 'select-one', 'options' => array( 'yes', 'no' ), 'group' => 'Settings & Push' ),

			// 9. Device, Time & Attribution
			array( 'slug' => 'device_platform', 'label' => 'Device Platform', 'type' => 'select-one', 'options' => array( 'web', 'android', 'ios', 'pwa' ), 'group' => 'Device, Time & Attribution' ),
			array( 'slug' => 'app_version', 'label' => 'App Version', 'type' => 'text', 'group' => 'Device, Time & Attribution' ),
			array( 'slug' => 'time_zone', 'label' => 'Time Zone', 'type' => 'text', 'group' => 'Device, Time & Attribution' ),
			array( 'slug' => 'last_user_agent', 'label' => 'Last User Agent', 'type' => 'textarea', 'group' => 'Device, Time & Attribution' ),
			array( 'slug' => 'last_seen_at', 'label' => 'Last Seen At', 'type' => 'date_time', 'group' => 'Device, Time & Attribution' ),
			array( 'slug' => 'utm_source', 'label' => 'UTM Source', 'type' => 'text', 'group' => 'Device, Time & Attribution' ),
			array( 'slug' => 'utm_medium', 'label' => 'UTM Medium', 'type' => 'text', 'group' => 'Device, Time & Attribution' ),
			array( 'slug' => 'utm_campaign', 'label' => 'UTM Campaign', 'type' => 'text', 'group' => 'Device, Time & Attribution' ),
			array( 'slug' => 'referrer_url', 'label' => 'Referrer URL', 'type' => 'text', 'group' => 'Device, Time & Attribution' ),
		);
	}

	/**
	 * Run the one-time push if the schema version has not been applied yet.
	 */
	public static function maybe_push_custom_fields() {
		if ( ! function_exists( 'fluentcrm_get_option' ) || ! function_exists( 'fluentcrm_update_option' ) ) {
			return;
		}

		$installed = get_option( self::OPTION_KEY, '0.0.0' );
		if ( version_compare( $installed, self::SCHEMA_VERSION, '>=' ) ) {
			return;
		}

		self::push_custom_fields();
		update_option( self::OPTION_KEY, self::SCHEMA_VERSION );
	}

	/**
	 * Idempotently merge iKAN custom fields into FluentCRM's contact_custom_fields option.
	 * Preserves any existing custom fields created manually in wp-admin.
	 *
	 * @return array{added: int, total: int}
	 */
	public static function push_custom_fields() {
		if ( ! function_exists( 'fluentcrm_get_option' ) || ! function_exists( 'fluentcrm_update_option' ) ) {
			return array( 'added' => 0, 'total' => 0 );
		}

		$existing = fluentcrm_get_option( 'contact_custom_fields', array() );
		if ( ! is_array( $existing ) ) {
			$existing = array();
		}

		$existing_slugs = array();
		foreach ( $existing as $field ) {
			if ( ! empty( $field['slug'] ) ) {
				$existing_slugs[ $field['slug'] ] = true;
			}
		}

		$added = 0;
		foreach ( self::get_field_definitions() as $def ) {
			$slug = $def['slug'];
			if ( isset( $existing_slugs[ $slug ] ) ) {
				continue;
			}

			$item = array(
				'field_key' => $slug,
				'slug'      => $slug,
				'label'     => $def['label'],
				'type'      => $def['type'],
			);
			if ( ! empty( $def['options'] ) ) {
				$item['options'] = $def['options'];
			}
			if ( ! empty( $def['group'] ) ) {
				$item['group'] = $def['group'];
			}

			$existing[]              = $item;
			$existing_slugs[ $slug ] = true;
			$added++;
		}

		if ( $added > 0 ) {
			fluentcrm_update_option( 'contact_custom_fields', $existing );
		}

		return array(
			'added' => $added,
			'total' => count( $existing ),
		);
	}

	/**
	 * Sync custom_values (and optional core contact fields) to FluentCRM for a given email.
	 * Empty/null values are omitted so existing contact data is never overwritten with blanks.
	 *
	 * @param string               $email         Contact email.
	 * @param array<string, mixed> $custom_values Map of custom field slug => value.
	 * @param array<string, mixed> $core_fields   Optional core FluentCRM fields (first_name, last_name, phone, city, etc.).
	 * @return mixed FluentCRM Subscriber model or false.
	 */
	public static function sync_contact( $email, $custom_values = array(), $core_fields = array() ) {
		if ( ! function_exists( 'FluentCrmApi' ) || empty( $email ) ) {
			return false;
		}

		$allowed_slugs = array();
		foreach ( self::get_field_definitions() as $def ) {
			$allowed_slugs[ $def['slug'] ] = true;
		}

		$filtered_custom = array();
		foreach ( $custom_values as $key => $val ) {
			if ( ! isset( $allowed_slugs[ $key ] ) ) {
				continue;
			}
			if ( $val === '' || $val === null ) {
				continue;
			}
			$filtered_custom[ $key ] = is_bool( $val ) ? ( $val ? 'yes' : 'no' ) : $val;
		}

		$payload = array_merge(
			array_filter(
				$core_fields,
				function ( $v ) {
					return $v !== '' && $v !== null;
				}
			),
			array(
				'email'         => sanitize_email( $email ),
				'custom_values' => $filtered_custom,
			)
		);

		try {
			return FluentCrmApi( 'contacts' )->createOrUpdate( $payload );
		} catch ( \Exception $e ) {
			error_log( 'iKAN FluentCRM sync_contact error: ' . $e->getMessage() );
			return false;
		}
	}
}

Ikan_FluentCRM_Fields::init();
