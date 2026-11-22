<?php
/**
 * iKAN Health — Clinical Admin Hub.
 *
 * Provides WordPress Admin screens for Clinicians and Administrators to view
 * assessment instrument templates, questions, Equip curriculum, and member submissions
 * mapped against clinical cutoffs.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_Clinical_Admin {

	/**
	 * Boot hooks.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_admin_menu' ) );
	}

	/**
	 * Register the iKAN Clinical top-level admin menu and sub-pages.
	 */
	public static function register_admin_menu() {
		add_menu_page(
			'iKAN Clinical',
			'iKAN Clinical',
			'manage_options',
			'ikan-clinical',
			array( __CLASS__, 'render_assessments_page' ),
			'dashicons-heart',
			30
		);

		add_submenu_page(
			'ikan-clinical',
			'Assessment Instruments',
			'Assessments & Questions',
			'manage_options',
			'ikan-clinical',
			array( __CLASS__, 'render_assessments_page' )
		);

		add_submenu_page(
			'ikan-clinical',
			'Equip Curriculum',
			'Equip Curriculum',
			'manage_options',
			'ikan-clinical-equip',
			array( __CLASS__, 'render_equip_page' )
		);

		add_submenu_page(
			'ikan-clinical',
			'Member Submissions',
			'Member Results',
			'manage_options',
			'ikan-clinical-results',
			array( __CLASS__, 'render_results_page' )
		);
	}

	/**
	 * Load bundled clinical instruments JSON.
	 */
	private static function get_instruments_data() {
		$file = get_template_directory() . '/assets/data/clinical-instruments.json';
		if ( file_exists( $file ) ) {
			$json = json_decode( file_get_contents( $file ), true );
			return is_array( $json ) ? $json : array();
		}
		return array();
	}

	/**
	 * Render Assessments & Question Templates Page.
	 */
	public static function render_assessments_page() {
		$data        = self::get_instruments_data();
		$assessments = isset( $data['assessments'] ) ? $data['assessments'] : array();
		$profiles    = isset( $data['profiles'] ) ? $data['profiles'] : array();

		$current_slug = isset( $_GET['slug'] ) ? sanitize_text_field( $_GET['slug'] ) : '';
		if ( empty( $current_slug ) && ! empty( $assessments ) ) {
			$current_slug = $assessments[0]['slug'];
		}

		$current = null;
		foreach ( $assessments as $a ) {
			if ( $a['slug'] === $current_slug ) {
				$current = $a;
				break;
			}
		}

		?>
		<div class="wrap ikan-admin-wrap" style="max-width: 1200px; margin-top: 20px;">
			<h1 style="display:flex; align-items:center; gap:10px; font-size:24px; font-weight:700;">
				<span class="dashicons dashicons-heart" style="font-size:30px; width:30px; height:30px; color:#0e8388;"></span>
				iKAN Clinical Instruments & Question Catalog
			</h1>
			<p class="description" style="font-size:14px; margin-bottom:20px;">
				Standard clinical assessment templates (verbatim Notion & DSM-5 validated questions, option weights, risk markers, and severity cutoffs).
			</p>

			<!-- Assessment Selector Nav Tabs -->
			<nav class="nav-tab-wrapper wp-clearfix" style="margin-bottom: 20px;">
				<?php foreach ( $assessments as $item ) : ?>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=ikan-clinical&slug=' . $item['slug'] ) ); ?>"
					   class="nav-tab <?php echo $current_slug === $item['slug'] ? 'nav-tab-active' : ''; ?>">
						<?php echo esc_html( $item['instrument'] . ' (' . $item['name'] . ')' ); ?>
					</a>
				<?php endforeach; ?>
			</nav>

			<?php if ( $current ) : ?>
				<div style="background:#fff; border:1px solid #c3c4c7; border-radius:8px; padding:24px; margin-bottom:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
					<div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #f0f0f1; padding-bottom:16px; margin-bottom:20px;">
						<div>
							<span style="display:inline-block; background:#e6f4f1; color:#0e8388; font-weight:600; font-size:12px; padding:4px 10px; border-radius:4px; margin-bottom:8px; text-transform:uppercase;">
								Instrument: <?php echo esc_html( $current['instrument'] ); ?> · Category: <?php echo esc_html( $current['category'] ); ?>
							</span>
							<h2 style="margin:4px 0; font-size:20px; font-weight:700; color:#1d2327;">
								<?php echo esc_html( $current['title'] ); ?>
							</h2>
							<p style="margin:4px 0 0; color:#50575e; font-size:14px;">
								Slug: <code><?php echo esc_html( $current['slug'] ); ?></code> · Estimated Completion: <strong><?php echo esc_html( $current['minutes'] ); ?> mins</strong>
							</p>
						</div>
					</div>

					<!-- Severity Bands & Cut-points -->
					<h3 style="font-size:16px; margin:20px 0 10px; color:#1d2327;">Clinical Severity Bands & Cut-Points</h3>
					<?php
					$score_id = ! empty( $current['scores'][0]['profile'] ) ? $current['scores'][0]['profile'] : '';
					$band_profile = isset( $profiles[ $score_id ] ) ? $profiles[ $score_id ] : null;
					if ( $band_profile && ! empty( $band_profile['bands'] ) ) :
					?>
						<table class="widefat fixed striped" style="margin-bottom:24px; border:1px solid #dcdcde;">
							<thead>
								<tr>
									<th style="width:20%;">Band Label</th>
									<th style="width:15%;">Score Range</th>
									<th style="width:15%;">Severity</th>
									<th>Clinical Meaning & Recommended Action</th>
								</tr>
							</thead>
							<tbody>
								<?php foreach ( $band_profile['bands'] as $b ) : ?>
									<tr>
										<td><strong><?php echo esc_html( $b['label'] ); ?></strong></td>
										<td><code><?php echo esc_html( $b['min'] . ' – ' . $b['max'] ); ?> pts</code></td>
										<td>
											<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; <?php
												if ( 'severe' === $b['severity'] || 'moderately-severe' === $b['severity'] ) {
													echo 'background:#fbeae5; color:#c92a2a;';
												} elseif ( 'moderate' === $b['severity'] ) {
													echo 'background:#fff3bf; color:#f08c00;';
												} else {
													echo 'background:#ebfbee; color:#2b8a3e;';
												}
											?>">
												<?php echo esc_html( ucfirst( $b['severity'] ) ); ?>
											</span>
										</td>
										<td><?php echo esc_html( ! empty( $b['interpretation'] ) ? $b['interpretation'] : 'Standard monitoring band.' ); ?></td>
									</tr>
								<?php endforeach; ?>
							</tbody>
						</table>
					<?php endif; ?>

					<!-- Question by Question Template -->
					<h3 style="font-size:16px; margin:24px 0 10px; color:#1d2327;">
						Verbatim Instrument Questions & Options (<?php echo count( $current['questions'] ); ?> Questions)
					</h3>
					<div style="display:flex; flex-direction:column; gap:12px;">
						<?php foreach ( $current['questions'] as $q_idx => $q ) : ?>
							<?php
							$scale_key = $q['scale'];
							$scale_info = isset( $current['scales'][ $scale_key ] ) ? $current['scales'][ $scale_key ] : null;
							?>
							<div style="background:#f9f9fb; border:1px solid #e2e4e7; border-radius:6px; padding:14px 18px;">
								<div style="display:flex; justify-content:space-between; align-items:flex-start;">
									<div style="font-size:15px; font-weight:600; color:#1d2327;">
										<span style="color:#0e8388; margin-right:6px;">Q<?php echo $q_idx + 1; ?>.</span>
										<?php echo esc_html( $q['text'] ); ?>
									</div>
									<div>
										<?php if ( ! empty( $q['risk'] ) ) : ?>
											<span style="background:#fbeae5; color:#c92a2a; font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
												⚠️ High Risk Flag
											</span>
										<?php endif; ?>
										<?php if ( ! empty( $q['reversed'] ) ) : ?>
											<span style="background:#e7f5ff; color:#1971c2; font-size:11px; font-weight:600; padding:2px 8px; border-radius:4px;">
												Reverse Scored
											</span>
										<?php endif; ?>
									</div>
								</div>

								<?php if ( $scale_info && ! empty( $scale_info['options'] ) ) : ?>
									<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
										<?php foreach ( $scale_info['options'] as $opt ) : ?>
											<span style="background:#fff; border:1px solid #dcdcde; border-radius:4px; padding:4px 10px; font-size:13px; color:#3c434a;">
												<strong><?php echo esc_html( $opt['value'] ); ?></strong> — <?php echo esc_html( $opt['text'] ); ?>
											</span>
										<?php endforeach; ?>
									</div>
								<?php endif; ?>
							</div>
						<?php endforeach; ?>
					</div>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Render Equip Program Curriculum Page.
	 */
	public static function render_equip_page() {
		$dir = get_template_directory() . '/assets/data/equip-curriculum/';
		$programs = array(
			'sleep-tight'        => 'Sleep Tight (14 Days · Insomnia Recovery)',
			'unburn'             => 'Unburn (28 Days · Burnout Prevention)',
			'stress-buster'      => 'Stress Buster (14 Days · Nervous System Reset)',
			'productivity-reset' => 'Productivity Reset (7 Days · Focus)',
		);

		$current_slug = isset( $_GET['slug'] ) ? sanitize_text_field( $_GET['slug'] ) : 'sleep-tight';
		$file = $dir . $current_slug . '.json';
		$curriculum = array();
		if ( file_exists( $file ) ) {
			$curriculum = json_decode( file_get_contents( $file ), true );
		}

		?>
		<div class="wrap ikan-admin-wrap" style="max-width: 1200px; margin-top: 20px;">
			<h1 style="display:flex; align-items:center; gap:10px; font-size:24px; font-weight:700;">
				<span class="dashicons dashicons-calendar-alt" style="font-size:30px; width:30px; height:30px; color:#0e8388;"></span>
				iKAN Equip Programs & Curriculum Day-by-Day Templates
			</h1>
			<p class="description" style="font-size:14px; margin-bottom:20px;">
				Structured clinical day-by-day programs, lesson blocks, reflection prompts, and habit tracker schemas.
			</p>

			<!-- Program Selector Nav Tabs -->
			<nav class="nav-tab-wrapper wp-clearfix" style="margin-bottom: 20px;">
				<?php foreach ( $programs as $slug => $label ) : ?>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=ikan-clinical-equip&slug=' . $slug ) ); ?>"
					   class="nav-tab <?php echo $current_slug === $slug ? 'nav-tab-active' : ''; ?>">
						<?php echo esc_html( $label ); ?>
					</a>
				<?php endforeach; ?>
			</nav>

			<?php if ( ! empty( $curriculum['days'] ) ) : ?>
				<div style="background:#fff; border:1px solid #c3c4c7; border-radius:8px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
					<h2 style="margin:0 0 16px; font-size:18px;">
						<?php echo esc_html( $programs[ $current_slug ] ?? $current_slug ); ?>
					</h2>
					<table class="widefat fixed striped">
						<thead>
							<tr>
								<th style="width:10%;">Day #</th>
								<th style="width:30%;">Session Title</th>
								<th>Core Interactive Modules & Tasks</th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $curriculum['days'] as $day ) : ?>
								<tr>
									<td><strong>Day <?php echo esc_html( $day['day'] ?? '—' ); ?></strong></td>
									<td>
										<span style="font-weight:600; color:#1d2327;">
											<?php echo esc_html( $day['title'] ?? 'Untitled Day' ); ?>
										</span>
									</td>
									<td>
										<?php
										if ( ! empty( $day['steps'] ) && is_array( $day['steps'] ) ) {
											$step_labels = array();
											foreach ( $day['steps'] as $s ) {
												$step_labels[] = esc_html( $s['view']['ui'] ?? 'exercise' );
											}
											echo '<span style="color:#50575e; font-size:13px;">' . implode( ' → ', array_slice( $step_labels, 0, 4 ) ) . '</span>';
										} else {
											echo '<span style="color:#8c8f94;">Standard daily reflection & tracker</span>';
										}
										?>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Render Live Member Results Reviewer.
	 */
	public static function render_results_page() {
		global $wpdb;
		$table_assessments = $wpdb->prefix . 'ikan_assessment_results';
		$results = $wpdb->get_results( "SELECT * FROM $table_assessments ORDER BY completed_at DESC LIMIT 50" );

		?>
		<div class="wrap ikan-admin-wrap" style="max-width: 1200px; margin-top: 20px;">
			<h1 style="display:flex; align-items:center; gap:10px; font-size:24px; font-weight:700;">
				<span class="dashicons dashicons-clipboard" style="font-size:30px; width:30px; height:30px; color:#0e8388;"></span>
				Member Submissions Reviewer (Mapped to Clinical Instruments)
			</h1>
			<p class="description" style="font-size:14px; margin-bottom:20px;">
				Live clinical assessment results submitted by members, mapped to standardized cutoffs and scores.
			</p>

			<table class="widefat fixed striped">
				<thead>
					<tr>
						<th style="width:20%;">Member Email</th>
						<th style="width:25%;">Instrument</th>
						<th style="width:15%;">Score</th>
						<th style="width:15%;">Severity Band</th>
						<th style="width:25%;">Completed At</th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $results ) ) : ?>
						<tr>
							<td colspan="5" style="text-align:center; padding:30px; color:#8c8f94;">No member submissions recorded yet.</td>
						</tr>
					<?php else : ?>
						<?php foreach ( $results as $r ) : ?>
							<tr>
								<td>
									<strong><?php echo esc_html( $r->user_email ?: 'Anonymous User' ); ?></strong>
									<?php if ( $r->user_id ) : ?>
										<br><a href="<?php echo esc_url( admin_url( 'user-edit.php?user_id=' . $r->user_id ) ); ?>" style="font-size:12px;">View Profile</a>
									<?php endif; ?>
								</td>
								<td>
									<code><?php echo esc_html( $r->assessment_slug ); ?></code>
								</td>
								<td>
									<strong style="font-size:15px;"><?php echo esc_html( $r->score ); ?></strong>
								</td>
								<td>
									<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:600; <?php
										if ( 'severe' === $r->severity_band || 'moderately-severe' === $r->severity_band ) {
											echo 'background:#fbeae5; color:#c92a2a;';
										} elseif ( 'moderate' === $r->severity_band ) {
											echo 'background:#fff3bf; color:#f08c00;';
										} else {
											echo 'background:#ebfbee; color:#2b8a3e;';
										}
									?>">
										<?php echo esc_html( ucfirst( $r->severity_band ?: 'Normal' ) ); ?>
									</span>
								</td>
								<td>
									<?php echo esc_html( date( 'd M Y, h:i A', strtotime( $r->completed_at ) ) ); ?>
								</td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}
}

// Auto-initialize
Ikan_Clinical_Admin::init();
