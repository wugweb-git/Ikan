<?php
/**
 * iKAN Database Schema Manager.
 *
 * Handles creation and maintenance of custom database tables for clinical programs,
 * assessment histories, encrypted journals, and wellness trajectories.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_DB_Schema {

	const DB_VERSION = '1.0.0';

	/**
	 * Initialize schema checks.
	 */
	public static function init() {
		// Run table creation on admin init or theme switch if version bumped.
		add_action( 'admin_init', array( __CLASS__, 'maybe_update_schema' ) );
	}

	/**
	 * Check if schema requires update.
	 */
	public static function maybe_update_schema() {
		$installed_ver = get_option( 'ikan_db_version', '0.0.0' );
		if ( version_compare( $installed_ver, self::DB_VERSION, '<' ) ) {
			self::create_tables();
			update_option( 'ikan_db_version', self::DB_VERSION );
		}
	}

	/**
	 * Create the 4 custom tables cleanly via $wpdb.
	 */
	public static function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();
		if ( empty( $charset_collate ) ) {
			$charset_collate = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';
		}

		// 1. Assessment Results Table
		$table_assessments = $wpdb->prefix . 'ikan_assessment_results';
		$wpdb->query( "CREATE TABLE IF NOT EXISTS $table_assessments (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			supabase_user_id varchar(64) NOT NULL DEFAULT '',
			user_email varchar(100) NOT NULL DEFAULT '',
			assessment_slug varchar(64) NOT NULL,
			assessment_result_id varchar(64) NOT NULL DEFAULT '',
			score int(11) NOT NULL DEFAULT 0,
			max_score int(11) NOT NULL DEFAULT 0,
			severity_band varchar(32) NOT NULL DEFAULT '',
			duration_seconds int(11) NOT NULL DEFAULT 0,
			answers longtext DEFAULT NULL,
			snapshot longtext DEFAULT NULL,
			completed_at datetime NOT NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY user_id (user_id),
			KEY supabase_user_id (supabase_user_id),
			KEY assessment_slug (assessment_slug),
			KEY completed_at (completed_at),
			UNIQUE KEY result_uuid (assessment_result_id)
		) $charset_collate;" );

		// 2. Program Progress Table
		$table_program = $wpdb->prefix . 'ikan_program_progress';
		$wpdb->query( "CREATE TABLE IF NOT EXISTS $table_program (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			supabase_user_id varchar(64) NOT NULL DEFAULT '',
			user_email varchar(100) NOT NULL DEFAULT '',
			program_slug varchar(64) NOT NULL,
			current_day int(11) NOT NULL DEFAULT 1,
			completed_days text DEFAULT NULL,
			completed_at_map text DEFAULT NULL,
			answers longtext DEFAULT NULL,
			feedback longtext DEFAULT NULL,
			tracker_data longtext DEFAULT NULL,
			collections longtext DEFAULT NULL,
			status varchar(32) NOT NULL DEFAULT 'active',
			last_active_at datetime DEFAULT NULL,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY user_id (user_id),
			KEY supabase_user_id (supabase_user_id),
			KEY program_slug (program_slug),
			UNIQUE KEY user_program (supabase_user_id, program_slug)
		) $charset_collate;" );

		// 3. Encrypted Journal Table
		$table_journal = $wpdb->prefix . 'ikan_journals';
		$wpdb->query( "CREATE TABLE IF NOT EXISTS $table_journal (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			supabase_user_id varchar(64) NOT NULL DEFAULT '',
			user_email varchar(100) NOT NULL DEFAULT '',
			entry_uuid varchar(64) NOT NULL DEFAULT '',
			entry_date date NOT NULL,
			mood_rating tinyint(3) DEFAULT NULL,
			sleep_rating tinyint(3) DEFAULT NULL,
			stress_level tinyint(3) DEFAULT NULL,
			energy tinyint(3) DEFAULT NULL,
			pain_exist tinyint(1) DEFAULT NULL,
			pain_experience tinyint(3) DEFAULT NULL,
			pain_impact tinyint(3) DEFAULT NULL,
			context_tags text DEFAULT NULL,
			encrypted_reflection longtext DEFAULT NULL,
			iv varchar(64) DEFAULT NULL,
			salt varchar(64) DEFAULT NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY user_id (user_id),
			KEY supabase_user_id (supabase_user_id),
			KEY entry_date (entry_date),
			UNIQUE KEY entry_uuid_idx (entry_uuid)
		) $charset_collate;" );

		// 4. Wellness Scores Table
		$table_wellness = $wpdb->prefix . 'ikan_wellness_scores';
		$wpdb->query( "CREATE TABLE IF NOT EXISTS $table_wellness (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			supabase_user_id varchar(64) NOT NULL DEFAULT '',
			user_email varchar(100) NOT NULL DEFAULT '',
			score_date date NOT NULL,
			overall_score int(11) NOT NULL DEFAULT 0,
			subscores text DEFAULT NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY user_id (user_id),
			KEY supabase_user_id (supabase_user_id),
			KEY score_date (score_date),
			UNIQUE KEY user_score_date (supabase_user_id, score_date)
		) $charset_collate;" );

		return true;
	}
}

// Auto-initialize
Ikan_DB_Schema::init();
