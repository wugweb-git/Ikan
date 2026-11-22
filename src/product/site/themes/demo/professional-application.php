<?php
/**
 * Template Name: Professional Application
 * Template Post Type: page
 * Description: Authentic 11-Step Clinical Provider Application — 1:1 match with ProfessionalApplication.tsx
 */

$assets = ikan_get_vite_assets();
$vite_js = $assets['js'];
$vite_css = $assets['css'];

get_header(); ?>

<main id="main-content" tabindex="-1" class="flex-1 w-full relative outline-none p-[0px]" role="main" aria-label="Page content">
  <div class="ikan2-theme ikan2-type accent-calm info-page site-page-below-nav wizard">

    <!-- ── Intro Hero Header ── -->
    <section class="info-band">
      <div class="info-band__inner">
        <p class="info-eyebrow">Partner With iKAN</p>
        <h1 class="info-title">Join our mental health provider network</h1>
        <p class="info-subtitle">
          Provide therapy, counselling, and psychiatric consultations with complete scheduling flexibility, guaranteed prompt payouts, and a supportive clinical ecosystem.
        </p>
      </div>
    </section>

    <!-- ── Wizard Container ── -->
    <div class="wizard__body">
      <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">

        <!-- ── Desktop Navigation Rail (Matches ProfessionalApplication.tsx) ── -->
        <aside class="hidden lg:block sticky top-28 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">Application Steps</p>
          <ol class="space-y-1 select-list" id="wizard-rail-list">
            <?php
            $steps = [
              'Basic Information',
              'Qualifications & Verification',
              'Practice Information',
              'Clinical Expertise',
              'Client Preferences',
              'Therapy Style',
              'Cultural Competence',
              'Availability & Fees',
              'Publications & Contributions',
              'Media',
              'Public Profile',
            ];
            foreach ( $steps as $idx => $step_name ) :
              $step_num = $idx + 1;
              $active_class = ( $idx === 0 ) ? 'bg-gray-900 text-white font-semibold' : 'text-gray-600 hover:bg-gray-50';
            ?>
              <li>
                <button type="button" class="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors wizard-step-btn <?php echo $active_class; ?>" data-step="<?php echo $idx; ?>">
                  <span class="w-5 h-5 rounded-full flex items-center justify-center border text-[10px] shrink-0 <?php echo $idx === 0 ? 'border-white text-white' : 'border-gray-300 text-gray-500'; ?>">
                    <?php echo $step_num; ?>
                  </span>
                  <span class="truncate"><?php echo esc_html( $step_name ); ?></span>
                </button>
              </li>
            <?php endforeach; ?>
          </ol>
        </aside>

        <!-- ── Interactive Form Card ── -->
        <div class="bg-white p-6 sm:p-8 md:p-10 rounded-[24px] border border-gray-200/90 shadow-sm wizard__card">

          <!-- Mobile Step Pill Counter -->
          <div class="flex items-center justify-between pb-6 mb-6 border-b border-gray-100">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-emerald-700" id="current-step-counter">Step 1 of 11</span>
              <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 mt-0.5" id="current-step-title">Basic Information</h2>
            </div>
            <span class="text-xs text-gray-400 font-medium hidden sm:inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <i data-lucide="save" class="w-3.5 h-3.5 text-gray-400"></i> Draft auto-saved
            </span>
          </div>

          <!-- Application Form -->
          <form id="partner-application-form" class="space-y-6">

            <!-- STEP 1: Basic Information -->
            <div class="wizard-pane space-y-5" data-pane="0">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Full Name *</label>
                  <input type="text" name="full_name" required placeholder="Dr. / Ms. / Mr. Full Name" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Email Address *</label>
                  <input type="email" name="email" required placeholder="doctor@practice.com" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Phone Number *</label>
                  <input type="tel" name="phone" required placeholder="+91 98765 43210" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">PIN Code (India Post auto-lookup) *</label>
                  <input type="text" id="partner-pin" name="pincode" maxlength="6" required placeholder="411001" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                  <span id="pin-status" class="text-xs text-gray-500 mt-1 block">Fills in your city and state.</span>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">City *</label>
                  <input type="text" id="partner-city" name="city" required placeholder="e.g. Pune" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">State *</label>
                  <input type="text" id="partner-state" name="state" required placeholder="e.g. Maharashtra" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>
              </div>
            </div>

            <!-- STEP 2: Qualifications & Verification -->
            <div class="wizard-pane space-y-5 hidden" data-pane="1">
              <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <i data-lucide="shield-check" class="w-4 h-4 text-amber-700 shrink-0 mt-0.5"></i>
                <div>
                  <strong>Verification details:</strong> Kept strictly confidential by our clinical credentialing board and never exposed on your public profile.
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Highest Qualification *</label>
                  <select name="highest_qualification" required class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors">
                    <option value="">Select qualification</option>
                    <option value="M.Phil Clinical Psychology">M.Phil Clinical Psychology (RCI recognized)</option>
                    <option value="Psy.D Clinical Psychology">Psy.D Clinical Psychology</option>
                    <option value="Ph.D Psychology">Ph.D Psychology</option>
                    <option value="M.D. Psychiatry">M.D. Psychiatry / D.P.M.</option>
                    <option value="M.A. / M.Sc. Applied Psychology">M.A. / M.Sc. Applied Psychology</option>
                    <option value="M.A. / M.Sc. Counselling Psychology">M.A. / M.Sc. Counselling Psychology</option>
                    <option value="Other">Other postgraduate clinical degree</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Registration Council / Body</label>
                  <select name="registration_body" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors">
                    <option value="">Select council (if applicable)</option>
                    <option value="Rehabilitation Council of India (RCI)">Rehabilitation Council of India (RCI)</option>
                    <option value="National Medical Commission (NMC)">National Medical Commission (NMC)</option>
                    <option value="State Medical Council">State Medical Council</option>
                    <option value="Indian Association of Clinical Psychologists (IACP)">Indian Association of Clinical Psychologists (IACP)</option>
                    <option value="None / Not Required">Not applicable to my category</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Registration / License Number</label>
                  <input type="text" name="license_number" placeholder="e.g. CRR / MCI / SMC number" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">University / Awarding Institution *</label>
                  <input type="text" name="institution" required placeholder="e.g. NIMHANS, CIP, TISS, Delhi University" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>
              </div>
            </div>

            <!-- STEP 3: Practice Information -->
            <div class="wizard-pane space-y-5 hidden" data-pane="2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Years of Post-Qualification Practice *</label>
                  <select name="years_experience" required class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors">
                    <option value="">Select experience</option>
                    <option value="1-3">1 – 3 years</option>
                    <option value="4-7">4 – 7 years</option>
                    <option value="8-12">8 – 12 years</option>
                    <option value="12+">12+ years</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Primary Practice Setting</label>
                  <select name="practice_setting" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors">
                    <option value="Private Practice">Private Practice</option>
                    <option value="Hospital / Clinic">Hospital / Multi-specialty Clinic</option>
                    <option value="Academic Institution">Academic / University Counselling</option>
                    <option value="Tele-health Only">Online / Tele-health Practice</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- STEP 4 to 11: Clinical Expertise, Style & Availability -->
            <div class="wizard-pane space-y-5 hidden" data-pane="3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Primary Clinical Areas (Select all that apply) *</label>
                <div class="flex flex-wrap gap-2">
                  <?php
                  $areas = ['Anxiety & Panic', 'Depression & Mood', 'Workplace Burnout & Stress', 'Trauma & PTSD', 'OCD', 'Relationship & Marriage', 'Grief & Loss', 'ADHD & Neurodivergence', 'Sleep Disorders', 'LGBTQ+ Affirmative'];
                  foreach ($areas as $a) : ?>
                    <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium cursor-pointer hover:bg-gray-100 has-checked:bg-emerald-700 has-checked:text-white has-checked:border-emerald-700 transition-colors">
                      <input type="checkbox" name="expertise[]" value="<?php echo esc_attr( $a ); ?>" class="hidden">
                      <span><?php echo esc_html( $a ); ?></span>
                    </label>
                  <?php endforeach; ?>
                </div>
              </div>
            </div>

            <div class="wizard-pane space-y-5 hidden" data-pane="4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Client Demographics Treated *</label>
                <div class="flex flex-wrap gap-2">
                  <?php
                  $clients = ['Adults (18–64)', 'Young Adults (18–25)', 'Adolescents (13–17)', 'Couples', 'Corporate / Executives', 'Geriatric (65+)'];
                  foreach ($clients as $c) : ?>
                    <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium cursor-pointer hover:bg-gray-100 has-checked:bg-emerald-700 has-checked:text-white has-checked:border-emerald-700 transition-colors">
                      <input type="checkbox" name="clients[]" value="<?php echo esc_attr( $c ); ?>" class="hidden">
                      <span><?php echo esc_html( $c ); ?></span>
                    </label>
                  <?php endforeach; ?>
                </div>
              </div>
            </div>

            <div class="wizard-pane space-y-5 hidden" data-pane="5">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Therapeutic Modalities *</label>
                <div class="flex flex-wrap gap-2">
                  <?php
                  $styles = ['Cognitive Behavioural Therapy (CBT)', 'Acceptance & Commitment (ACT)', 'Mindfulness-Based (MBCT)', 'Psychodynamic Therapy', 'Compassion Focused', 'Humanistic / Person-Centered', 'EMDR', 'Schema Therapy'];
                  foreach ($styles as $s) : ?>
                    <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium cursor-pointer hover:bg-gray-100 has-checked:bg-emerald-700 has-checked:text-white has-checked:border-emerald-700 transition-colors">
                      <input type="checkbox" name="modalities[]" value="<?php echo esc_attr( $s ); ?>" class="hidden">
                      <span><?php echo esc_html( $s ); ?></span>
                    </label>
                  <?php endforeach; ?>
                </div>
              </div>
            </div>

            <div class="wizard-pane space-y-5 hidden" data-pane="6">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">Languages of Clinical Fluency *</label>
                <div class="flex flex-wrap gap-2">
                  <?php
                  $langs = ['English', 'Hindi', 'Bengali', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Gujarati', 'Punjabi', 'Urdu'];
                  foreach ($langs as $l) : ?>
                    <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium cursor-pointer hover:bg-gray-100 has-checked:bg-emerald-700 has-checked:text-white has-checked:border-emerald-700 transition-colors">
                      <input type="checkbox" name="languages[]" value="<?php echo esc_attr( $l ); ?>" class="hidden">
                      <span><?php echo esc_html( $l ); ?></span>
                    </label>
                  <?php endforeach; ?>
                </div>
              </div>
            </div>

            <div class="wizard-pane space-y-5 hidden" data-pane="7">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Standard 50-Min Session Fee (₹) *</label>
                  <input type="number" name="session_fee" required placeholder="e.g. 1500" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Weekly Availability for iKAN (Hours/Week)</label>
                  <select name="weekly_hours" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors">
                    <option value="4-8">4 – 8 hours / week</option>
                    <option value="8-15">8 – 15 hours / week</option>
                    <option value="15-25">15 – 25 hours / week</option>
                    <option value="25+">25+ hours / week (Full-time network)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="wizard-pane space-y-5 hidden" data-pane="8">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Publications, Research or Book Chapters (Optional)</label>
                <textarea name="publications" rows="3" placeholder="List any relevant publications, papers, or clinical talks..." class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none resize-none transition-colors"></textarea>
              </div>
            </div>

            <div class="wizard-pane space-y-5 hidden" data-pane="9">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Introductory Video Link (Optional)</label>
                <input type="url" name="video_url" placeholder="YouTube or Vimeo unlisted link introducing your approach" class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
                <span class="text-xs text-gray-400 mt-1 block">Help clients connect with your presence and tone before booking.</span>
              </div>
            </div>

            <div class="wizard-pane space-y-5 hidden" data-pane="10">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Public Clinical Bio (250–300 words) *</label>
                <textarea name="bio" rows="6" required placeholder="Describe your therapeutic philosophy, approach to sessions, and what clients can expect when working with you..." class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none resize-none transition-colors"></textarea>
              </div>
            </div>

            <!-- Error Banner (Fail Case) -->
            <div id="partner-error-banner" class="hidden p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 text-left my-4">
              <div class="flex items-start gap-3">
                <span class="text-red-600 font-bold text-lg leading-none">&#9888;</span>
                <div class="text-sm">
                  <p class="font-semibold text-red-900" id="partner-error-title">Submission Could Not Be Completed</p>
                  <p class="mt-1 text-red-800" id="partner-error-message">An error occurred while submitting your application.</p>
                  <p class="mt-2 text-xs text-red-600">Your information is safely saved on this device. Please check your connection and click <strong>Submit Application</strong> to try again.</p>
                </div>
              </div>
            </div>

            <!-- Wizard Bottom Actions -->
            <div class="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
              <button type="button" id="wizard-prev-btn" class="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors disabled:opacity-40" disabled>
                &larr; Back
              </button>

              <button type="button" id="wizard-next-btn" class="px-7 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2">
                <span id="wizard-next-text">Next Step &rarr;</span>
                <svg id="wizard-spinner" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white hidden" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </div>

          </form>

          <!-- Submission Confirmation Screen -->
          <div id="partner-success-pane" class="py-12 text-center space-y-4 hidden">
            <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <i data-lucide="check-circle" class="w-9 h-9"></i>
            </div>
            <h3 class="text-2xl font-bold text-gray-900">Application Received</h3>
            <p class="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Thank you for applying to the iKAN mental health provider network. Our clinical credentialing committee reviews all applications within 3–5 business days. We will contact you at your provided email address.
            </p>
            <div class="pt-4">
              <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-900 text-white text-xs font-bold">
                Return to Homepage &rarr;
              </a>
            </div>
          </div>

        </div><!-- /.wizard__card -->

      </div>
    </div><!-- /.wizard__body -->

  </div><!-- /.wizard -->
</main>

<!-- Interactive 11-Step Engine + Draft Storage + India Post Lookup -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const steps = [
    'Basic Information',
    'Qualifications & Verification',
    'Practice Information',
    'Clinical Expertise',
    'Client Preferences',
    'Therapy Style',
    'Cultural Competence',
    'Availability & Fees',
    'Publications & Contributions',
    'Media',
    'Public Profile'
  ];

  let currentStep = 0;
  const form = document.getElementById('partner-application-form');
  const panes = document.querySelectorAll('.wizard-pane');
  const railBtns = document.querySelectorAll('.wizard-step-btn');
  const stepCounter = document.getElementById('current-step-counter');
  const stepTitle = document.getElementById('current-step-title');
  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');
  const nextText = document.getElementById('wizard-next-text');
  const pinInput = document.getElementById('partner-pin');
  const pinStatus = document.getElementById('pin-status');
  const cityInput = document.getElementById('partner-city');
  const stateInput = document.getElementById('partner-state');
  const successPane = document.getElementById('partner-success-pane');
  const spinner = document.getElementById('wizard-spinner');

  const DRAFT_KEY = 'ikan.partner-application.draft.v1';

  // Restore Draft from localStorage
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const draft = JSON.parse(raw);
      if (draft.fields) {
        Object.keys(draft.fields).forEach(key => {
          const el = form.elements[key];
          if (el) {
            if (el.type === 'checkbox') el.checked = draft.fields[key];
            else el.value = draft.fields[key];
          }
        });
      }
      if (typeof draft.step === 'number' && draft.step < steps.length) {
        currentStep = draft.step;
      }
    }
  } catch (e) {}

  function saveDraft() {
    try {
      const data = {};
      Array.from(form.elements).forEach(el => {
        if (el.name) {
          if (el.type === 'checkbox') {
            if (!data[el.name]) data[el.name] = [];
            if (el.checked) data[el.name].push(el.value);
          } else {
            data[el.name] = el.value;
          }
        }
      });
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: currentStep, fields: data, updated_at: Date.now() }));
    } catch (e) {}
  }

  function updateView() {
    panes.forEach((p, idx) => {
      p.classList.toggle('hidden', idx !== currentStep);
    });

    stepCounter.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    stepTitle.textContent = steps[currentStep];

    railBtns.forEach((btn, idx) => {
      if (idx === currentStep) {
        btn.className = 'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors wizard-step-btn bg-gray-900 text-white font-semibold';
      } else {
        btn.className = 'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors wizard-step-btn text-gray-600 hover:bg-gray-50';
      }
    });

    prevBtn.disabled = currentStep === 0;
    if (currentStep === steps.length - 1) {
      nextText.textContent = 'Submit Application';
    } else {
      nextText.textContent = 'Next Step \u2192';
    }

    if (window.lucide && lucide.createIcons) lucide.createIcons();
    saveDraft();
  }

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateView();
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    }
  });

  nextBtn.addEventListener('click', async () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      updateView();
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    } else {
      // Submit Application
      const errBanner = document.getElementById('partner-error-banner');
      const errMsg = document.getElementById('partner-error-message');
      if (errBanner) errBanner.classList.add('hidden');

      spinner.classList.remove('hidden');
      nextBtn.disabled = true;

      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());

      try {
        const res = await fetch('/wp-json/ikan/v1/partner-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || result.code) {
          throw new Error(result.message || 'Server error while submitting application.');
        }

        localStorage.removeItem(DRAFT_KEY);
        spinner.classList.add('hidden');
        form.classList.add('hidden');
        successPane.classList.remove('hidden');
        if (window.lucide && lucide.createIcons) lucide.createIcons();
      } catch (err) {
        spinner.classList.add('hidden');
        nextBtn.disabled = false;
        if (errBanner && errMsg) {
          errMsg.textContent = err.message || 'Network error. Please try again.';
          errBanner.classList.remove('hidden');
          errBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          alert(err.message || 'Network error. Please try again.');
        }
      }
    }
  });

  railBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const target = parseInt(this.getAttribute('data-step'), 10);
      if (!isNaN(target)) {
        currentStep = target;
        updateView();
      }
    });
  });

  // India Post PIN lookup
  if (pinInput) {
    pinInput.addEventListener('input', function() {
      const pin = this.value.trim();
      if (pin.length === 6 && /^\d+$/.test(pin)) {
        pinStatus.textContent = 'Looking up postal district\u2026';
        fetch(`https://api.postalpincode.in/pincode/${pin}`)
          .then(r => r.json())
          .then(res => {
            if (res && res[0] && res[0].Status === 'Success' && res[0].PostOffice && res[0].PostOffice.length) {
              const po = res[0].PostOffice[0];
              if (cityInput && !cityInput.value) cityInput.value = po.District;
              if (stateInput && !stateInput.value) stateInput.value = po.State;
              pinStatus.textContent = `Found: ${po.District}, ${po.State}`;
              saveDraft();
            } else {
              pinStatus.textContent = 'Unknown PIN code. Please fill city & state.';
            }
          })
          .catch(() => {
            pinStatus.textContent = 'Could not lookup PIN right now.';
          });
      }
    });
  }

  updateView();
});
</script>

<!-- Vite React SPA Module Mount -->
<script type="module" crossorigin src="<?php echo esc_url( $vite_js ); ?>"></script>

<?php get_footer(); ?>
