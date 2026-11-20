<?php
/**
 * Template Name: Organization Portal
 * Template Post Type: page
 * Description: iKAN for Organisations — Workplace mental wellness & aggregate insights with full validation & FluentCRM profiling
 */

get_header(); ?>

<main class="ikan2-theme bg-gray-50 pb-24 md:pb-16 min-h-screen">

  <?php
  $hero_img = 'https://images.unsplash.com/photo-1759951609703-f03171e6f66e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwc3Vuc2V0JTIwbGFrZSUyMG5hdHVyZSUyMG1pbmRmdWxuZXNzJTIwcGVhY2VmdWx8ZW58MXx8fHwxNzczNjY4MjU5fDA&ixlib=rb-4.1.0&q=80&w=1080';
  ?>

  <!-- Hero Section -->
  <section class="relative w-full overflow-hidden bg-gray-900 text-white py-16 md:py-24">
    <div class="absolute inset-0 z-0">
      <img src="<?php echo esc_url( $hero_img ); ?>" alt="Calm sunset lake" class="w-full h-full object-cover opacity-35" loading="eager" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-[1200px] mx-auto px-4 text-center">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-6">
        <i data-lucide="shield-check" class="w-4 h-4"></i>
        iKAN for Organisations
      </div>

      <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto font-display">
        Wellbeing your people can use, and you can measure.
      </h1>

      <p class="text-base md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
        Aggregate insight into how your organisation is doing — never a window into any one person. Strict privacy by design.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="#request-demo" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2">
          <span>Request an Organisation Demo</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </a>
        <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-all border border-white/20 backdrop-blur-sm flex items-center justify-center gap-2">
          <i data-lucide="calculator" class="w-4 h-4"></i>
          <span>Calculate Burnout Cost</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Privacy Guarantee Banner (k-anonymity) -->
  <section class="bg-emerald-900/10 border-b border-emerald-900/20 py-4">
    <div class="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-emerald-950 font-medium">
      <div class="flex items-center gap-3">
        <span class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <i data-lucide="lock" class="w-4 h-4"></i>
        </span>
        <p>
          <strong>Architectural Privacy Promise:</strong> Strict <em>k-anonymity</em> threshold (k &ge; 5). Individual answers are never exposed to managers or HR.
        </p>
      </div>
      <a href="<?php echo esc_url( home_url( '/workplace-privacy' ) ); ?>" class="text-emerald-800 underline hover:text-emerald-950 whitespace-nowrap text-xs font-semibold">
        Read Workplace Privacy &rarr;
      </a>
    </div>
  </section>

  <!-- Overview Metrics / Dashboard Preview -->
  <section class="py-16 md:py-20">
    <div class="max-w-[1200px] mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Dashboard</span>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 mt-2 mb-4 font-display">
          Real-Time Anonymous Wellbeing Insights
        </h2>
        <p class="text-gray-600 text-sm md:text-base leading-relaxed">
          See department-level wellbeing distributions, track stress indicators across quarters, and deploy targeted Equip cohorts before burnout leads to turnover.
        </p>
      </div>

      <!-- 4 Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">Aggregate Score</span>
            <i data-lucide="activity" class="w-5 h-5 text-emerald-600"></i>
          </div>
          <div class="text-3xl font-extrabold text-gray-900">78 <span class="text-base font-normal text-gray-400">/ 100</span></div>
          <p class="text-xs text-emerald-700 mt-2 font-medium flex items-center gap-1">
            <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> +4.2 pts vs last quarter
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">Burnout Reduction</span>
            <i data-lucide="sparkles" class="w-5 h-5 text-blue-600"></i>
          </div>
          <div class="text-3xl font-extrabold text-gray-900">-34%</div>
          <p class="text-xs text-gray-500 mt-2 font-medium">Post-Equip 8-week cohorts</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">Team Adoption</span>
            <i data-lucide="users" class="w-5 h-5 text-indigo-600"></i>
          </div>
          <div class="text-3xl font-extrabold text-gray-900">82%</div>
          <p class="text-xs text-gray-500 mt-2 font-medium">Monthly active participation</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">Privacy Safeguard</span>
            <i data-lucide="shield" class="w-5 h-5 text-teal-600"></i>
          </div>
          <div class="text-3xl font-extrabold text-gray-900">k &ge; 5</div>
          <p class="text-xs text-teal-700 mt-2 font-medium">100% individual anonymity</p>
        </div>
      </div>

      <!-- Dashboard Mock Table -->
      <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Department Wellbeing Breakdown</h3>
            <p class="text-xs text-gray-500 mt-0.5">Aggregated metrics updated across recent check-ins.</p>
          </div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <i data-lucide="calendar" class="w-3.5 h-3.5"></i> Last 6 Months
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th class="px-6 py-3.5">Department</th>
                <th class="px-6 py-3.5">Participation</th>
                <th class="px-6 py-3.5">Avg Score</th>
                <th class="px-6 py-3.5">Equip Adoption</th>
                <th class="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="px-6 py-4 font-semibold text-gray-900">Engineering & Tech</td>
                <td class="px-6 py-4 text-gray-600">142 members</td>
                <td class="px-6 py-4 font-semibold text-emerald-700">76 / 100</td>
                <td class="px-6 py-4 text-gray-600">68% in Burnout Cohort</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Thriving</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="px-6 py-4 font-semibold text-gray-900">Product & Design</td>
                <td class="px-6 py-4 text-gray-600">38 members</td>
                <td class="px-6 py-4 font-semibold text-emerald-700">81 / 100</td>
                <td class="px-6 py-4 text-gray-600">74% in Focus & Flow</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Thriving</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="px-6 py-4 font-semibold text-gray-900">Operations & Logistics</td>
                <td class="px-6 py-4 text-gray-600">85 members</td>
                <td class="px-6 py-4 font-semibold text-amber-700">67 / 100</td>
                <td class="px-6 py-4 text-gray-600">55% in Sleep Recovery</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Coping</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="px-6 py-4 font-semibold text-gray-900">Executive & Legal</td>
                <td class="px-6 py-4 text-gray-400">4 members</td>
                <td class="px-6 py-4 text-gray-400 italic">Withheld (k &lt; 5)</td>
                <td class="px-6 py-4 text-gray-400 italic">—</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600" title="Data suppressed to preserve anonymity">
                    <i data-lucide="lock" class="w-3 h-3"></i> Protected
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- Interactive Burnout Calculator Callout -->
  <section class="py-12 bg-gradient-to-r from-blue-900 to-indigo-950 text-white">
    <div class="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
      <div class="max-w-xl">
        <span class="text-xs font-bold uppercase tracking-wider text-blue-300">Financial Impact</span>
        <h3 class="text-2xl md:text-3xl font-bold mt-1 mb-3">
          What is Employee Burnout Costing Your Business?
        </h3>
        <p class="text-blue-100 text-sm md:text-base leading-relaxed">
          High stress directly correlates with absenteeism, disengagement, and voluntary turnover. Use our interactive tool to calculate the exact ROI of mental wellness prevention.
        </p>
      </div>
      <div>
        <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-gray-900 font-bold hover:bg-blue-50 transition-all shadow-xl">
          <i data-lucide="calculator" class="w-5 h-5 text-blue-600"></i>
          <span>Launch Burnout Calculator</span>
        </a>
      </div>
    </div>
  </section>

  <!-- Request Demo / Lead Capture Section with Full Validation, Busy, Success & Failure UI -->
  <section id="request-demo" class="py-16 md:py-24 bg-gray-50">
    <div class="max-w-[800px] mx-auto px-4">
      <div class="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
        <div class="text-center mb-8">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-600">Partner with iKAN</span>
          <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-3 font-display">
            Schedule an Organisation Consultation
          </h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Fill out the form below and our workplace wellbeing team will tailor an onboarding plan and pilot for your company.
          </p>
        </div>

        <!-- Success Card -->
        <div id="org-success" class="hidden overflow-hidden rounded-[24px] bg-[#DFF0E8] text-[#173D2F] border border-[#B3DEC9] p-6 mb-6">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-[#B3DEC9] flex items-center justify-center text-[#173D2F] shrink-0 mt-0.5">
              <i data-lucide="check" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-base font-bold">Inquiry received successfully</h3>
              <p class="text-sm mt-1 text-[#285743]" id="org-success-msg">
                Our workplace wellbeing lead will reach out to your work email to schedule your demo.
              </p>
            </div>
          </div>
        </div>

        <!-- Failure Banner -->
        <div id="org-failure" class="hidden rounded-xl bg-red-50 border border-red-200 text-red-800 p-4 mb-6 text-sm flex items-center gap-3">
          <i data-lucide="alert-circle" class="w-5 h-5 text-red-600 shrink-0"></i>
          <span id="org-failure-msg">Submission failed. Please check your network connection and try again.</span>
        </div>

        <form id="org-form" noValidate class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Your Name <span class="text-red-500">*</span>
              </label>
              <input type="text" id="org-name" name="name" required placeholder="Priya Sharma" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none transition-colors" />
              <span class="text-xs text-red-500 mt-1 hidden" id="org-err-name"></span>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Work Email <span class="text-red-500">*</span>
              </label>
              <input type="email" id="org-email" name="email" required placeholder="priya@company.com" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none transition-colors" />
              <span class="text-xs text-red-500 mt-1 hidden" id="org-err-email"></span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                Organisation Name <span class="text-red-500">*</span>
              </label>
              <input type="text" id="org-company" name="company" required placeholder="Acme Technologies" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none transition-colors" />
              <span class="text-xs text-red-500 mt-1 hidden" id="org-err-company"></span>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Team Size</label>
              <select id="org-team-size" name="team_size" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none bg-white">
                <option value="10-50">10 – 50 employees</option>
                <option value="51-200" selected>51 – 200 employees</option>
                <option value="201-1000">201 – 1,000 employees</option>
                <option value="1000+">1,000+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">How can we help your team?</label>
            <textarea id="org-message" name="message" rows="4" placeholder="Tell us about your team's wellbeing goals, challenges, or pilot timeline..." class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none resize-none transition-colors"></textarea>
          </div>

          <button type="submit" id="org-submit-btn" class="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2">
            <span id="org-btn-text">Send Organisation Inquiry</span>
            <svg id="org-btn-spinner" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white hidden" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>

        <div class="mt-8 pt-6 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-500">
            Already an administrator? Visit <a href="mailto:support@ikanhealth.in" class="text-blue-600 font-semibold underline">support@ikanhealth.in</a> or sign into the member app.
          </p>
        </div>
      </div>
    </div>
  </section>

</main>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('org-form');
    if (!form) return;

    const nameInput = document.getElementById('org-name');
    const emailInput = document.getElementById('org-email');
    const companyInput = document.getElementById('org-company');
    const teamSizeInput = document.getElementById('org-team-size');
    const messageInput = document.getElementById('org-message');

    const submitBtn = document.getElementById('org-submit-btn');
    const btnText = document.getElementById('org-btn-text');
    const btnSpinner = document.getElementById('org-btn-spinner');
    const successCard = document.getElementById('org-success');
    const successMsg = document.getElementById('org-success-msg');
    const failureBanner = document.getElementById('org-failure');
    const failureMsg = document.getElementById('org-failure-msg');

    const errName = document.getElementById('org-err-name');
    const errEmail = document.getElementById('org-err-email');
    const errCompany = document.getElementById('org-err-company');

    function validate() {
      let valid = true;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const company = companyInput.value.trim();

      if (!name || name.length < 2) {
        errName.textContent = 'Please enter your name.';
        errName.classList.remove('hidden');
        nameInput.classList.add('border-red-500');
        valid = false;
      } else {
        errName.classList.add('hidden');
        nameInput.classList.remove('border-red-500');
      }

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRe.test(email)) {
        errEmail.textContent = 'Please enter a valid work email.';
        errEmail.classList.remove('hidden');
        emailInput.classList.add('border-red-500');
        valid = false;
      } else {
        errEmail.classList.add('hidden');
        emailInput.classList.remove('border-red-500');
      }

      if (!company) {
        errCompany.textContent = 'Please enter your organisation name.';
        errCompany.classList.remove('hidden');
        companyInput.classList.add('border-red-500');
        valid = false;
      } else {
        errCompany.classList.add('hidden');
        companyInput.classList.remove('border-red-500');
      }

      return valid;
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      failureBanner.classList.add('hidden');

      if (!validate()) return;

      submitBtn.disabled = true;
      btnSpinner.classList.remove('hidden');
      btnText.textContent = 'Submitting inquiry...';

      const formData = new FormData();
      formData.append('action', 'ikan_org_inquiry');
      formData.append('nonce', window.ikanAjax ? window.ikanAjax.nonce : '');
      formData.append('name', nameInput.value.trim());
      formData.append('email', emailInput.value.trim());
      formData.append('company', companyInput.value.trim());
      formData.append('team_size', teamSizeInput.value);
      formData.append('message', messageInput.value.trim());

      try {
        const ajaxUrl = window.ikanAjax ? window.ikanAjax.ajax_url : '/wp-admin/admin-ajax.php';
        const res = await fetch(ajaxUrl, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          form.classList.add('hidden');
          successMsg.textContent = data.data && data.data.message ? data.data.message : 'Inquiry received. We will contact your work email.';
          successCard.classList.remove('hidden');
          successCard.scrollIntoView({ behavior: 'smooth' });
        } else {
          const errMsg = data.data && data.data.errors ? Object.values(data.data.errors).join(' ') : (data.data && data.data.message ? data.data.message : 'Submission failed. Please try again.');
          failureMsg.textContent = errMsg;
          failureBanner.classList.remove('hidden');
        }
      } catch (err) {
        failureMsg.textContent = 'Network error. Please check your connection or write directly to partners@ikanhealth.in.';
        failureBanner.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        btnSpinner.classList.add('hidden');
        btnText.textContent = 'Send Organisation Inquiry';
      }
    });
  });
</script>

<?php get_footer(); ?>
