<?php
/**
 * iKAN Health — Secure Custom Fields (SCF) Clinical Field Group.
 *
 * Registers structured clinical meta fields on wp_users for member profiles
 * and clinician case management, mapping canonical IDs, scoring matrices,
 * and severity bands.
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
						'sleep-tight'         => 'Sleep Tight (Insomnia Recovery · 14 Days)',
						'unburn'              => 'Unburn (Workplace Burnout & Energy · 28 Days)',
						'stress-buster'       => 'Stress Buster (Anxiety & Overwhelm · 14 Days)',
						'productivity-reset'  => 'Productivity Reset (Focus & Flow · 7 Days)',
					),
					'allow_null'   => 1,
					'ui'           => 1,
					'wrapper'      => array( 'width' => '33' ),
				),
				array(
					'key'          => 'field_ikan_program_id',
					'label'        => 'Canonical Program ID',
					'name'         => 'program_id',
					'type'         => 'text',
					'instructions' => 'e.g. prg_sleep_tight_v2',
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
					'wrapper'      => array( 'width' => '17' ),
				),
				array(
					'key'          => 'field_ikan_program_status',
					'label'        => 'Pacing Status',
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
					'wrapper'      => array( 'width' => '17' ),
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
					'label'        => 'Last Check-In Date',
					'name'         => 'last_journal_date',
					'type'         => 'text',
					'instructions' => 'Date of most recent check-in (YYYY-MM-DD).',
					'wrapper'      => array( 'width' => '50' ),
				),

				// Tab 2: Clinical Assessment & Severity
				array(
					'key'   => 'field_tab_assessment_severity',
					'label' => 'Latest Assessment & Severity Matrix',
					'name'  => '',
					'type'  => 'tab',
				),
				array(
					'key'          => 'field_ikan_latest_assessment',
					'label'        => 'Latest Instrument',
					'name'         => 'latest_assessment',
					'type'         => 'select',
					'choices'      => array(
						''                                => '— None Completed —',
						'asm_1767129862254_frzeigbdb'     => 'PHQ-9 (Depression & Low Mood)',
						'asm_1767129765741_wse9aeprv'     => 'GAD-7 (Anxiety & Panic)',
						'asm_1767129926263_ru3v6dozh'     => 'PSS-10 (Perceived Stress)',
						'asm_1767130007889_mewy939gi'     => 'Insomnia Severity (Sleep Health)',
						'asm_1767130043662_wc4qpivfl'     => 'Workplace Strain (Life Balance)',
						'asm_1767129964930_bv8cqgm16'     => 'BAT-23 (Burnout Assessment Tool)',
						'asm_1767129718791_zj1t8hx3c'     => 'General Holistic Screen (Battery)',
						'feeling-depressed-and-hopeless'  => 'PHQ-9 (Depression & Low Mood)',
						'feeling-overwhelmed-and-anxious' => 'GAD-7 (Anxiety & Panic)',
						'feeling-worried-and-stressed'    => 'PSS-10 (Perceived Stress)',
						'struggling-with-quality-sleep'   => 'Insomnia Severity (Sleep Health)',
						'struggling-to-balance-life'      => 'Workplace Strain (Life Balance)',
						'feeling-drained-and-burned-out'  => 'BAT-23 (Burnout Assessment Tool)',
						'unsure-or-general-concern'       => 'General Holistic Screen (Battery)',
					),
					'ui'           => 1,
					'wrapper'      => array( 'width' => '35' ),
				),
				array(
					'key'          => 'field_ikan_assessment_id',
					'label'        => 'Assessment ID',
					'name'         => 'assessment_id',
					'type'         => 'text',
					'instructions' => 'Canonical assessment instrument ID.',
					'wrapper'      => array( 'width' => '25' ),
				),
				array(
					'key'          => 'field_ikan_assessment_result_id',
					'label'        => 'Result UUID',
					'name'         => 'assessment_result_id',
					'type'         => 'text',
					'instructions' => 'Unique submission UUID.',
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
						'severe'            => 'Severe (Requires Outreach)',
					),
					'ui'           => 1,
					'wrapper'      => array( 'width' => '25' ),
				),
				array(
					'key'          => 'field_ikan_scoring_matrix',
					'label'        => 'Scoring Matrix Spec',
					'name'         => 'scoring_matrix',
					'type'         => 'text',
					'instructions' => 'Instrument calc mode, score range, cut-points (e.g. PHQ-9: Sum, 0–27).',
					'wrapper'      => array( 'width' => '40' ),
				),
				array(
					'key'          => 'field_ikan_clinical_risk_flag',
					'label'        => 'High-Risk Alert',
					'name'         => 'clinical_risk_flag',
					'type'         => 'true_false',
					'message'      => 'Active clinical triage alert (requires outreach)',
					'wrapper'      => array( 'width' => '15' ),
				),

				// Tab 3: Longitudinal Wellness Trajectory
				array(
					'key'   => 'field_tab_wellness_trajectory',
					'label' => 'Longitudinal Wellness Trajectory',
					'name'  => '',
					'type'  => 'tab',
				),
				array(
					'key'          => 'field_ikan_latest_wellness_score',
					'label'        => 'Holistic Wellness Score (0–100)',
					'name'         => 'latest_wellness_score',
					'type'         => 'number',
					'min'          => 0,
					'max'          => 100,
					'wrapper'      => array( 'width' => '33' ),
				),
				array(
					'key'          => 'field_ikan_wellness_7d_avg',
					'label'        => '7-Day Rolling Average',
					'name'         => 'wellness_7d_avg',
					'type'         => 'number',
					'step'         => 0.1,
					'wrapper'      => array( 'width' => '33' ),
				),
				array(
					'key'          => 'field_ikan_wellness_trajectory_trend',
					'label'        => 'Trajectory Trend',
					'name'         => 'wellness_trajectory_trend',
					'type'         => 'select',
					'choices'      => array(
						'improving' => 'Improving (Trending Up)',
						'stable'    => 'Stable',
						'declining' => 'Declining (Trending Down)',
					),
					'wrapper'      => array( 'width' => '34' ),
				),

				// Tab 4: Clinician Assignment & Case Notes
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
					'key'          => 'field_ikan_supabase_user_id',
					'label'        => 'Buffer Sync UUID',
					'name'         => '_ikan_supabase_user_id',
					'type'         => 'text',
					'instructions' => 'Supabase Interim Buffer auth UUID.',
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
