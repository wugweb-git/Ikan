<?php
/**
 * Template Name: Homepage
 * Template Post Type: page
 * Description: The iKAN Health landing/homepage
 */

get_header(); ?>

<main class="ikan2-theme bg-white pb-24 md:pb-0">

  <?php
  // Get CMS content for the homepage
  $cms_content = get_post_meta( get_the_ID(), 'homepage-hero', true );
  $hero = [];
  if ( $cms_content ) {
    try {
      $hero = json_decode( $cms_content, true );
    } catch ( Throwable $e ) {
      // fall through
    }
  }
  
  $hero_title = ! empty( $hero['title'] ) ? $hero['title'] : 'Evidence-Based Mental Wellness for You & Your Team';
  $hero_subtitle = ! empty( $hero['subtitle'] ) ? $hero['subtitle'] : 'Clinically validated assessments, structured Equip programs, and privacy-first corporate insights.';
  
  $hero_image = get_post_meta( get_the_ID(), 'homepage-hero-image', true );
  $default_banner = 'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBhc3Nlc3NtZW50JTIwcXVlc3Rpb25uYWlyZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzczMzIxNTcyfDA&ixlib=rb-4.1.0&q=80&w=1080';
  $image = $hero_image ? $hero_image : $default_banner;
  ?>

  <!-- Hero Section -->
  <section class="relative w-full overflow-hidden bg-gray-900 text-white pt-24 pb-20 md:pt-32 md:pb-28">
    <div class="absolute inset-0 z-0">
      <img src="<?php echo esc_url( $image ); ?>" alt="Mental Health & Wellness" class="w-full h-full object-cover opacity-40 scale-105" loading="eager" decoding="async" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-gray-900/40"></div>
    </div>

    <div class="relative z-10 max-w-[1000px] mx-auto px-4 text-center">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-blue-300 mb-6">
        <i data-lucide="sparkles" class="w-4 h-4 text-blue-300"></i>
        Clinical Mental Health & Wellbeing Platform
      </div>

      <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
        <?php echo esc_html( $hero_title ); ?>
      </h1>
      
      <p class="text-base md:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
        <?php echo esc_html( $hero_subtitle ); ?>
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2">
          <span>Take Free Assessment</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
        <a href="<?php echo esc_url( home_url( '/org' ) ); ?>" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-base transition-all border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2">
          <i data-lucide="building" class="w-4 h-4"></i>
          <span>For Organisations</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Quick Feature Badges -->
  <section class="py-6 border-b border-gray-100 bg-gray-50/50">
    <div class="max-w-[1200px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div class="p-3">
        <p class="text-xl md:text-2xl font-bold text-gray-900">100%</p>
        <p class="text-xs text-gray-500 mt-0.5">Confidential & Private</p>
      </div>
      <div class="p-3">
        <p class="text-xl md:text-2xl font-bold text-gray-900">PHQ-9 & GAD-7</p>
        <p class="text-xs text-gray-500 mt-0.5">Clinical Standard Tests</p>
      </div>
      <div class="p-3">
        <p class="text-xl md:text-2xl font-bold text-gray-900">4-8 Wks</p>
        <p class="text-xs text-gray-500 mt-0.5">Equip Resilience Cohorts</p>
      </div>
      <div class="p-3">
        <p class="text-xl md:text-2xl font-bold text-gray-900">k &ge; 5</p>
        <p class="text-xs text-gray-500 mt-0.5">Enterprise Anonymity</p>
      </div>
    </div>
  </section>

  <!-- Featured Workplace & Enterprise Section: Mapped with /org and /burnout-cost-calculator -->
  <section class="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
    <div class="max-w-[1200px] mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600">Workplace Mental Health</span>
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-2 mb-4">
          Support Your Teams. Quantify ROI.
        </h2>
        <p class="text-gray-600 text-sm md:text-base leading-relaxed">
          Employee burnout and stress are leading causes of quiet quitting, absenteeism, and unexpected turnover. iKAN gives leadership aggregate insights without infringing on personal trust.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Card 1: Org Portal -->
        <div class="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div>
            <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <i data-lucide="building" class="w-7 h-7"></i>
            </div>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 mb-3">
              Organization Dashboard
            </span>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              Aggregate Insights for HR & Leadership
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed mb-6">
              Track department-level wellbeing indices, monitor burnout risk curves across quarters, and deploy structured mental health cohorts — with ironclad k-anonymity (k &ge; 5) so no individual score is ever revealed.
            </p>
            <ul class="space-y-2.5 text-xs text-gray-600 mb-8">
              <li class="flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span>Strict k &ge; 5 suppression protects team privacy</span>
              </li>
              <li class="flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span>Department-wide wellbeing trends and adoption</span>
              </li>
              <li class="flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span>HIPAA & DPDP Act compliant corporate architecture</span>
              </li>
            </ul>
          </div>
          <div>
            <a href="<?php echo esc_url( home_url( '/org' ) ); ?>" class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-colors">
              <span>Explore Organization Portal</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
          </div>
        </div>

        <!-- Card 2: Burnout Cost Calculator -->
        <div class="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
          <div>
            <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <i data-lucide="calculator" class="w-7 h-7"></i>
            </div>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 mb-3">
              Interactive Financial Tool
            </span>
            <h3 class="text-2xl font-bold text-gray-900 mb-3">
              Burnout Cost Calculator
            </h3>
            <p class="text-sm text-gray-600 leading-relaxed mb-6">
              Calculate the true financial toll of unaddressed workplace stress. Estimate productivity loss, unplanned sick leaves, and replacement hiring costs based on your team size and average salary.
            </p>
            <ul class="space-y-2.5 text-xs text-gray-600 mb-8">
              <li class="flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span>Calculate annual cost of absenteeism and presenteeism</span>
              </li>
              <li class="flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span>Simulate estimated ROI of mental wellness prevention</span>
              </li>
              <li class="flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span>Instant financial forecast customized to your team size</span>
              </li>
            </ul>
          </div>
          <div>
            <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors">
              <span>Calculate Your Burnout Cost</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Individual Mental Health Pathways -->
  <section class="py-16 md:py-24 bg-white">
    <div class="max-w-[1200px] mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600">Personal Care Pathways</span>
        <h2 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-2 mb-4">
          Evidence-Based Mental Wellness
        </h2>
        <p class="text-gray-600 text-sm md:text-base">
          From self-assessments to structured programs and licensed clinical support, choose the pathway that fits where you are today.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Pathway 1: Assessments -->
        <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
              <i data-lucide="bar-chart-2" class="w-6 h-6"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">Clinical Assessments</h4>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              Take standardized tests used by doctors worldwide (PHQ-9 for Depression, GAD-7 for Anxiety, GHQ-12 for General Health) in under 4 minutes.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
            Browse assessments &rarr;
          </a>
        </div>

        <!-- Pathway 2: Equip Programs -->
        <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6">
              <i data-lucide="sparkles" class="w-6 h-6"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">Equip Programs</h4>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              Structured multi-week programs created by clinical psychologists to build resilience, overcome burnout, and improve emotional fitness.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
            Explore Equip &rarr;
          </a>
        </div>

        <!-- Pathway 3: Resources & Insights -->
        <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <i data-lucide="book-open" class="w-6 h-6"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">Resources & Blog</h4>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              Explore our library of videos, guided breathing exercises, and clinical guides curated to help you de-escalate anxiety and manage stress.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
            Read articles &rarr;
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Consultation Banner -->
  <section class="py-16 bg-gray-900 text-white">
    <div class="max-w-[1200px] mx-auto px-4 text-center">
      <h3 class="text-2xl md:text-3xl font-bold mb-4">
        Ready to Speak with a Licensed Psychologist?
      </h3>
      <p class="text-gray-300 max-w-xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
        Confidential, 1-on-1 virtual consultations with experienced mental health professionals matched to your needs.
      </p>
      <a href="<?php echo esc_url( home_url( '/consultation' ) ); ?>" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all">
        <span>Book a Confidential Consultation</span>
        <i data-lucide="arrow-right" class="w-4 h-4"></i>
      </a>
    </div>
  </section>

</main>

<?php get_footer(); ?>
