<?php
/**
 * Template Name: Equip Programs
 * Template Post Type: page
 * Description: Structured daily mental health habit and resilience programs
 */

get_header();

// Load equip programs from catalog JSON
$equip_file = get_template_directory() . '/assets/data/equip-programs.json';
$programs = [];
if ( file_exists( $equip_file ) ) {
  $data = json_decode( file_get_contents( $equip_file ), true );
  $programs = $data['rows'] ?? [];
}
?>

<main class="ikan2-theme site-page-below-nav" style="font-family: var(--font-sans);">

  <!-- Hero Section -->
  <section class="py-14 md:py-20 bg-gradient-to-b from-[#F2F7F4] via-[#E5EFE9] to-white border-b border-gray-100">
    <div class="site-container">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
          <i data-lucide="layers" class="w-3.5 h-3.5"></i>
          Structured Behavioural Interventions
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
          A program built for your real life.
        </h1>
        <p class="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
          Equip pairs your assessment results with bite-sized, 5-minute daily micro-habits and cognitive behavioural tools. Designed by clinical psychologists to build long-term psychological fitness.
        </p>

        <div class="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> 14-Day Micro-Cadence</div>
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> CBT &amp; Mindfulness Grounding</div>
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> Real Progress Milestones</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Programs Grid -->
  <section class="py-12 md:py-16 bg-white">
    <div class="site-container">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Featured Equip Curriculums</h2>
          <p class="text-sm text-gray-500 mt-1">Start a track aligned with your current wellbeing focus.</p>
        </div>
        <div class="text-xs text-gray-400 font-medium">
          <?php echo count( $programs ); ?> curated tracks
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <?php foreach ( $programs as $idx => $p ) : 
          $slug = $p['slug'] ?? $p['id'] ?? 'program';
          $duration = $p['duration'] ?? '14 Days';
          $category = $p['category'] ?? 'Wellbeing';
        ?>
        <div class="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-4">
              <span class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100">
                <?php echo esc_html( $category ); ?>
              </span>
              <span class="text-xs text-gray-500 font-medium flex items-center gap-1">
                <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                <?php echo esc_html( $duration ); ?>
              </span>
            </div>

            <h3 class="font-extrabold text-gray-900 text-2xl mb-3">
              <?php echo esc_html( $p['title'] ); ?>
            </h3>

            <p class="text-sm text-gray-600 leading-relaxed mb-6">
              <?php echo esc_html( $p['description'] ?? 'Targeted, daily cognitive strategies and habit-building exercises created by psychologists.' ); ?>
            </p>

            <!-- Highlights / Bullets -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl mb-6 text-xs text-gray-700">
              <div class="flex items-center gap-2">
                <i data-lucide="zap" class="w-4 h-4 text-amber-500 shrink-0"></i>
                <span>5–10 mins daily investment</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="brain" class="w-4 h-4 text-purple-500 shrink-0"></i>
                <span>CBT &amp; ACT Evidence Base</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="smartphone" class="w-4 h-4 text-blue-500 shrink-0"></i>
                <span>Audio &amp; Guided Exercises</span>
              </div>
              <div class="flex items-center gap-2">
                <i data-lucide="trending-up" class="w-4 h-4 text-emerald-500 shrink-0"></i>
                <span>Weekly Symptom Re-Check</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            <div>
              <span class="text-xs text-emerald-700 font-semibold block">Included with iKAN</span>
              <span class="text-[11px] text-gray-400">Self-paced with daily guidance</span>
            </div>
            <a href="<?php echo esc_url( home_url( '/signup/?program=' . urlencode( $slug ) ) ); ?>"
              class="px-6 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-1.5">
              <span>Start Program</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
        <?php endforeach; ?>
      </div>

    </div>
  </section>

  <!-- Habit Science Section -->
  <section class="py-14 bg-[#FBFBFA] border-t border-gray-200/80">
    <div class="site-container">
      <div class="text-center max-w-xl mx-auto mb-10">
        <h2 class="text-2xl font-bold text-gray-900">Why Equip Works</h2>
        <p class="text-sm text-gray-500 mt-2">Built on progressive desensitisation and small habitual reinforcement.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            <i data-lucide="target" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Micro-Dosed Cadence</h3>
          <p class="text-xs text-gray-600 leading-relaxed">No overwhelming 60-minute modules. Just 5 minutes of focused action when you wake up or unwind.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            <i data-lucide="repeat" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Habit Stacking</h3>
          <p class="text-xs text-gray-600 leading-relaxed">Anchor evidence-based mental coping strategies onto routines you already perform daily.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            <i data-lucide="activity" class="w-6 h-6"></i>
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Measurable Relief</h3>
          <p class="text-xs text-gray-600 leading-relaxed">Integrated self-evaluations track changes in sleep efficiency, mood, and stress load over the 14 days.</p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>
