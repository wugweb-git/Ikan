<?php
/**
 * Template Name: Equip Detail
 * Template Post Type: page
 * Description: Detailed view for an individual Equip habit & resilience program
 */

get_header();

// Determine slug
$slug = sanitize_text_field( $_GET['program'] ?? $_GET['slug'] ?? '' );
if ( empty( $slug ) ) {
  $path = trim( parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), '/' );
  $parts = explode( '/', $path );
  $slug = end( $parts );
}

// Load equip programs
$equip_file = get_template_directory() . '/assets/data/equip-programs.json';
$program = null;
if ( file_exists( $equip_file ) ) {
  $data = json_decode( file_get_contents( $equip_file ), true );
  $rows = $data['rows'] ?? [];
  foreach ( $rows as $r ) {
    if ( ( $r['slug'] ?? '' ) === $slug || ( $r['id'] ?? '' ) === $slug ) {
      $program = $r;
      break;
    }
  }
  if ( ! $program && ! empty( $rows ) ) {
    $program = $rows[0]; // Fallback to first program
  }
}

$title = $program['title'] ?? 'Equip Wellbeing Program';
$desc = $program['description'] ?? 'A 14-day guided behavioural program for mental wellbeing.';
$category = $program['category'] ?? 'Wellbeing';
$duration = $program['duration'] ?? '14 Days';
?>

<main class="ikan2-theme site-page-below-nav" style="font-family: var(--font-sans);">

  <!-- Hero Section -->
  <?php
  $cover_map = [
    'sleep-tight' => 'equip-sleep-tight.jpg',
    'unburn' => 'res-burnout.jpg',
    'stress-buster' => 'res-anxiety.jpg',
    'productivity-reset' => 'equip-productivity-reset.jpg',
  ];
  $cover_img = $cover_map[$slug] ?? 'program-cover.jpg';
  ?>
  <section class="py-14 md:py-20 bg-gradient-to-b from-[#F2F7F4] via-[#E5EFE9] to-white border-b border-gray-100">
    <div class="site-container">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div class="lg:col-span-7">
          <a href="<?php echo esc_url( home_url( '/equip-programs/' ) ); ?>" class="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-medium mb-4">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            Back to all Equip Programs
          </a>

          <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-100/80 text-emerald-800">
              <?php echo esc_html( $category ); ?>
            </span>
            <span class="text-xs text-gray-500 font-medium">
              &bull; <?php echo esc_html( $duration ); ?>
            </span>
          </div>

          <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
            <?php echo esc_html( $title ); ?>
          </h1>

          <p class="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            <?php echo esc_html( $desc ); ?>
          </p>

          <div class="flex flex-wrap items-center gap-4">
            <a href="<?php echo esc_url( home_url( '/signup/?program=' . urlencode( $slug ) ) ); ?>"
              class="px-8 py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm">
              <span>Enroll &amp; Start Day 1</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
            <span class="text-xs text-gray-400">Included free in iKAN membership</span>
          </div>
        </div>
        <div class="lg:col-span-5">
          <div class="rounded-3xl overflow-hidden shadow-xl border border-gray-100 aspect-[4/3] bg-gray-100">
            <img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/' . $cover_img ) ); ?>" alt="<?php echo esc_attr( $title ); ?>" class="w-full h-full object-cover" loading="eager" decoding="async">
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Bento Grid & Curriculum -->
  <section class="py-14 bg-white">
    <div class="site-container">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200/80">
          <h3 class="text-xs uppercase font-bold text-gray-400 mb-2">Time Commitment</h3>
          <p class="text-xl font-bold text-gray-900 mb-1">5–10 mins a day</p>
          <p class="text-xs text-gray-500">Paced for busy schedules with audio sessions and self-reflection prompts.</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200/80">
          <h3 class="text-xs uppercase font-bold text-gray-400 mb-2">Methodology</h3>
          <p class="text-xl font-bold text-gray-900 mb-1">CBT + Mindfulness</p>
          <p class="text-xs text-gray-500">Targeted cognitive framing techniques validated across clinical trials.</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200/80">
          <h3 class="text-xs uppercase font-bold text-gray-400 mb-2">Outcome Measure</h3>
          <p class="text-xl font-bold text-gray-900 mb-1">Weekly Check-in</p>
          <p class="text-xs text-gray-500">Track symptom reduction and energy levels as you progress through each day.</p>
        </div>
      </div>

      <!-- Curriculum breakdown -->
      <div class="border border-gray-200 rounded-3xl p-6 sm:p-10 bg-[#FAFAFA]">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">What you will learn &amp; build</h2>
        <p class="text-sm text-gray-500 mb-6">Each day provides one high-impact intervention paired with guided practice.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-3">
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">1</span>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Baseline Assessment &amp; Trigger Mapping</h4>
              <p class="text-xs text-gray-500 mt-0.5">Identify specific situational stressors and somatic responses.</p>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-3">
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">2</span>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Cognitive Reframing &amp; Thought Records</h4>
              <p class="text-xs text-gray-500 mt-0.5">Catch automatic negative thoughts before spiral patterns set in.</p>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-3">
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">3</span>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Somatic Grounding &amp; Breathwork</h4>
              <p class="text-xs text-gray-500 mt-0.5">Down-regulate nervous system activation during acute spikes.</p>
            </div>
          </div>

          <div class="bg-white p-4 rounded-xl border border-gray-200 flex items-start gap-3">
            <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">4</span>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Habit Architecture &amp; Long-term Retention</h4>
              <p class="text-xs text-gray-500 mt-0.5">Solidify healthy boundary setting and evening recovery rituals.</p>
            </div>
          </div>
        </div>

        <div class="text-center mt-8">
          <a href="<?php echo esc_url( home_url( '/signup/?program=' . urlencode( $slug ) ) ); ?>"
            class="px-8 py-3 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-all inline-flex items-center gap-2">
            <span>Start <?php echo esc_html( $title ); ?></span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>
      </div>

    </div>
  </section>

</main>

<?php get_footer(); ?>
