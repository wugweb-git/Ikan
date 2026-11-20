<?php
/**
 * Template Name: Assessment Detail
 * Template Post Type: page
 * Description: Clinical assessment detail view with validation notes and start flow
 */

get_header();

// Determine slug
$slug = sanitize_text_field( $_GET['assessment'] ?? $_GET['slug'] ?? '' );
if ( empty( $slug ) ) {
  $path = trim( parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), '/' );
  $parts = explode( '/', $path );
  $slug = end( $parts );
}

// Load assessments
$ass_file = get_template_directory() . '/assets/data/assessments.json';
$assessment = null;
if ( file_exists( $ass_file ) ) {
  $data = json_decode( file_get_contents( $ass_file ), true );
  $rows = $data['rows'] ?? [];
  foreach ( $rows as $r ) {
    if ( ( $r['slug'] ?? '' ) === $slug || ( $r['id'] ?? '' ) === $slug ) {
      $assessment = $r;
      break;
    }
  }
  if ( ! $assessment && ! empty( $rows ) ) {
    $assessment = $rows[0];
  }
}

$title = $assessment['title'] ?? 'Mental Health Assessment';
$desc = $assessment['description'] ?? 'Clinically validated screening to evaluate mental wellbeing and symptoms.';
$category = $assessment['category'] ?? 'Clinical Screening';
$duration = $assessment['duration'] ?? 5;
?>

<main class="ikan2-theme site-page-below-nav" style="font-family: var(--font-sans);">

  <!-- Hero Section -->
  <?php
  $cover_map = [
    'who-5' => 'what-is-the-who-5-well-being-index-a.webp',
    'bat-23' => 'what-is-the-burnout-assessment-tool-an-easy-guide.webp',
    'gad-7' => 'what-is-generalized-anxiety-disorder-7-a-simple-guide.webp',
    'phq-9' => 'what-is-patient-health-questionnaire-9-a-quick-depression.webp',
    'sci' => 'what-is-the-sleep-condition-indicator-wake-up-to.webp',
    'pss-10' => 'what-is-the-perceived-stress-scale-understand-the-stress.webp',
    'workplace' => 'what-is-the-workplace-stress-scale-explained.webp',
  ];
  $cover_file = $cover_map[$slug] ?? null;
  ?>
  <section class="py-14 md:py-20 bg-gradient-to-b from-[#F5F8F7] via-[#EBF3EF] to-white border-b border-gray-100">
    <div class="site-container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div class="lg:col-span-7">
          <a href="<?php echo esc_url( home_url( '/assessments/' ) ); ?>" class="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-medium mb-4">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            Back to all Assessments
          </a>

          <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100/80 text-emerald-800">
              <?php echo esc_html( $category ); ?>
            </span>
            <span class="text-xs text-gray-500 font-medium flex items-center gap-1">
              <i data-lucide="clock" class="w-3.5 h-3.5"></i>
              <?php echo esc_html( $duration ); ?> mins to complete
            </span>
          </div>

          <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            <?php echo esc_html( $title ); ?>
          </h1>

          <p class="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            <?php echo esc_html( $desc ); ?>
          </p>

          <div class="flex flex-wrap items-center gap-4">
            <a href="<?php echo esc_url( home_url( '/signup/?focus=' . urlencode( $category ) ) ); ?>"
              class="px-8 py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm">
              <span>Begin Assessment</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
            <span class="text-xs text-gray-400">100% Free &amp; Anonymous</span>
          </div>
        </div>
        <?php if ( $cover_file ) : ?>
          <div class="lg:col-span-5">
            <div class="rounded-3xl overflow-hidden shadow-xl border border-gray-100 aspect-[4/3] bg-gray-100">
              <img src="<?php echo esc_url( get_theme_file_uri( 'assets/resources/covers/' . $cover_file ) ); ?>" alt="<?php echo esc_attr( $title ); ?>" class="w-full h-full object-cover" loading="eager" decoding="async">
            </div>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <!-- Assessment Criteria & Details -->
  <section class="py-14 bg-white">
    <div class="site-container">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200/80">
          <h3 class="text-xs uppercase font-bold text-gray-400 mb-2">Duration</h3>
          <p class="text-xl font-bold text-gray-900 mb-1"><?php echo esc_html( $duration ); ?> Minutes</p>
          <p class="text-xs text-gray-500">Brief multiple choice screening with zero open-ended typing required.</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200/80">
          <h3 class="text-xs uppercase font-bold text-gray-400 mb-2">Clinical Rigor</h3>
          <p class="text-xl font-bold text-gray-900 mb-1">Peer-Reviewed</p>
          <p class="text-xs text-gray-500">Validated against standard clinical diagnostic thresholds and population cohorts.</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200/80">
          <h3 class="text-xs uppercase font-bold text-gray-400 mb-2">Outcome</h3>
          <p class="text-xl font-bold text-gray-900 mb-1">Instant Severity Report</p>
          <p class="text-xs text-gray-500">Clear categorical score breakdown with tailored next steps and care pathways.</p>
        </div>
      </div>

      <!-- Eligibility & Target Audience -->
      <?php if ( ! empty( $assessment['section1_eligibility_points'] ) ) : ?>
      <div class="border border-gray-200 rounded-3xl p-6 sm:p-10 bg-[#FAFAFA] mb-8">
        <h2 class="text-xl md:text-2xl font-bold text-gray-900 mb-3">Who this assessment is designed for</h2>
        <ul class="space-y-3">
          <?php foreach ( $assessment['section1_eligibility_points'] as $point ) : ?>
            <li class="flex items-start gap-3 text-sm text-gray-700">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">&check;</span>
              <span><?php echo esc_html( $point ); ?></span>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>
      <?php endif; ?>

      <div class="text-center pt-6">
        <a href="<?php echo esc_url( home_url( '/signup/?focus=' . urlencode( $category ) ) ); ?>"
          class="px-8 py-3 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-all inline-flex items-center gap-2">
          <span>Start Assessment Now</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>
