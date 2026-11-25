<?php
/**
 * iKAN Health — FluentCRM Email Templates Engine
 *
 * Compiles and registers branded iKAN HTML email templates directly inside FluentCRM
 * (post_type = 'fc_template', _design_template = 'raw_html') so they appear
 * in FluentCRM -> Emails -> Email Templates and can be used in campaigns,
 * automations, funnels, and transactional notifications.
 *
 * Designed with strict mobile-first responsiveness, thin compact header,
 * hosted social media icons, clinical emergency helplines, and iKAN branding tokens.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_FluentCRM_Templates {

	const TEMPLATE_VERSION = '2.3.0';
	const OPTION_KEY       = 'ikan_fluentcrm_templates_version';

	/**
	 * Boot hooks and CLI handlers.
	 */
	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'maybe_push_templates' ), 30 );

		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			WP_CLI::add_command( 'ikan-templates', array( __CLASS__, 'cli_handler' ) );
		}
	}

	/**
	 * Check if FluentCRM is active or its models are available.
	 * Note: FluentCRM uses 'fc_template' in wp_posts without registering it via register_post_type().
	 *
	 * @return bool
	 */
	public static function is_fluentcrm_installed() {
		return defined( 'FLUENTCRM' ) || class_exists( '\FluentCrm\App\Models\Template' ) || function_exists( 'fluentcrmTemplateCPTSlug' );
	}

	/**
	 * Run template push if version updated or forced.
	 */
	public static function maybe_push_templates() {
		if ( ! self::is_fluentcrm_installed() ) {
			return;
		}

		$installed = get_option( self::OPTION_KEY, '0.0.0' );
		if ( version_compare( $installed, self::TEMPLATE_VERSION, '<' ) ) {
			self::push_templates();
			update_option( self::OPTION_KEY, self::TEMPLATE_VERSION );
		}
	}

	/**
	 * Idempotently compile and sync all iKAN templates into FluentCRM.
	 *
	 * @return int Number of templates created or updated.
	 */
	public static function push_templates() {
		if ( ! self::is_fluentcrm_installed() ) {
			return 0;
		}

		global $wpdb;
		$templates = self::get_templates();
		$synced    = 0;

		foreach ( $templates as $tpl ) {
			$existing_id = (int) $wpdb->get_var(
				$wpdb->prepare(
					"SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'fc_template' LIMIT 1",
					$tpl['slug']
				)
			);
			$post_id = 0;

			$post_data = array(
				'post_type'    => 'fc_template',
				'post_status'  => 'publish',
				'post_name'    => $tpl['slug'],
				'post_title'   => $tpl['title'],
				'post_content' => $tpl['html'],
				'post_excerpt' => $tpl['excerpt'] ?? $tpl['subject'],
			);

			if ( $existing_id > 0 ) {
				$post_data['ID'] = $existing_id;
				wp_update_post( $post_data );
				$post_id = $existing_id;
			} else {
				$new_id = wp_insert_post( $post_data, true );
				if ( ! is_wp_error( $new_id ) ) {
					$post_id = $new_id;
				}
			}

			if ( $post_id > 0 ) {
				update_post_meta( $post_id, '_design_template', 'raw_html' );
				update_post_meta( $post_id, '_edit_type', 'raw_html' );
				update_post_meta( $post_id, '_email_subject', $tpl['subject'] );
				update_post_meta( $post_id, '_email_pre_header', $tpl['preheader'] ?? $tpl['subject'] );
				update_post_meta( $post_id, '_template_config', array(
					'template_type' => 'raw_html',
				) );
				update_post_meta( $post_id, '_edit_template_config', array(
					'template_type' => 'raw_html',
				) );
				$synced++;
			}
		}

		return $synced;
	}

	/**
	 * Render the authentic mobile-first iKAN email shell.
	 *
	 * Features:
	 * - Thin, compact header (max 48px height) with favicon.svg, brand name, and right pill badge.
	 * - 100% fluid mobile layout (<600px) with touch-friendly elements.
	 * - Social icons (LinkedIn, X, Instagram, Web) using verified hosted SVGs.
	 * - 24/7 National Emergency Crisis Support with instant tel: quick-dials.
	 * - Founder & Clinical Director signature block (Kartik).
	 * - FluentCRM unsubscribe tags (##crm.unsubscribe_to_manage##).
	 *
	 * @param array<string, mixed> $args Template parameters.
	 * @return string HTML email document.
	 */
	public static function render_shell( $args = array() ) {
		$badge_label  = $args['badge_label'] ?? 'Personal Wellbeing Summary';
		$badge_bg     = $args['badge_bg'] ?? '#F2F9F7';
		$badge_border = $args['badge_border'] ?? '#D1ECE5';
		$badge_color  = $args['badge_color'] ?? '#2A9D8F';
		$heading      = $args['heading'] ?? 'Your Wellbeing Assessment & Insights Summary';
		$greeting     = $args['greeting'] ?? 'Hi ##contact.first_name|there##,';
		$intro        = $args['intro'] ?? '';
		$content_html = $args['content_html'] ?? '';
		$cta_label    = $args['cta_label'] ?? '';
		$cta_url      = $args['cta_url'] ?? '';
		$disclaimer   = $args['disclaimer'] ?? 'iKAN supports, but never replaces, care from a qualified professional. If you are experiencing acute distress or a medical crisis, please contact your local healthcare emergency provider immediately.';

		$font_family = "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
		$font_title  = "'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

		// CTA Button
		$cta_html = '';
		if ( $cta_label && $cta_url ) {
			$cta_html = '
			<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin:26px auto 24px auto;width:100%">
			  <tr>
			    <td align="center">
			      <a href="' . esc_url( $cta_url ) . '" class="mobile-btn" target="_blank" style="display:inline-block;padding:13px 32px;background-color:#151515;color:#FFFFFF !important;text-decoration:none !important;border-radius:12px;font-family:' . $font_family . ';font-size:14px;font-weight:600;letter-spacing:0.01em;text-align:center">
			        ' . esc_html( $cta_label ) . ' &rarr;
			      </a>
			    </td>
			  </tr>
			</table>';
		}

		return '<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>' . esc_html( $heading ) . '</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8F9FA; font-family: ' . $font_family . '; color: #151515; }
    
    /* Mobile-first responsiveness rules (<600px) */
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-wrapper { padding: 12px 8px !important; }
      .header-cell { padding: 12px 16px !important; }
      .content-body { padding: 16px 14px !important; }
      .metric-col { display: block !important; width: 100% !important; border-right: none !important; border-bottom: 1px solid #E5E7EB !important; padding: 10px 0 !important; }
      .metric-col:last-child { border-bottom: none !important; }
      .mobile-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
      .footer-cell { padding: 20px 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F8F9FA;">

  <!-- Outer background container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FA;margin:0;padding:16px 0 28px">
    <tr>
      <td align="center" class="email-wrapper" style="padding:0 8px">
        <!-- 580px Content Container -->
        <table role="presentation" class="email-container" width="580" cellpadding="0" cellspacing="0" style="width:580px;max-width:580px;margin:0 auto;background-color:#FFFFFF;border-radius:14px;border:1px solid #EBECEF;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04)">

          <!-- Thin, Compact Brand Header (Critical) -->
          <tr>
            <td class="header-cell" style="padding:14px 22px;border-bottom:1px solid #EBECEF;background-color:#FFFFFF">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align:middle;text-align:left">
                    <a href="https://ikanhealth.in" target="_blank" style="text-decoration:none;display:inline-flex;align-items:center">
                      <img src="https://ikanhealth.in/wp-content/themes/demo/assets/img/favicon.svg" alt="iKAN" width="26" height="26" style="vertical-align:middle;border-radius:6px;margin-right:8px" />
                      <span style="font-family:' . $font_title . ';font-size:18px;font-weight:700;color:#151515;letter-spacing:-0.01em;vertical-align:middle">iKAN</span>
                    </a>
                  </td>
                  <td style="vertical-align:middle;text-align:right">
                    <span style="display:inline-block;padding:3px 10px;background-color:' . esc_attr( $badge_bg ) . ';border:1px solid ' . esc_attr( $badge_border ) . ';border-radius:9999px;font-family:' . $font_family . ';font-size:10px;font-weight:700;color:' . esc_attr( $badge_color ) . ';letter-spacing:0.04em;text-transform:uppercase">
                      ' . esc_html( $badge_label ) . '
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Email Body -->
          <tr>
            <td class="content-body" style="padding:24px 24px 20px">
              <h1 style="font-family:' . $font_title . ';color:#151515;font-size:21px;font-weight:600;letter-spacing:-0.015em;margin-top:0;margin-bottom:12px;line-height:1.3">
                ' . $heading . '
              </h1>

              ' . ( $greeting ? '<p style="font-family:' . $font_family . ';color:#151515;font-size:15px;line-height:1.65;font-weight:600;margin-top:0;margin-bottom:12px">' . $greeting . '</p>' : '' ) . '

              ' . ( $intro ? '<p style="font-family:' . $font_family . ';color:#333333;font-size:14px;line-height:1.65;margin-bottom:18px">' . $intro . '</p>' : '' ) . '

              <!-- Specialized Content Section -->
              ' . $content_html . '

              <!-- Call to Action -->
              ' . $cta_html . '
            </td>
          </tr>

          <!-- Comprehensive Footer (Critical) -->
          <tr>
            <td class="footer-cell" style="border-top:1px solid #EBECEF;background-color:#FAFAFA;padding:24px 20px 20px;text-align:center">

              <!-- 24/7 National Emergency & Crisis Support Box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2F4F7;border:1px solid #E4E7EC;border-radius:8px;margin-bottom:18px">
                <tr>
                  <td style="padding:10px 14px;font-family:' . $font_family . ';font-size:11px;line-height:1.5;color:#344054;text-align:center">
                    <strong style="color:#101828;display:block;margin-bottom:2px">Need Immediate Mental Health Support? (24/7 Helpline)</strong>
                    Tele-MANAS: <a href="tel:14416" style="color:#0E9384;font-weight:700;text-decoration:none">14416</a> &bull;
                    Vandrevala Foundation: <a href="tel:+919999666555" style="color:#0E9384;font-weight:700;text-decoration:none">+91 9999 666 555</a> &bull;
                    KIRAN: <a href="tel:18005990019" style="color:#0E9384;font-weight:700;text-decoration:none">1800-599-0019</a>
                  </td>
                </tr>
              </table>

              <!-- Social Media Icons (Hosted SVGs) -->
              <p style="font-family:' . $font_family . ';font-size:11px;font-weight:600;color:#717182;margin:0 0 10px 0;letter-spacing:0.02em">Follow @ikanhealth_in</p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 16px auto">
                <tr>
                  <td style="padding:0 6px">
                    <a href="https://www.linkedin.com/company/ikan-mental-health/" target="_blank" title="iKAN on LinkedIn">
                      <img src="https://ikanhealth.in/wp-content/themes/demo/assets/img/icon-linkedin.svg" alt="LinkedIn" width="30" height="30" style="display:block;border:0" />
                    </a>
                  </td>
                  <td style="padding:0 6px">
                    <a href="https://x.com/ikanhealth_in" target="_blank" title="iKAN on X">
                      <img src="https://ikanhealth.in/wp-content/themes/demo/assets/img/icon-x.svg" alt="X" width="30" height="30" style="display:block;border:0" />
                    </a>
                  </td>
                  <td style="padding:0 6px">
                    <a href="https://www.instagram.com/ikanhealth_in/" target="_blank" title="iKAN on Instagram">
                      <img src="https://ikanhealth.in/wp-content/themes/demo/assets/img/icon-instagram.svg" alt="Instagram" width="30" height="30" style="display:block;border:0" />
                    </a>
                  </td>
                  <td style="padding:0 6px">
                    <a href="https://ikanhealth.in" target="_blank" title="iKAN Website">
                      <img src="https://ikanhealth.in/wp-content/themes/demo/assets/img/icon-web.svg" alt="Website" width="30" height="30" style="display:block;border:0" />
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Clinical Healthcare Notice -->
              <p style="font-family:' . $font_family . ';font-size:11px;line-height:1.6;color:#8F90A0;max-width:440px;margin:0 auto 12px auto">
                <strong style="color:#5A5D72">Confidential Clinical Notice:</strong> ' . esc_html( $disclaimer ) . '
              </p>

              <!-- Copyright & Unsubscribe -->
              <p style="font-family:' . $font_family . ';font-size:11px;line-height:1.5;color:#A0A1B2;margin:0 0 6px 0">
                &copy; ' . gmdate( 'Y' ) . ' iKAN Health &bull; Bengaluru, Karnataka, India &bull; All rights reserved.<br>
                Dispatched via <code>noreply@ikanhealth.in</code>. Monitored replies: <a href="mailto:support@ikanhealth.in" style="color:#2A9D8F;text-decoration:none">support@ikanhealth.in</a>
              </p>

              <p style="font-family:' . $font_family . ';font-size:11px;color:#A0A1B2;margin:0">
                ##crm.unsubscribe_to_manage##
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>';
	}

	/**
	 * Render an authentic iKAN team alert email matching ikan2-alerts.
	 * Matches the exact design of the ikan2 notification emails (such as "New app user").
	 *
	 * @param array<string, mixed> $args Alert parameters.
	 * @return string HTML email document.
	 */
	public static function render_alert_shell( $args = array() ) {
		$badge_label  = $args['badge_label'] ?? 'New app user';
		$badge_tint   = $args['badge_tint'] ?? '#FBE6E4';
		$badge_ink    = $args['badge_ink'] ?? '#A83E38';
		$title        = $args['title'] ?? 'New Account';
		$intro        = $args['intro'] ?? 'Someone created an account in the iKAN app.';
		$facts        = $args['facts'] ?? array();
		$cta_label    = $args['cta_label'] ?? 'Open the app';
		$cta_url      = $args['cta_url'] ?? 'https://app.ikanhealth.in';
		$footer_note  = $args['footer_note'] ?? 'An automatic alert from iKAN, sent to the team when something new arrives. Replying goes to the person who sent it, where there is one.';

		$font_body    = "Manrope, 'Segoe UI', Helvetica, Arial, sans-serif";
		$font_display = "Sora, 'Segoe UI', Helvetica, Arial, sans-serif";

		$facts_html = '';
		foreach ( $facts as $i => $row ) {
			$rule       = $i > 0 ? 'border-top:1px solid #E3E7EC;' : '';
			$facts_html .= '<tr>'
				. '<td style="padding:12px 0;' . $rule . 'width:38%;vertical-align:top;font-family:' . $font_body . ';font-size:13px;line-height:20px;color:#5B6470;font-weight:500;">' . esc_html( $row[0] ) . '</td>'
				. '<td style="padding:12px 0;' . $rule . 'vertical-align:top;font-family:' . $font_body . ';font-size:14px;line-height:20px;color:#0E1217;font-weight:600;word-break:break-word;">' . $row[1] . '</td>'
				. '</tr>';
		}

		$cta_html = '';
		if ( $cta_label && $cta_url ) {
			$cta_html = '<tr><td style="padding:28px 32px 4px;">'
				. '<a href="' . esc_url( $cta_url ) . '" style="display:inline-block;background:#0E1217;color:#FFFFFF !important;text-decoration:none !important;font-family:' . $font_body . ';font-size:14px;line-height:20px;font-weight:600;padding:12px 22px;border-radius:999px;">' . esc_html( $cta_label ) . '</a>'
				. '</td></tr>';
		}

		return '<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>' . esc_html( $title ) . '</title></head>
<body style="margin:0;padding:0;background:#EDF0F4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDF0F4;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="padding:0 4px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;"><img src="https://app.ikanhealth.in/pwa-192x192.png" width="36" height="36" alt="iKAN" style="display:block;border:0;border-radius:999px;"></td>
          <td style="vertical-align:middle;padding-left:10px;font-family:' . $font_display . ';font-size:18px;line-height:24px;font-weight:700;color:#0E1217;letter-spacing:-0.01em;">iKAN</td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#FFFFFF;border-radius:20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:28px 32px 0;">
            <span style="display:inline-block;background:' . esc_attr( $badge_tint ) . ';color:' . esc_attr( $badge_ink ) . ';font-family:' . $font_body . ';font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:6px 12px;border-radius:999px;">' . esc_html( $badge_label ) . '</span>
          </td></tr>
          <tr><td style="padding:16px 32px 0;font-family:' . $font_display . ';font-size:24px;line-height:32px;font-weight:700;color:#0E1217;letter-spacing:-0.015em;">' . $title . '</td></tr>
          <tr><td style="padding:8px 32px 0;font-family:' . $font_body . ';font-size:15px;line-height:24px;font-weight:400;color:#5B6470;">' . $intro . '</td></tr>
          <tr><td style="padding:20px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $facts_html . '</table>
          </td></tr>' . $cta_html . '
          <tr><td style="padding:28px 32px;font-family:' . $font_body . ';font-size:12px;line-height:18px;color:#5B6470;">Received ##crm.date_time##</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:20px 4px 0;font-family:' . $font_body . ';font-size:12px;line-height:18px;color:#5B6470;">' . esc_html( $footer_note ) . '</td></tr>
    </table>
  </td></tr>
</table>
</body></html>';
	}

	/**
	 * Full catalog of 10 compiled iKAN email templates for FluentCRM.
	 *
	 * @return array<int, array<string, string>>
	 */
	public static function get_templates() {
		return array(

			// 1. (Post 314 Update) Member Assessment Summary — Personal Wellbeing Export
			array(
				'slug'      => 'member-assessment-summary-export',
				'title'     => 'Member Assessment Summary — Personal Wellbeing Export',
				'subject'   => 'Your ##contact.custom.latest_assessment## Summary — ##contact.custom.latest_severity##',
				'excerpt'   => 'Personal summary export triggered when a member emails their assessment report to themselves.',
				'preheader' => 'Clinical baseline breakdown, cognitive resilience metrics, and recommended focus areas.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Personal Wellbeing Summary',
						'badge_bg'     => '#F2F9F7',
						'badge_border' => '#D1ECE5',
						'badge_color'  => '#2A9D8F',
						'heading'      => 'Your Wellbeing Assessment &amp; Insights Summary',
						'intro'        => 'You requested an export of your wellbeing summary from the iKAN Health Member Portal. Below is your clinical baseline breakdown, cognitive resilience metrics, and recommended focus areas based on your latest self-assessment:',
						'content_html' => '
						<div style="background-color:#F8F9FA;border:1px solid #EBECEF;border-radius:14px;padding:18px;margin-top:16px;margin-bottom:20px">
						  <div style="font-family:\'Manrope\',sans-serif;font-size:11px;font-weight:700;color:#717182;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px">Assessment Score Snapshot</div>
						  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
						    <tr>
						      <td class="metric-col" width="33%" style="text-align:center;padding:8px 4px;border-right:1px solid #E5E7EB;vertical-align:top">
						        <div style="font-family:\'Sora\',sans-serif;font-size:22px;font-weight:700;color:#2A9D8F">##contact.custom.latest_score|--##</div>
						        <div style="font-family:\'Manrope\',sans-serif;font-size:11px;color:#717182;margin-top:4px">Scale Score</div>
						      </td>
						      <td class="metric-col" width="33%" style="text-align:center;padding:8px 4px;border-right:1px solid #E5E7EB;vertical-align:top">
						        <div style="font-family:\'Sora\',sans-serif;font-size:22px;font-weight:700;color:#15803D">##contact.custom.latest_severity|Optimal##</div>
						        <div style="font-family:\'Manrope\',sans-serif;font-size:11px;color:#717182;margin-top:4px">Severity Band</div>
						      </td>
						      <td class="metric-col" width="33%" style="text-align:center;padding:8px 4px;vertical-align:top">
						        <div style="font-family:\'Sora\',sans-serif;font-size:22px;font-weight:700;color:#151515">Verified</div>
						        <div style="font-family:\'Manrope\',sans-serif;font-size:11px;color:#717182;margin-top:4px">Clinical Status</div>
						      </td>
						    </tr>
						  </table>

						  <div style="background-color:#FFFFFF;border:1px solid #EBECEF;border-radius:10px;padding:14px;margin-top:14px">
						    <div style="font-family:\'Sora\',sans-serif;font-size:13px;font-weight:600;color:#151515;margin-bottom:6px">Instrument: ##contact.custom.latest_assessment##</div>
						    <p style="margin:0;font-family:\'Manrope\',sans-serif;font-size:13px;line-height:1.55;color:#4A4A5A">
						      Your screening indicates current emotional and cognitive functioning. Fluctuations across work weeks are completely natural; tracking over 14-day intervals provides the most reliable trajectory.
						    </p>
						  </div>
						</div>',
						'cta_label'    => 'View In Member Portal',
						'cta_url'      => 'https://app.ikanhealth.in/history/assessments',
					)
				),
			),

			// 2. (NEW) Equip Program — Journey Progress & Daily Milestone
			// Answering the user's explicit question: "can recycle for equip too or different"
			array(
				'slug'      => 'equip-program-milestone-digest',
				'title'     => 'Equip Program — Journey Progress & Daily Milestone',
				'subject'   => 'Your Equip Milestone: Day ##contact.custom.current_day|7## Progress on ##contact.custom.current_program|Stress Buster##',
				'excerpt'   => 'Sent to celebrate Equip 21-day milestones, streak tracking, and daily cognitive tool mastery.',
				'preheader' => 'Keep your daily resilience streak alive with today\'s 5-minute practice.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Equip Milestone',
						'badge_bg'     => '#FEF3C7',
						'badge_border' => '#FDE68A',
						'badge_color'  => '#B45309',
						'heading'      => 'Strong Work on Your Resilience Journey',
						'intro'        => 'Hi ##contact.first_name|there##, building psychological resilience is an incremental daily practice. Here is your Equip milestone summary and tomorrow\'s focus area:',
						'content_html' => '
						<div style="background-color:#F8F9FA;border:1px solid #EBECEF;border-radius:14px;padding:18px;margin-top:16px;margin-bottom:20px">
						  <div style="font-family:\'Manrope\',sans-serif;font-size:11px;font-weight:700;color:#717182;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:12px">Equip Curriculum Snapshot</div>
						  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
						    <tr>
						      <td class="metric-col" width="33%" style="text-align:center;padding:8px 4px;border-right:1px solid #E5E7EB;vertical-align:top">
						        <div style="font-family:\'Sora\',sans-serif;font-size:22px;font-weight:700;color:#D97706">Day ##contact.custom.current_day|7##</div>
						        <div style="font-family:\'Manrope\',sans-serif;font-size:11px;color:#717182;margin-top:4px">Of 21 Days</div>
						      </td>
						      <td class="metric-col" width="33%" style="text-align:center;padding:8px 4px;border-right:1px solid #E5E7EB;vertical-align:top">
						        <div style="font-family:\'Sora\',sans-serif;font-size:22px;font-weight:700;color:#2A9D8F">Active</div>
						        <div style="font-family:\'Manrope\',sans-serif;font-size:11px;color:#717182;margin-top:4px">Daily Streak</div>
						      </td>
						      <td class="metric-col" width="33%" style="text-align:center;padding:8px 4px;vertical-align:top">
						        <div style="font-family:\'Sora\',sans-serif;font-size:22px;font-weight:700;color:#151515">100%</div>
						        <div style="font-family:\'Manrope\',sans-serif;font-size:11px;color:#717182;margin-top:4px">Completion Rate</div>
						      </td>
						    </tr>
						  </table>

						  <div style="background-color:#FFFFFF;border:1px solid #EBECEF;border-radius:10px;padding:14px;margin-top:14px">
						    <div style="font-family:\'Sora\',sans-serif;font-size:13px;font-weight:600;color:#151515;margin-bottom:6px">Active Track: ##contact.custom.current_program|Stress Buster##</div>
						    <p style="margin:0;font-family:\'Manrope\',sans-serif;font-size:13px;line-height:1.55;color:#4A4A5A">
						      Tomorrow\'s practice introduces targeted cognitive reframing and physiological sigh breathing to calm sympathetic autonomic arousal during high-pressure work blocks.
						    </p>
						  </div>
						</div>',
						'cta_label'    => 'Open Today\'s Equip Exercise',
						'cta_url'      => 'https://app.ikanhealth.in/equip',
					)
				),
			),

			// 3. (NEW) Clinical Risk Alert — Urgent Safety Team Notification
			array(
				'slug'      => 'clinical-risk-urgent-alert',
				'title'     => 'Clinical Risk Alert — Urgent Safety Team Notification',
				'subject'   => '[URGENT CLINICAL ALERT] High Risk Flag: ##contact.first_name## ##contact.last_name##',
				'excerpt'   => 'Internal alert sent to iKAN Clinical Care Team when Item 9 or severe clinical risk is endorsed.',
				'preheader' => 'Immediate clinical review recommended for member completing self-assessment.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Urgent Clinical Priority',
						'badge_bg'     => '#FEE2E2',
						'badge_border' => '#FCA5A5',
						'badge_color'  => '#B91C1C',
						'heading'      => 'Clinical Attention Required: Member Flagged',
						'greeting'     => 'Attention iKAN Clinical Operations Team,',
						'intro'        => 'A member completed a self-screening assessment with responses crossing elevated clinical thresholds or endorsing Item 9 (thoughts of self-harm / suicidal ideation):',
						'content_html' => '
						<div style="background-color:#FEF2F2;border-left:4px solid #EF4444;border-radius:6px;padding:14px 16px;margin:16px 0">
						  <strong style="display:block;font-size:13px;color:#991B1B;margin-bottom:4px">Immediate Clinical Safety SOP Active</strong>
						  <span style="font-size:13px;line-height:1.5;color:#7F1D1D">
						    Please review the subscriber record in FluentCRM and execute the designated clinical welfare outreach according to iKAN triage protocols.
						  </span>
						</div>

						<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8F9FA;border:1px solid #EBECEF;border-radius:10px;margin-bottom:20px">
						  <tr><td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:600;color:#717182">Member Name</td><td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:700;color:#151515">##contact.first_name## ##contact.last_name##</td></tr>
						  <tr><td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:600;color:#717182">Member Email</td><td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:700;color:#2A9D8F"><a href="mailto:##contact.email##" style="color:#2A9D8F;text-decoration:none">##contact.email##</a></td></tr>
						  <tr><td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:600;color:#717182">Phone Number</td><td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:700;color:#151515">##contact.phone|Not Provided##</td></tr>
						  <tr><td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:600;color:#717182">Assessment</td><td style="padding:10px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;font-weight:700;color:#151515">##contact.custom.latest_assessment##</td></tr>
						  <tr><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#717182">Score / Severity</td><td style="padding:10px 14px;font-size:14px;font-weight:700;color:#DC2626">Score ##contact.custom.latest_score## &bull; ##contact.custom.latest_severity##</td></tr>
						</table>',
						'cta_label'    => 'Open Member in FluentCRM',
						'cta_url'      => 'https://ikanhealth.in/wp-admin/admin.php?page=fluentcrm-admin#/subscribers',
						'disclaimer'   => 'Confidential internal clinical alert intended solely for iKAN Health clinical staff.',
					)
				),
			),

			// 4. (NEW) Clinical Consultation — Appointment Confirmed & Video Link
			array(
				'slug'      => 'consultation-booking-confirmation',
				'title'     => 'Clinical Consultation — Appointment Confirmed & Video Link',
				'subject'   => 'Confirmed: Your Clinical Consultation with iKAN Health',
				'excerpt'   => 'Appointment confirmation with video session link, clinician details, and preparation guide.',
				'preheader' => 'Details and link for your upcoming 1:1 consultation session.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Appointment Confirmed',
						'badge_bg'     => '#E0F2FE',
						'badge_border' => '#BAE6FD',
						'badge_color'  => '#0369A1',
						'heading'      => 'Your 1:1 Clinical Consultation Is Scheduled',
						'intro'        => 'Your confidential consultation with an iKAN licensed clinical psychologist or therapist is confirmed. Here are the details and video room link for your session:',
						'content_html' => '
						<div style="background-color:#F0F9FF;border:1px solid #BAE6FD;border-radius:12px;padding:16px;margin:16px 0">
						  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
						    <tr><td style="padding:6px 0;font-size:13px;color:#0369A1;font-weight:600;width:35%">Patient:</td><td style="padding:6px 0;font-size:14px;color:#0C4A6E;font-weight:700">##contact.first_name## ##contact.last_name##</td></tr>
						    <tr><td style="padding:6px 0;font-size:13px;color:#0369A1;font-weight:600">Mode:</td><td style="padding:6px 0;font-size:14px;color:#0C4A6E;font-weight:700">Confidential Encrypted Video</td></tr>
						    <tr><td style="padding:6px 0;font-size:13px;color:#0369A1;font-weight:600">Registered Email:</td><td style="padding:6px 0;font-size:14px;color:#0C4A6E;font-weight:700">##contact.email##</td></tr>
						  </table>
						</div>
						<div style="padding:14px;background-color:#F8F9FA;border-radius:8px;border:1px solid #EBECEF">
						  <strong style="display:block;font-size:12px;color:#151515;text-transform:uppercase;margin-bottom:6px">Session Checklist</strong>
						  <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#5A5D72">
						    <li>Join from a quiet, private space with headphones.</li>
						    <li>Test your camera and microphone 5 minutes before scheduled start.</li>
						    <li>If you need to reschedule, please notify us at least 4 hours in advance.</li>
						  </ul>
						</div>',
						'cta_label'    => 'Join Video Consultation Room',
						'cta_url'      => 'https://app.ikanhealth.in/consult',
					)
				),
			),

			// 5. (NEW) 14-Day Clinical Re-assessment Tracker
			array(
				'slug'      => 'clinical-reassessment-due-reminder',
				'title'     => '14-Day Clinical Re-assessment Tracker',
				'subject'   => 'Time for your 14-day wellbeing check-in, ##contact.first_name##',
				'excerpt'   => 'Triggered every 14 days to monitor clinical recovery trajectory and score shift.',
				'preheader' => 'Track your progress and compare your score against your clinical baseline.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => '14-Day Check-in',
						'badge_bg'     => '#EEF2FF',
						'badge_border' => '#C7D2FE',
						'badge_color'  => '#4338CA',
						'heading'      => 'How Has Your Wellbeing Shifted This Fortnight?',
						'intro'        => 'It has been 14 days since your last screening. Clinical recovery is not always linear — re-taking your screening helps highlight subtle gains in sleep, energy, and stress regulation:',
						'content_html' => '
						<div style="background-color:#F8F9FA;border:1px solid #EBECEF;border-radius:12px;padding:16px;margin:16px 0">
						  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
						    <tr><td style="padding:6px 0;font-size:13px;color:#717182">Previous Instrument:</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#151515">##contact.custom.latest_assessment##</td></tr>
						    <tr><td style="padding:6px 0;font-size:13px;color:#717182">Previous Score:</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#2A9D8F">##contact.custom.latest_score## (##contact.custom.latest_severity##)</td></tr>
						    <tr><td style="padding:6px 0;font-size:13px;color:#717182">Time to complete:</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#151515">~3 minutes (Confidential)</td></tr>
						  </table>
						</div>',
						'cta_label'    => 'Start 3-Minute Re-assessment',
						'cta_url'      => 'https://app.ikanhealth.in/assessments',
					)
				),
			),

			// 6. (Post 313 Update) iKAN Health — Master Brand Template
			array(
				'slug'      => 'ikan-master-brand-template',
				'title'     => 'iKAN Health — Master Brand Template',
				'subject'   => 'Evidence-Based Preventive Mental Health Architecture',
				'excerpt'   => 'Core master template setting brand styles, typography, and standard layout for iKAN Health.',
				'preheader' => 'Scientific clinical frameworks and preventive mental wellbeing architecture.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Official Communication',
						'badge_bg'     => '#F5F6F8',
						'badge_border' => '#E5E7EB',
						'badge_color'  => '#5A5D72',
						'heading'      => 'Evidence-Based Preventive Mental Health Architecture',
						'intro'        => 'Thank you for connecting with iKAN Health. We provide evidence-based, scientifically validated preventive wellbeing architectures designed to protect workplace mental health, build psychological safety, and provide timely support for individuals and teams.',
						'content_html' => '
						<div style="background-color:#F5F6F8;border-left:3px solid #2A9D8F;border-radius:4px;padding:14px 18px;margin-top:18px;margin-bottom:18px">
						  <p style="font-family:\'Manrope\',sans-serif;font-size:14px;line-height:1.6;color:#151515;margin:0">
						    <strong>Clinical Methodology:</strong> Our programmes integrate validated psychometric indices with contextual coaching protocols to mitigate burnout before clinical symptoms emerge.
						  </p>
						</div>

						<h3 style="font-family:\'Sora\',sans-serif;color:#151515;font-size:15px;font-weight:600;margin-top:18px;margin-bottom:10px">Core Platform Capabilities:</h3>
						<ul style="font-family:\'Manrope\',sans-serif;color:#2A2A2A;font-size:14px;line-height:1.7;margin-bottom:20px;padding-left:20px">
						  <li style="margin-bottom:6px"><strong>Burnout Cost Intelligence:</strong> Granular financial modeling of attrition and presenteeism risks.</li>
						  <li style="margin-bottom:6px"><strong>Member Wellbeing Platform:</strong> Confidential self-assessments, pulse monitoring, and proactive reflections.</li>
						  <li style="margin-bottom:6px"><strong>Equip Corporate Programs:</strong> Structured workshops and resilience blueprints for forward-looking organisations.</li>
						</ul>',
						'cta_label'    => 'Access iKAN Platform',
						'cta_url'      => 'https://ikanhealth.in',
					)
				),
			),

			// 7. (Post 316 Update) Member Onboarding — Account Activation & Baseline
			array(
				'slug'      => 'member-onboarding-account-activation',
				'title'     => 'Member Onboarding — Account Activation &amp; Baseline',
				'subject'   => 'Welcome to iKAN Health, ##contact.first_name##',
				'excerpt'   => 'Welcomes a new member, sets expectations, and provides immediate access to their personal wellbeing dashboard.',
				'preheader' => 'Your confidential space for mental health and clinical wellbeing is active.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Account Activated',
						'badge_bg'     => '#DAF6E9',
						'badge_border' => '#A3E8CB',
						'badge_color'  => '#0C6B4D',
						'heading'      => 'Your Personal Wellbeing Architecture is Active',
						'intro'        => 'Welcome to iKAN Health. Your account has been provisioned and your secure, encrypted member profile is ready. You now have full access to our clinically validated assessment batteries, guided reflections, and preventive mental health resources.',
						'content_html' => '
						<div style="background-color:#F8F9FA;border:1px solid #EBECEF;border-radius:12px;padding:16px;margin:16px 0">
						  <strong style="display:block;font-size:12px;color:#151515;text-transform:uppercase;margin-bottom:8px">Three Ways to Begin Today</strong>
						  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
						    <tr><td style="padding:6px 0;font-size:13px;line-height:1.5;color:#4A4A5A"><strong style="color:#151515">1. Baseline Self-Screening:</strong> Complete the PHQ-9 or GAD-7 screener in 3 minutes.</td></tr>
						    <tr><td style="padding:6px 0;font-size:13px;line-height:1.5;color:#4A4A5A"><strong style="color:#151515">2. Daily Equip Practice:</strong> Start a 21-day program to master evidence-based coping skills.</td></tr>
						    <tr><td style="padding:6px 0;font-size:13px;line-height:1.5;color:#4A4A5A"><strong style="color:#151515">3. Confidential 1:1 Care:</strong> Book a video session with a licensed clinical psychologist.</td></tr>
						  </table>
						</div>',
						'cta_label'    => 'Open iKAN Member Portal',
						'cta_url'      => 'https://app.ikanhealth.in',
					)
				),
			),

			// 8. (Post 317 Update) Weekly Wellbeing Status — Member Progress Digest
			array(
				'slug'      => 'weekly-wellbeing-status-digest',
				'title'     => 'Weekly Wellbeing Status — Member Progress Digest',
				'subject'   => 'Your Weekly Wellbeing Digest &bull; iKAN Health',
				'excerpt'   => 'Automated weekly check-in summarizing weekly activity, reflection streaks, and recommended micro-actions.',
				'preheader' => 'Weekly summary of your emotional check-ins and wellbeing milestones.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Weekly Digest',
						'badge_bg'     => '#F5F6F8',
						'badge_border' => '#E5E7EB',
						'badge_color'  => '#5A5D72',
						'heading'      => 'Your Weekly Wellbeing Trajectory',
						'intro'        => 'Here is your weekly summary of proactive reflections, self-assessments, and Equip progress. Regular self-monitoring is one of the single most reliable protective factors against emotional fatigue.',
						'content_html' => '
						<div style="background-color:#F8F9FA;border:1px solid #EBECEF;border-radius:12px;padding:16px;margin:16px 0">
						  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
						    <tr><td style="padding:6px 0;font-size:13px;color:#717182">Latest Assessment:</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#151515">##contact.custom.latest_assessment|General Screening##</td></tr>
						    <tr><td style="padding:6px 0;font-size:13px;color:#717182">Severity Band:</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#2A9D8F">##contact.custom.latest_severity|Stable##</td></tr>
						    <tr><td style="padding:6px 0;font-size:13px;color:#717182">Equip Program:</td><td style="padding:6px 0;font-size:13px;font-weight:700;color:#151515">##contact.custom.current_program|On Track##</td></tr>
						  </table>
						</div>',
						'cta_label'    => 'View Full Weekly Analytics',
						'cta_url'      => 'https://app.ikanhealth.in/history',
					)
				),
			),

			// 9. (Post 318 Update) Burnout Cost Calculator — Executive Report
			array(
				'slug'      => 'burnout-cost-calculator-report',
				'title'     => 'Burnout Cost Calculator — Executive Report',
				'subject'   => 'Your Executive Burnout Cost Analysis &bull; iKAN Health',
				'excerpt'   => 'Automated report sent to prospective enterprise clients after completing the Burnout Cost Calculator.',
				'preheader' => 'Quantified financial impact and executive summary of workplace burnout.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Executive Intelligence',
						'badge_bg'     => '#FBF0DC',
						'badge_border' => '#F8DEB5',
						'badge_color'  => '#8A5A00',
						'heading'      => 'Workplace Burnout Impact &amp; Financial Risk Model',
						'intro'        => 'Thank you for evaluating your organisation\'s mental health exposure with the iKAN Burnout Cost Calculator. Below is the executive summary modeling attrition, absenteeism, and lost productive output:',
						'content_html' => '
						<div style="background-color:#FDFBF7;border:1px solid #F5E6CC;border-radius:12px;padding:16px;margin:16px 0">
						  <strong style="display:block;font-size:12px;color:#8A5A00;text-transform:uppercase;margin-bottom:8px">Financial Exposure Breakdown</strong>
						  <p style="margin:0;font-size:13px;line-height:1.6;color:#4A4A5A">
						    Research demonstrates that workplace burnout incurs costs exceeding &pound;1,650 / &#8377;1.8 Lakhs per employee annually in combined presenteeism and preventable turnover. Implementing early clinical screening and Equip interventions mitigates up to 64% of downstream risk.
						  </p>
						</div>',
						'cta_label'    => 'Schedule an Executive Briefing',
						'cta_url'      => 'https://ikanhealth.in/org/',
					)
				),
			),

			// 10. (Post 315 Update) Partner Onboarding — Application Received
			array(
				'slug'      => 'partner-onboarding-application-received',
				'title'     => 'Partner Onboarding — Application Received',
				'subject'   => 'We Have Received Your Application &bull; iKAN Health Network',
				'excerpt'   => 'Confirms receipt of a clinical partner or organisational application with next evaluation steps.',
				'preheader' => 'Confirmation and next steps for your partner clinician application.',
				'html'      => self::render_shell(
					array(
						'badge_label'  => 'Application Received',
						'badge_bg'     => '#DFF3EE',
						'badge_border' => '#B8E3D7',
						'badge_color'  => '#1F6A54',
						'heading'      => 'Thank You for Applying to Join the iKAN Network',
						'intro'        => 'We have received your credential submission to join the iKAN Health provider and clinical consulting network. Our clinical credentials committee reviews all submissions for licensing, accreditation, and practice philosophy alignment.',
						'content_html' => '
						<div style="background-color:#F8F9FA;border:1px solid #EBECEF;border-radius:12px;padding:16px;margin:16px 0">
						  <strong style="display:block;font-size:12px;color:#151515;text-transform:uppercase;margin-bottom:8px">What Happens Next?</strong>
						  <ol style="margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#5A5D72">
						    <li><strong>Clinical Verification:</strong> Credentials and licensing validation (typically 2-3 business days).</li>
						    <li><strong>Platform Onboarding:</strong> Tele-health and clinical documentation workflow orientation.</li>
						    <li><strong>Network Activation:</strong> Listing in the iKAN member consultation directory.</li>
						  </ol>
						</div>',
						'cta_label'    => 'Learn More About Our Clinical Protocol',
						'cta_url'      => 'https://ikanhealth.in/join/partner/',
					)
				),
			),

			// 11. iKAN Alert — New App User (Internal Team Alert matching ikan2-alerts)
			array(
				'slug'      => 'ikan-alert-new-app-user',
				'title'     => 'iKAN Alert — New App User',
				'subject'   => 'New user: ##contact.full_name|New Member##',
				'excerpt'   => 'Internal team notification sent whenever someone creates an account in the iKAN app.',
				'preheader' => 'Someone created an account in the iKAN app.',
				'html'      => self::render_alert_shell(
					array(
						'badge_label' => 'New app user',
						'badge_tint'  => '#FBE6E4',
						'badge_ink'   => '#A83E38',
						'title'       => '##contact.full_name|New Account##',
						'intro'       => 'Someone created an account in the iKAN app.',
						'facts'       => array(
							array( 'Name', '##contact.full_name##' ),
							array( 'Email', '<a href="mailto:##contact.email##" style="color:#0E1217;text-decoration:underline">##contact.email##</a>' ),
							array( 'Signed up with', '##contact.custom.auth_provider|Email and password##' ),
						),
						'cta_label'   => 'Open the app',
						'cta_url'     => 'https://app.ikanhealth.in',
						'footer_note' => 'An automatic alert from iKAN, sent to the team when something new arrives. Replying goes to the person who sent it, where there is one.',
					)
				),
			),

			// 12. iKAN Alert — Pilot Lead (Internal Team Alert matching ikan2-alerts)
			array(
				'slug'      => 'ikan-alert-pilot-lead',
				'title'     => 'iKAN Alert — Pilot Lead',
				'subject'   => 'Pilot lead: ##contact.custom.company_name|Corporate Enquiry##',
				'excerpt'   => 'Internal notification when an organization requests a pilot via the burnout cost calculator.',
				'preheader' => 'New corporate pilot enquiry received.',
				'html'      => self::render_alert_shell(
					array(
						'badge_label' => 'Pilot lead',
						'badge_tint'  => '#FBF0DC',
						'badge_ink'   => '#8A5A00',
						'title'       => '##contact.custom.company_name|Corporate Enquiry##',
						'intro'       => 'Someone asked about a pilot from the burnout cost calculator.',
						'facts'       => array(
							array( 'Name', '##contact.full_name##' ),
							array( 'Email', '<a href="mailto:##contact.email##" style="color:#0E1217;text-decoration:underline">##contact.email##</a>' ),
							array( 'Company', '##contact.custom.company_name|--##' ),
							array( 'Team size', '##contact.custom.team_size|--##' ),
							array( 'From', 'ikanhealth.in' ),
						),
						'cta_label'   => 'Reply to Lead',
						'cta_url'     => 'mailto:##contact.email##?subject=Re:%20your%20iKAN%20pilot%20enquiry',
						'footer_note' => 'An automatic alert from iKAN, sent to the team when something new arrives. Replying goes to the person who sent it, where there is one.',
					)
				),
			),

			// 13. iKAN Alert — Contact Message (Internal Team Alert matching ikan2-alerts)
			array(
				'slug'      => 'ikan-alert-contact-message',
				'title'     => 'iKAN Alert — Contact Message',
				'subject'   => 'Contact: General enquiry, from ##contact.full_name##',
				'excerpt'   => 'Internal notification when someone submits the website contact form.',
				'preheader' => 'New message received from the contact form.',
				'html'      => self::render_alert_shell(
					array(
						'badge_label' => 'Contact message',
						'badge_tint'  => '#E8ECF8',
						'badge_ink'   => '#455B9E',
						'title'       => '##contact.custom.subject|General enquiry##',
						'intro'       => 'Someone sent a message through the contact form.',
						'facts'       => array(
							array( 'Name', '##contact.full_name##' ),
							array( 'Email', '<a href="mailto:##contact.email##" style="color:#0E1217;text-decoration:underline">##contact.email##</a>' ),
							array( 'From', 'ikanhealth.in' ),
						),
						'cta_label'   => 'Reply to Message',
						'cta_url'     => 'mailto:##contact.email##',
						'footer_note' => 'An automatic alert from iKAN, sent to the team when something new arrives. Replying goes to the person who sent it, where there is one.',
					)
				),
			),

			// 14. iKAN Alert — Partner Application (Internal Team Alert matching ikan2-alerts)
			array(
				'slug'      => 'ikan-alert-partner-application',
				'title'     => 'iKAN Alert — Partner Application',
				'subject'   => 'Partner application: ##contact.full_name##',
				'excerpt'   => 'Internal notification when a clinician or wellness partner applies to join the iKAN network.',
				'preheader' => 'New clinical partner credential submission received.',
				'html'      => self::render_alert_shell(
					array(
						'badge_label' => 'Partner application',
						'badge_tint'  => '#DFF3EE',
						'badge_ink'   => '#356B5A',
						'title'       => '##contact.full_name##',
						'intro'       => 'A new clinical partner applied to join iKAN. Expected response within 3–5 business days.',
						'facts'       => array(
							array( 'Name', '##contact.full_name##' ),
							array( 'Email', '<a href="mailto:##contact.email##" style="color:#0E1217;text-decoration:underline">##contact.email##</a>' ),
							array( 'Phone', '##contact.phone|--##' ),
							array( 'Specialty / Category', '##contact.custom.category|Counselor##' ),
						),
						'cta_label'   => 'Review in Admin',
						'cta_url'     => 'https://ikanhealth.in/wp-admin/admin.php?page=fluentcrm-admin#/subscribers',
						'footer_note' => 'An automatic alert from iKAN, sent to the team when something new arrives. Replying goes to the person who sent it, where there is one.',
					)
				),
			),

			// 15. iKAN Alert — Newsletter Sign-up (Internal Team Alert matching ikan2-alerts)
			array(
				'slug'      => 'ikan-alert-newsletter-signup',
				'title'     => 'iKAN Alert — Newsletter Sign-up',
				'subject'   => 'Newsletter: ##contact.email##',
				'excerpt'   => 'Internal notification when a new subscriber signs up for the iKAN newsletter.',
				'preheader' => 'New newsletter subscriber registered.',
				'html'      => self::render_alert_shell(
					array(
						'badge_label' => 'Newsletter sign-up',
						'badge_tint'  => '#DAF6E9',
						'badge_ink'   => '#0C6B4D',
						'title'       => '##contact.email##',
						'intro'       => 'A new subscriber joined the iKAN newsletter list.',
						'facts'       => array(
							array( 'Email', '<a href="mailto:##contact.email##" style="color:#0E1217;text-decoration:underline">##contact.email##</a>' ),
							array( 'Name', '##contact.full_name|Reader##' ),
							array( 'From', 'ikanhealth.in' ),
						),
						'cta_label'   => 'Open Subscribers',
						'cta_url'     => 'https://ikanhealth.in/wp-admin/admin.php?page=fluentcrm-admin#/subscribers',
						'footer_note' => 'An automatic alert from iKAN, sent to the team when something new arrives. Replying goes to the person who sent it, where there is one.',
					)
				),
			),
		);
	}

	/**
	 * WP-CLI handler for compiling and inspecting FluentCRM templates.
	 */
	public static function cli_handler( $args, $assoc_args ) {
		$action = $args[0] ?? 'list';

		switch ( $action ) {
			case 'sync':
				WP_CLI::line( '==> Compiling all iKAN branded email templates into FluentCRM...' );
				$count = self::push_templates();
				update_option( self::OPTION_KEY, self::TEMPLATE_VERSION );
				WP_CLI::success( sprintf( 'Successfully compiled and synced %d templates in FluentCRM (post_type = fc_template)!', $count ) );
				break;

			case 'list':
				global $wpdb;
				$templates = self::get_templates();
				WP_CLI::line( '=== iKAN FluentCRM Email Templates Catalog ===' );
				foreach ( $templates as $tpl ) {
					$existing_id = (int) $wpdb->get_var(
						$wpdb->prepare(
							"SELECT ID FROM {$wpdb->posts} WHERE post_name = %s AND post_type = 'fc_template' LIMIT 1",
							$tpl['slug']
						)
					);
					$status = $existing_id > 0 ? "Synced (ID: {$existing_id})" : 'Pending Sync';
					WP_CLI::line( sprintf( '- [%s] %s (Slug: %s)', $status, $tpl['title'], $tpl['slug'] ) );
				}
				break;

			default:
				WP_CLI::line( 'Usage: wp ikan-templates [sync|list]' );
		}
	}
}

// Auto-initialize
Ikan_FluentCRM_Templates::init();
