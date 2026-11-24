<?php
/**
 * iKAN Health — Design System & Compliance Hub.
 *
 * Provides an Appearance submenu screen for Administrators and Designers to view:
 * 1. Golden Design Tokens (synchronized with ikan2 styles.css & theme.json)
 * 2. Multi-surface Compliance Matrix (Normal Web, Mobile Only, PWA, Android)
 * 3. Scheduled GitHub Actions compliance status and ratchets
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_Design_Admin {

	/**
	 * Boot hooks.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_admin_menu' ) );
	}

	/**
	 * Register Appearance submenu page.
	 */
	public static function register_admin_menu() {
		add_submenu_page(
			'themes.php',
			'Design System & Compliance',
			'Design System & Tokens',
			'manage_options',
			'ikan-design-compliance',
			array( __CLASS__, 'render_compliance_page' )
		);
	}

	/**
	 * Render the Design System & Compliance page.
	 */
	public static function render_compliance_page() {
		$theme_json_path = get_template_directory() . '/theme.json';
		$theme_data      = file_exists( $theme_json_path ) ? json_decode( file_get_contents( $theme_json_path ), true ) : array();
		$palette         = isset( $theme_data['settings']['color']['palette'] ) ? $theme_data['settings']['color']['palette'] : array();
		$font_families   = isset( $theme_data['settings']['typography']['fontFamilies'] ) ? $theme_data['settings']['typography']['fontFamilies'] : array();
		?>
		<div class="wrap" style="max-width: 1200px; font-family: 'Manrope', -apple-system, sans-serif;">
			<div style="background: #151515; color: #FFFFFF; padding: 28px 36px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
				<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
					<div>
						<span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #10B981;">Cross-Repo Architecture & Governance</span>
						<h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; font-family: 'Sora', sans-serif; margin: 4px 0 8px 0;">Design System & Token Compliance</h1>
						<p style="margin: 0; color: #94A3B8; font-size: 14px;">Authority: <code>ikan2</code> (PWA & App Golden Source) &rarr; Mirror: <code>ikan</code> (WordPress Theme &amp; Web Surface)</p>
					</div>
					<div style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; padding: 8px 16px; border-radius: 9999px; color: #10B981; font-weight: 600; font-size: 13px;">
						✓ Scheduled Daily Compliance Active
					</div>
				</div>
			</div>

			<!-- 4-Surface Matrix -->
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px;">
				<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px;">
					<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B;">Surface 1</div>
					<h3 style="margin: 4px 0 8px 0; font-size: 18px; font-weight: 600; font-family: 'Sora', sans-serif;">Normal Web</h3>
					<p style="font-size: 13px; color: #64748B; margin-bottom: 12px;">Responsive layout on <code>ikanhealth.in</code></p>
					<ul style="font-size: 13px; margin: 0; padding-left: 18px; line-height: 1.6;">
						<li><strong>Max Content:</strong> 1200px container</li>
						<li><strong>Typography:</strong> Sora (head) + Manrope (sans)</li>
						<li><strong>Contrast:</strong> WCAG AA verified</li>
					</ul>
				</div>

				<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px;">
					<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B;">Surface 2</div>
					<h3 style="margin: 4px 0 8px 0; font-size: 18px; font-weight: 600; font-family: 'Sora', sans-serif;">Mobile Only</h3>
					<p style="font-size: 13px; color: #64748B; margin-bottom: 12px;">iOS Safari & Android Chrome viewports</p>
					<ul style="font-size: 13px; margin: 0; padding-left: 18px; line-height: 1.6;">
						<li><strong>Touch Targets:</strong> &ge; 48px CTAs</li>
						<li><strong>iOS Input:</strong> &ge; 16px (no auto-zoom)</li>
						<li><strong>Tap State:</strong> tap-highlight transparent</li>
					</ul>
				</div>

				<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px;">
					<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B;">Surface 3</div>
					<h3 style="margin: 4px 0 8px 0; font-size: 18px; font-weight: 600; font-family: 'Sora', sans-serif;">PWA (Installed)</h3>
					<p style="font-size: 13px; color: #64748B; margin-bottom: 12px;">Standalone Home-Screen Web App</p>
					<ul style="font-size: 13px; margin: 0; padding-left: 18px; line-height: 1.6;">
						<li><strong>Manifest:</strong> <code>manifest.json</code></li>
						<li><strong>Colors:</strong> <code>#FBFBFD</code> bg &amp; theme</li>
						<li><strong>Display:</strong> standalone / fullscreen</li>
					</ul>
				</div>

				<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 20px;">
					<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748B;">Surface 4</div>
					<h3 style="margin: 4px 0 8px 0; font-size: 18px; font-weight: 600; font-family: 'Sora', sans-serif;">Android Shell</h3>
					<p style="font-size: 13px; color: #64748B; margin-bottom: 12px;">Capacitor Android wrapper &amp; TWA</p>
					<ul style="font-size: 13px; margin: 0; padding-left: 18px; line-height: 1.6;">
						<li><strong>Keyboard:</strong> <code>interactive-widget</code></li>
						<li><strong>Safe Area:</strong> <code>pb-safe</code> inset padding</li>
						<li><strong>Notch:</strong> <code>viewport-fit=cover</code></li>
					</ul>
				</div>
			</div>

			<!-- Palette & Tokens -->
			<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
				<h3 style="font-family: 'Sora', sans-serif; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Active theme.json Color Palette (Mirrored from ikan2)</h3>
				<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
					<?php foreach ( $palette as $color ) : ?>
						<div style="border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
							<div style="height: 48px; background-color: <?php echo esc_attr( $color['color'] ); ?>;"></div>
							<div style="padding: 10px 12px; font-size: 12px;">
								<div style="font-weight: 600; color: #1E293B;"><?php echo esc_html( $color['name'] ); ?></div>
								<div style="color: #64748B; font-family: monospace; font-size: 11px;"><?php echo esc_html( $color['color'] ); ?></div>
								<div style="color: #94A3B8; font-family: monospace; font-size: 10px;">slug: <?php echo esc_html( $color['slug'] ); ?></div>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			</div>

			<!-- Automated Scheduled Governance -->
			<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 24px;">
				<h3 style="font-family: 'Sora', sans-serif; font-size: 18px; margin-top: 0; margin-bottom: 16px;">Scheduled Compliance Action Specs</h3>
				<p style="font-size: 13px; color: #64748B;">Automated cron jobs and ratchets enforce design standards without human intervention:</p>
				<table class="widefat striped" style="margin-top: 12px; font-size: 13px;">
					<thead>
						<tr>
							<th style="font-weight: 600;">Gate / Workflow</th>
							<th style="font-weight: 600;">Schedule / Trigger</th>
							<th style="font-weight: 600;">Execution Target</th>
							<th style="font-weight: 600;">Rule Enforced</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><strong>scheduled-design-compliance.yml</strong></td>
							<td>Daily (<code>0 2 * * *</code>) + Manual</td>
							<td><code>scripts/check-design-compliance.mjs</code></td>
							<td>Multi-surface validation: Web, Mobile, PWA, Android, and theme.json parity</td>
						</tr>
						<tr>
							<td><strong>contrast:ratchet</strong></td>
							<td>Every Push &amp; Daily</td>
							<td><code>scripts/contrast-ratchet.mjs</code></td>
							<td>WCAG AA contrast on all active foreground/background color tokens</td>
						</tr>
						<tr>
							<td><strong>lint:rawhex</strong></td>
							<td>Every Push &amp; Daily</td>
							<td><code>scripts/lint-raw-hex.mjs</code></td>
							<td>Hardcoded colour bypasses prevented; forces usage of registered tokens</td>
						</tr>
						<tr>
							<td><strong>lint:a11y</strong></td>
							<td>Every Push &amp; Daily</td>
							<td><code>scripts/lint-a11y-static.mjs</code></td>
							<td>Static checks for keyboard handlers, roles, and accessible button names</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<?php
	}
}

// Auto-initialize
Ikan_Design_Admin::init();
