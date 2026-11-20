<?php
/**
 * Template Name: Homepage
 * Template Post Type: page
 * Description: The authentic iKAN Health landing page matching Homepage.tsx
 */

get_header(); ?>

<main class="w-full flex-1" style="background-color: var(--canvas); font-family: var(--font-sans);">

  <!-- 1. Hero Section -->
  <section class="w-full pt-28 lg:pt-36 pb-12 overflow-hidden" aria-label="Hero">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-semibold tracking-tight text-gray-900 mb-6 leading-[1.15]" style="font-family: var(--font-display); letter-spacing: -0.02em;">
        Reimagining mental health care.
      </h1>
      
      <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
        Stay on top of your mental health with real time monitoring and insights, expert therapists, science backed tools and programs.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4">
        <a 
          href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" 
          class="px-8 py-3.5 rounded-full font-semibold text-sm text-white shadow-md hover:opacity-95 transition-all transform hover:-translate-y-0.5"
          style="background-color: var(--foreground);"
        >
          Get Started
        </a>
        <a 
          href="<?php echo esc_url( home_url( '/services' ) ); ?>" 
          class="px-6 py-3.5 rounded-full font-semibold text-sm text-gray-700 bg-white/80 hover:bg-white border border-gray-200 transition-all"
        >
          Explore Services
        </a>
      </div>
    </div>

    <!-- Auto-scrolling Hero Cards Marquee -->
    <div class="w-full mt-14 overflow-hidden relative">
      <div class="hero-marquee flex items-center gap-5 w-max animate-marquee py-2">
        
        <!-- Card 1: Acceptance -->
        <div class="w-64 sm:w-72 h-80 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-sm text-white relative overflow-hidden" style="background-color: var(--brand-teal);">
          <span class="text-xs uppercase tracking-wider font-semibold opacity-80">Value</span>
          <p class="text-3xl font-bold tracking-tight" style="font-family: var(--font-display);">Acceptance</p>
          <p class="text-xs opacity-90 leading-relaxed">A compassionate, non-judgmental space to understand yourself without stigma.</p>
        </div>

        <!-- Card 2: 2500+ Stat -->
        <div class="w-64 sm:w-72 h-80 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-sm bg-white border border-gray-100 text-gray-900 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Community</span>
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div>
            <p class="text-4xl font-extrabold tracking-tight mb-2" style="font-family: var(--font-display);">2500+</p>
            <p class="text-xs text-gray-600 leading-relaxed">People who have gained more wellbeing and emotional clarity through our platform.</p>
          </div>
          <div class="flex items-center -space-x-2 pt-2">
            <img class="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" alt="Member" loading="lazy">
            <img class="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Member" loading="lazy">
            <img class="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" alt="Member" loading="lazy">
            <div class="w-8 h-8 rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold flex items-center justify-center text-gray-600">+2.5k</div>
          </div>
        </div>

        <!-- Card 3: Understanding -->
        <div class="w-64 sm:w-72 h-80 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-sm text-white relative overflow-hidden" style="background-color: var(--brand-amber);">
          <span class="text-xs uppercase tracking-wider font-semibold opacity-80">Insight</span>
          <p class="text-3xl font-bold tracking-tight" style="font-family: var(--font-display);">Understanding</p>
          <p class="text-xs opacity-90 leading-relaxed">Validating where you are with clinically sound tools, not guesswork or quick fixes.</p>
        </div>

        <!-- Card 4: 95% Stat -->
        <div class="w-64 sm:w-72 h-80 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-sm bg-white border border-gray-100 text-gray-900 relative overflow-hidden">
          <span class="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full self-start">Impact</span>
          <div>
            <p class="text-4xl font-extrabold tracking-tight mb-2 text-gray-900" style="font-family: var(--font-display);">95%</p>
            <p class="text-xs text-gray-600 leading-relaxed">Report meaningful improvement in mood and stress management after 4 weeks of structured care.</p>
          </div>
          <div class="flex items-center gap-1 text-amber-500">
            <span>★★★★★</span>
            <span class="text-xs text-gray-500 ml-1">4.9/5 satisfaction</span>
          </div>
        </div>

        <!-- Card 5: Compassion -->
        <div class="w-64 sm:w-72 h-80 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-sm text-white relative overflow-hidden" style="background-color: var(--brand-coral);">
          <span class="text-xs uppercase tracking-wider font-semibold opacity-80">Care</span>
          <p class="text-3xl font-bold tracking-tight" style="font-family: var(--font-display);">Compassion</p>
          <p class="text-xs opacity-90 leading-relaxed">Kindness and clinical empathy guiding every assessment, exercise, and interaction.</p>
        </div>

        <!-- Card 6: 50+ Experts -->
        <div class="w-64 sm:w-72 h-80 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-sm bg-white border border-gray-100 text-gray-900 relative overflow-hidden">
          <span class="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full self-start">Network</span>
          <div>
            <p class="text-4xl font-extrabold tracking-tight mb-2" style="font-family: var(--font-display);">50+</p>
            <p class="text-xs text-gray-600 leading-relaxed">Certified therapists, clinical psychologists, and wellness advisors ready to support your journey.</p>
          </div>
          <p class="text-[11px] text-gray-400 font-medium">Licensed & Verified Professionals</p>
        </div>

        <!-- Duplicate set for seamless loop -->
        <div class="w-64 sm:w-72 h-80 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-sm text-white relative overflow-hidden" style="background-color: var(--brand-teal);">
          <span class="text-xs uppercase tracking-wider font-semibold opacity-80">Value</span>
          <p class="text-3xl font-bold tracking-tight" style="font-family: var(--font-display);">Acceptance</p>
          <p class="text-xs opacity-90 leading-relaxed">A compassionate, non-judgmental space to understand yourself without stigma.</p>
        </div>
        <div class="w-64 sm:w-72 h-80 rounded-3xl p-6 flex flex-col justify-between shrink-0 shadow-sm bg-white border border-gray-100 text-gray-900 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Community</span>
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div>
            <p class="text-4xl font-extrabold tracking-tight mb-2" style="font-family: var(--font-display);">2500+</p>
            <p class="text-xs text-gray-600 leading-relaxed">People who have gained more wellbeing and emotional clarity through our platform.</p>
          </div>
          <div class="flex items-center -space-x-2 pt-2">
            <img class="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" alt="Member" loading="lazy">
            <img class="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Member" loading="lazy">
            <img class="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" alt="Member" loading="lazy">
            <div class="w-8 h-8 rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold flex items-center justify-center text-gray-600">+2.5k</div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- 2. Assessment Section (Phone Mockup + Highlights) -->
  <section id="assessment" class="w-full py-20 bg-white" aria-label="Assessments">
    <div class="max-w-6xl mx-auto px-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <!-- Left: Copy & 3 Quick Assessment Cards (7 cols) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Clinically Validated Screenings
          </div>

          <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 leading-snug" style="font-family: var(--font-display);">
            How are you <span style="color: var(--brand-teal); font-style: italic;">really</span> feeling today?
          </h2>

          <p class="text-base text-gray-600 leading-relaxed">
            Our <span style="color: var(--brand-amber); font-style: italic;">assessments</span> help you understand your emotional well-being — privately, at your own pace, with gold-standard psychometric tools.
          </p>

          <div class="space-y-3 pt-2">
            <!-- Assessment 1: GAD-7 -->
            <a href="<?php echo esc_url( home_url( '/assessment-detail?slug=gad-7' ) ); ?>" class="p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 bg-gray-50/60 hover:bg-emerald-50/30 flex items-center justify-between transition-all group">
              <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                  G7
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Generalized Anxiety Disorder (GAD-7)</h3>
                  <p class="text-xs text-gray-500">7 questions • 3 min • High clinical reliability</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-emerald-700 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <!-- Assessment 2: PHQ-9 -->
            <a href="<?php echo esc_url( home_url( '/assessment-detail?slug=phq-9' ) ); ?>" class="p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 bg-gray-50/60 hover:bg-emerald-50/30 flex items-center justify-between transition-all group">
              <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                  P9
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Depression Screening (PHQ-9)</h3>
                  <p class="text-xs text-gray-500">9 questions • 4 min • Diagnostic benchmark</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-emerald-700 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <!-- Assessment 3: Burnout BAT -->
            <a href="<?php echo esc_url( home_url( '/assessment-detail?slug=burnout' ) ); ?>" class="p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 bg-gray-50/60 hover:bg-emerald-50/30 flex items-center justify-between transition-all group">
              <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
                  BT
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-900 group-hover:text-emerald-800 transition-colors">Workplace Burnout Assessment (BAT)</h3>
                  <p class="text-xs text-gray-500">12 questions • 5 min • Exhaustion & cynicism</p>
                </div>
              </div>
              <svg class="w-5 h-5 text-gray-400 group-hover:text-emerald-700 transform group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>

          <div class="pt-2">
            <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="text-sm font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5">
              <span>View all 8 clinical assessments</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </a>
          </div>
        </div>

        <!-- Right: Real Phone Mockup Graphic (5 cols) -->
        <div class="lg:col-span-5 flex justify-center">
          <div class="relative max-w-sm w-full">
            <div class="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-teal-100/40 via-amber-50/30 to-rose-100/30 blur-xl"></div>
            <img 
              src="<?php echo esc_url( get_theme_file_uri( 'assets/img/25d8d01a36eaa618a0c4fdd22ae73fb856925905.png' ) ); ?>" 
              alt="iKAN Assessment Mobile UI" 
              class="relative z-10 w-full h-auto drop-shadow-2xl rounded-2xl object-contain mx-auto"
              loading="lazy"
            />
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- 3. Mission Section (Client Logos Ribbon) -->
  <section class="w-full py-16 border-t border-b border-gray-100" style="background-color: var(--canvas);" aria-label="Trusted Organizations">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <p class="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-8" style="font-family: var(--font-display);">
        Trusted by leading teams & forward-thinking organizations
      </p>

      <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
        <?php
        $logos = [
          '1fa377842c0edee2e6d99526877c4abfe5cffba4.png',
          'bed3a7c577bcfb0b6fc0334b0f93d8eddb9275f8.png',
          'e12e76c2f5940d65dbebba2615815d6b5552f1cc.png',
          'd246862ee8771400424ba422593c855cabc9ba4a.png',
          '4d70d16cfc423d83c6ca9941c4d3da923cf039ac.png',
          '17b5fecba5e52eb9055025402d9b0c25a870d0d2.png',
          '7a674497643e29f384a4eaeb5616eeb32e4aa50b.png',
          'ac0292f75b641a157de9af130cc05ecea5dd193f.png',
        ];
        foreach ( $logos as $idx => $logo_file ) :
        ?>
          <img 
            src="<?php echo esc_url( get_theme_file_uri( "assets/img/{$logo_file}" ) ); ?>" 
            alt="Client Partner <?php echo $idx + 1; ?>" 
            class="h-7 sm:h-8 w-auto object-contain"
            loading="lazy"
          />
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- 4. How It Works Section (01, 02, 03) -->
  <section class="w-full py-20 bg-white" aria-label="How It Works">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-xs uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">Methodology</span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-3 mb-4" style="font-family: var(--font-display);">
          How iKAN supports your wellness
        </h2>
        <p class="text-gray-600 text-sm sm:text-base">
          A seamless, continuous loop of self-understanding, guided exercises, and measurement.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Step 1 -->
        <div class="bg-gray-50/80 rounded-3xl p-8 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span class="text-3xl font-extrabold text-emerald-700/40 block mb-4" style="font-family: var(--font-display);">01</span>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Take an Assessment</h3>
            <p class="text-xs font-semibold text-emerald-800 mb-3">Understand where you are.</p>
            <p class="text-sm text-gray-600 leading-relaxed">
              Answer a few simple, clinically backed questions. Privately map your current anxiety, burnout risk, or mood patterns in minutes.
            </p>
          </div>
          <div class="mt-8 pt-4 border-t border-gray-200/60 flex items-center justify-between">
            <span class="text-xs text-gray-500 font-medium">Step 1 of 3</span>
            <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="text-xs font-bold text-gray-900 hover:text-emerald-700">Explore &rarr;</a>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="bg-gray-50/80 rounded-3xl p-8 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span class="text-3xl font-extrabold text-amber-700/40 block mb-4" style="font-family: var(--font-display);">02</span>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Choose Your Path</h3>
            <p class="text-xs font-semibold text-amber-800 mb-3">Science-backed tools & care.</p>
            <p class="text-sm text-gray-600 leading-relaxed">
              Engage with self-guided Equip programs, build daily mindfulness routines, or connect with a licensed mental health professional.
            </p>
          </div>
          <div class="mt-8 pt-4 border-t border-gray-200/60 flex items-center justify-between">
            <span class="text-xs text-gray-500 font-medium">Step 2 of 3</span>
            <a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="text-xs font-bold text-gray-900 hover:text-amber-700">Programs &rarr;</a>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="bg-gray-50/80 rounded-3xl p-8 border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <span class="text-3xl font-extrabold text-rose-700/40 block mb-4" style="font-family: var(--font-display);">03</span>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Track & Flourish</h3>
            <p class="text-xs font-semibold text-rose-800 mb-3">Measure what matters.</p>
            <p class="text-sm text-gray-600 leading-relaxed">
              Monitor your progress over time with measurement-based care. See tangible improvements in resilience, focus, and sleep.
            </p>
          </div>
          <div class="mt-8 pt-4 border-t border-gray-200/60 flex items-center justify-between">
            <span class="text-xs text-gray-500 font-medium">Step 3 of 3</span>
            <a href="<?php echo esc_url( home_url( '/services' ) ); ?>" class="text-xs font-bold text-gray-900 hover:text-rose-700">Insights &rarr;</a>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- 5. Services Section (Complete Ecosystem) -->
  <section id="programs" class="w-full py-20" style="background-color: var(--canvas);" aria-label="Services Ecosystem">
    <div class="max-w-6xl mx-auto px-6">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="text-xs uppercase tracking-wider font-semibold text-gray-500">The Platform</span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 mt-2 mb-4" style="font-family: var(--font-display);">
          A complete ecosystem for your mental wellbeing
        </h2>
        <p class="text-gray-600 text-sm sm:text-base">
          Everything you need for emotional fitness, from clinical triage to daily habits.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Service 1: Assessments -->
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Assessments</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Standardized mental health tools validated worldwide, providing immediate score interpretation.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="mt-6 text-xs font-semibold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1">
            <span>Take a test</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>

        <!-- Service 2: Equip Programs -->
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-5">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Equip Programs</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Multi-day structured CBT & mindfulness programs: Productivity Reset, Anxiety Calm, Sleep Tight.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="mt-6 text-xs font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1">
            <span>Explore programs</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>

        <!-- Service 3: Consultations -->
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Consultations</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              1-on-1 confidential video and call sessions with licensed psychologists and wellness counselors.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/consultation' ) ); ?>" class="mt-6 text-xs font-semibold text-purple-800 hover:text-purple-950 inline-flex items-center gap-1">
            <span>Book a session</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>

        <!-- Service 4: Resources & Blog -->
        <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:-translate-y-1 transition-all">
          <div>
            <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-5">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"></path></svg>
            </div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Media & Guides</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              26+ clinical writeups, guided breathing audio recordings, and expert video breakdowns.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="mt-6 text-xs font-semibold text-rose-800 hover:text-rose-950 inline-flex items-center gap-1">
            <span>Read & listen</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </a>
        </div>

      </div>
    </div>
  </section>

  <!-- 6. Testimonials & Stat Callouts -->
  <section class="w-full py-20 bg-white" aria-label="Social Proof">
    <div class="max-w-6xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pb-16 border-b border-gray-100">
        <div>
          <p class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2" style="font-family: var(--font-display);">50,000+</p>
          <p class="text-sm text-gray-500 font-medium">Assessments completed</p>
        </div>
        <div>
          <p class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2" style="font-family: var(--font-display);">2M+</p>
          <p class="text-sm text-gray-500 font-medium">iKAN members touched</p>
        </div>
        <div>
          <p class="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2" style="font-family: var(--font-display);">500+</p>
          <p class="text-sm text-gray-500 font-medium">Daily wellness sessions</p>
        </div>
      </div>

      <!-- Member Reviews Cards -->
      <div class="pt-16">
        <div class="text-center max-w-xl mx-auto mb-12">
          <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 mb-2" style="font-family: var(--font-display);">
            What our members say
          </h2>
          <p class="text-sm text-gray-500">Real stories from people who took charge of their mental wellbeing.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div class="p-6 rounded-3xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center text-amber-400 mb-3 text-sm">★★★★★</div>
              <p class="text-sm text-gray-700 leading-relaxed italic mb-6">
                "iKAN helped me understand my emotions better. I used to bottle everything up, but now I have tools to process what I feel. The assessments gave me clarity I never expected."
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style="background-color: var(--brand-teal);">P</div>
              <div>
                <p class="text-xs font-bold text-gray-900">Priya M.</p>
                <p class="text-[11px] text-gray-400">Software Engineer, Bengaluru</p>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-3xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center text-amber-400 mb-3 text-sm">★★★★★</div>
              <p class="text-sm text-gray-700 leading-relaxed italic mb-6">
                "I was hesitant at first, but the guided programs made it so easy to start. The Equip programs fit right into my commute, and I genuinely look forward to each day."
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style="background-color: var(--brand-amber);">A</div>
              <div>
                <p class="text-xs font-bold text-gray-900">Arjun K.</p>
                <p class="text-[11px] text-gray-400">Product Manager, Mumbai</p>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-3xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center text-amber-400 mb-3 text-sm">★★★★★</div>
              <p class="text-sm text-gray-700 leading-relaxed italic mb-6">
                "Finding affordable, stigma-free mental health support felt impossible until I found iKAN. The resources are thoughtful and the consultations are judgment-free."
              </p>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style="background-color: var(--brand-coral);">S</div>
              <div>
                <p class="text-xs font-bold text-gray-900">Sneha R.</p>
                <p class="text-[11px] text-gray-400">Consultant, Gurugram</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>

  <!-- 7. FAQ Section (Accordion) -->
  <section id="contact" class="w-full py-20" style="background-color: var(--canvas);" aria-label="FAQ">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-12">
        <span class="text-xs uppercase tracking-wider font-semibold text-gray-500">Answers</span>
        <h2 class="text-3xl font-semibold tracking-tight text-gray-900 mt-2 mb-3" style="font-family: var(--font-display);">
          Frequently Asked Questions
        </h2>
        <p class="text-sm text-gray-600">Everything you need to know about iKAN's services and clinical methodology.</p>
      </div>

      <div class="space-y-4">
        
        <details class="group bg-white p-6 rounded-2xl border border-gray-100 shadow-xs cursor-pointer">
          <summary class="flex items-center justify-between text-base font-semibold text-gray-900 list-none">
            <span>What is iKAN and how does it support mental health?</span>
            <span class="text-gray-400 group-open:rotate-180 transition-transform">&darr;</span>
          </summary>
          <p class="text-sm text-gray-600 mt-4 leading-relaxed">
            iKAN is an evidence-based mental wellness platform that combines clinically validated assessments, structured self-paced CBT programs (Equip), licensed therapist consultations, and workplace health metrics into one accessible, privacy-first service.
          </p>
        </details>

        <details class="group bg-white p-6 rounded-2xl border border-gray-100 shadow-xs cursor-pointer">
          <summary class="flex items-center justify-between text-base font-semibold text-gray-900 list-none">
            <span>Are my assessment responses and notes kept private?</span>
            <span class="text-gray-400 group-open:rotate-180 transition-transform">&darr;</span>
          </summary>
          <p class="text-sm text-gray-600 mt-4 leading-relaxed">
            Yes. Absolutely. We maintain strict end-to-end data segregation. Your clinical answers and private notes are never shared with your employer or any third party. Workplace aggregate reports require a minimum cohort of 10 people to prevent any re-identification.
          </p>
        </details>

        <details class="group bg-white p-6 rounded-2xl border border-gray-100 shadow-xs cursor-pointer">
          <summary class="flex items-center justify-between text-base font-semibold text-gray-900 list-none">
            <span>How do Equip programs work?</span>
            <span class="text-gray-400 group-open:rotate-180 transition-transform">&darr;</span>
          </summary>
          <p class="text-sm text-gray-600 mt-4 leading-relaxed">
            Equip programs are self-paced, 10 to 14-day progressive modules designed around Cognitive Behavioral Therapy (CBT) and mindfulness principles. Each day includes a 5-minute reflection or audio exercise to help build sustainable mental habits.
          </p>
        </details>

        <details class="group bg-white p-6 rounded-2xl border border-gray-100 shadow-xs cursor-pointer">
          <summary class="flex items-center justify-between text-base font-semibold text-gray-900 list-none">
            <span>How do organizations implement iKAN?</span>
            <span class="text-gray-400 group-open:rotate-180 transition-transform">&darr;</span>
          </summary>
          <p class="text-sm text-gray-600 mt-4 leading-relaxed">
            Organizations can sign up via our Organisation Portal, calculate their baseline burnout risk with our Burnout Cost Calculator, and roll out an anonymous wellness pilot to their teams in less than 48 hours.
          </p>
        </details>

      </div>

      <div class="text-center mt-10">
        <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="text-sm font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5">
          <span>Have more questions? Read our full FAQ</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </a>
      </div>
    </div>
  </section>

  <!-- 8. Newsletter Block (FluentCRM Integrated) -->
  <section class="w-full py-20 bg-white" aria-label="Newsletter">
    <div class="max-w-4xl mx-auto px-6">
      <div class="rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm" style="background-color: var(--card);">
        
        <div class="max-w-2xl mx-auto text-center space-y-4">
          <span class="text-xs uppercase tracking-wider font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full">Weekly Grounding</span>
          
          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900" style="font-family: var(--font-display);">
            Stay grounded. Mental wellness in your inbox.
          </h2>
          
          <p class="text-sm text-gray-600 leading-relaxed">
            Join over 2,500 readers receiving clinically backed micro-practices, stress-reduction exercises, and honest insights every Sunday morning. No spam. Unsubscribe anytime.
          </p>

          <!-- Newsletter Form with AJAX to FluentCRM -->
          <form id="home-newsletter-form" class="pt-4 max-w-md mx-auto">
            <div class="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                id="home-news-email" 
                name="email" 
                placeholder="Enter your email address" 
                required 
                class="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
              <button 
                type="submit" 
                id="home-news-submit" 
                class="px-6 py-3 rounded-full font-semibold text-sm text-white shadow-xs hover:opacity-95 transition-all shrink-0 flex items-center justify-center gap-2"
                style="background-color: var(--foreground);"
              >
                <span>Subscribe</span>
                <span id="home-news-spinner" class="hidden">
                  <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </span>
              </button>
            </div>

            <p class="text-[11px] text-gray-400 mt-2">
              By subscribing, you agree to our <a href="<?php echo esc_url( home_url( '/privacy-policy' ) ); ?>" class="underline">Privacy Policy</a>. Data stored strictly in WordPress FluentCRM.
            </p>

            <!-- Success Card -->
            <div id="home-news-success" class="hidden mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium">
              🎉 Welcome! You've been subscribed to iKAN Weekly Grounding. Check your inbox shortly.
            </div>

            <!-- Failure Banner -->
            <div id="home-news-failure" class="hidden mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm font-medium">
              ⚠️ Something went wrong. Please check your email address and try again.
            </div>
          </form>

        </div>

      </div>
    </div>
  </section>

</main>

<style>
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    display: flex;
    width: max-content;
    animation: marquee 35s linear infinite;
  }
  .animate-marquee:hover {
    animation-play-state: paused;
  }
</style>

<script>
  (function() {
    const form = document.getElementById('home-newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const emailInput = document.getElementById('home-news-email');
      const submitBtn = document.getElementById('home-news-submit');
      const spinner = document.getElementById('home-news-spinner');
      const successCard = document.getElementById('home-news-success');
      const failBanner = document.getElementById('home-news-failure');

      const email = emailInput.value.trim();
      if (!email || !email.includes('@')) {
        failBanner.textContent = 'Please enter a valid email address.';
        failBanner.classList.remove('hidden');
        return;
      }

      failBanner.classList.add('hidden');
      successCard.classList.add('hidden');
      submitBtn.disabled = true;
      spinner.classList.remove('hidden');

      const formData = new FormData();
      formData.append('action', 'ikan_newsletter_submit');
      formData.append('email', email);
      if (window.ikanAjax && window.ikanAjax.nonce) {
        formData.append('nonce', window.ikanAjax.nonce);
      }

      const ajaxUrl = (window.ikanAjax && window.ikanAjax.ajax_url) ? window.ikanAjax.ajax_url : '/wp-admin/admin-ajax.php';

      fetch(ajaxUrl, {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
        if (data.success) {
          successCard.classList.remove('hidden');
          form.reset();
        } else {
          failBanner.textContent = data.data && data.data.message ? data.data.message : 'Subscription failed. Please try again.';
          failBanner.classList.remove('hidden');
        }
      })
      .catch(err => {
        submitBtn.disabled = false;
        spinner.classList.add('hidden');
        failBanner.textContent = 'Network error. Please try again later.';
        failBanner.classList.remove('hidden');
      });
    });
  })();
</script>

<?php get_footer(); ?>
