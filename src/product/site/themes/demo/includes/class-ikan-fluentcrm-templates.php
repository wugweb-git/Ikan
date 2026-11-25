<?php
/**
 * iKAN Health — FluentCRM Email Templates One-Time Push.
 *
 * Registers branded iKAN HTML email templates inside FluentCRM
 * (post_type = 'fc_template', _design_template = 'raw_html') so they appear
 * in wp-admin -> FluentCRM -> Emails -> Email Templates and can be edited
 * and used in FluentCRM automations (sent via FluentSMTP from noreply@ikanhealth.in).
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_FluentCRM_Templates {

	const TEMPLATE_VERSION = '1.0.0';
	const OPTION_KEY       = 'ikan_fluentcrm_templates_version';

	/**
	 * Boot hooks.
	 */
	public static function init() {
		add_action( 'admin_init', array( __CLASS__, 'maybe_push_templates' ), 30 );
	}

	/**
	 * Run the one-time template push if not yet applied.
	 */
	public static function maybe_push_templates() {
		if ( ! post_type_exists( 'fc_template' ) ) {
			return;
		}

		$installed = get_option( self::OPTION_KEY, '0.0.0' );
		if ( version_compare( $installed, self::TEMPLATE_VERSION, '>=' ) ) {
			return;
		}

		self::push_templates();
		update_option( self::OPTION_KEY, self::TEMPLATE_VERSION );
	}

	/**
	 * Idempotently insert branded iKAN templates into FluentCRM (fc_template).
	 *
	 * @return int Number of templates created.
	 */
	public static function push_templates() {
		if ( ! post_type_exists( 'fc_template' ) ) {
			return 0;
		}

		$templates = self::get_templates();
		$created   = 0;

		foreach ( $templates as $tpl ) {
			$existing = get_page_by_path( $tpl['slug'], OBJECT, 'fc_template' );
			if ( $existing ) {
				continue;
			}

			$post_id = wp_insert_post(
				array(
					'post_type'    => 'fc_template',
					'post_status'  => 'publish',
					'post_name'    => $tpl['slug'],
					'post_title'   => $tpl['title'],
					'post_content' => $tpl['html'],
				),
				true
			);

			if ( ! is_wp_error( $post_id ) && $post_id > 0 ) {
				update_post_meta( $post_id, '_design_template', 'raw_html' );
				update_post_meta( $post_id, '_email_subject', $tpl['subject'] );
				update_post_meta(
					$post_id,
					'_edit_template_config',
					array(
						'template_type' => 'raw_html',
					)
				);
				$created++;
			}
		}

		return $created;
	}

	/**
	 * Render the shared iKAN branded email shell (matching ikan2-alerts layout).
	 *
	 * @param array<string, mixed> $args Template config.
	 * @return string
	 */
	private static function render_shell( $args ) {
		$badge_bg    = $args['badge_bg'] ?? '#FBE6E4';
		$badge_color = $args['badge_color'] ?? '#A83E38';
		$badge_label = $args['badge_label'] ?? 'Notification';
		$heading     = $args['heading'] ?? '{{contact.full_name}}';
		$intro       = $args['intro'] ?? '';
		$facts       = $args['facts'] ?? array();
		$cta_label   = $args['cta_label'] ?? '';
		$cta_url     = $args['cta_url'] ?? '';
		$footer_note = $args['footer_note'] ?? 'Sent automatically by iKAN Health via FluentCRM.';

		$font_body    = "Manrope, 'Segoe UI', Helvetica, Arial, sans-serif";
		$font_display = "Sora, 'Segoe UI', Helvetica, Arial, sans-serif";

		$facts_html = '';
		foreach ( $facts as $i => $row ) {
			$rule       = $i > 0 ? 'border-top:1px solid #E3E7EC;' : '';
			$facts_html .= '<tr>'
				. '<td style="padding:12px 0;' . $rule . 'width:38%;vertical-align:top;font:500 13px/20px ' . $font_body . ';color:#5B6470;">' . esc_html( $row[0] ) . '</td>'
				. '<td style="padding:12px 0;' . $rule . 'vertical-align:top;font:600 14px/20px ' . $font_body . ';color:#0E1217;word-break:break-word;">' . $row[1] . '</td>'
				. '</tr>';
		}

		$cta_html = '';
		if ( $cta_label && $cta_url ) {
			$cta_html = '<tr><td style="padding:28px 32px 4px;">'
				. '<a href="' . esc_url( $cta_url ) . '" style="display:inline-block;background:#0E1217;color:#FFFFFF;text-decoration:none;font:600 14px/20px ' . $font_body . ';padding:12px 22px;border-radius:999px;">' . esc_html( $cta_label ) . '</a>'
				. '</td></tr>';
		}

		return '<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:#EDF0F4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDF0F4;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="padding:0 4px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;"><img src="https://app.ikanhealth.in/pwa-192x192.png" width="36" height="36" alt="iKAN" style="display:block;border:0;border-radius:999px;"></td>
          <td style="vertical-align:middle;padding-left:10px;font:700 18px/24px ' . $font_display . ';color:#0E1217;letter-spacing:-0.01em;">iKAN</td>
        </tr></table>
      </td></tr>
      <tr><td style="background:#FFFFFF;border-radius:20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:28px 32px 0;">
            <span style="display:inline-block;background:' . esc_attr( $badge_bg ) . ';color:' . esc_attr( $badge_color ) . ';font:700 12px/16px ' . $font_body . ';letter-spacing:0.04em;text-transform:uppercase;padding:6px 12px;border-radius:999px;">' . esc_html( $badge_label ) . '</span>
          </td></tr>
          <tr><td style="padding:16px 32px 0;font:700 24px/32px ' . $font_display . ';color:#0E1217;letter-spacing:-0.015em;">' . $heading . '</td></tr>
          <tr><td style="padding:8px 32px 0;font:400 15px/24px ' . $font_body . ';color:#5B6470;">' . $intro . '</td></tr>
          <tr><td style="padding:20px 32px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $facts_html . '</table>
          </td></tr>' . $cta_html . '
          <tr><td style="padding:28px 32px;font:400 12px/18px ' . $font_body . ';color:#5B6470;">iKAN Health · app.ikanhealth.in</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:20px 4px 0;font:400 12px/18px ' . $font_body . ';color:#5B6470;">' . esc_html( $footer_note ) . '</td></tr>
    </table>
  </td></tr>
</table>
</body></html>';
	}

	/**
	 * Definitions for all iKAN FluentCRM email templates.
	 *
	 * @return array<int, array<string, string>>
	 */
	public static function get_templates() {
		return array(
			array(
				'slug'    => 'ikan-alert-new-app-user',
				'title'   => 'iKAN Alert — New App User',
				'subject' => 'New user: {{contact.full_name}}',
				'html'    => self::render_shell(
					array(
						'badge_bg'    => '#FBE6E4',
						'badge_color' => '#A83E38',
						'badge_label' => 'New app user',
						'heading'     => '{{contact.full_name}}',
						'intro'       => 'Someone created an account in the iKAN app.',
						'facts'       => array(
							array( 'Name', '{{contact.full_name}}' ),
							array( 'Email', '{{contact.email}}' ),
							array( 'Phone', '{{contact.phone}}' ),
							array( 'City', '{{contact.city}}' ),
							array( 'Signed up with', '{{contact.custom.auth_provider}}' ),
							array( 'Member since', '{{contact.custom.member_since}}' ),
							array( 'Goal / Reason', '{{contact.custom.onboarding_reason}}' ),
						),
						'cta_label'   => 'Open wp-admin CRM',
						'cta_url'     => 'https://ikanhealth.in/wp-admin/admin.php?page=fluentcrm-admin#/subscribers',
						'footer_note' => 'An automatic alert from iKAN via FluentCRM (noreply@ikanhealth.in).',
					)
				),
			),
			array(
				'slug'    => 'ikan-welcome-member',
				'title'   => 'iKAN Member — Welcome Email',
				'subject' => 'Welcome to iKAN, {{contact.first_name}}',
				'html'    => self::render_shell(
					array(
						'badge_bg'    => '#DAF6E9',
						'badge_color' => '#0C6B4D',
						'badge_label' => 'Welcome to iKAN',
						'heading'     => 'Hi {{contact.first_name}}, glad you are here',
						'intro'       => 'Your iKAN space is ready — short daily Equip programmes, clinical assessments, mood check-ins, and consultation support in one place.',
						'facts'       => array(
							array( 'Account email', '{{contact.email}}' ),
							array( 'Member since', '{{contact.custom.member_since}}' ),
						),
						'cta_label'   => 'Open iKAN',
						'cta_url'     => 'https://app.ikanhealth.in',
						'footer_note' => 'Sent from noreply@ikanhealth.in via iKAN Health.',
					)
				),
			),
		);
	}
}

Ikan_FluentCRM_Templates::init();
