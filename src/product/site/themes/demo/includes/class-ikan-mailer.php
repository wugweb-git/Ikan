<?php
/**
 * iKAN Health — Transactional Email & Clinical Alert Dispatcher
 *
 * Implements branded, mobile-first HTML email templates adhering to the
 * iKAN design tokens and clinical safety protocols.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_Mailer {

	const TEXT_DOMAIN = 'ikan';

	/**
	 * Boot hooks and CLI handlers.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_preview_routes' ) );

		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			WP_CLI::add_command( 'ikan-email', array( __CLASS__, 'cli_handler' ) );
		}
	}

	/**
	 * Get the absolute directory where email templates reside.
	 */
	public static function get_templates_dir() {
		return trailingslashit( get_template_directory() ) . 'templates/emails/';
	}

	/**
	 * Safe template renderer using ob_start and EXTR_SKIP.
	 *
	 * @param string $path File path.
	 * @param array  $vars Template variables.
	 * @return string
	 */
	public static function render_template( $path, $vars = array() ) {
		if ( ! is_readable( $path ) ) {
			return '';
		}

		// phpcs:ignore WordPress.PHP.DontExtract.extract_extract -- controlled template vars
		extract( $vars, EXTR_SKIP );

		ob_start();
		include $path;
		return (string) ob_get_clean();
	}

	/**
	 * Renders an email wrapped in the compact base shell.
	 *
	 * @param string $template_name Template filename without .php extension.
	 * @param array  $vars          Variables for both content and base shell.
	 * @return string HTML content.
	 */
	public static function render_email( $template_name, $vars = array() ) {
		$dir = self::get_templates_dir();

		// Ensure defaults
		$vars['site_name'] = ! empty( $vars['site_name'] ) ? $vars['site_name'] : get_bloginfo( 'name' );
		$vars['site_url']  = ! empty( $vars['site_url'] ) ? $vars['site_url'] : home_url( '/' );
		$vars['subject']   = ! empty( $vars['subject'] ) ? $vars['subject'] : 'iKAN Health Notification';

		// Render inner content first
		$vars['content'] = self::render_template( $dir . $template_name . '.php', $vars );

		// Render outer shell with inner content injected
		return self::render_template( $dir . 'base.php', $vars );
	}

	/**
	 * Send Member Assessment Result Email.
	 *
	 * @param array $args Assessment result context.
	 * @return bool Whether the email was accepted for delivery.
	 */
	public static function send_member_assessment_result( $args = array() ) {
		$to = ! empty( $args['email'] ) ? sanitize_email( $args['email'] ) : '';
		if ( empty( $to ) || ! is_email( $to ) ) {
			return false;
		}

		$result_id = ! empty( $args['assessment_result_id'] ) ? sanitize_text_field( $args['assessment_result_id'] ) : '';
		if ( $result_id ) {
			$meta_key = '_ikan_result_email_sent_' . md5( $result_id );
			if ( get_transient( $meta_key ) ) {
				// Already emailed for this exact result ID
				return true;
			}
		}

		$slug            = ! empty( $args['slug'] ) ? sanitize_text_field( $args['slug'] ) : 'general';
		$score           = isset( $args['score'] ) ? (int) $args['score'] : 0;
		$severity        = ! empty( $args['severity'] ) ? sanitize_text_field( $args['severity'] ) : 'minimal';
		$band_label      = ! empty( $args['band_label'] ) ? sanitize_text_field( $args['band_label'] ) : ucfirst( $severity );
		$has_risk        = ! empty( $args['risk'] );
		$user_name       = ! empty( $args['name'] ) ? sanitize_text_field( $args['name'] ) : 'Member';
		$inst            = class_exists( 'Ikan_Interim_Sync' ) ? Ikan_Interim_Sync::get_clinical_instrument( $slug ) : array( 'name' => 'Wellbeing Screener', 'code' => 'Screen' );
		$max_score       = self::get_max_score( $slug );
		$interpretation  = self::get_interpretation( $slug, $score, $severity, $has_risk );
		$recommendation  = self::get_recommendation( $slug, $severity );

		$app_host = defined( 'IKAN_APP_URL' ) ? IKAN_APP_URL : 'https://app.ikanhealth.in';
		$result_url = $result_id ? "{$app_host}/assessments/{$slug}/result/{$result_id}" : "{$app_host}/assessments";

		$subject = sprintf( 'Your %s Assessment Summary (%s)', $inst['code'], $band_label );

		$vars = array(
			'subject'         => $subject,
			'preheader'       => sprintf( '%s score: %d (%s). View your clinical summary.', $inst['code'], $score, $band_label ),
			'user_name'       => $user_name,
			'instrument_name' => $inst['name'],
			'instrument_code' => $inst['code'],
			'score'           => $score,
			'max_score'       => $max_score,
			'severity'        => $severity,
			'severity_label'  => $band_label,
			'interpretation'  => $interpretation,
			'recommendation'  => $recommendation,
			'completed_at'    => current_time( 'j F Y' ),
			'result_url'      => $result_url,
			'has_risk'        => $has_risk,
		);

		$body    = self::render_email( 'assessment-result', $vars );
		$headers = array(
			'Content-Type: text/html; charset=UTF-8',
			'From: iKAN Health <noreply@ikanhealth.in>',
		);

		$sent = wp_mail( $to, $subject, $body, $headers );

		if ( $sent && $result_id ) {
			set_transient( $meta_key, 1, 30 * DAY_IN_SECONDS );
		}

		return $sent;
	}

	/**
	 * Send Clinical Risk Alert Email to Care Team / Admin.
	 *
	 * @param array $args Assessment and member details.
	 * @return bool Whether the email was sent.
	 */
	public static function send_clinical_alert( $args = array() ) {
		$recipients = self::get_clinical_alert_recipients();
		if ( empty( $recipients ) ) {
			return false;
		}

		$result_id = ! empty( $args['assessment_result_id'] ) ? sanitize_text_field( $args['assessment_result_id'] ) : '';
		if ( $result_id ) {
			$meta_key = '_ikan_clinical_alert_sent_' . md5( $result_id );
			if ( get_transient( $meta_key ) ) {
				return true;
			}
		}

		$slug           = ! empty( $args['slug'] ) ? sanitize_text_field( $args['slug'] ) : 'general';
		$score          = isset( $args['score'] ) ? (int) $args['score'] : 0;
		$severity       = ! empty( $args['severity'] ) ? sanitize_text_field( $args['severity'] ) : 'severe';
		$band_label     = ! empty( $args['band_label'] ) ? sanitize_text_field( $args['band_label'] ) : ucfirst( $severity );
		$has_risk       = ! empty( $args['risk'] );
		$user_name      = ! empty( $args['name'] ) ? sanitize_text_field( $args['name'] ) : 'Member';
		$user_email     = ! empty( $args['email'] ) ? sanitize_email( $args['email'] ) : 'Unknown';
		$uid            = ! empty( $args['supabase_user_id'] ) ? sanitize_text_field( $args['supabase_user_id'] ) : '';
		$wp_user_id     = ! empty( $args['wp_user_id'] ) ? (int) $args['wp_user_id'] : 0;
		$inst           = class_exists( 'Ikan_Interim_Sync' ) ? Ikan_Interim_Sync::get_clinical_instrument( $slug ) : array( 'name' => 'Wellbeing Screener', 'code' => 'Screen' );
		$max_score      = self::get_max_score( $slug );

		$risk_reasons = array();
		if ( $has_risk ) {
			$risk_reasons[] = 'Item 9 (Thoughts of self-harm / suicidal ideation) endorsed on screening.';
		}
		if ( in_array( $severity, array( 'severe', 'moderately-severe', 'high' ), true ) ) {
			$risk_reasons[] = sprintf( 'Symptom severity is %s with score %d/%d.', $band_label, $score, $max_score );
		}
		$risk_detail = implode( ' ', $risk_reasons );

		$crm_contact_url = admin_url( 'admin.php?page=fluentcrm-admin#/subscribers' );
		if ( ! empty( $args['fc_sub_id'] ) ) {
			$crm_contact_url = admin_url( 'admin.php?page=fluentcrm-admin#/subscribers/' . (int) $args['fc_sub_id'] );
		}
		$wp_user_url = $wp_user_id ? admin_url( 'user-edit.php?user_id=' . $wp_user_id ) : admin_url( 'users.php' );

		$subject = sprintf( '[URGENT CLINICAL ALERT] %s: %s (%s, Score: %d)', $has_risk ? 'Self-Harm Risk' : 'Severe Score', $user_name, $inst['code'], $score );

		$vars = array(
			'subject'         => $subject,
			'preheader'       => sprintf( 'Clinical Alert: %s flagged %s (%d/%d). Prompt clinical triage recommended.', $user_name, $band_label, $score, $max_score ),
			'user_name'       => $user_name,
			'user_email'      => $user_email,
			'supabase_uid'    => $uid,
			'wp_user_id'      => $wp_user_id,
			'instrument_name' => $inst['name'],
			'instrument_code' => $inst['code'],
			'score'           => $score,
			'max_score'       => $max_score,
			'severity_label'  => $band_label,
			'has_risk'        => $has_risk,
			'risk_detail'     => $risk_detail,
			'completed_at'    => current_time( 'j F Y, H:i T' ),
			'crm_contact_url' => $crm_contact_url,
			'wp_user_url'     => $wp_user_url,
		);

		$body    = self::render_email( 'clinical-alert', $vars );
		$headers = array(
			'Content-Type: text/html; charset=UTF-8',
			'From: iKAN Clinical Alert <noreply@ikanhealth.in>',
		);

		$all_sent = true;
		foreach ( $recipients as $recipient ) {
			$s = wp_mail( $recipient, $subject, $body, $headers );
			if ( ! $s ) {
				$all_sent = false;
			}
		}

		if ( $all_sent && $result_id ) {
			set_transient( $meta_key, 1, 30 * DAY_IN_SECONDS );
		}

		return $all_sent;
	}

	/**
	 * Get recipients for clinical alerts.
	 *
	 * @return array List of valid emails.
	 */
	public static function get_clinical_alert_recipients() {
		$list = array();

		// Constant defined in wp-config.php
		if ( defined( 'IKAN_CLINICAL_ALERT_EMAIL' ) && IKAN_CLINICAL_ALERT_EMAIL ) {
			$parts = explode( ',', IKAN_CLINICAL_ALERT_EMAIL );
			foreach ( $parts as $p ) {
				$clean = sanitize_email( trim( $p ) );
				if ( is_email( $clean ) ) {
					$list[] = $clean;
				}
			}
		}

		// Option from DB
		$opt = get_option( 'ikan_clinical_alert_email' );
		if ( $opt ) {
			$parts = explode( ',', $opt );
			foreach ( $parts as $p ) {
				$clean = sanitize_email( trim( $p ) );
				if ( is_email( $clean ) && ! in_array( $clean, $list, true ) ) {
					$list[] = $clean;
				}
			}
		}

		// Defaults
		if ( empty( $list ) ) {
			$admin = get_option( 'admin_email' );
			if ( is_email( $admin ) ) {
				$list[] = $admin;
			}
			$list[] = 'support@ikanhealth.in';
		}

		return array_unique( $list );
	}

	/**
	 * Max score lookup for standard instruments.
	 */
	public static function get_max_score( $slug ) {
		$clean = strtolower( trim( $slug ) );
		if ( strpos( $clean, 'depress' ) !== false || strpos( $clean, 'phq' ) !== false ) {
			return 27;
		}
		if ( strpos( $clean, 'anxi' ) !== false || strpos( $clean, 'gad' ) !== false ) {
			return 21;
		}
		if ( strpos( $clean, 'stress' ) !== false || strpos( $clean, 'pss' ) !== false ) {
			return 40;
		}
		if ( strpos( $clean, 'sleep' ) !== false || strpos( $clean, 'isi' ) !== false ) {
			return 28;
		}
		if ( strpos( $clean, 'burnout' ) !== false || strpos( $clean, 'bat' ) !== false ) {
			return 5;
		}
		if ( strpos( $clean, 'balance' ) !== false || strpos( $clean, 'strain' ) !== false ) {
			return 40;
		}
		return 100;
	}

	/**
	 * Clinical interpretation copy generator.
	 */
	public static function get_interpretation( $slug, $score, $severity, $has_risk ) {
		$clean = strtolower( trim( $slug ) );
		$sev   = strtolower( trim( $severity ) );

		if ( strpos( $clean, 'depress' ) !== false || strpos( $clean, 'phq' ) !== false ) {
			switch ( $sev ) {
				case 'minimal':
					return 'Your score reflects few or minimal signs of depression. Fluctuations in mood are natural; continuing routine self-care and balanced lifestyle habits will support your ongoing emotional wellness.';
				case 'mild':
					return 'Your responses indicate mild low mood or occasional fatigue. While these symptoms may not severely interrupt your daily functioning, gentle daily routines, regular physical movement, and restful sleep can prevent them from escalating.';
				case 'moderate':
					return 'Your responses indicate noticeable, persistent low mood and reduced interest in regular activities. These symptoms may be impacting your concentration, daily motivation, and energy.';
				case 'moderately-severe':
				case 'severe':
					return 'Your score indicates significant depressive symptoms that are likely causing considerable distress in your daily work, relationships, or personal routines. Reaching out to a qualified psychologist or counsellor is strongly advised.';
				default:
					return 'Your screening provides a baseline measure of current mood and emotional vitality.';
			}
		}

		if ( strpos( $clean, 'anxi' ) !== false || strpos( $clean, 'gad' ) !== false ) {
			switch ( $sev ) {
				case 'minimal':
					return 'Your score indicates minimal anxiety. Nervousness or worry appear well within manageable daily parameters.';
				case 'mild':
					return 'Your responses reflect mild worry or physical tension. Evidence-based breathing exercises and grounding techniques can help restore balance when stressful situations arise.';
				case 'moderate':
					return 'Your score indicates moderate anxiety symptoms, such as restlessness, persistent worry, or difficulty unwinding. Targeted stress management and cognitive coping tools can help ease this load.';
				case 'moderately-severe':
				case 'severe':
					return 'Your score reflects severe anxiety that is likely creating significant physical tension, racing thoughts, or disruption in daily activities. Guided clinical support is recommended.';
				default:
					return 'Your screening offers a helpful snapshot of your current anxiety and stress levels.';
			}
		}

		if ( strpos( $clean, 'burnout' ) !== false || strpos( $clean, 'bat' ) !== false ) {
			return 'Your responses highlight the degree of mental and physical exhaustion experienced at work or in daily demands. Restoring boundaries and emotional recovery intervals is key.';
		}

		if ( strpos( $clean, 'sleep' ) !== false || strpos( $clean, 'isi' ) !== false ) {
			return 'Your score provides insights into sleep onset, night awakenings, and daytime alertness. Healthy sleep hygiene and cognitive calming routines can improve sleep architecture.';
		}

		return 'Your assessment results give a valuable snapshot of your emotional state today. Regular check-ins help you monitor subtle changes and take proactive action.';
	}

	/**
	 * Care pathway and program recommendation generator.
	 */
	public static function get_recommendation( $slug, $severity ) {
		$clean = strtolower( trim( $slug ) );
		$sev   = strtolower( trim( $severity ) );

		if ( strpos( $clean, 'depress' ) !== false || strpos( $clean, 'phq' ) !== false ) {
			if ( in_array( $sev, array( 'moderately-severe', 'severe' ), true ) ) {
				return 'Consider booking a confidential 1:1 consultation with an iKAN licensed psychologist to develop an individualized care plan.';
			}
			return 'We recommend starting the "Stress Buster" or "Unburn" Equip program in your member app for daily cognitive and mood rebalancing.';
		}

		if ( strpos( $clean, 'anxi' ) !== false || strpos( $clean, 'gad' ) !== false ) {
			if ( in_array( $sev, array( 'moderately-severe', 'severe' ), true ) ) {
				return 'Consulting with a licensed clinical psychologist or counsellor can help you learn targeted somatic and cognitive tools to manage high anxiety.';
			}
			return 'Try the "Stress Buster" 21-day Equip curriculum to master evidence-based physiological sigh and nervous system resets.';
		}

		if ( strpos( $clean, 'sleep' ) !== false || strpos( $clean, 'isi' ) !== false ) {
			return 'Start the "Sleep Tight" Equip program for step-by-step stimulus control and wind-down protocols.';
		}

		if ( strpos( $clean, 'burnout' ) !== false || strpos( $clean, 'bat' ) !== false ) {
			return 'Explore the "Unburn" and "Productivity Reset" Equip curricula to recalibrate workplace boundaries and energy reserve management.';
		}

		return 'Explore our curated mental wellness resources and interactive Equip journeys in the iKAN app.';
	}

	/**
	 * Register preview REST routes for easy browser validation.
	 */
	public static function register_preview_routes() {
		register_rest_route( 'ikan/v1', '/email/preview', array(
			'methods'             => 'GET',
			'callback'            => array( __CLASS__, 'rest_preview_email' ),
			'permission_callback' => '__return_true',
		) );
	}

	/**
	 * REST callback for previewing emails in the browser.
	 */
	public static function rest_preview_email( $request ) {
		$template = $request->get_param( 'template' ) ?: 'assessment-result';
		$slug     = $request->get_param( 'slug' ) ?: 'feeling-depressed-and-hopeless';
		$score    = (int) ( $request->get_param( 'score' ) ?: 14 );
		$severity = $request->get_param( 'severity' ) ?: 'moderate';
		$risk     = (bool) ( $request->get_param( 'risk' ) ?: 0 );

		$inst           = class_exists( 'Ikan_Interim_Sync' ) ? Ikan_Interim_Sync::get_clinical_instrument( $slug ) : array( 'name' => 'PHQ-9 Depression Screener', 'code' => 'PHQ-9' );
		$band_label     = class_exists( 'Ikan_Interim_Sync' ) ? Ikan_Interim_Sync::format_severity_label( $severity ) : ucfirst( $severity );
		$max_score      = self::get_max_score( $slug );
		$interpretation = self::get_interpretation( $slug, $score, $severity, $risk );
		$recommendation = self::get_recommendation( $slug, $severity );

		$vars = array(
			'subject'         => 'iKAN Clinical Summary Preview',
			'user_name'       => 'Priya Sharma',
			'user_email'      => 'priya.sharma@example.com',
			'supabase_uid'    => 'usr_98a72b1c4e',
			'wp_user_id'      => 42,
			'instrument_name' => $inst['name'],
			'instrument_code' => $inst['code'],
			'score'           => $score,
			'max_score'       => $max_score,
			'severity'        => $severity,
			'severity_label'  => $band_label,
			'has_risk'        => $risk,
			'risk_detail'     => 'Member endorsed suicidal ideation item on PHQ-9 (Item 9 > 0).',
			'interpretation'  => $interpretation,
			'recommendation'  => $recommendation,
			'completed_at'    => current_time( 'j F Y, H:i T' ),
			'result_url'      => 'https://app.ikanhealth.in/assessments',
			'crm_contact_url' => admin_url( 'admin.php?page=fluentcrm-admin#/subscribers' ),
			'wp_user_url'     => admin_url( 'users.php' ),
		);

		$html = self::render_email( $template, $vars );
		header( 'Content-Type: text/html; charset=UTF-8' );
		echo $html;
		exit;
	}

	/**
	 * WP-CLI handler for testing transactional emails.
	 */
	public static function cli_handler( $args, $assoc_args ) {
		$action = $args[0] ?? 'help';

		switch ( $action ) {
			case 'test-result':
				$to       = $args[1] ?? get_option( 'admin_email' );
				$slug     = $assoc_args['slug'] ?? 'feeling-depressed-and-hopeless';
				$score    = isset( $assoc_args['score'] ) ? (int) $assoc_args['score'] : 14;
				$severity = $assoc_args['severity'] ?? 'moderate';
				$risk     = ! empty( $assoc_args['risk'] );

				WP_CLI::line( "Dispatching test result email for {$slug} (Score: {$score}, Severity: {$severity}) to {$to}..." );
				$sent = self::send_member_assessment_result( array(
					'email'      => $to,
					'name'       => 'Test Member',
					'slug'       => $slug,
					'score'      => $score,
					'severity'   => $severity,
					'band_label' => ucfirst( $severity ),
					'risk'       => $risk,
				) );

				if ( $sent ) {
					WP_CLI::success( "Assessment result email delivered to {$to}!" );
				} else {
					WP_CLI::error( "Failed to dispatch email. Check mail logs or SMTP configuration." );
				}
				break;

			case 'test-alert':
				$to       = $args[1] ?? get_option( 'admin_email' );
				$slug     = $assoc_args['slug'] ?? 'feeling-depressed-and-hopeless';
				$score    = isset( $assoc_args['score'] ) ? (int) $assoc_args['score'] : 21;
				$severity = $assoc_args['severity'] ?? 'severe';
				$risk     = true;

				WP_CLI::line( "Dispatching test clinical alert email to {$to}..." );
				$sent = self::send_clinical_alert( array(
					'email'        => 'member@example.com',
					'name'         => 'Test Flagged Member',
					'slug'         => $slug,
					'score'        => $score,
					'severity'     => $severity,
					'band_label'   => 'Severe',
					'risk'         => $risk,
					'supabase_uid' => 'usr_test_clinical_alert',
				) );

				if ( $sent ) {
					WP_CLI::success( "Clinical alert email delivered to care team!" );
				} else {
					WP_CLI::error( "Failed to dispatch alert. Check mail logs." );
				}
				break;

			default:
				WP_CLI::line( "Usage: wp ikan-email [test-result <to_email> --slug=phq-9 --score=14 --severity=moderate] [test-alert <to_email>]" );
		}
	}
}

// Boot class
Ikan_Mailer::init();
