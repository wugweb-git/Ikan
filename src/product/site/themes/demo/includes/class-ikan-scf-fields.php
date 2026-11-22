<?php
/**
 * iKAN Health — Secure Custom Fields (SCF) Clinical Field Group.
 *
 * Registers structured clinical meta fields on wp_users for member profiles
 * and clinician case management.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_SCF_Fields {

	/**
	 * Boot hooks.
	 */
	public static function init() {
		add_action( 'acf/init', array( __CLASS__, 'register_member_clinical_fields' ) );
		// Fallback in case acf/init already fired
		add_action( 'init', array( __CLASS__, 'maybe_register_fields' ), 20 );
	}

	/**
	 * Wrapper to register fields if SCF/ACF is loaded.
	 */
	public static function maybe_register_fields() {
		if ( function_exists( 'acf_add_local_field_group' ) && ! did_action( 'ikan_scf_fields_registered' ) ) {
			self::register_member_clinical_fields();
		}
	}

	/**
	 * Register the SCF Member Clinical & Case Management Field Group.
	 */
	public static function register_member_clinical_fields() {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		if ( did_action( 'ikan_scf_fields_registered' ) ) {
			return;
		}

		acf_add_local_field_group( array(
			'key'                   => 'group_ikan_member_clinical',
			'title'                 => 'iKAN Clinical & Member Profile',
			'fields'                => array(
				// Tab 1: Clinical Pacing & Equip Programs
				array(
					'key'   => 'field_tab_clinical_pacing',
					'label' => 'Equip Program & Pacing',
					'name'  => '',
					'type'  => 'tab',
				),
				array(
					'key'          => 'field_ikan_current_program',
					'label'        => 'Current Equip Program',
					'name'         => 'current_program',
					'type'         => 'select',
					'choices'      => array(
						''                    => '— None / Not Enrolled —',
						'sleep-tight'         => 'Sleep Tight (Insomnia & Recovery)',
						'unburn'              => 'Unburn (Workplace Burnout & Energy)',
						'stress-buster'       => 'Stress Buster (Anxiety & Overwhelm)',
						'productivity-reset'  => 'Productivity Reset (Focus & Flow)',
					),
					'allow_null'   => 1,
					'ui'           => 1,
					'wrapper'      => array( 'width' => '33' ),
				),
				array(
					'key'          => 'field_ikan_program_current_day',
					'label'        => 'Current Active Day',
					'name'         => 'program_current_day',
					'type'         => 'number',
					'min'          => 1,
					'max'          => 28,
					'step'         => 1,
					'default_value'=> 1,
					'wrapper'      => array( 'width' => '33' ),
				),
				array(
					'key'          => 'field_ikan_program_status',
					'label'        => 'Program Pacing Status',
					'name'         => 'program_status',
					'type'         => 'select',
					'choices'      => array(
						'active'    => 'Active (On Track)',
						'paused'    => 'Paused',
						'completed' => 'Completed Track',
						'stalled'   => 'Stalled (>4 Days Inactive)',
					),
					'default_value'=> 'active',
					'ui'           => 1,
					'wrapper'      => array( 'width' => '33' ),
				),
				array(
					'key'          => 'field_ikan_last_active_at',
					'label'        => 'Last Active Instant',
					'name'         => 'last_active_at',
					'type'         => 'text',
					'instructions' => 'Last completed day or exercise timestamp.',
					'wrapper'      => array( 'width' => '50' ),
				),
				array(
					'key'          => 'field_ikan_last_journal_date',
					'label'        => 'Last Mood/Sleep Check-In',
					'name'         => 'last_journal_date',
					'type'         => 'text',
					'instructions' => 'Date of most recent daily check-in (YYYY-MM-DD).',
					'wrapper'      => array( 'width' => '50' ),
				),

				// Tab 2: Clinical Assessment & Severity
				array(
					'key'   => 'field_tab_assessment_severity',
					'label' => 'Latest Assessment & Triage',
					'name'  => '',
					'type'  => 'tab',
				),
				array(
					'key'          => 'field_ikan_latest_assessment',
					'label'        => 'Latest Completed Instrument',
					'name'         => 'latest_assessment',
					'type'         => 'select',
					'choices'      => array(
						''                                => '— None Completed —',
						'feeling-depressed-and-hopeless' => 'PHQ-9 (Depression & Low Mood)',
						'feeling-worried-and-stressed'   => 'GAD-7 (Anxiety & Worry)',
						'feeling-overwhelmed-and-anxious'=> 'PSS-10 (Perceived Stress)',
						'feeling-drained-and-burned-out' => 'BAT-23 (Burnout Assessment Tool)',
						'struggling-with-quality-sleep'  => 'SCI (Sleep Condition Indicator)',
						'struggling-to-balance-life'     => 'WHO-5 (Work-Life Well-being)',
						'unsure-or-general-concern'      => 'General Holistic Concern',
					),
					'ui'           => 1,
					'wrapper'      => array( 'width' => '40' ),
				),
				array(
					'key'          => 'field_ikan_latest_score',
					'label'        => 'Total Score',
					'name'         => 'latest_score',
					'type'         => 'number',
					'wrapper'      => array( 'width' => '20' ),
				),
				array(
					'key'          => 'field_ikan_latest_severity',
					'label'        => 'Severity Band',
					'name'         => 'latest_severity',
					'type'         => 'select',
					'choices'      => array(
						'normal'            => 'Normal / Minimal',
						'mild'              => 'Mild',
						'moderate'          => 'Moderate',
						'moderately-severe' => 'Moderately Severe',
						'severe'            => 'Severe (Clinician Review)',
					),
					'ui'           => 1,
					'wrapper'      => array( 'width' => '25' ),
				),
				array(
					'key'          => 'field_ikan_clinical_risk_flag',
					'label'        => 'High-Risk Alert',
					'name'         => 'clinical_risk_flag',
					'type'         => 'true_false',
					'message'      => 'Active clinical triage alert (requires outreach)',
					'wrapper'      => array( 'width' => '15' ),
				),
				array(
					'key'          => 'field_ikan_latest_wellness_score',
					'label'        => 'Current Holistic Wellness Score (0–100)',
					'name'         => 'latest_wellness_score',
					'type'         => 'number',
					'min'          => 0,
					'max'          => 100,
					'wrapper'      => array( 'width' => '50' ),
				),

				// Tab 3: Clinician Assignment & Notes
				array(
					'key'   => 'field_tab_case_management',
					'label' => 'Clinician Case Management',
					'name'  => '',
					'type'  => 'tab',
				),
				array(
					'key'          => 'field_ikan_assigned_clinician',
					'label'        => 'Assigned Clinician',
					'name'         => 'assigned_clinician',
					'type'         => 'text',
					'placeholder'  => 'e.g. Dr. Vedanshu / Lead Clinical Psychologist',
					'wrapper'      => array( 'width' => '50' ),
				),
				array(
					'key'          => 'field_ikan_clinical_case_notes',
					'label'        => 'Internal Clinician Case Notes',
					'name'         => 'clinical_case_notes',
					'type'         => 'textarea',
					'rows'         => 4,
					'instructions' => 'Private clinical review notes (only visible to administrators and clinicians).',
				),
			),
			'location'              => array(
				array(
					array(
						'param'    => 'user_form',
						'operator' => '==',
						'value'    => 'all',
					),
				),
			),
			'menu_order'            => 10,
			'position'              => 'normal',
			'style'                 => 'default',
			'label_placement'       => 'top',
			'instruction_placement' => 'label',
			'active'                => true,
		) );

		do_action( 'ikan_scf_fields_registered' );
	}
}

// Auto-initialize
Ikan_SCF_Fields::init();
