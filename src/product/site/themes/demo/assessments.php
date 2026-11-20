<?php
/**
 * Template Name: Assessments
 * Template Post Type: page
 * Description: Clinically validated mental health assessments directory
 */

get_header();

// Load assessments from catalog JSON
$assessments_file = get_template_directory() . '/assets/data/assessments.json';
$assessments = [];
if ( file_exists( $assessments_file ) ) {
  $data = json_decode( file_get_contents( $assessments_file ), true );
  $assessments = $data['rows'] ?? [];
}
?>

<main class="ikan2-theme site-page-below-nav" style="font-family: var(--font-sans);">

  <!-- Hero Section -->
  <section class="py-14 md:py-20 bg-gradient-to-b from-[#F5F8F7] via-[#EBF3EF] to-white border-b border-gray-100">
    <div class="site-container">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
          <i data-lucide="activity" class="w-3.5 h-3.5"></i>
          Standardised Psychological Tools
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
          Understand where you stand.
        </h1>
        <p class="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
          Seven scientifically validated assessments turn how you're feeling into clear, actionable metrics you can track over time — completely confidential and free of judgment.
        </p>

        <div class="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> PHQ-9, GAD-7, &amp; WHO-5 Protocols</div>
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> 100% Private &amp; Anonymised</div>
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> Instant Actionable Insights</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Assessments Grid -->
  <section class="py-12 md:py-16 bg-white">
    <div class="site-container">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Clinical Assessments</h2>
          <p class="text-sm text-gray-500 mt-1">Select an assessment to evaluate your current psychological indicators.</p>
        </div>
        <div class="text-xs text-gray-400 font-medium">
          <?php echo count( $assessments ); ?> validated assessments available
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ( $assessments as $idx => $a ) : 
          $slug = $a['slug'] ?? $a['id'] ?? 'assessment';
          $duration = $a['duration'] ?? 5;
          $category = $a['category'] ?? 'Wellbeing';
          $bg_colors = [ 'bg-blue-50 text-blue-700', 'bg-emerald-50 text-emerald-700', 'bg-purple-50 text-purple-700', 'bg-amber-50 text-amber-700', 'bg-rose-50 text-rose-700' ];
          $badge_color = $bg_colors[ $idx % count( $bg_colors ) ];
        ?>
        <div class="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between group">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider <?php echo esc_attr( $badge_color ); ?>">
                <?php echo esc_html( $category ); ?>
              </span>
              <span class="text-xs text-gray-400 flex items-center gap-1">
                <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                <?php echo esc_html( $duration ); ?> mins
              </span>
            </div>

            <h3 class="font-bold text-gray-900 text-lg mb-2 group-hover:text-black">
              <?php echo esc_html( $a['title'] ); ?>
            </h3>

            <p class="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
              <?php echo esc_html( $a['description'] ?? 'Evidence-based clinical screening to identify patterns and gauge severity over time.' ); ?>
            </p>

            <?php if ( ! empty( $a['section1_eligibility_points'] ) ) : ?>
              <ul class="text-[11px] text-gray-500 space-y-1 mb-4 border-t border-gray-100 pt-3">
                <?php foreach ( array_slice( $a['section1_eligibility_points'], 0, 2 ) as $pt ) : ?>
                  <li class="flex items-start gap-1.5">
                    <span class="text-emerald-500 font-bold">&bull;</span>
                    <span><?php echo esc_html( $pt ); ?></span>
                  </li>
                <?php endforeach; ?>
              </ul>
            <?php endif; ?>
          </div>

          <div class="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <span class="text-xs text-gray-400 font-medium">Free &amp; Confidential</span>
            <a href="<?php echo esc_url( home_url( '/signup/?focus=' . urlencode( $category ) ) ); ?>"
              class="px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-1.5">
              <span>Start Assessment</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
        <?php endforeach; ?>
      </div>

    </div>
  </section>

  <!-- How It Works -->
  <section class="py-14 bg-[#FBFBFA] border-t border-gray-200/80">
    <div class="site-container">
      <div class="text-center max-w-xl mx-auto mb-10">
        <h2 class="text-2xl font-bold text-gray-900">How the Screening Works</h2>
        <p class="text-sm text-gray-500 mt-2">Validated by clinical psychologists to establish your personal baseline.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            1
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Complete Prompts</h3>
          <p class="text-xs text-gray-600 leading-relaxed">Answer standard 5–10 multiple choice questions about your feelings over the last 2 weeks.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            2
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Instant Clinical Score</h3>
          <p class="text-xs text-gray-600 leading-relaxed">Get your severity index categorised (Minimal, Mild, Moderate, Severe) against population norms.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            3
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Tailored Equip Care</h3>
          <p class="text-xs text-gray-600 leading-relaxed">Instantly unlock relevant Equip modules and direct therapist referral if recommended.</p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>
