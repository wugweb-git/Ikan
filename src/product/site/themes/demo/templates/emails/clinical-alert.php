<?php
/**
 * Clinical Risk & Severe Score Alert Email Template
 *
 * Dispatched to the Clinical Support & Safety Team when high risk or severe scores occur.
 *
 * @var string $user_name        Member Name.
 * @var string $user_email       Member Email.
 * @var string $supabase_uid     Supabase User UUID.
 * @var int    $wp_user_id       WordPress User ID.
 * @var string $instrument_name  Assessment Name (e.g. PHQ-9 Depression Screener).
 * @var string $instrument_code  Assessment Code (e.g. PHQ-9).
 * @var int    $score            Score.
 * @var int    $max_score        Max Score.
 * @var string $severity_label   Severity Label (e.g. Severe).
 * @var bool   $has_risk         True if item 9 or explicit risk endorsed.
 * @var string $risk_detail      Explanation of why alert fired.
 * @var string $completed_at     Timestamp.
 * @var string $crm_contact_url  URL to FluentCRM subscriber.
 * @var string $wp_user_url      URL to WP-Admin edit user.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$user_name       = ! empty( $user_name ) ? $user_name : 'iKAN Member';
$user_email      = ! empty( $user_email ) ? $user_email : 'Unknown';
$instrument_name = ! empty( $instrument_name ) ? $instrument_name : 'Clinical Assessment';
$score           = isset( $score ) ? (int) $score : 0;
$max_score       = isset( $max_score ) ? (int) $max_score : 27;
$severity_label  = ! empty( $severity_label ) ? $severity_label : 'Severe';
$has_risk        = ! empty( $has_risk );
$risk_detail     = ! empty( $risk_detail ) ? $risk_detail : 'Member crossed elevated clinical threshold.';
$completed_at    = ! empty( $completed_at ) ? $completed_at : current_time( 'j F Y, H:i T' );
$crm_contact_url = ! empty( $crm_contact_url ) ? $crm_contact_url : admin_url( 'admin.php?page=fluentcrm-admin#/subscribers' );
$wp_user_url     = ! empty( $wp_user_url ) ? $wp_user_url : admin_url( 'users.php' );
?>

<!-- Urgent Alert Banner -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; margin-bottom: 20px;">
	<tr>
		<td style="padding: 14px 18px;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td align="left" style="vertical-align: middle;">
						<span style="display: inline-block; background-color: #DC2626; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border-radius: 4px; margin-bottom: 6px;">
							Urgent Clinical Alert
						</span>
						<h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #991B1B;">
							High Clinical Risk / Severe Score Flagged
						</h2>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>

<!-- Member Identity Details -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 20px;">
	<tr>
		<td style="padding: 16px;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td style="font-size: 13px; color: #6B7280; padding: 4px 0; width: 120px;">Member:</td>
					<td style="font-size: 13px; font-weight: 600; color: #111827; padding: 4px 0;"><?php echo esc_html( $user_name ); ?></td>
				</tr>
				<tr>
					<td style="font-size: 13px; color: #6B7280; padding: 4px 0;">Email:</td>
					<td style="font-size: 13px; font-weight: 600; color: #111827; padding: 4px 0;">
						<a href="mailto:<?php echo esc_attr( $user_email ); ?>" style="color: #0F766E; text-decoration: underline;"><?php echo esc_html( $user_email ); ?></a>
					</td>
				</tr>
				<tr>
					<td style="font-size: 13px; color: #6B7280; padding: 4px 0;">Assessment:</td>
					<td style="font-size: 13px; font-weight: 600; color: #111827; padding: 4px 0;"><?php echo esc_html( $instrument_name ); ?></td>
				</tr>
				<tr>
					<td style="font-size: 13px; color: #6B7280; padding: 4px 0;">Result:</td>
					<td style="font-size: 13px; font-weight: 700; color: #DC2626; padding: 4px 0;">
						Score <?php echo esc_html( $score ); ?>/<?php echo esc_html( $max_score ); ?> &middot; <?php echo esc_html( $severity_label ); ?>
					</td>
				</tr>
				<tr>
					<td style="font-size: 13px; color: #6B7280; padding: 4px 0;">Timestamp:</td>
					<td style="font-size: 13px; color: #4B5563; padding: 4px 0;"><?php echo esc_html( $completed_at ); ?></td>
				</tr>
			</table>
		</td>
	</tr>
</table>

<!-- Risk Details -->
<div style="margin-bottom: 24px;">
	<h3 style="margin: 0 0 6px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #374151;">
		Risk Flag Explanation
	</h3>
	<p style="margin: 0; font-size: 13px; line-height: 1.5; color: #4B5563;">
		<?php echo esc_html( $risk_detail ); ?>
	</p>
</div>

<!-- Quick Action Buttons -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
	<tr>
		<td align="left">
			<a href="<?php echo esc_url( $crm_contact_url ); ?>" class="mobile-btn" target="_blank" style="display: inline-block; background-color: #0F766E; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 6px; margin-right: 8px;">
				Open in FluentCRM &rarr;
			</a>
			<a href="<?php echo esc_url( $wp_user_url ); ?>" class="mobile-btn" target="_blank" style="display: inline-block; background-color: #F3F4F6; color: #374151; border: 1px solid #D1D5DB; font-size: 13px; font-weight: 600; text-decoration: none; padding: 10px 18px; border-radius: 6px;">
				View WP Member &rarr;
			</a>
		</td>
	</tr>
</table>

<!-- Clinical Safety Note -->
<div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 6px; padding: 12px 14px;">
	<p style="margin: 0; font-size: 11px; line-height: 1.4; color: #92400E;">
		<strong>Clinical Safety Protocol:</strong> Ensure prompt clinical review according to iKAN clinical triage SOPs. If active suicidal ideation or self-harm risk is indicated, follow emergency outreach protocols immediately.
	</p>
</div>
