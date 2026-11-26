<?php
/**
 * Template Name: Therapist & Professional Network
 * Template Post Type: page
 * Description: Dedicated Landing Page for Mental Health Professionals & Therapists — 90/10 Split, Clinical Autonomy, Smart Matching
 */

$assets = ikan_get_vite_assets();
$vite_js = $assets['js'] ?? '/assets/index-BN9O1lzE.js';
$vite_css = $assets['css'] ?? '/assets/index-_0EzZI--.css';

get_header(); ?>

<main id="main-content" tabindex="-1" class="flex-1 w-full relative outline-none p-0" role="main" aria-label="Therapist and Professional Partnership">
  <div class="ikan2-theme ikan2-type accent-calm site-page-below-nav partner-landing" style="font-family: var(--font-sans); background: #FAF9F6; color: #151515;">

    <!-- ── 1. Hero Section ── -->
    <section class="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-gray-200/70" style="background: radial-gradient(100% 85% at 50% 0%, #F5F1EA 0%, #FAF9F6 100%);">
      <!-- Ambient Decorative Circles -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl pointer-events-none" aria-hidden="true"></div>
      <div class="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" aria-hidden="true"></div>

      <div class="site-container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <!-- Left Column: Value Proposition -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-900 text-xs font-semibold tracking-wide shadow-2xs">
              <i data-lucide="shield-check" class="w-4 h-4 text-teal-700 shrink-0"></i>
              <span>Therapist &amp; Psychologist Network · India</span>
            </div>

            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-gray-900 tracking-tight leading-[1.12]" style="font-family: var(--font-display);">
              Your Practice. Your Autonomy.<br class="hidden sm:inline">
              <span class="text-teal-800 italic font-serif">Client Connections Done Right.</span>
            </h1>

            <p class="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl font-normal">
              Connect with pre-screened clients tailored to your therapeutic modalities, languages, fee preferences, and schedule. With <strong class="text-gray-900 font-semibold">zero clinical interference</strong>, <strong class="text-gray-900 font-semibold">zero session recording</strong>, and a transparent <strong class="text-teal-900 font-semibold">90/10 payout structure</strong>.
            </p>

            <!-- Dual CTAs -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a href="<?php echo esc_url( home_url( '/partner/join/' ) ); ?>" class="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gray-900 text-white font-semibold text-base shadow-md hover:bg-gray-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                <span>Apply to Join Network</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>

              <a href="<?php echo esc_url( home_url( '/partner/account/' ) ); ?>" class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border border-gray-300 text-gray-800 font-semibold text-base shadow-2xs hover:bg-gray-50 hover:border-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-600">
                <i data-lucide="user-check" class="w-4 h-4 text-teal-700"></i>
                <span>Partner Account Sign In</span>
              </a>
            </div>

            <p class="text-xs text-gray-500 flex items-center gap-2 pt-1">
              <i data-lucide="check" class="w-3.5 h-3.5 text-teal-600 shrink-0"></i>
              <span>Takes ~5 minutes · No listing fees · Open to RCI registered &amp; Masters qualified clinicians</span>
            </p>

            <!-- 4 Value Pills Strip -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200/80">
              <div class="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                <span class="block text-xl font-bold text-teal-800" style="font-family: var(--font-display);">90%</span>
                <span class="text-xs text-gray-600 font-medium">Direct Payout</span>
              </div>
              <div class="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                <span class="block text-xl font-bold text-gray-900" style="font-family: var(--font-display);">₹0</span>
                <span class="text-xs text-gray-600 font-medium">Listing Fees</span>
              </div>
              <div class="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                <span class="block text-xl font-bold text-teal-800" style="font-family: var(--font-display);">100%</span>
                <span class="text-xs text-gray-600 font-medium">Clinical Agency</span>
              </div>
              <div class="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                <span class="block text-xl font-bold text-gray-900" style="font-family: var(--font-display);">Daily</span>
                <span class="text-xs text-gray-600 font-medium">Settlements</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Visual Showcase Card -->
          <div class="lg:col-span-5 relative">
            <div class="relative bg-white rounded-3xl p-6 md:p-8 border border-gray-200/90 shadow-xl max-w-md mx-auto">
              
              <!-- Top Pill Badge -->
              <div class="flex items-center justify-between pb-5 mb-5 border-b border-gray-100">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="text-xs font-bold uppercase tracking-wider text-gray-500">Practice Dashboard</span>
                </div>
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  Verified Clinician
                </span>
              </div>

              <!-- Practitioner Mini Profile Preview -->
              <div class="flex items-start gap-4 mb-6">
                <img 
                  src="<?php echo esc_url( get_theme_file_uri( 'assets/img/photo-1573496359142-b8d87734a5a2' ) ); ?>" 
                  alt="Verified Clinical Psychologist Profile" 
                  class="w-16 h-16 rounded-2xl object-cover shadow-xs border border-gray-100 shrink-0"
                  loading="eager"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <h2 class="text-base font-bold text-gray-900 truncate">Dr. Shweta Rao</h2>
                    <i data-lucide="badge-check" class="w-4 h-4 text-teal-600 shrink-0"></i>
                  </div>
                  <p class="text-xs text-teal-800 font-medium mt-0.5">M.Phil Clinical Psychology · RCI Registered</p>
                  <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>8+ yrs exp</span>
                    <span>&bull;</span>
                    <span>Fee: ₹2,000 / session</span>
                  </div>
                </div>
              </div>

              <!-- Modality Tags -->
              <div class="flex flex-wrap gap-1.5 mb-6">
                <span class="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/70 text-[11px] font-medium text-gray-700">CBT</span>
                <span class="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/70 text-[11px] font-medium text-gray-700">ACT</span>
                <span class="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/70 text-[11px] font-medium text-gray-700">Trauma-Informed</span>
                <span class="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-[11px] font-medium text-teal-800">Hindi · English · Marathi</span>
              </div>

              <!-- Live Notification Card: Direct Payout -->
              <div class="p-4 rounded-2xl bg-gradient-to-r from-teal-50/90 to-emerald-50/90 border border-teal-200/80 mb-5">
                <div class="flex items-center justify-between text-xs mb-1.5">
                  <span class="font-semibold text-teal-900 flex items-center gap-1.5">
                    <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
                    Session Completed &amp; Reconciled
                  </span>
                  <span class="text-teal-700 text-[11px]">Today, 4:30 PM</span>
                </div>
                <div class="flex items-baseline justify-between mt-2">
                  <span class="text-xs text-gray-600">Direct Payout (90%):</span>
                  <span class="text-lg font-bold text-gray-900" style="font-family: var(--font-display);">₹1,800.00</span>
                </div>
                <div class="text-[11px] text-gray-500 mt-1 flex items-center justify-between">
                  <span>iKAN Platform Fee (10%): ₹200.00</span>
                  <span class="text-emerald-700 font-medium">Reconciled to Bank</span>
                </div>
              </div>

              <!-- Guarantee Pill -->
              <div class="text-center text-xs text-gray-500 border-t border-gray-100 pt-4 flex items-center justify-center gap-1.5">
                <i data-lucide="lock" class="w-3.5 h-3.5 text-gray-400"></i>
                <span>Zero session recording · 100% clinician-led care</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ── 2. Four Pillars of Partnership (The Anti-Interference Charter) ── -->
    <section class="py-16 md:py-24 bg-white border-b border-gray-200/70">
      <div class="site-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="max-w-3xl mx-auto text-center mb-16">
          <p class="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">Built With Respect For Your Profession</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight" style="font-family: var(--font-display);">
            A Partnership Designed for Clinicians, Not Aggregators
          </h2>
          <p class="text-base text-gray-600 mt-3 leading-relaxed">
            Most platforms turn therapists into service-desk operators with monitored sessions, rigid homework scripts, and heavy commissions. We took the opposite approach.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- Pillar 1 -->
          <div class="p-6 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:bg-white hover:shadow-md transition-all group">
            <div class="w-12 h-12 rounded-xl bg-teal-100/70 text-teal-800 flex items-center justify-center mb-5 group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <i data-lucide="user-check" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Absolute Clinical Autonomy</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              You own your clinical approach, session structure, fees, and client journey. We never record calls, monitor sessions, or dictate treatment plans.
            </p>
          </div>

          <!-- Pillar 2 -->
          <div class="p-6 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:bg-white hover:shadow-md transition-all group">
            <div class="w-12 h-12 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <i data-lucide="sliders" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Multi-Factor Matching</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              We match clients based on therapy modality, language comfort, budget, and bandwidth (ensuring clients who cannot handle heavy homework are not mismatched).
            </p>
          </div>

          <!-- Pillar 3 -->
          <div class="p-6 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:bg-white hover:shadow-md transition-all group">
            <div class="w-12 h-12 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center mb-5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <i data-lucide="calendar" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Automated Admin Friction</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              iKAN handles pre-consultation screening questionnaires, calendar slot bookings, reminder emails, Razorpay payments, and GST compliance receipts.
            </p>
          </div>

          <!-- Pillar 4 -->
          <div class="p-6 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:bg-white hover:shadow-md transition-all group">
            <div class="w-12 h-12 rounded-xl bg-purple-100/70 text-purple-800 flex items-center justify-center mb-5 group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <i data-lucide="percent" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Fair 90/10 Split</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Flat 10% platform fee on completed sessions only. Zero listing fees, zero subscriptions. Daily automated settlements with itemized fortnightly statements.
            </p>
          </div>

        </div>

      </div>
    </section>

    <!-- ── 3. Interactive Commercials & Earnings Calculator ── -->
    <section id="commercials" class="py-16 md:py-24 bg-[#F5F2EB] border-b border-gray-200/70">
      <div class="site-container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="max-w-2xl mx-auto text-center mb-12">
          <p class="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">Transparent Economics</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight" style="font-family: var(--font-display);">
            You Set Your Fee. We Retain 10%.
          </h2>
          <p class="text-base text-gray-600 mt-2">
            No hidden cuts, no tier deductions, and no penalties for continuing care directly with clients.
          </p>
        </div>

        <div class="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/90 shadow-lg">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <!-- Controls Column -->
            <div class="md:col-span-7 space-y-6">
              
              <!-- Session Fee Input -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label for="calc-fee-slider" class="text-xs font-bold uppercase tracking-wider text-gray-700">Your Consultation Fee per Session</label>
                  <span class="text-xl font-bold text-gray-900" id="calc-fee-display" style="font-family: var(--font-display);">₹2,000</span>
                </div>
                <input 
                  type="range" 
                  id="calc-fee-slider" 
                  min="800" 
                  max="6000" 
                  step="100" 
                  value="2000" 
                  class="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                />
                
                <!-- Quick Fee Presets -->
                <div class="flex flex-wrap gap-2 mt-3">
                  <button type="button" class="calc-preset-btn px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors" data-fee="1200">₹1,200</button>
                  <button type="button" class="calc-preset-btn px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors" data-fee="1800">₹1,800</button>
                  <button type="button" class="calc-preset-btn px-3 py-1 rounded-lg text-xs font-semibold border border-teal-600 bg-teal-50 text-teal-800 transition-colors" data-fee="2000">₹2,000</button>
                  <button type="button" class="calc-preset-btn px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors" data-fee="2500">₹2,500</button>
                  <button type="button" class="calc-preset-btn px-3 py-1 rounded-lg text-xs font-medium border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors" data-fee="3500">₹3,500</button>
                </div>
              </div>

              <!-- Sessions Per Month Input -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label for="calc-sessions-slider" class="text-xs font-bold uppercase tracking-wider text-gray-700">Estimated Sessions / Month</label>
                  <span class="text-xl font-bold text-gray-900" id="calc-sessions-display" style="font-family: var(--font-display);">20 sessions</span>
                </div>
                <input 
                  type="range" 
                  id="calc-sessions-slider" 
                  min="4" 
                  max="80" 
                  step="2" 
                  value="20" 
                  class="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                />
                <div class="flex justify-between text-[11px] text-gray-400 mt-1">
                  <span>Part-time (4–10)</span>
                  <span>Active Practice (20–40)</span>
                  <span>Full-time (50+)</span>
                </div>
              </div>

              <!-- Commercial Safeguards List -->
              <div class="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                <div class="flex items-center gap-2">
                  <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                  <span>Zero listing or directory membership fees</span>
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                  <span>Reconciled at the end of each session day</span>
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                  <span>No fee on cancellations or client drop-offs</span>
                </div>
              </div>

            </div>

            <!-- Output Display Card -->
            <div class="md:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 sm:p-7 shadow-md flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-bold uppercase tracking-widest text-teal-400">Monthly Payout Breakdown</span>
                
                <div class="mt-4 mb-6">
                  <p class="text-xs text-gray-400">Your Net Monthly Earnings (90%):</p>
                  <p class="text-3xl sm:text-4xl font-extrabold text-white mt-1" id="calc-monthly-net" style="font-family: var(--font-display);">₹36,000</p>
                  <p class="text-xs text-teal-300 mt-1" id="calc-annual-net">Annualised: ~₹4,32,000 / year</p>
                </div>

                <div class="space-y-3 py-4 border-y border-gray-700/80 text-xs">
                  <div class="flex justify-between text-gray-300">
                    <span>Per Session Gross:</span>
                    <span class="font-semibold text-white" id="calc-per-session-gross">₹2,000</span>
                  </div>
                  <div class="flex justify-between text-teal-300">
                    <span>Your Share (90%):</span>
                    <span class="font-bold text-white" id="calc-per-session-net">₹1,800</span>
                  </div>
                  <div class="flex justify-between text-gray-400">
                    <span>iKAN Platform Fee (10%):</span>
                    <span id="calc-per-session-fee">₹200</span>
                  </div>
                </div>
              </div>

              <div class="mt-6 pt-2">
                <a href="<?php echo esc_url( home_url( '/partner/join/' ) ); ?>" class="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-gray-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-xs">
                  <span>Start Application</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- ── 4. Side-by-Side Comparison Grid ── -->
    <section class="py-16 md:py-24 bg-white border-b border-gray-200/70">
      <div class="site-container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="max-w-2xl mx-auto text-center mb-16">
          <p class="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">The Structural Difference</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight" style="font-family: var(--font-display);">
            Traditional Platforms vs. iKAN Health
          </h2>
          <p class="text-base text-gray-600 mt-2">
            Why independent clinicians choose our partnership model.
          </p>
        </div>

        <div class="overflow-hidden border border-gray-200 rounded-3xl shadow-xs bg-white">
          <div class="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            
            <!-- Traditional Platforms Column -->
            <div class="md:col-span-6 p-6 sm:p-8 bg-gray-50/50">
              <div class="flex items-center gap-2 mb-6">
                <div class="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <i data-lucide="x" class="w-4 h-4"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800">Traditional Aggregators</h3>
              </div>

              <ul class="space-y-4 text-xs sm:text-sm text-gray-600">
                <li class="flex items-start gap-3">
                  <i data-lucide="x-circle" class="w-4 h-4 text-red-500 shrink-0 mt-0.5"></i>
                  <span><strong>30% – 50% commission</strong> taken from your consultation fee.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="x-circle" class="w-4 h-4 text-red-500 shrink-0 mt-0.5"></i>
                  <span><strong>Session monitoring &amp; recording</strong>, intruding on clinical privacy.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="x-circle" class="w-4 h-4 text-red-500 shrink-0 mt-0.5"></i>
                  <span><strong>Forced homework templates</strong> and rigid session procedures.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="x-circle" class="w-4 h-4 text-red-500 shrink-0 mt-0.5"></i>
                  <span><strong>30 to 60-day payout cycles</strong> with complex deduction rules.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="x-circle" class="w-4 h-4 text-red-500 shrink-0 mt-0.5"></i>
                  <span><strong>Upfront listing fees</strong> (₹15,000–₹50,000/yr) just to be visible.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="x-circle" class="w-4 h-4 text-red-500 shrink-0 mt-0.5"></i>
                  <span><strong>Punitive non-competes</strong> if a client transitions to private care.</span>
                </li>
              </ul>
            </div>

            <!-- iKAN Column -->
            <div class="md:col-span-6 p-6 sm:p-8 bg-teal-50/20">
              <div class="flex items-center gap-2 mb-6">
                <div class="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                  <i data-lucide="check" class="w-4 h-4"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-900">iKAN Health Network</h3>
              </div>

              <ul class="space-y-4 text-xs sm:text-sm text-gray-800">
                <li class="flex items-start gap-3">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                  <span><strong>Flat 10% platform fee</strong>. You keep 90% of your earnings.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                  <span><strong>Zero session recording</strong>. 100% confidential and unmonitored.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                  <span><strong>Absolute clinical agency</strong> over methodology and homework load.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                  <span><strong>Daily automated settlements</strong> upon session completion.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                  <span><strong>₹0 listing or subscription fees</strong>. We only earn when you earn.</span>
                </li>
                <li class="flex items-start gap-3">
                  <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0 mt-0.5"></i>
                  <span><strong>Zero platform lock-in</strong>. Clients and clinicians are free to transition.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </section>

    <!-- ── 5. How Matching Works (The Match Engine) ── -->
    <section class="py-16 md:py-24 bg-[#FAF9F6] border-b border-gray-200/70">
      <div class="site-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="max-w-3xl mx-auto text-center mb-16">
          <p class="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">Precision Client Introductions</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight" style="font-family: var(--font-display);">
            Matching That Considers Bandwidth, Not Just Symptoms
          </h2>
          <p class="text-base text-gray-600 mt-3 leading-relaxed">
            Drop-offs happen when a client and therapist are misaligned on approach, language, or workload. Our multi-variable algorithm ensures mutual fit before the first session.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">01</div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Therapeutic Modality</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Matched by your primary frameworks: CBT, ACT, Psychodynamic, Humanistic, Somatic Experiencing, Emotion-Focused, or DBT.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">02</div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Bandwidth &amp; Homework Capacity</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              If a client is experiencing acute burnout and has zero capacity for worksheets, we never match them with an intensive exercise-heavy protocol.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">03</div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Linguistic Comfort</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Sessions conducted in your preferred languages: Hindi, English, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, or Gujarati.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">04</div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Custom Fee Alignment</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Clients only see your profile if their budget accommodates your set consultation fee, preventing awkward price negotiations.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">05</div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Mutual Right of Refusal</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              You review the pre-screened intake summary before accepting. If a case is outside your clinical scope, decline without penalty.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-4">06</div>
            <h3 class="text-base font-bold text-gray-900 mb-2">Video or In-Person Clinic</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Offer telehealth consultations via secure video links, or indicate your physical clinic location for in-person consultations.
            </p>
          </div>

        </div>

      </div>
    </section>

    <!-- ── 6. Complementary Care Ecosystem (The Inter-Session Scaffolding) ── -->
    <section class="py-16 md:py-24 bg-white border-b border-gray-200/70">
      <div class="site-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div class="lg:col-span-6 space-y-6">
            <p class="text-xs font-bold uppercase tracking-wider text-teal-800">Supportive Ecosystem</p>
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight" style="font-family: var(--font-display);">
              Tools That Support Your Therapy, Never Replace It
            </h2>
            <p class="text-base text-gray-600 leading-relaxed">
              iKAN includes self-paced clinical tools designed to keep clients anchored between consultations. You are always the driver of care; these tools provide the scaffolding.
            </p>

            <div class="space-y-4 pt-2">
              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                  <i data-lucide="file-text" class="w-4 h-4"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">7 Clinical Assessment Baselines</h3>
                  <p class="text-xs text-gray-600 mt-0.5">Validated instruments (PHQ-9, GAD-7, WHO-5, PSS-10, BAT, SCI, BRS) provide objective data if the client chooses to share results.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                  <i data-lucide="sparkles" class="w-4 h-4"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">Equip Micro-Interventions</h3>
                  <p class="text-xs text-gray-600 mt-0.5">14 and 28-day neurobehavioral daily habits for sleep hygiene and stress regulation that reinforce therapy concepts.</p>
                </div>
              </div>

              <div class="flex items-start gap-3.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <i data-lucide="heart-handshake" class="w-4 h-4"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">Private Reflection Journal</h3>
                  <p class="text-xs text-gray-600 mt-0.5">Clients can track mood and trigger observations securely. We never read or parse their personal journal entries.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6">
            <div class="relative bg-gradient-to-tr from-gray-50 to-[#F5F2EB] p-6 sm:p-8 rounded-3xl border border-gray-200/90 shadow-sm">
              <div class="space-y-4">
                
                <div class="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                    <div>
                      <p class="text-xs font-bold text-gray-900">Pre-Consultation Context</p>
                      <p class="text-[11px] text-gray-500">Intake concern, language preference, previous therapy history</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">Verified</span>
                </div>

                <div class="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <div>
                      <p class="text-xs font-bold text-gray-900">Optional Baseline Scores</p>
                      <p class="text-[11px] text-gray-500">PHQ-9 (Moderate) · GAD-7 (Mild) shared with consent</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md">Screening</span>
                </div>

                <div class="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <div>
                      <p class="text-xs font-bold text-gray-900">Session Handover</p>
                      <p class="text-[11px] text-gray-500">100% agency transferred to clinician · Zero monitoring</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">Autonomous</span>
                </div>

              </div>

              <div class="mt-6 p-4 rounded-xl bg-white border border-gray-200 text-center">
                <p class="text-xs text-gray-600 italic">
                  "Self-help is a gateway for clients hesitant to start therapy. Once they connect with you, iKAN steps back completely."
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ── 7. The 4-Step Application & Onboarding Process ── -->
    <section class="py-16 md:py-24 bg-[#FAF9F6] border-b border-gray-200/70">
      <div class="site-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="max-w-2xl mx-auto text-center mb-16">
          <p class="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">Fast, Respectful Onboarding</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight" style="font-family: var(--font-display);">
            How to Join the Network
          </h2>
          <p class="text-base text-gray-600 mt-2">
            From application to active matches in four straightforward steps.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs relative">
            <span class="text-3xl font-extrabold text-gray-200 mb-3 block" style="font-family: var(--font-display);">01</span>
            <h3 class="text-base font-bold text-gray-900 mb-1.5">Submit Application</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Complete the 11-step profile form with your qualifications, clinical modalities, languages, and fee schedule.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs relative">
            <span class="text-3xl font-extrabold text-gray-200 mb-3 block" style="font-family: var(--font-display);">02</span>
            <h3 class="text-base font-bold text-gray-900 mb-1.5">Credential Verification</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Our clinical board verifies your RCI registration or Master's degree in Psychology. Usually completed within 48 hours.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs relative">
            <span class="text-3xl font-extrabold text-gray-200 mb-3 block" style="font-family: var(--font-display);">03</span>
            <h3 class="text-base font-bold text-gray-900 mb-1.5">Slot &amp; Mode Setup</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Define your availability hours, whether you offer telehealth, in-person clinic visits, or both, and set your consultation fee.
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs relative">
            <span class="text-3xl font-extrabold text-teal-800/30 mb-3 block" style="font-family: var(--font-display);">04</span>
            <h3 class="text-base font-bold text-gray-900 mb-1.5">Care &amp; Daily Settlement</h3>
            <p class="text-xs text-gray-600 leading-relaxed">
              Receive matched client requests. Conduct unmonitored sessions and receive 90% direct payout reconciled daily.
            </p>
          </div>

        </div>

        <div class="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="<?php echo esc_url( home_url( '/partner/join/' ) ); ?>" class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gray-900 text-white font-semibold text-base shadow-md hover:bg-gray-800 transition-all">
            <span>Start Provider Application</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
          <a href="<?php echo esc_url( home_url( '/partner/account/' ) ); ?>" class="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-gray-300 text-gray-800 font-semibold text-base shadow-2xs hover:bg-gray-50 transition-all">
            <span>Already a Partner? Sign In</span>
          </a>
        </div>

      </div>
    </section>

    <!-- ── 8. Frequently Asked Questions (From Alignment Workbook) ── -->
    <section class="py-16 md:py-24 bg-white border-b border-gray-200/70">
      <div class="site-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-14">
          <p class="text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">Clarity &amp; Transparency</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight" style="font-family: var(--font-display);">
            Frequently Asked Questions
          </h2>
          <p class="text-base text-gray-600 mt-2">
            Direct, unequivocal answers to the practical questions clinicians ask us.
          </p>
        </div>

        <div class="space-y-4" id="partner-faq-accordion">
          
          <!-- FAQ 1 -->
          <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
            <button type="button" class="faq-toggle w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-sm sm:text-base text-gray-900 focus:outline-none" aria-expanded="false">
              <span>Who sets my consultation fees?</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 transition-transform duration-200"></i>
            </button>
            <div class="faq-content hidden px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              You do. You decide your fee per session and can modify it anytime in your provider portal. iKAN never caps or dictates your rates.
            </div>
          </div>

          <!-- FAQ 2 -->
          <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
            <button type="button" class="faq-toggle w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-sm sm:text-base text-gray-900 focus:outline-none" aria-expanded="false">
              <span>What commission does iKAN charge and when is it deducted?</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 transition-transform duration-200"></i>
            </button>
            <div class="faq-content hidden px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              We charge a flat 10% platform commission on completed sessions only. There are zero listing fees, zero setup charges, and zero monthly subscriptions. If a session is cancelled or does not occur, no fee is charged.
            </div>
          </div>

          <!-- FAQ 3 -->
          <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
            <button type="button" class="faq-toggle w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-sm sm:text-base text-gray-900 focus:outline-none" aria-expanded="false">
              <span>When and how do I receive my payouts?</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 transition-transform duration-200"></i>
            </button>
            <div class="faq-content hidden px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              iKAN collects the fee upfront from the client. Payouts are reconciled at the end of each session day and transferred directly to your bank account via automated payment gateway (RazorpayX). You also receive an itemized transaction statement fortnightly.
            </div>
          </div>

          <!-- FAQ 4 -->
          <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
            <button type="button" class="faq-toggle w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-sm sm:text-base text-gray-900 focus:outline-none" aria-expanded="false">
              <span>Does iKAN record, monitor, or review my sessions?</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 transition-transform duration-200"></i>
            </button>
            <div class="faq-content hidden px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              Never. We have an absolute Anti-Interference Guarantee. We do not record calls, store transcripts, or listen to sessions. The therapeutic space belongs solely to you and your client.
            </div>
          </div>

          <!-- FAQ 5 -->
          <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
            <button type="button" class="faq-toggle w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-sm sm:text-base text-gray-900 focus:outline-none" aria-expanded="false">
              <span>Can a client continue therapy with me outside of iKAN?</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 transition-transform duration-200"></i>
            </button>
            <div class="faq-content hidden px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              Yes. If a client and therapist decide to continue their relationship off-platform after the agreed booking period, you are completely free to do so without any punitive platform clauses or fee demands.
            </div>
          </div>

          <!-- FAQ 6 -->
          <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
            <button type="button" class="faq-toggle w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-sm sm:text-base text-gray-900 focus:outline-none" aria-expanded="false">
              <span>Can I decline a client match?</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 transition-transform duration-200"></i>
            </button>
            <div class="faq-content hidden px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              Yes, absolutely. You receive an initial pre-screened summary (concerns, language, session goals) before accepting. If you believe the case is outside your expertise or bandwidth, you can decline with zero penalty.
            </div>
          </div>

          <!-- FAQ 7 -->
          <div class="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50">
            <button type="button" class="faq-toggle w-full text-left px-6 py-4.5 flex items-center justify-between font-bold text-sm sm:text-base text-gray-900 focus:outline-none" aria-expanded="false">
              <span>What qualifications are required to join?</span>
              <i data-lucide="chevron-down" class="w-4 h-4 text-gray-500 transition-transform duration-200"></i>
            </button>
            <div class="faq-content hidden px-6 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
              We welcome licensed Clinical Psychologists (M.Phil / Psy.D / Ph.D with RCI registration), Counselling Psychologists (Master's in Applied / Counselling Psychology with recognized clinical supervision), and Psychiatrists (M.D. / D.P.M.).
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- ── 9. Final High-Conversion CTA Banner ── -->
    <section class="py-16 md:py-24 bg-[#0A2E28] text-white relative overflow-hidden">
      <!-- Decorative radial gradient background -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.25),transparent_60%)] pointer-events-none" aria-hidden="true"></div>

      <div class="site-container relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900/60 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wide mb-6">
          <i data-lucide="award" class="w-4 h-4 text-teal-400"></i>
          <span>Join Verified Mental Health Clinicians Across India</span>
        </div>

        <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6" style="font-family: var(--font-display);">
          Build a Thriving Clinical Practice<br class="hidden sm:inline"> On Your Own Terms.
        </h2>

        <p class="text-base sm:text-lg text-teal-100/90 max-w-2xl mx-auto leading-relaxed mb-8">
          Pre-screened client introductions, fair 90/10 financials, daily settlements, and complete autonomy over your therapeutic practice.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="<?php echo esc_url( home_url( '/partner/join/' ) ); ?>" class="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-2xl bg-teal-400 hover:bg-teal-300 text-gray-950 font-bold text-base shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0">
            <span>Start Provider Application</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>

          <a href="<?php echo esc_url( home_url( '/partner/account/' ) ); ?>" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-teal-950/60 border border-teal-700/60 text-teal-200 hover:text-white hover:bg-teal-900/80 font-medium text-base transition-all">
            <i data-lucide="user-check" class="w-4 h-4 text-teal-400"></i>
            <span>Partner Account Sign In</span>
          </a>
        </div>

        <p class="text-xs text-teal-200/60 mt-6">
          Questions before applying? Email us directly at <a href="mailto:partner@ikanhealth.in" class="underline text-teal-200 hover:text-white">partner@ikanhealth.in</a>
        </p>

      </div>
    </section>

  </div>
</main>

<!-- Interactive Calculator & Accordion Logic -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Lucide icon render
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }

  // ── Commercials Calculator ──
  const feeSlider = document.getElementById('calc-fee-slider');
  const feeDisplay = document.getElementById('calc-fee-display');
  const sessionsSlider = document.getElementById('calc-sessions-slider');
  const sessionsDisplay = document.getElementById('calc-sessions-display');
  
  const monthlyNet = document.getElementById('calc-monthly-net');
  const annualNet = document.getElementById('calc-annual-net');
  const perSessionGross = document.getElementById('calc-per-session-gross');
  const perSessionNet = document.getElementById('calc-per-session-net');
  const perSessionFee = document.getElementById('calc-per-session-fee');
  const presetBtns = document.querySelectorAll('.calc-preset-btn');

  function formatInr(val) {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  function updateCalculator() {
    if (!feeSlider || !sessionsSlider) return;
    const fee = parseInt(feeSlider.value, 10) || 2000;
    const sessions = parseInt(sessionsSlider.value, 10) || 20;

    const therapistShare = fee * 0.90;
    const platformFee = fee * 0.10;
    const monthTotal = therapistShare * sessions;
    const annualTotal = monthTotal * 12;

    if (feeDisplay) feeDisplay.textContent = formatInr(fee);
    if (sessionsDisplay) sessionsDisplay.textContent = sessions + ' sessions';
    if (perSessionGross) perSessionGross.textContent = formatInr(fee);
    if (perSessionNet) perSessionNet.textContent = formatInr(therapistShare);
    if (perSessionFee) perSessionFee.textContent = formatInr(platformFee);
    if (monthlyNet) monthlyNet.textContent = formatInr(monthTotal);
    if (annualNet) annualNet.textContent = 'Annualised: ~' + formatInr(annualTotal) + ' / year';
  }

  if (feeSlider) feeSlider.addEventListener('input', updateCalculator);
  if (sessionsSlider) sessionsSlider.addEventListener('input', updateCalculator);

  presetBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const f = this.getAttribute('data-fee');
      if (f && feeSlider) {
        feeSlider.value = f;
        presetBtns.forEach(b => {
          b.classList.remove('border-teal-600', 'bg-teal-50', 'text-teal-800', 'font-semibold');
          b.classList.add('border-gray-200', 'bg-gray-50', 'text-gray-700', 'font-medium');
        });
        this.classList.remove('border-gray-200', 'bg-gray-50', 'text-gray-700', 'font-medium');
        this.classList.add('border-teal-600', 'bg-teal-50', 'text-teal-800', 'font-semibold');
        updateCalculator();
      }
    });
  });

  // ── FAQ Accordion ──
  const faqToggles = document.querySelectorAll('.faq-toggle');
  faqToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const content = this.nextElementSibling;
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const icon = this.querySelector('svg');

      // Close all others
      faqToggles.forEach(otherToggle => {
        if (otherToggle !== this) {
          otherToggle.setAttribute('aria-expanded', 'false');
          if (otherToggle.nextElementSibling) otherToggle.nextElementSibling.classList.add('hidden');
          const otherIcon = otherToggle.querySelector('svg');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        }
      });

      if (isExpanded) {
        this.setAttribute('aria-expanded', 'false');
        if (content) content.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      } else {
        this.setAttribute('aria-expanded', 'true');
        if (content) content.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      }
    });
  });

  updateCalculator();
});
</script>

<!-- Vite React SPA Module Mount -->
<script type="module" crossorigin src="<?php echo esc_url( $vite_js ); ?>"></script>

<?php get_footer(); ?>
