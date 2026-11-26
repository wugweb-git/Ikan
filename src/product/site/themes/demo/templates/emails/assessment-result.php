<?php
/**
 * Member Assessment Result Email Template
 *
 * @var string $user_name       Recipient Name.
 * @var string $instrument_name Name of assessment (e.g. PHQ-9 Depression Screener).
 * @var string $instrument_code Short code (e.g. PHQ-9).
 * @var int    $score           Total Score.
 * @var int    $max_score       Maximum Score.
 * @var string $severity        Severity slug (e.g. minimal, mild, moderate, moderately-severe, severe).
 * @var string $severity_label  Human readable severity band (e.g. Moderate).
 * @var string $interpretation  Clinical interpretation text.
 * @var string $recommendation  Care pathway recommendation.
 * @var string $program_slug    Recommended Equip program slug.
 * @var string $program_name    Recommended Equip program name.
 * @var string $completed_at    Date string of completion.
 * @var string $result_url      URL to open result in app.
 * @var bool   $has_risk        True if clinical risk flag endorsed.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$user_name       = ! empty( $user_name ) ? $user_name : 'Member';
$instrument_name = ! empty( $instrument_name ) ? $instrument_name : 'Mental Wellbeing Assessment';
$instrument_code = ! empty( $instrument_code ) ? $instrument_code : 'Assessment';
$score           = isset( $score ) ? (int) $score : 0;
$max_score       = isset( $max_score ) ? (int) $max_score : 27;
$severity        = ! empty( $severity ) ? strtolower( $severity ) : 'minimal';
$severity_label  = ! empty( $severity_label ) ? $severity_label : ucfirst( $severity );
$interpretation  = ! empty( $interpretation ) ? $interpretation : '';
$recommendation  = ! empty( $recommendation ) ? $recommendation : '';
$program_name    = ! empty( $program_name ) ? $program_name : 'iKAN Equip Programs';
$completed_at    = ! empty( $completed_at ) ? $completed_at : current_time( 'j F Y' );
$result_url      = ! empty( $result_url ) ? $result_url : 'https://app.ikanhealth.in/assessments';
$has_risk        = ! empty( $has_risk );

// Severity Color Styling
$sev_colors = array(
	'minimal'           => array( 'bg' => '#E6F4EA', 'text' => '#137333', 'border' => '#CEEAD6' ),
	'mild'              => array( 'bg' => '#E8F0FE', 'text' => '#1A73E8', 'border' => '#D2E3FC' ),
	'moderate'          => array( 'bg' => '#FEF7E0', 'text' => '#B06000', 'border' => '#FEEFC3' ),
	'moderately-severe' => array( 'bg' => '#FCE8E6', 'text' => '#C5221F', 'border' => '#FAD2CF' ),
	'severe'            => array( 'bg' => '#FCE8E6', 'text' => '#B31412', 'border' => '#FAD2CF' ),
	'high'              => array( 'bg' => '#FCE8E6', 'text' => '#B31412', 'border' => '#FAD2CF' ),
);
$badge = isset( $sev_colors[ $severity ] ) ? $sev_colors[ $severity ] : $sev_colors['mild'];
?>

<!-- Greeting -->
<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #111827;">
	Hello <strong><?php echo esc_html( $user_name ); ?></strong>,
</p>
<p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #4B5563;">
	Thank you for taking time for your wellbeing. Here is the clinical summary of your <strong><?php echo esc_html( $instrument_name ); ?></strong> completed on <?php echo esc_html( $completed_at ); ?>.
</p>

<!-- Score Summary Card -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; margin-bottom: 24px; overflow: hidden;">
	<tr>
		<td style="padding: 18px 20px;">
			<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td align="left" style="vertical-align: middle;">
						<span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6B7280; display: block; margin-bottom: 4px;">
							<?php echo esc_html( $instrument_code ); ?> Score
						</span>
						<span class="score-pill" style="font-size: 26px; font-weight: 700; color: #111827; letter-spacing: -0.02em;">
							<?php echo esc_html( $score ); ?>
							<?php if ( $max_score > 0 ) : ?>
								<span style="font-size: 15px; font-weight: 400; color: #6B7280;">/ <?php echo esc_html( $max_score ); ?></span>
							<?php endif; ?>
						</span>
					</td>
					<td align="right" style="vertical-align: middle;">
						<span style="display: inline-block; background-color: <?php echo esc_attr( $badge['bg'] ); ?>; color: <?php echo esc_attr( $badge['text'] ); ?>; border: 1px solid <?php echo esc_attr( $badge['border'] ); ?>; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 9999px;">
							<?php echo esc_html( $severity_label ); ?>
						</span>
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>

<!-- Clinical Meaning -->
<?php if ( ! empty( $interpretation ) ) : ?>
<div style="margin-bottom: 20px;">
	<h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #374151;">
		What This Means
	</h3>
	<p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4B5563;">
		<?php echo esc_html( $interpretation ); ?>
	</p>
</div>
<?php endif; ?>

<!-- Elevated Symptom or Risk Notice -->
<?php if ( $has_risk || in_array( $severity, array( 'moderately-severe', 'severe', 'high' ), true ) ) : ?>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 6px; margin-bottom: 24px;">
	<tr>
		<td style="padding: 14px 16px;">
			<p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #991B1B;">
				We encourage you to speak with a professional
			</p>
			<p style="margin: 0; font-size: 13px; line-height: 1.5; color: #7F1D1D;">
				Your screening shows elevated symptoms. You do not have to carry this alone. Our qualified clinical team is here to support you.
			</p>
		</td>
	</tr>
</table>
<?php endif; ?>

<!-- Care Pathway / Recommendation -->
<?php if ( ! empty( $recommendation ) ) : ?>
<div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
	<p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #166534;">
		Recommended Next Step
	</p>
	<p style="margin: 0; font-size: 13px; line-height: 1.5; color: #14532D;">
		<?php echo esc_html( $recommendation ); ?>
	</p>
</div>
<?php endif; ?>

<!-- CTA Actions -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
	<tr>
		<td align="center">
			<a href="<?php echo esc_url( $result_url ); ?>" class="mobile-btn" target="_blank" style="display: inline-block; background-color: #132A1E; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; text-align: center;">
				View Detailed Breakdown &rarr;
			</a>
		</td>
	</tr>
</table>
