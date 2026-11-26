<?php
/**
 * iKAN Health — Compact Responsive Email Shell
 *
 * Designed with a thin, compact header and fluid mobile-first layout.
 *
 * @var string $subject    Subject / preheader fallback.
 * @var string $preheader  Hidden inbox preview text.
 * @var string $content    Inner HTML rendered from specific email template.
 * @var string $site_name  Site/Brand Name.
 * @var string $site_url   Home URL.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$subject   = $subject ?? 'iKAN Health Notification';
$preheader = $preheader ?? $subject;
$content   = $content ?? '';
$site_name = $site_name ?? 'iKAN Health';
$site_url  = $site_url ?? home_url( '/' );
$app_url   = defined( 'IKAN_APP_URL' ) ? IKAN_APP_URL : 'https://app.ikanhealth.in';
?>
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="x-apple-disable-message-reformatting" />
	<title><?php echo esc_html( $subject ); ?></title>
	<style type="text/css">
		/* Client reset */
		body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
		table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
		img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
		table { border-collapse: collapse !important; }
		body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8F9FA; }

		/* Responsive rules for mobile view */
		@media only screen and (max-width: 600px) {
			.email-container { width: 100% !important; max-width: 100% !important; }
			.email-card { border-radius: 10px !important; margin: 8px !important; }
			.content-cell { padding: 20px 16px !important; }
			.compact-header { padding: 10px 16px !important; }
			.score-pill { font-size: 20px !important; }
			.mobile-stack { display: block !important; width: 100% !important; box-sizing: border-box !important; }
			.mobile-btn { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 8px !important; }
			.footer-cell { padding: 16px 16px 24px !important; }
		}
	</style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
	<!-- Hidden preheader text for inbox preview -->
	<div style="display: none; font-size: 1px; color: #F8F9FA; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
		<?php echo esc_html( $preheader ); ?>
		&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
	</div>

	<!-- Outer background table -->
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8F9FA; width: 100%; margin: 0; padding: 16px 0;">
		<tr>
			<td align="center" style="padding: 0 8px;">
				<!-- Centered email container (max 580px) -->
				<table role="presentation" class="email-container" width="580" cellpadding="0" cellspacing="0" style="width: 580px; max-width: 580px; margin: 0 auto;">

					<!-- Thin, Compact Brand Header -->
					<tr>
						<td style="padding-bottom: 10px;">
							<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #132A1E; border-radius: 10px; overflow: hidden;">
								<tr>
									<td class="compact-header" style="padding: 10px 20px;">
										<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
											<tr>
												<td align="left" style="vertical-align: middle;">
													<a href="<?php echo esc_url( $site_url ); ?>" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center;">
														<span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 17px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.02em;">
															iKAN<span style="color: #52B788;">.</span>health
														</span>
													</a>
												</td>
												<td align="right" style="vertical-align: middle;">
													<span style="display: inline-block; background-color: rgba(255,255,255,0.12); color: #E2E8F0; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 9999px;">
														Clinical Health
													</span>
												</td>
											</tr>
										</table>
									</td>
								</tr>
							</table>
						</td>
					</tr>

					<!-- Main Content Body Card -->
					<tr>
						<td>
							<table role="presentation" class="email-card" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); overflow: hidden;">
								<tr>
									<td class="content-cell" style="padding: 28px 24px;">
										<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
									</td>
								</tr>
							</table>
						</td>
					</tr>

					<!-- Compact Clinical Footer & Crisis Helpline -->
					<tr>
						<td class="footer-cell" style="padding: 20px 16px 28px; text-align: center;">
							<!-- Crisis Support Quick Bar -->
							<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F1F5F9; border-radius: 8px; margin-bottom: 16px;">
								<tr>
									<td style="padding: 10px 14px; font-size: 11px; line-height: 1.4; color: #475569; text-align: center;">
										<strong style="color: #0F172A;">Need immediate support?</strong> Call 24/7 Tele-MANAS at <a href="tel:14416" style="color: #0F766E; font-weight: 600; text-decoration: none;">14416</a> or Vandrevala at <a href="tel:+919999666555" style="color: #0F766E; font-weight: 600; text-decoration: none;">+91 9999 666 555</a>.
									</td>
								</tr>
							</table>

							<p style="margin: 0 0 8px; font-size: 11px; line-height: 1.5; color: #6B7280;">
								<?php
								printf(
									/* translators: %s: site name */
									esc_html__( 'This clinical summary is generated automatically for members of %s.', 'ikan' ),
									'<strong>' . esc_html( $site_name ) . '</strong>'
								);
								?>
								<br />
								<?php esc_html_e( 'Assessments are screening tools and not formal clinical diagnoses.', 'ikan' ); ?>
							</p>
							<p style="margin: 0; font-size: 11px; color: #9CA3AF;">
								&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php echo esc_html( $site_name ); ?>. All rights reserved. &middot;
								<a href="<?php echo esc_url( home_url( '/privacy-policy/' ) ); ?>" style="color: #6B7280; text-decoration: underline;">Privacy</a> &middot;
								<a href="<?php echo esc_url( home_url( '/terms-of-use/' ) ); ?>" style="color: #6B7280; text-decoration: underline;">Terms</a>
							</p>
						</td>
					</tr>

				</table>
			</td>
		</tr>
	</table>
</body>
</html>
