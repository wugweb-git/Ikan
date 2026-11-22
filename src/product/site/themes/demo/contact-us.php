<?php
/**
 * Template Name: Contact Us
 * Template Post Type: page
 * Description: Exact replica of iKAN mobile PWA & responsive contact layout with full validation, success, and failure states
 */

get_header(); ?>

<main class="ikan2-theme site-page-below-nav bg-canvas text-foreground pb-24 md:pb-16 min-h-screen">

  <?php
  $cms_content = get_post_meta( get_the_ID(), 'page-contact', true );
  $contact = [];
  if ( $cms_content ) {
    try { $contact = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  
  $hero_title = ! empty( $contact['heroTitle'] ) ? $contact['heroTitle'] : 'Contact us';
  $hero_subtitle = ! empty( $contact['heroSubtitle'] ) ? $contact['heroSubtitle'] : "We’re here to help. Reach out with questions, feedback, or to learn more about iKAN.";
  ?>

  <!-- Header -->
  <header class="max-w-[760px] mx-auto px-5 pt-8 md:pt-14 pb-2">
    <h1 class="font-display text-3xl md:text-5xl font-semibold leading-[1.15] tracking-tight text-gray-900"><?php echo esc_html( $hero_title ); ?></h1>
    <p class="mt-2 text-base md:text-lg leading-relaxed text-gray-600"><?php echo esc_html( $hero_subtitle ); ?></p>
  </header>

  <div class="max-w-[760px] mx-auto px-5 space-y-6 mt-4">

    <!-- Crisis Card (Matches ikan2 ShieldAlert styling) -->
    <section class="overflow-hidden rounded-[24px] bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] p-5 shadow-sm">
      <div class="flex items-start gap-3.5">
        <div class="w-8 h-8 rounded-full bg-[#FDE8E8] flex items-center justify-center shrink-0 text-[#E02424] mt-0.5">
          <i data-lucide="shield-alert" class="w-5 h-5"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-base font-bold text-[#9B1C1C]">Need urgent support?</h2>
          <p class="text-xs md:text-sm mt-1 text-[#771D1D] leading-relaxed">
            If you or someone you know is in distress or thinking about self-harm, please reach out immediately. Help is free, confidential, and available 24/7.
          </p>
          <div class="mt-4 flex flex-wrap gap-2.5">
            <a href="tel:18005990019" class="inline-flex items-center gap-2 rounded-full bg-[#9B1C1C] hover:bg-[#771D1D] px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm">
              <i data-lucide="phone" class="w-3.5 h-3.5"></i> 1800-599-0019 (KIRAN)
            </a>
            <a href="tel:9152987821" class="inline-flex items-center gap-2 rounded-full bg-[#9B1C1C] hover:bg-[#771D1D] px-4 py-2 text-xs font-bold text-white transition-colors shadow-sm">
              <i data-lucide="phone" class="w-3.5 h-3.5"></i> 9152987821 (iCALL)
            </a>
            <a href="<?php echo esc_url( home_url( '/faq#helplines' ) ); ?>" class="inline-flex items-center rounded-full border border-[#9B1C1C]/40 px-4 py-2 text-xs font-semibold text-[#9B1C1C] hover:bg-[#FDE8E8] transition-colors">
              More helplines &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Methods Grid (Matches ikan2 2-col cards) -->
    <section>
      <div class="grid grid-cols-2 gap-3 md:gap-4">
        <!-- Method 1: Email -->
        <a href="mailto:support@ikanhealth.in" class="block rounded-[20px] bg-gray-100 hover:bg-gray-200/70 p-4 transition-colors">
          <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-700 shadow-xs mb-2">
            <i data-lucide="mail" class="w-4 h-4"></i>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Email</p>
          <p class="text-xs text-gray-500 mt-0.5 hidden sm:block">Replies within 24h</p>
          <p class="text-xs sm:text-sm font-bold text-gray-900 mt-1.5 break-all">support@ikanhealth.in</p>
        </a>

        <!-- Method 2: Phone -->
        <a href="tel:+918527545503" class="block rounded-[20px] bg-gray-100 hover:bg-gray-200/70 p-4 transition-colors">
          <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-700 shadow-xs mb-2">
            <i data-lucide="phone" class="w-4 h-4"></i>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Phone</p>
          <p class="text-xs text-gray-500 mt-0.5 hidden sm:block">Mon–Fri, 9am–6pm</p>
          <p class="text-xs sm:text-sm font-bold text-gray-900 mt-1.5">+91 85275 45503</p>
        </a>

        <!-- Method 3: Clinical Care -->
        <a href="tel:+919899843330" class="block rounded-[20px] bg-gray-100 hover:bg-gray-200/70 p-4 transition-colors">
          <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-700 shadow-xs mb-2">
            <i data-lucide="heart-handshake" class="w-4 h-4"></i>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Clinical Care</p>
          <p class="text-xs text-gray-500 mt-0.5 hidden sm:block">Counselor inquiries</p>
          <p class="text-xs sm:text-sm font-bold text-gray-900 mt-1.5">+91 98998 43330</p>
        </a>

        <!-- Method 4: Organizations -->
        <a href="mailto:partners@ikanhealth.in" class="block rounded-[20px] bg-gray-100 hover:bg-gray-200/70 p-4 transition-colors">
          <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-gray-700 shadow-xs mb-2">
            <i data-lucide="building" class="w-4 h-4"></i>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Organisations</p>
          <p class="text-xs text-gray-500 mt-0.5 hidden sm:block">Workplace pilots</p>
          <p class="text-xs sm:text-sm font-bold text-gray-900 mt-1.5 break-all">partners@ikanhealth.in</p>
        </a>
      </div>
    </section>

    <!-- Message Form Section with Validation, Success, and Failure states -->
    <section class="rounded-[24px] bg-white border border-gray-200/80 p-6 md:p-8 shadow-xs" id="contact-form-container">
      <h2 class="font-display text-xl font-semibold text-gray-900 mb-1">Send us a message</h2>
      <p class="font-sans text-sm text-gray-500 mb-6">Drop us a line and our care team will get back to you promptly.</p>

      <!-- Success Scenario Card -->
      <div id="contact-success" class="hidden overflow-hidden rounded-[24px] bg-[#DFF0E8] text-[#173D2F] border border-[#B3DEC9] p-6 mb-6">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-[#B3DEC9] flex items-center justify-center text-[#173D2F] shrink-0 mt-0.5">
            <i data-lucide="check" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="font-display text-base font-semibold">Message sent successfully</h3>
            <p class="font-sans text-sm mt-1 text-[#285743]" id="contact-success-msg">
              We’ve received your message and will reply to you within 24 hours.
            </p>
          </div>
        </div>
      </div>

      <!-- Failure Alert Scenario Banner -->
      <div id="contact-failure" class="hidden rounded-xl bg-red-50 border border-red-200 text-red-800 p-4 mb-6 text-sm flex items-center gap-3">
        <i data-lucide="alert-circle" class="w-5 h-5 text-red-600 shrink-0"></i>
        <span id="contact-failure-msg" class="font-sans">Your message didn’t send. Check your connection and try again, or email us directly at support@ikanhealth.in.</span>
      </div>

      <form id="contact-form" noValidate class="space-y-4">
        <!-- Name Field -->
        <div>
          <label class="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Name <span class="text-red-500">*</span>
          </label>
          <input type="text" id="contact-name" name="name" required maxlength="60" placeholder="Your full name" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-sans focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
          <span class="text-xs text-red-500 mt-1 hidden" id="err-name"></span>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Email <span class="text-red-500">*</span>
          </label>
          <input type="email" id="contact-email" name="email" required maxlength="254" placeholder="your.email@example.com" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-sans focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
          <span class="text-xs text-red-500 mt-1 hidden" id="err-email"></span>
        </div>

        <!-- Subject Field -->
        <div>
          <label class="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Subject (optional)
          </label>
          <input type="text" id="contact-subject" name="subject" maxlength="120" placeholder="General enquiry" class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-sans focus:border-gray-900 focus:bg-white focus:outline-none transition-colors" />
        </div>

        <!-- Message Field with length counter -->
        <div>
          <div class="flex justify-between items-center mb-1.5">
            <label class="block font-sans text-xs font-semibold uppercase tracking-wider text-gray-700">
              Message <span class="text-red-500">*</span>
            </label>
            <span class="text-xs text-gray-400 tabular-nums" id="msg-counter">0/2000</span>
          </div>
          <textarea id="contact-message" name="message" rows="5" required maxlength="2000" placeholder="Write a little more so we can help (10 characters or more)..." class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-sans focus:border-gray-900 focus:bg-white focus:outline-none resize-none transition-colors"></textarea>
          <span class="text-xs text-red-500 mt-1 hidden" id="err-message"></span>
        </div>

        <!-- Submit Button with Busy Spinner -->
        <button type="submit" id="contact-submit-btn" class="w-full py-3.5 px-6 rounded-xl bg-[#151515] hover:bg-black text-white font-sans font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer">
          <span id="btn-text">Send message</span>
          <svg id="btn-spinner" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white hidden" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </form>
    </section>

    <!-- FAQ Banner Link -->
    <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="block rounded-[24px] border border-gray-200/80 bg-gray-50/70 p-5 hover:bg-gray-100 transition-colors">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-display text-sm font-semibold text-gray-900">Looking for immediate answers?</h3>
          <p class="font-sans text-xs text-gray-500 mt-0.5">Explore our frequently asked questions about assessments, privacy, and therapy.</p>
        </div>
        <span class="font-sans text-xs font-semibold text-[#2A9D8F] underline whitespace-nowrap ml-4">
          Visit FAQ &rarr;
        </span>
      </div>
    </a>

  </div>

</main>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');
    const counter = document.getElementById('msg-counter');
    const submitBtn = document.getElementById('contact-submit-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const successCard = document.getElementById('contact-success');
    const successMsg = document.getElementById('contact-success-msg');
    const failureBanner = document.getElementById('contact-failure');
    const failureMsg = document.getElementById('contact-failure-msg');

    const errName = document.getElementById('err-name');
    const errEmail = document.getElementById('err-email');
    const errMessage = document.getElementById('err-message');

    // Prefill pilot enquiry from Burnout Calculator or URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const topic = urlParams.get('topic');
      const paramSubject = urlParams.get('subject');
      const paramName = urlParams.get('name');
      const paramEmail = urlParams.get('email');

      if (paramName && !nameInput.value) nameInput.value = paramName;
      if (paramEmail && !emailInput.value) emailInput.value = paramEmail;
      if (paramSubject && !subjectInput.value) subjectInput.value = paramSubject;

      if (topic === 'pilot') {
        const PILOT_KEY = 'ikan.calc.pilot-prefill.v1';
        let prefilled = false;
        try {
          const raw = window.sessionStorage.getItem(PILOT_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              if (parsed.subject) subjectInput.value = parsed.subject.slice(0, 120);
              if (parsed.message) messageInput.value = parsed.message.slice(0, 2000);
              prefilled = true;
            }
          }
        } catch (e) {}

        if (!prefilled && !subjectInput.value) {
          subjectInput.value = 'Pilot enquiry';
        }
      }
    } catch (e) {}

    // Live message character counter
    function updateCounter() {
      counter.textContent = `${messageInput.value.length}/2000`;
    }
    updateCounter();
    messageInput.addEventListener('input', updateCounter);

    function validate() {
      let valid = true;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();

      // Name validation
      if (!name || name.length < 2) {
        errName.textContent = 'Please enter your full name.';
        errName.classList.remove('hidden');
        nameInput.classList.add('border-red-500');
        valid = false;
      } else {
        errName.classList.add('hidden');
        nameInput.classList.remove('border-red-500');
      }

      // Email validation
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRe.test(email)) {
        errEmail.textContent = 'Please enter a valid email address.';
        errEmail.classList.remove('hidden');
        emailInput.classList.add('border-red-500');
        valid = false;
      } else {
        errEmail.classList.add('hidden');
        emailInput.classList.remove('border-red-500');
      }

      // Message validation
      if (!message || message.length < 10) {
        errMessage.textContent = 'Write a little more so we can help (10 characters or more).';
        errMessage.classList.remove('hidden');
        messageInput.classList.add('border-red-500');
        valid = false;
      } else {
        errMessage.classList.add('hidden');
        messageInput.classList.remove('border-red-500');
      }

      return valid;
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      failureBanner.classList.add('hidden');

      if (!validate()) return;

      // Set busy state
      submitBtn.disabled = true;
      btnSpinner.classList.remove('hidden');
      btnText.textContent = 'Sending message...';

      const formData = new FormData();
      formData.append('action', 'ikan_contact_submit');
      formData.append('nonce', window.ikanAjax ? window.ikanAjax.nonce : '');
      formData.append('name', nameInput.value.trim());
      formData.append('email', emailInput.value.trim());
      formData.append('subject', subjectInput.value.trim());
      formData.append('message', messageInput.value.trim());

      try {
        const ajaxUrl = window.ikanAjax ? window.ikanAjax.ajax_url : '/wp-admin/admin-ajax.php';
        const res = await fetch(ajaxUrl, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          try {
            window.sessionStorage.removeItem('ikan.calc.pilot-prefill.v1');
          } catch (e) {}
          form.classList.add('hidden');
          successMsg.textContent = data.data && data.data.message ? data.data.message : 'Message sent. We will reply to your email.';
          successCard.classList.remove('hidden');
          successCard.scrollIntoView({ behavior: 'smooth' });
        } else {
          const errMsg = data.data && data.data.errors ? Object.values(data.data.errors).join(' ') : (data.data && data.data.message ? data.data.message : 'Your message could not be sent. Please try again.');
          failureMsg.textContent = errMsg;
          failureBanner.classList.remove('hidden');
        }
      } catch (err) {
        failureMsg.textContent = 'Network error. Please check your connection or write directly to support@ikanhealth.in.';
        failureBanner.classList.remove('hidden');
      } finally {
        submitBtn.disabled = false;
        btnSpinner.classList.add('hidden');
        btnText.textContent = 'Send message';
      }
    });
  });
</script>

<?php get_footer(); ?>
