<?php
/**
 * iKAN Health — Clinical Admin Hub.
 *
 * Provides comprehensive WordPress Admin screens for Clinicians and Administrators
 * to view:
 * 1. Assessment Instruments & Question Catalogs
 * 2. Landing Page Content & Eligibility Rules
 * 3. Result Layouts & Severity Bands
 * 4. Grouped Category Layouts
 * 5. Equip Programs & Day-by-Day Curriculum
 * 6. Longitudinal Wellness Trajectories
 * 7. Live Member Submissions Mapped to Clinical Instruments
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
			'Assessments & Questions',
			'Assessments & Catalog',
			'manage_options',
			'ikan-clinical',
			array( __CLASS__, 'render_assessments_page' )
		);

		add_submenu_page(
			'ikan-clinical',
			'Equip Curriculum',
			'Equip Programs',
			'manage_options',
			'ikan-clinical-equip',
			array( __CLASS__, 'render_equip_page' )
		);

		add_submenu_page(
			'ikan-clinical',
			'Wellness Trajectories',
			'Wellness Trajectory',
			'manage_options',
			'ikan-clinical-wellness',
			array( __CLASS__, 'render_wellness_page' )
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
	 * Load bundled clinical instruments and landing page data.
	 */
	private static function get_bundle_data() {
		$inst_file   = get_template_directory() . '/assets/data/clinical-instruments.json';
		$assess_file = get_template_directory() . '/assets/data/assessments.json';
		$write_file  = get_template_directory() . '/assets/data/writeups.json';

		$instruments = file_exists( $inst_file ) ? json_decode( file_get_contents( $inst_file ), true ) : array();
		$assessments = file_exists( $assess_file ) ? json_decode( file_get_contents( $assess_file ), true ) : array();
		$writeups    = file_exists( $write_file ) ? json_decode( file_get_contents( $write_file ), true ) : array();

		// Index landing rows by slug
		$landing_map = array();
		if ( ! empty( $assessments['rows'] ) && is_array( $assessments['rows'] ) ) {
			foreach ( $assessments['rows'] as $r ) {
				$landing_map[ $r['slug'] ] = $r;
			}
		}

		$writeup_map = isset( $writeups['assessments'] ) ? $writeups['assessments'] : array();

		return array(
			'instruments' => isset( $instruments['assessments'] ) ? $instruments['assessments'] : array(),
			'profiles'    => isset( $instruments['profiles'] ) ? $instruments['profiles'] : array(),
			'landing'     => $landing_map,
			'writeups'    => $writeup_map,
		);
	}

	/**
	 * Render Assessments & Question Templates Page.
	 */
	public static function render_assessments_page() {
		$data        = self::get_bundle_data();
		$instruments = $data['instruments'];
		$profiles    = $data['profiles'];
		$landing_map = $data['landing'];
		$writeup_map = $data['writeups'];

		// Grouped Layout definitions
		$grouped_categories = array(
			'Clinical Mood & Affect'  => array( 'feeling-depressed-and-hopeless', 'feeling-worried-and-stressed' ),
			'Stress & Exhaustion'     => array( 'feeling-overwhelmed-and-anxious', 'feeling-drained-and-burned-out' ),
			'Sleep & Life Balance'    => array( 'struggling-with-quality-sleep', 'struggling-to-balance-life' ),
			'Holistic Triage'         => array( 'unsure-or-general-concern' ),
		);

		$current_slug = isset( $_GET['slug'] ) ? sanitize_text_field( $_GET['slug'] ) : '';
		if ( empty( $current_slug ) && ! empty( $instruments ) ) {
			$current_slug = $instruments[0]['slug'];
		}

		$current_inst = null;
		foreach ( $instruments as $a ) {
			if ( $a['slug'] === $current_slug ) {
				$current_inst = $a;
				break;
			}
		}

		$current_landing = isset( $landing_map[ $current_slug ] ) ? $landing_map[ $current_slug ] : array();
		$current_writeup = isset( $writeup_map[ $current_slug ] ) ? $writeup_map[ $current_slug ] : array();

		?>
		<div class="wrap ikan-admin-wrap" style="max-width: 1240px; margin-top: 20px;">
			<h1 style="display:flex; align-items:center; gap:10px; font-size:24px; font-weight:700;">
				<span class="dashicons dashicons-heart" style="font-size:30px; width:30px; height:30px; color:#0e8388;"></span>
				iKAN Clinical Assessment Hub: Questions, Scoring Matrix & Landing Content
			</h1>
			<p class="description" style="font-size:14px; margin-bottom:20px;">
				Standardized DSM-5 validated instruments, verbatim question banks, landing page layouts, clinical severity cutoffs, and Equip recommendation mapping.
			</p>

			<!-- Grouped Category Layout Badges -->
			<div style="background:#fff; border:1px solid #dcdcde; border-radius:8px; padding:16px 20px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
				<strong style="font-size:13px; text-transform:uppercase; color:#646970; letter-spacing:0.5px; display:block; margin-bottom:10px;">
					Grouped Clinical Categories:
				</strong>
				<div style="display:flex; flex-wrap:wrap; gap:16px;">
					<?php foreach ( $grouped_categories as $cat_title => $slugs ) : ?>
						<div style="background:#f6f7f7; border:1px solid #c3c4c7; border-radius:6px; padding:8px 14px;">
							<span style="font-weight:700; color:#1d2327; font-size:13px; display:block; margin-bottom:6px;"><?php echo esc_html( $cat_title ); ?></span>
							<div style="display:flex; gap:6px;">
								<?php foreach ( $slugs as $s ) :
									$inst_name = strtoupper( str_replace( array('feeling-', 'struggling-', 'unsure-or-'), '', $s ) );
									foreach ( $instruments as $ins ) {
										if ( $ins['slug'] === $s ) {
											$inst_name = $ins['instrument'];
											break;
										}
									}
								?>
									<a href="<?php echo esc_url( admin_url( 'admin.php?page=ikan-clinical&slug=' . $s ) ); ?>"
									   style="display:inline-block; padding:3px 9px; font-size:12px; font-weight:600; border-radius:4px; text-decoration:none; <?php echo $current_slug === $s ? 'background:#0e8388; color:#fff;' : 'background:#fff; border:1px solid #8c8f94; color:#2c3338;'; ?>">
										<?php echo esc_html( $inst_name ); ?>
									</a>
								<?php endforeach; ?>
							</div>
						</div>
					<?php endforeach; ?>
				</div>
			</div>

			<!-- Assessment Instrument Selector Nav Tabs -->
			<nav class="nav-tab-wrapper wp-clearfix" style="margin-bottom: 24px;">
				<?php foreach ( $instruments as $item ) : ?>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=ikan-clinical&slug=' . $item['slug'] ) ); ?>"
					   class="nav-tab <?php echo $current_slug === $item['slug'] ? 'nav-tab-active' : ''; ?>">
						<?php echo esc_html( $item['instrument'] . ' · ' . $item['name'] ); ?>
					</a>
				<?php endforeach; ?>
			</nav>

			<?php if ( $current_inst ) : ?>
				<!-- SECTION 1: HEADER & CLINICAL SPECIFICATION -->
				<div style="background:#fff; border:1px solid #c3c4c7; border-radius:8px; padding:24px; margin-bottom:24px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
					<div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #f0f0f1; padding-bottom:18px; margin-bottom:20px;">
						<div>
							<span style="display:inline-block; background:#e6f4f1; color:#0e8388; font-weight:700; font-size:12px; padding:4px 10px; border-radius:4px; margin-bottom:8px; text-transform:uppercase;">
								Validated Instrument: <?php echo esc_html( $current_inst['instrument'] ); ?> · Category: <?php echo esc_html( ucfirst( $current_inst['category'] ) ); ?>
							</span>
							<h2 style="margin:4px 0 8px; font-size:22px; font-weight:700; color:#1d2327;">
								<?php echo esc_html( $current_landing['title'] ?? $current_inst['title'] ); ?>
							</h2>
							<p style="margin:0; color:#50575e; font-size:14px; max-width:850px; line-height:1.5;">
								<?php echo esc_html( $current_landing['description'] ?? '' ); ?>
							</p>
						</div>
						<div style="text-align:right;">
							<span style="display:inline-block; background:#f0f0f1; padding:6px 12px; border-radius:6px; font-size:13px; font-weight:600; color:#2c3338;">
								⏱ <?php echo esc_html( $current_inst['minutes'] ); ?> Mins · <?php echo count( $current_inst['questions'] ); ?> Questions
							</span>
						</div>
					</div>

					<!-- SCORING MATRIX SPECS -->
					<?php
					$score_id     = ! empty( $current_inst['scores'][0]['profile'] ) ? $current_inst['scores'][0]['profile'] : '';
					$band_profile = isset( $profiles[ $score_id ] ) ? $profiles[ $score_id ] : null;
					?>
					<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-bottom:24px; background:#f9f9fb; border:1px solid #e2e4e7; border-radius:6px; padding:16px;">
						<div>
							<span style="display:block; font-size:12px; color:#646970; text-transform:uppercase;">Calculation Method</span>
							<strong style="font-size:15px; color:#1d2327;"><?php echo esc_html( strtoupper( $band_profile['calc'] ?? 'SUM' ) ); ?></strong>
						</div>
						<div>
							<span style="display:block; font-size:12px; color:#646970; text-transform:uppercase;">Score Range</span>
							<strong style="font-size:15px; color:#1d2327;"><?php echo esc_html( ($band_profile['min'] ?? 0) . ' to ' . ($band_profile['max'] ?? 27) ); ?> Points</strong>
						</div>
						<div>
							<span style="display:block; font-size:12px; color:#646970; text-transform:uppercase;">Clinical Direction</span>
							<strong style="font-size:15px; color:#1d2327;"><?php echo esc_html( ucfirst( $band_profile['direction'] ?? 'Distress' ) ); ?></strong>
						</div>
						<div>
							<span style="display:block; font-size:12px; color:#646970; text-transform:uppercase;">Canonical ID</span>
							<code style="font-size:13px;"><?php echo esc_html( $current_landing['id'] ?? $current_inst['id'] ); ?></code>
						</div>
					</div>

					<!-- RESULT LAYOUT & SEVERITY BANDS TABLE -->
					<h3 style="font-size:16px; margin:24px 0 12px; color:#1d2327;">
						📊 Result Layout & Clinical Severity Cut-Points
					</h3>
					<?php if ( $band_profile && ! empty( $band_profile['bands'] ) ) : ?>
						<table class="widefat fixed striped" style="margin-bottom:28px; border:1px solid #dcdcde;">
							<thead>
								<tr>
									<th style="width:20%;">Result Band Label</th>
									<th style="width:15%;">Score Cutoff</th>
									<th style="width:15%;">Severity Status</th>
									<th style="width:30%;">Clinical Interpretation Text</th>
									<th style="width:20%;">Recommended Equip Track</th>
								</tr>
							</thead>
							<tbody>
								<?php foreach ( $band_profile['bands'] as $b ) : ?>
									<tr>
										<td><strong><?php echo esc_html( $b['label'] ); ?></strong></td>
										<td><code><?php echo esc_html( $b['min'] . ' – ' . $b['max'] ); ?> pts</code></td>
										<td>
											<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; text-transform:uppercase; <?php
												if ( 'severe' === $b['severity'] || 'moderately-severe' === $b['severity'] ) {
													echo 'background:#fbeae5; color:#c92a2a;';
												} elseif ( 'moderate' === $b['severity'] ) {
													echo 'background:#fff3bf; color:#f08c00;';
												} else {
													echo 'background:#ebfbee; color:#2b8a3e;';
												}
											?>">
												<?php echo esc_html( $b['severity'] ); ?>
											</span>
										</td>
										<td style="font-size:13px; color:#3c434a;">
											<?php echo esc_html( ! empty( $b['interpretation'] ) ? $b['interpretation'] : 'Standard baseline monitoring.' ); ?>
										</td>
										<td>
											<?php
											$recs = isset( $current_inst['recommends'][ $b['label'] ] ) ? $current_inst['recommends'][ $b['label'] ] : array();
											if ( ! empty( $recs ) ) {
												foreach ( $recs as $rec_slug ) {
													echo '<span style="display:inline-block; background:#e7f5ff; color:#1971c2; font-size:11px; font-weight:600; padding:2px 8px; border-radius:4px; margin:2px;">' . esc_html( $rec_slug ) . '</span>';
												}
											} else {
												echo '<span style="color:#8c8f94; font-size:12px;">Equip as needed</span>';
											}
											?>
										</td>
									</tr>
								<?php endforeach; ?>
							</tbody>
						</table>
					<?php endif; ?>

					<!-- LANDING PAGE CONTENT & ELIGIBILITY SECTIONS -->
					<h3 style="font-size:16px; margin:28px 0 12px; color:#1d2327;">
						📄 Landing Page Content & Eligibility Rules
					</h3>
					<div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:28px;">
						<!-- Eligibility & Who can take this -->
						<div style="background:#f6f7f7; border:1px solid #dcdcde; border-radius:6px; padding:18px;">
							<h4 style="margin:0 0 10px; font-size:15px; color:#1d2327;">
								🎯 <?php echo esc_html( $current_landing['section1_title'] ?? 'How it works' ); ?>
							</h4>
							<p style="font-size:13px; margin:0 0 8px; color:#50575e;">
								<strong><?php echo esc_html( $current_landing['section1_who_title'] ?? 'Who can take this?' ); ?>:</strong>
								<?php echo esc_html( $current_landing['section1_who_content'] ?? 'Adults 18+' ); ?>
							</p>
							<div style="font-size:13px; color:#50575e; margin-top:10px;">
								<strong><?php echo esc_html( $current_landing['section1_eligibility_title'] ?? 'What to expect:' ); ?></strong>
								<ul style="list-style:disc; margin:6px 0 0 20px;">
									<?php
									$points = $current_landing['section1_eligibility_points'] ?? array('Answer honestly', 'Takes 4–5 minutes', 'Instant clinical result');
									foreach ( (array) $points as $pt ) {
										echo '<li>' . esc_html( $pt ) . '</li>';
									}
									?>
								</ul>
							</div>
						</div>

						<!-- Section 2 About & Highlights -->
						<div style="background:#f6f7f7; border:1px solid #dcdcde; border-radius:6px; padding:18px;">
							<h4 style="margin:0 0 10px; font-size:15px; color:#1d2327;">
								💡 <?php echo esc_html( $current_landing['section2_title'] ?? 'What is this assessment?' ); ?>
							</h4>
							<p style="font-size:13px; color:#50575e; line-height:1.5; margin:0 0 10px;">
								<?php echo nl2br( esc_html( $current_landing['section2_content'] ?? '' ) ); ?>
							</p>
							<?php if ( ! empty( $current_landing['section2_bullets'] ) ) : ?>
								<ul style="list-style:disc; margin:0 0 0 20px; font-size:13px; color:#50575e;">
									<?php foreach ( (array) $current_landing['section2_bullets'] as $b_item ) : ?>
										<li><?php echo esc_html( $b_item ); ?></li>
									<?php endforeach; ?>
								</ul>
							<?php endif; ?>
						</div>
					</div>

					<!-- VERBATIM INSTRUMENT QUESTIONS & SCALES -->
					<h3 style="font-size:16px; margin:28px 0 14px; color:#1d2327;">
						📝 Verbatim Question Bank & Option Weights (<?php echo count( $current_inst['questions'] ); ?> Questions)
					</h3>
					<div style="display:flex; flex-direction:column; gap:12px;">
						<?php foreach ( $current_inst['questions'] as $q_idx => $q ) : ?>
							<?php
							$scale_key  = $q['scale'];
							$scale_info = isset( $current_inst['scales'][ $scale_key ] ) ? $current_inst['scales'][ $scale_key ] : null;
							?>
							<div style="background:#f9f9fb; border:1px solid #e2e4e7; border-radius:6px; padding:14px 18px;">
								<div style="display:flex; justify-content:space-between; align-items:flex-start;">
									<div style="font-size:15px; font-weight:600; color:#1d2327;">
										<span style="color:#0e8388; margin-right:6px;">Q<?php echo $q_idx + 1; ?>.</span>
										<?php echo esc_html( $q['text'] ); ?>
										<code style="font-size:11px; margin-left:8px; color:#8c8f94;"><?php echo esc_html( $q['id'] ); ?></code>
									</div>
									<div>
										<?php if ( ! empty( $q['risk'] ) ) : ?>
											<span style="background:#fbeae5; color:#c92a2a; font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px; text-transform:uppercase;">
												⚠️ High Risk / Self-Harm Item
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
												<strong>Score: <?php echo esc_html( $opt['value'] ); ?></strong> ➔ <?php echo esc_html( $opt['text'] ); ?>
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
		<div class="wrap ikan-admin-wrap" style="max-width: 1240px; margin-top: 20px;">
			<h1 style="display:flex; align-items:center; gap:10px; font-size:24px; font-weight:700;">
				<span class="dashicons dashicons-calendar-alt" style="font-size:30px; width:30px; height:30px; color:#0e8388;"></span>
				iKAN Equip Clinical Tracks & Day-by-Day Curricula
			</h1>
			<p class="description" style="font-size:14px; margin-bottom:20px;">
				Structured day-by-day psychoeducation, interactive audio/reflection exercises, and habit trackers.
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
				<div style="background:#fff; border:1px solid #c3c4c7; border-radius:8px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.04);">
					<h2 style="margin:0 0 16px; font-size:18px;">
						<?php echo esc_html( $programs[ $current_slug ] ?? $current_slug ); ?>
					</h2>
					<table class="widefat fixed striped">
						<thead>
							<tr>
								<th style="width:10%;">Day #</th>
								<th style="width:30%;">Session Title</th>
								<th>Interactive Tasks & Trackers</th>
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
											echo '<span style="color:#50575e; font-size:13px;">' . implode( ' ➔ ', array_slice( $step_labels, 0, 5 ) ) . '</span>';
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
	 * Render Longitudinal Wellness Trajectory Dashboard.
	 */
	public static function render_wellness_page() {
		global $wpdb;
		$table_wellness = $wpdb->prefix . 'ikan_wellness_scores';
		$table_journals = $wpdb->prefix . 'ikan_journals';

		$scores = $wpdb->get_results( "SELECT score_date, AVG(overall_score) as avg_score, COUNT(*) as count FROM $table_wellness GROUP BY score_date ORDER BY score_date DESC LIMIT 30" );
		$recent_journals = $wpdb->get_results( "SELECT entry_date, AVG(mood_rating) as avg_mood, AVG(sleep_rating) as avg_sleep, AVG(stress_level) as avg_stress FROM $table_journals GROUP BY entry_date ORDER BY entry_date DESC LIMIT 14" );

		?>
		<div class="wrap ikan-admin-wrap" style="max-width: 1240px; margin-top: 20px;">
			<h1 style="display:flex; align-items:center; gap:10px; font-size:24px; font-weight:700;">
				<span class="dashicons dashicons-chart-line" style="font-size:30px; width:30px; height:30px; color:#0e8388;"></span>
				Longitudinal Wellness Trajectory & Daily Check-In Analytics
			</h1>
			<p class="description" style="font-size:14px; margin-bottom:20px;">
				Longitudinal member wellness scores (0–100), 7-day rolling mood/sleep ratings, and cohort wellness trends.
			</p>

			<div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:24px;">
				<!-- Wellness Trajectory Table -->
				<div style="background:#fff; border:1px solid #c3c4c7; border-radius:8px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
					<h3 style="margin:0 0 14px; font-size:16px;">📈 Daily Average Wellness Scores (0–100)</h3>
					<table class="widefat fixed striped">
						<thead>
							<tr>
								<th>Date</th>
								<th>Average Score</th>
								<th>Check-Ins</th>
							</tr>
						</thead>
						<tbody>
							<?php if ( empty( $scores ) ) : ?>
								<tr><td colspan="3" style="text-align:center; color:#8c8f94;">No wellness records yet.</td></tr>
							<?php else : ?>
								<?php foreach ( $scores as $s ) : ?>
									<tr>
										<td><strong><?php echo esc_html( date( 'd M Y', strtotime( $s->score_date ) ) ); ?></strong></td>
										<td>
											<span style="font-weight:700; color:#0e8388; font-size:15px;"><?php echo round( $s->avg_score ); ?></span> / 100
										</td>
										<td><?php echo esc_html( $s->count ); ?> members</td>
									</tr>
								<?php endforeach; ?>
							<?php endif; ?>
						</tbody>
					</table>
				</div>

				<!-- Mood, Sleep & Stress Metrics -->
				<div style="background:#fff; border:1px solid #c3c4c7; border-radius:8px; padding:20px; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
					<h3 style="margin:0 0 14px; font-size:16px;">🌱 14-Day Holistic Check-In Ratings (1–5 Scale)</h3>
					<table class="widefat fixed striped">
						<thead>
							<tr>
								<th>Date</th>
								<th>Mood (1–5)</th>
								<th>Sleep (1–5)</th>
								<th>Stress (1–5)</th>
							</tr>
						</thead>
						<tbody>
							<?php if ( empty( $recent_journals ) ) : ?>
								<tr><td colspan="4" style="text-align:center; color:#8c8f94;">No journal ratings yet.</td></tr>
							<?php else : ?>
								<?php foreach ( $recent_journals as $j ) : ?>
									<tr>
										<td><strong><?php echo esc_html( date( 'd M Y', strtotime( $j->entry_date ) ) ); ?></strong></td>
										<td>😊 <?php echo round( $j->avg_mood, 1 ); ?></td>
										<td>😴 <?php echo round( $j->avg_sleep, 1 ); ?></td>
										<td>⚡ <?php echo round( $j->avg_stress, 1 ); ?></td>
									</tr>
								<?php endforeach; ?>
							<?php endif; ?>
						</tbody>
					</table>
				</div>
			</div>
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
		<div class="wrap ikan-admin-wrap" style="max-width: 1240px; margin-top: 20px;">
			<h1 style="display:flex; align-items:center; gap:10px; font-size:24px; font-weight:700;">
				<span class="dashicons dashicons-clipboard" style="font-size:30px; width:30px; height:30px; color:#0e8388;"></span>
				Member Submissions Reviewer (Mapped to Clinical Instruments)
			</h1>
			<p class="description" style="font-size:14px; margin-bottom:20px;">
				Live clinical assessment results submitted by members, mapped to standardized cutoffs, scores, and SCF profiles.
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
										<br><a href="<?php echo esc_url( admin_url( 'user-edit.php?user_id=' . $r->user_id ) ); ?>" style="font-size:12px;">View SCF Profile</a>
									<?php endif; ?>
								</td>
								<td>
									<code><?php echo esc_html( $r->assessment_slug ); ?></code>
								</td>
								<td>
									<strong style="font-size:15px;"><?php echo esc_html( $r->score ); ?></strong>
								</td>
								<td>
									<span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; text-transform:uppercase; <?php
										if ( 'severe' === $r->severity_band || 'moderately-severe' === $r->severity_band ) {
											echo 'background:#fbeae5; color:#c92a2a;';
										} elseif ( 'moderate' === $r->severity_band ) {
											echo 'background:#fff3bf; color:#f08c00;';
										} else {
											echo 'background:#ebfbee; color:#2b8a3e;';
										}
									?>">
										<?php echo esc_html( $r->severity_band ?: 'Normal' ); ?>
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
