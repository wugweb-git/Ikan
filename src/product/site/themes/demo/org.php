<?php
/**
 * Template Name: Organization Portal
 * Template Post Type: page
 * Description: iKAN for Organisations — Workplace mental wellness & aggregate insights
 */

get_header(); ?>

<main class="ikan2-theme bg-gray-50 pb-24 md:pb-16">

  <?php
  $hero_img = 'https://images.unsplash.com/photo-1759951609703-f03171e6f66e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwc3Vuc2V0JTIwbGFrZSUyMG5hdHVyZSUyMG1pbmRmdWxuZXNzJTIwcGVhY2VmdWx8ZW58MXx8fHwxNzczNjY4MjU5fDA&ixlib=rb-4.1.0&q=80&w=1080';
  ?>

  <!-- Hero Section -->
  <section class="relative w-full overflow-hidden bg-gray-900 text-white py-20 md:py-28">
    <div class="absolute inset-0 z-0">
      <img src="<?php echo esc_url( $hero_img ); ?>" alt="Calm sunset lake" class="w-full h-full object-cover opacity-35" loading="eager" />
      <div class="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent"></div>
    </div>

    <div class="relative z-10 max-w-[1200px] mx-auto px-4 text-center">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-6">
        <i data-lucide="shield-check" class="w-4 h-4"></i>
        iKAN for Organisations
      </div>

      <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
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
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 mt-2 mb-4">
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
          <p class="text-xs text-gray-500 mt-2 font-medium">
            Post-Equip 8-week cohorts
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">Team Adoption</span>
            <i data-lucide="users" class="w-5 h-5 text-indigo-600"></i>
          </div>
          <div class="text-3xl font-extrabold text-gray-900">82%</div>
          <p class="text-xs text-gray-500 mt-2 font-medium">
            Monthly active participation
          </p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center justify-between text-gray-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-gray-500">Privacy Safeguard</span>
            <i data-lucide="shield" class="w-5 h-5 text-teal-600"></i>
          </div>
          <div class="text-3xl font-extrabold text-gray-900">k &ge; 5</div>
          <p class="text-xs text-teal-700 mt-2 font-medium">
            100% individual anonymity
          </p>
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

  <!-- What iKAN Offers Organisations -->
  <section class="py-16 md:py-20 bg-white">
    <div class="max-w-[1200px] mx-auto px-4">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          A Complete Workplace Wellbeing System
        </h2>
        <p class="text-gray-600 text-sm md:text-base">
          Unlike generic wellness apps, iKAN is built on clinically validated diagnostic tools and evidence-based mental fitness programs.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
              <i data-lucide="clipboard-check" class="w-6 h-6"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">Validated Assessments</h4>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              Employees get confidential access to clinically validated self-assessments (PHQ-9, GAD-7, and GHQ-12) to understand their baseline anxiety and stress without stigma.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
            See all assessments &rarr;
          </a>
        </div>

        <!-- Feature 2 -->
        <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6">
              <i data-lucide="layers" class="w-6 h-6"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">Equip Cohort Programs</h4>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              Structured 4 to 8-week mental fitness programs covering burnout recovery, stress mastery, sleep hygiene, and emotional resilience for modern workplaces.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
            Explore Equip programs &rarr;
          </a>
        </div>

        <!-- Feature 3 -->
        <div class="p-8 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <i data-lucide="user-check" class="w-6 h-6"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">1-on-1 Clinical Care</h4>
            <p class="text-sm text-gray-600 leading-relaxed mb-4">
              Licensed clinical psychologists, counselors, and psychotherapists available for confidential 1-on-1 virtual sessions when members need professional care.
            </p>
          </div>
          <a href="<?php echo esc_url( home_url( '/consultation' ) ); ?>" class="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
            Book consultations &rarr;
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Request Demo / Lead Capture Section -->
  <section id="request-demo" class="py-16 md:py-24 bg-gray-50">
    <div class="max-w-[800px] mx-auto px-4">
      <div class="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
        <div class="text-center mb-8">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-600">Partner with iKAN</span>
          <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-3">
            Schedule an Organisation Consultation
          </h3>
          <p class="text-gray-600 text-sm leading-relaxed">
            Fill out the form below and our workplace wellbeing team will tailor an onboarding plan and pilot for your company.
          </p>
        </div>

        <?php if ( shortcode_exists( 'fluentform' ) ): ?>
          <?php echo do_shortcode( '[fluentform id="1"]' ); ?>
        <?php else: ?>
          <form method="post" action="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="space-y-4">
            <input type="hidden" name="org_inquiry" value="1" />
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Your Name</label>
                <input type="text" name="name" required placeholder="Priya Sharma" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Work Email</label>
                <input type="email" name="email" required placeholder="priya@company.com" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Organisation / Company Name</label>
                <input type="text" name="company" required placeholder="Acme Technologies" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">Team Size</label>
                <select name="team_size" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none bg-white">
                  <option value="10-50">10 – 50 employees</option>
                  <option value="51-200" selected>51 – 200 employees</option>
                  <option value="201-1000">201 – 1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">How can we help your team?</label>
              <textarea name="message" rows="4" placeholder="Tell us about your team's wellbeing goals, challenges, or pilot timeline..." class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none resize-none"></textarea>
            </div>

            <button type="submit" class="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors shadow-md">
              Send Organisation Inquiry
            </button>
          </form>
        <?php endif; ?>

        <div class="mt-8 pt-6 border-t border-gray-100 text-center">
          <p class="text-xs text-gray-500">
            Already an administrator? Visit <a href="mailto:support@ikanhealth.in" class="text-blue-600 font-semibold underline">support@ikanhealth.in</a> or sign into the member app.
          </p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>
