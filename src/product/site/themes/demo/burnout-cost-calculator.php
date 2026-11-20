<?php
/**
 * Template Name: Burnout Cost Calculator
 * Template Post Type: page
 * Description: Authentic iKAN Employer Burnout Cost Calculator matching BurnoutCostCalculator.tsx (v2.1)
 */

get_header(); ?>

<main class="w-full flex-1 pt-28 pb-20" style="background-color: var(--canvas); font-family: var(--font-sans);">

  <!-- Hero Section -->
  <section class="max-w-4xl mx-auto px-6 text-center mb-12">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-4">
      <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
      Workplace Economics • Model v2.1
    </div>

    <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-4" style="font-family: var(--font-display); letter-spacing: -0.02em;">
      Burnout Cost Calculator
    </h1>
    
    <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
      Estimate the hidden financial toll of employee burnout on turnover, absenteeism, and lost productivity for Indian organizations.
    </p>
  </section>

  <!-- Interactive Calculator Container -->
  <section class="max-w-4xl mx-auto px-6">
    <div class="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm space-y-8">
      
      <!-- Sector Selection -->
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3" style="font-family: var(--font-display);">
          Select Industry Sector
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="calc-sectors">
          <button type="button" data-sector="saas" class="calc-sec-btn px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold shadow-xs">SaaS / Software</button>
          <button type="button" data-sector="fintech" class="calc-sec-btn px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-left hover:border-gray-300 text-gray-700 transition-all">Fintech</button>
          <button type="button" data-sector="d2c" class="calc-sec-btn px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-left hover:border-gray-300 text-gray-700 transition-all">D2C / E-com</button>
          <button type="button" data-sector="edtech" class="calc-sec-btn px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-left hover:border-gray-300 text-gray-700 transition-all">Edtech / Health</button>
          <button type="button" data-sector="agency" class="calc-sec-btn px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-left hover:border-gray-300 text-gray-700 transition-all">Agency / Creative</button>
          <button type="button" data-sector="it-services" class="calc-sec-btn px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-left hover:border-gray-300 text-gray-700 transition-all">IT Services</button>
          <button type="button" data-sector="bpm" class="calc-sec-btn px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-left hover:border-gray-300 text-gray-700 transition-all">BPM / Operations</button>
          <button type="button" data-sector="other" class="calc-sec-btn px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-left hover:border-gray-300 text-gray-700 transition-all">Other Industries</button>
        </div>
      </div>

      <!-- Headcount & CTC Inputs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
        
        <!-- Headcount -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-gray-700">Team Headcount</label>
            <span id="headcount-val-display" class="text-sm font-bold text-gray-900">50 employees</span>
          </div>
          <input 
            type="range" 
            id="calc-headcount" 
            min="10" 
            max="1000" 
            step="5" 
            value="50" 
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-3"
          />
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">Quick set:</span>
            <button type="button" class="calc-quick-head text-xs px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium" data-val="25">25</button>
            <button type="button" class="calc-quick-head text-xs px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold" data-val="50">50</button>
            <button type="button" class="calc-quick-head text-xs px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium" data-val="100">100</button>
            <button type="button" class="calc-quick-head text-xs px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium" data-val="250">250</button>
          </div>
        </div>

        <!-- Average CTC -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-gray-700">Average Annual CTC</label>
            <span id="ctc-val-display" class="text-sm font-bold text-gray-900">₹12 Lakhs</span>
          </div>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm font-bold">₹</span>
            <input 
              type="number" 
              id="calc-ctc" 
              value="12" 
              min="2" 
              max="100" 
              step="0.5" 
              class="w-full pl-8 pr-16 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
            />
            <span class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 text-xs font-medium">Lakhs / yr</span>
          </div>
          <p class="text-[11px] text-gray-400 mt-2">Adjust based on your team's average compensation.</p>
        </div>

      </div>

      <!-- Stress Level Selector -->
      <div class="pt-4 border-t border-gray-100">
        <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-3">Workplace Stress Perception</label>
        <div class="grid grid-cols-3 gap-3">
          <label class="calc-stress-label p-3 rounded-2xl border border-gray-200 text-center cursor-pointer hover:border-gray-300 transition-all flex flex-col items-center gap-1">
            <input type="radio" name="calc-stress" value="low" class="sr-only">
            <span class="text-xs font-bold text-gray-800">Low (13%)</span>
            <span class="text-[10px] text-gray-400">Healthy workload</span>
          </label>
          <label class="calc-stress-label p-3 rounded-2xl border border-emerald-500 bg-emerald-50/50 text-center cursor-pointer transition-all flex flex-col items-center gap-1">
            <input type="radio" name="calc-stress" value="medium" checked class="sr-only">
            <span class="text-xs font-bold text-emerald-950">Medium (28%)</span>
            <span class="text-[10px] text-emerald-700">Typical tech/growth pace</span>
          </label>
          <label class="calc-stress-label p-3 rounded-2xl border border-gray-200 text-center cursor-pointer hover:border-gray-300 transition-all flex flex-col items-center gap-1">
            <input type="radio" name="calc-stress" value="high" class="sr-only">
            <span class="text-xs font-bold text-gray-800">High (45%)</span>
            <span class="text-[10px] text-gray-400">High churn / intense sprints</span>
          </label>
        </div>
      </div>

      <!-- Real-time Calculation Results Display -->
      <div class="p-6 sm:p-8 rounded-3xl bg-gray-900 text-white space-y-6">
        
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1" style="font-family: var(--font-display);">Estimated Annual Cost of Burnout</p>
            <h2 id="result-cost-range" class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white" style="font-family: var(--font-display);">
              ₹22.5L – ₹41.2L
            </h2>
          </div>
          <div class="text-left sm:text-right">
            <p class="text-xs text-gray-400 mb-1">Per Employee / Year</p>
            <p id="result-per-employee" class="text-xl font-bold text-emerald-300">₹63,700</p>
          </div>
        </div>

        <!-- 3-Way Split Bar -->
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs text-gray-400">
            <span>Cost Breakdown</span>
            <span id="result-payroll-share" class="font-semibold text-gray-300">5.3% of total annual payroll</span>
          </div>
          
          <div class="h-3 w-full bg-gray-800 rounded-full overflow-hidden flex">
            <div id="bar-turnover" class="h-full bg-rose-500 transition-all duration-300" style="width: 45%;" title="Turnover"></div>
            <div id="bar-presenteeism" class="h-full bg-amber-400 transition-all duration-300" style="width: 40%;" title="Presenteeism"></div>
            <div id="bar-absenteeism" class="h-full bg-teal-400 transition-all duration-300" style="width: 15%;" title="Absenteeism"></div>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-2 text-[11px]">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span class="text-gray-300">Turnover / Exits:</span>
              <strong id="val-turnover" class="text-white ml-auto">₹14.2L</strong>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span class="text-gray-300">Presenteeism:</span>
              <strong id="val-presenteeism" class="text-white ml-auto">₹12.6L</strong>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <span class="text-gray-300">Absenteeism:</span>
              <strong id="val-absenteeism" class="text-white ml-auto">₹4.8L</strong>
            </div>
          </div>
        </div>

      </div>

      <!-- Pilot Inquiry Form (FluentCRM Integrated) -->
      <div id="pilot" class="pt-6 border-t border-gray-100">
        <div class="max-w-xl mx-auto space-y-4">
          <div class="text-center mb-6">
            <h3 class="text-xl font-bold text-gray-900" style="font-family: var(--font-display);">Request a Custom Burnout Audit & Pilot</h3>
            <p class="text-xs text-gray-500">We'll benchmark your team's specific risk and share a tailored 14-day wellness intervention plan.</p>
          </div>

          <form id="calc-pilot-form" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
                <input type="text" id="pilot-name" name="name" required placeholder="Aarav Sharma" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Work Email *</label>
                <input type="email" id="pilot-email" name="email" required placeholder="aarav@company.com" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Company / Organization *</label>
                <input type="text" id="pilot-company" name="company" required placeholder="Acme Technologies" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Phone / WhatsApp *</label>
                <input type="tel" id="pilot-phone" name="phone" required placeholder="+91 98765 43210" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Specific concerns or team goals (Optional)</label>
              <textarea id="pilot-message" name="message" rows="2" placeholder="e.g. Q3 product sprint fatigue, post-funding churn..." class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>

            <button 
              type="submit" 
              id="pilot-submit" 
              class="w-full py-3.5 rounded-full font-semibold text-sm text-white shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              style="background-color: var(--foreground);"
            >
              <span>Get Detailed Report & Consultation</span>
              <span id="pilot-spinner" class="hidden">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </span>
            </button>

            <!-- Success Card -->
            <div id="pilot-success" class="hidden p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium">
              ✅ Thank you! Your pilot request and burnout estimate have been received. An iKAN Workplace Specialist will contact you within 24 hours.
            </div>

            <!-- Failure Banner -->
            <div id="pilot-failure" class="hidden p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm font-medium">
              ⚠️ Unable to submit inquiry. Please check required fields and try again.
            </div>
          </form>
        </div>
      </div>

    </div>
  </section>

</main>

<script>
  (function() {
    const SECTORS = {
      saas: { ctc: 12, attrition: 0.19, stress: 'medium', replacement: 0.6 },
      fintech: { ctc: 12, attrition: 0.25, stress: 'high', replacement: 0.6 },
      d2c: { ctc: 8, attrition: 0.3, stress: 'medium', replacement: 0.45 },
      edtech: { ctc: 9, attrition: 0.3, stress: 'high', replacement: 0.45 },
      agency: { ctc: 7, attrition: 0.33, stress: 'high', replacement: 0.4 },
      'it-services': { ctc: 7, attrition: 0.16, stress: 'medium', replacement: 0.5 },
      bpm: { ctc: 4.5, attrition: 0.38, stress: 'high', replacement: 0.35 },
      other: { ctc: 8, attrition: 0.18, stress: 'medium', replacement: 0.4 }
    };

    const PREVALENCE = { low: 0.13, medium: 0.28, high: 0.45 };
    const WORKING_DAYS = 250;

    let currentSector = 'saas';
    let headcount = 50;
    let ctcLakh = 12;
    let stress = 'medium';

    function calculate() {
      // Base scenario formula (v2.1)
      const leavers = headcount * SECTORS[currentSector].attrition * 0.25;
      const turnoverLakh = leavers * ctcLakh * SECTORS[currentSector].replacement * 1.0;
      const affected = headcount * PREVALENCE[stress] * 1.0;
      const absenteeismLakh = (affected * 2.0 * ctcLakh) / WORKING_DAYS;
      const presenteeismLakh = Math.max(0, affected - leavers) * 0.06 * ctcLakh;
      const baseTotal = turnoverLakh + presenteeismLakh + absenteeismLakh;

      // Low & High scenario bounds (0.7x to 1.35x)
      const lowTotal = baseTotal * 0.68;
      const highTotal = baseTotal * 1.35;

      const payrollLakh = headcount * ctcLakh;
      const payrollShare = payrollLakh > 0 ? ((baseTotal / payrollLakh) * 100).toFixed(1) : '0';
      const perEmployee = headcount > 0 ? Math.round((baseTotal * 100000) / headcount) : 0;

      // Update UI
      const formatL = (v) => v >= 100 ? `₹${(v / 100).toFixed(1)} Cr` : `₹${v.toFixed(1)}L`;
      document.getElementById('result-cost-range').textContent = `${formatL(lowTotal)} – ${formatL(highTotal)}`;
      document.getElementById('result-per-employee').textContent = `₹${new Intl.NumberFormat('en-IN').format(perEmployee)}`;
      document.getElementById('result-payroll-share').textContent = `${payrollShare}% of total annual payroll`;

      const tShare = (turnoverLakh / baseTotal) * 100;
      const pShare = (presenteeismLakh / baseTotal) * 100;
      const aShare = (absenteeismLakh / baseTotal) * 100;

      document.getElementById('bar-turnover').style.width = `${tShare}%`;
      document.getElementById('bar-presenteeism').style.width = `${pShare}%`;
      document.getElementById('bar-absenteeism').style.width = `${aShare}%`;

      document.getElementById('val-turnover').textContent = formatL(turnoverLakh);
      document.getElementById('val-presenteeism').textContent = formatL(presenteeismLakh);
      document.getElementById('val-absenteeism').textContent = formatL(absenteeismLakh);
    }

    // Sector buttons click
    const secBtns = document.querySelectorAll('.calc-sec-btn');
    secBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        secBtns.forEach(b => {
          b.className = 'calc-sec-btn px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-left hover:border-gray-300 text-gray-700 transition-all';
        });
        this.className = 'calc-sec-btn px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-xs';
        currentSector = this.getAttribute('data-sector');
        ctcLakh = SECTORS[currentSector].ctc;
        document.getElementById('calc-ctc').value = ctcLakh;
        document.getElementById('ctc-val-display').textContent = `₹${ctcLakh} Lakhs`;
        calculate();
      });
    });

    // Headcount slider
    const hcSlider = document.getElementById('calc-headcount');
    const hcDisplay = document.getElementById('headcount-val-display');
    hcSlider.addEventListener('input', function() {
      headcount = parseInt(this.value, 10);
      hcDisplay.textContent = `${headcount} employees`;
      calculate();
    });

    // Quick headcount buttons
    document.querySelectorAll('.calc-quick-head').forEach(btn => {
      btn.addEventListener('click', function() {
        headcount = parseInt(this.getAttribute('data-val'), 10);
        hcSlider.value = headcount;
        hcDisplay.textContent = `${headcount} employees`;
        calculate();
      });
    });

    // CTC input
    const ctcInput = document.getElementById('calc-ctc');
    ctcInput.addEventListener('input', function() {
      const v = parseFloat(this.value);
      if (!isNaN(v) && v > 0) {
        ctcLakh = v;
        document.getElementById('ctc-val-display').textContent = `₹${ctcLakh} Lakhs`;
        calculate();
      }
    });

    // Stress radio inputs
    document.querySelectorAll('input[name="calc-stress"]').forEach(r => {
      r.addEventListener('change', function() {
        stress = this.value;
        document.querySelectorAll('.calc-stress-label').forEach(lbl => {
          lbl.className = 'calc-stress-label p-3 rounded-2xl border border-gray-200 text-center cursor-pointer hover:border-gray-300 transition-all flex flex-col items-center gap-1';
        });
        this.closest('.calc-stress-label').className = 'calc-stress-label p-3 rounded-2xl border border-emerald-500 bg-emerald-50/50 text-center cursor-pointer transition-all flex flex-col items-center gap-1';
        calculate();
      });
    });

    // Pilot Form Submit -> FluentCRM
    const pilotForm = document.getElementById('calc-pilot-form');
    if (pilotForm) {
      pilotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const submitBtn = document.getElementById('pilot-submit');
        const spinner = document.getElementById('pilot-spinner');
        const successCard = document.getElementById('pilot-success');
        const failBanner = document.getElementById('pilot-failure');

        submitBtn.disabled = true;
        spinner.classList.remove('hidden');
        failBanner.classList.add('hidden');
        successCard.classList.add('hidden');

        const formData = new FormData();
        formData.append('action', 'ikan_contact_submit');
        formData.append('name', document.getElementById('pilot-name').value.trim());
        formData.append('email', document.getElementById('pilot-email').value.trim());
        formData.append('phone', document.getElementById('pilot-phone').value.trim());
        formData.append('subject', 'Burnout Cost Calculator Pilot Inquiry - ' + document.getElementById('pilot-company').value.trim());
        
        const message = `[Burnout Calculator Lead]\nCompany: ${document.getElementById('pilot-company').value}\nSector: ${currentSector}\nHeadcount: ${headcount}\nAverage CTC: ₹${ctcLakh}L\nStress Level: ${stress}\n\nClient Note:\n${document.getElementById('pilot-message').value}`;
        formData.append('message', message);

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
            pilotForm.reset();
          } else {
            failBanner.textContent = data.data && data.data.message ? data.data.message : 'Submission failed. Please try again.';
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
    }

    // Initial calculation run
    calculate();
  })();
</script>

<?php get_footer(); ?>
