<?php
/**
 * Template Name: Corporate Onboarding & Demo
 * Template Post Type: page
 * Description: Workplace Mental Health & Organisation Pilot Onboarding — connects with FluentCRM org-leads
 */

$assets = ikan_get_vite_assets();
$vite_js = $assets['js'] ?? '/assets/index-5S_-3E9M.js';
$vite_css = $assets['css'] ?? '/assets/index-ioCBHsFn.css';

get_header(); ?>

<main id="main-content" tabindex="-1" class="flex-1 w-full relative outline-none p-0" role="main" aria-label="Corporate Workplace Mental Health">
  <div class="ikan2-theme ikan2-type accent-calm site-page-below-nav corporate-landing" style="font-family: var(--font-sans); background: #FAF9F6; color: #151515;">

    <!-- ── 1. Hero Section ── -->
    <section class="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-gray-200/70" style="background: radial-gradient(100% 85% at 50% 0%, #F5F1EA 0%, #FAF9F6 100%);">
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" aria-hidden="true"></div>
      <div class="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl pointer-events-none" aria-hidden="true"></div>

      <div class="site-container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Left Column: Copy & Value Proposition -->
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-900 text-xs font-semibold tracking-wide">
              <i data-lucide="building-2" class="w-4 h-4 text-blue-700 shrink-0"></i>
              <span>iKAN for Workplaces · Organisational Wellbeing</span>
            </div>

            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-extrabold text-gray-900 tracking-tight leading-[1.12]" style="font-family: var(--font-display);">
              Workplace Mental Health<br class="hidden sm:inline">
              <span class="text-blue-900 italic font-serif">That Teams Actually Use.</span>
            </h1>

            <p class="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl font-normal">
              Most employee assistance programs (EAPs) see under 3% utilization because employees fear surveillance. iKAN delivers clinical-grade, self-paced neurobehavioral programs and confidential therapy with an <strong class="text-gray-900 font-semibold">uncompromised privacy threshold (k &ge; 5)</strong>.
            </p>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a href="#demo-form" class="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gray-900 text-white font-semibold text-base shadow-md hover:bg-gray-800 transition-all transform hover:-translate-y-0.5">
                <span>Book Organisation Pilot</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </a>

              <a href="<?php echo esc_url( home_url( '/corporate/portal/' ) ); ?>" class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border border-gray-300 text-gray-800 font-semibold text-base shadow-2xs hover:bg-gray-50 transition-all">
                <i data-lucide="layout-dashboard" class="w-4 h-4 text-gray-600"></i>
                <span>Explore Live Portal Demo</span>
              </a>
            </div>

            <!-- Stats Bar -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200/80">
              <div class="bg-white/80 p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                <span class="block text-xl font-bold text-blue-900" style="font-family: var(--font-display);">75%+</span>
                <span class="text-xs text-gray-600 font-medium">Voluntary Adoption</span>
              </div>
              <div class="bg-white/80 p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                <span class="block text-xl font-bold text-gray-900" style="font-family: var(--font-display);">k &ge; 5</span>
                <span class="text-xs text-gray-600 font-medium">Strict Anonymity</span>
              </div>
              <div class="bg-white/80 p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                <span class="block text-xl font-bold text-teal-800" style="font-family: var(--font-display);">-34%</span>
                <span class="text-xs text-gray-600 font-medium">Burnout Exposure</span>
              </div>
              <div class="bg-white/80 p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                <span class="block text-xl font-bold text-gray-900" style="font-family: var(--font-display);">24/7</span>
                <span class="text-xs text-gray-600 font-medium">Equip Tools</span>
              </div>
            </div>

          </div>

          <!-- Right Column: Interactive Demo Booking Form -->
          <div class="lg:col-span-5 relative" id="demo-form">
            <div class="bg-white rounded-3xl p-6 sm:p-8 md:p-9 border border-gray-200/90 shadow-xl max-w-md mx-auto">
              
              <div class="mb-6">
                <span class="text-xs font-bold uppercase tracking-wider text-blue-700">Get Started</span>
                <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mt-1" style="font-family: var(--font-display);">
                  Request a Workplace Pilot
                </h2>
                <p class="text-xs text-gray-500 mt-1">
                  Tailored wellbeing rollout for high-performance teams.
                </p>
              </div>

              <!-- Success Alert Banner -->
              <div id="org-success-banner" class="hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-5">
                <div class="flex items-start gap-2.5">
                  <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"></i>
                  <div>
                    <strong class="block text-sm font-bold text-emerald-950 mb-0.5">Pilot Request Received!</strong>
                    <span id="org-success-text">Thank you. Our workplace health lead will be in touch within 24 hours.</span>
                  </div>
                </div>
              </div>

              <!-- Form -->
              <form id="org-inquiry-form" class="space-y-4">
                <?php wp_nonce_field( 'ikan_form_nonce', 'nonce' ); ?>
                <input type="hidden" name="action" value="ikan_org_inquiry">

                <div>
                  <label for="org-name" class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Your Full Name *</label>
                  <input type="text" id="org-name" name="name" required placeholder="e.g. Priya Sharma" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>

                <div>
                  <label for="org-email" class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Work Email *</label>
                  <input type="email" id="org-email" name="email" required placeholder="priya@company.com" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label for="org-company" class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Company Name *</label>
                    <input type="text" id="org-company" name="company" required placeholder="Company Pvt Ltd" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label for="org-team-size" class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Team Headcount</label>
                    <select id="org-team-size" name="team_size" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors">
                      <option value="10-50">10 – 50</option>
                      <option value="51-200" selected>51 – 200</option>
                      <option value="201-1000">201 – 1,000</option>
                      <option value="1000+">1,000+ employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label for="org-message" class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Key Challenges / Objectives (Optional)</label>
                  <textarea id="org-message" name="message" rows="3" placeholder="e.g. High engineering burnout, night shift sleep issues, hybrid team support" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors"></textarea>
                </div>

                <button type="submit" id="org-submit-btn" class="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm shadow-md transition-colors">
                  <span>Submit Pilot Request</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
              </form>

              <div class="mt-4 pt-3 border-t border-gray-100 text-center">
                <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator/' ) ); ?>" class="text-xs text-blue-800 hover:text-blue-950 font-medium inline-flex items-center gap-1">
                  <span>Calculate your company's burnout cost first &rarr;</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ── 2. Why iKAN for Organisations ── -->
    <section class="py-16 md:py-24 bg-white border-b border-gray-200/70">
      <div class="site-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="max-w-3xl mx-auto text-center mb-16">
          <p class="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">Designed For Measurable Impact</p>
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight" style="font-family: var(--font-display);">
            The Modern Standard in Workplace Wellbeing
          </h2>
          <p class="text-base text-gray-600 mt-3 leading-relaxed">
            Legacy employee helplines fail because employees distrust HR privacy. iKAN combines clinical efficacy with airtight data isolation.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div class="p-8 rounded-3xl bg-gray-50/60 border border-gray-200/80">
            <div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-6">
              <i data-lucide="shield-alert" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Strict k &ge; 5 Anonymity</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Employers never see individual employee data, assessment scores, or therapy topics. Aggregate cohorts must have at least 5 respondents before reporting is generated.
            </p>
          </div>

          <div class="p-8 rounded-3xl bg-gray-50/60 border border-gray-200/80">
            <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mb-6">
              <i data-lucide="sparkles" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Self-Paced Equip Programs</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Equip 14 and 28-day micro-interventions for sleep tight, stress performance, and burnout reset that employees can complete in 5 minutes a day on mobile.
            </p>
          </div>

          <div class="p-8 rounded-3xl bg-gray-50/60 border border-gray-200/80">
            <div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-6">
              <i data-lucide="user-check" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Verified Clinical Network</h3>
            <p class="text-sm text-gray-600 leading-relaxed">
              Direct consultations with RCI-licensed psychologists and therapists, with no employer monitoring and transparent scheduling.
            </p>
          </div>

        </div>

      </div>
    </section>

    <!-- ── 3. Final Corporate CTA Banner ── -->
    <section class="py-16 md:py-24 bg-[#0F172A] text-white text-center relative overflow-hidden">
      <div class="site-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" style="font-family: var(--font-display);">
          Ready to Roll Out iKAN to Your Team?
        </h2>
        <p class="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8">
          Join leading technology, healthcare, and finance companies providing genuine mental healthcare to their people.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#demo-form" class="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-base shadow-xl transition-all">
            <span>Book Your Pilot Walkthrough</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
          <a href="<?php echo esc_url( home_url( '/corporate/portal/' ) ); ?>" class="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-base transition-all">
            <span>Open Interactive Dashboard</span>
          </a>
        </div>
      </div>
    </section>

  </div>
</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }

  const form = document.getElementById('org-inquiry-form');
  const submitBtn = document.getElementById('org-submit-btn');
  const banner = document.getElementById('org-success-banner');
  const successText = document.getElementById('org-success-text');

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Submitting\u2026</span>';
      }

      const fd = new FormData(form);
      try {
        const res = await fetch('<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (data.success) {
          form.classList.add('hidden');
          if (banner) {
            banner.classList.remove('hidden');
            if (data.data && data.data.message && successText) {
              successText.textContent = data.data.message;
            }
          }
        } else {
          alert((data.data && data.data.errors && Object.values(data.data.errors).join('\n')) || 'Error submitting request. Please try again.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Submit Pilot Request</span>';
          }
        }
      } catch (err) {
        alert('Network error. Please try again.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Submit Pilot Request</span>';
        }
      }
    });
  }
});
</script>

<!-- Vite React SPA Module Mount -->
<script type="module" crossorigin src="<?php echo esc_url( $vite_js ); ?>"></script>

<?php get_footer(); ?>
