<?php
/**
 * Template Name: Contact Us
 * Template Post Type: page
 * Description: Exact 1:1 replica of iKAN 2 PWA contact layout (ikan2/src/routes/contact.tsx)
 *
 * Matches InfoShell container, crisis card, contact methods, form fields,
 * validation feedback, success state with SVG checkup art, and FAQ bridge.
 *
 * @package iKAN_Health
 */

$GLOBALS['ikan_app_shell'] = true;
get_header();

// Load canonical contact content from pages.json
$pages_file = get_template_directory() . '/assets/pages.json';
$pages_data = [];
if ( file_exists( $pages_file ) ) {
  $pages_data = json_decode( file_get_contents( $pages_file ), true ) ?: [];
}
$c = $pages_data['contact'] ?? [];

$hero_title    = $c['heroTitle'] ?? 'Contact us';
$hero_subtitle = $c['heroSubtitle'] ?? 'We’re here to help. Reach out with questions, feedback, or to learn more about iKAN.';
$crisis        = $c['crisisCard'] ?? [];
$methods       = $c['contactMethods'] ?? [
  [ 'icon' => 'phone', 'title' => 'Phone', 'description' => 'Mon–Fri, 9am–6pm IST', 'value' => '+91 91529 87821', 'action' => 'tel:9152987821' ],
  [ 'icon' => 'email', 'title' => 'Email', 'description' => 'We usually reply in a day', 'value' => 'support@ikanhealth.in', 'action' => 'mailto:support@ikanhealth.in' ],
];
$form_title    = $c['formTitle'] ?? 'Send us a message';
$form_subtitle = $c['formSubtitle'] ?? 'Fill out the form below and we’ll get back to you.';
$faq_card      = $c['faqCard'] ?? [
  'title'       => 'Got questions? We’ve got answers.',
  'description' => 'Find quick answers about assessments, privacy, programs, and how iKAN works.',
  'buttonText'  => 'Browse our FAQs',
];
?>

<div class="min-h-dvh bg-canvas text-foreground ikan2-theme ikan2-type">
  <main class="mx-auto min-h-dvh w-full bg-background pb-12 shadow-app max-w-app">
    
    <!-- TopAppBar: thin, compact sticky header with back button (matching ikan2 exactly) -->
    <header class="safe-top-sm sticky top-0 z-30 flex min-h-16 items-center gap-1 bg-background px-1 print:hidden">
      <button
        type="button"
        aria-label="Back"
        onclick="if(window.history.length>1){window.history.back();}else{window.location.href='<?php echo esc_url( home_url( '/' ) ); ?>';}"
        class="grid h-12 w-12 place-items-center rounded-full text-foreground hover:bg-foreground/5 transition-colors"
      >
        <i data-lucide="arrow-left" class="h-6 w-6"></i>
      </button>
    </header>

    <!-- Page Header (px-5) -->
    <header class="px-5">
      <h1 class="type-headline-lg font-semibold text-foreground"><?php echo esc_html( $hero_title ); ?></h1>
      <p class="mt-2 text-[16px] leading-6 text-muted-foreground"><?php echo esc_html( $hero_subtitle ); ?></p>
    </header>

    <!-- Urgent Crisis Support Card (mx-5 mt-6 rounded-[24px] bg-error-container text-on-error-container) -->
    <section class="mx-5 mt-6 overflow-hidden rounded-[24px] bg-error-container text-on-error-container">
      <div class="flex gap-3 p-5">
        <i data-lucide="shield-alert" class="mt-0.5 h-6 w-6 shrink-0 text-error"></i>
        <div>
          <p class="type-subhead font-semibold text-error"><?php echo esc_html( $crisis['title'] ?? 'Urgent crisis support' ); ?></p>
          <p class="type-label-lg mt-1 text-on-error-container"><?php echo esc_html( $crisis['description'] ?? 'If you or someone you know is in immediate danger, please reach out to emergency services right away.' ); ?></p>
          <div class="mt-3 flex flex-wrap gap-2">
            <?php foreach ( (array) ( $crisis['buttons'] ?? [
              [ 'label' => 'KIRAN (24/7): 1800-599-0019', 'action' => 'tel:18005990019' ],
              [ 'label' => 'Tele-MANAS: 14416', 'action' => 'tel:14416' ],
            ] ) as $btn ) : ?>
              <a
                href="<?php echo esc_url( $btn['action'] ?? '#' ); ?>"
                class="type-body-md font-semibold inline-flex h-10 items-center gap-2 rounded-full bg-on-error-container px-4 text-error-container hover:opacity-90 transition-opacity"
              >
                <i data-lucide="phone" class="h-4 w-4"></i>
                <span><?php echo esc_html( $btn['label'] ?? '' ); ?></span>
              </a>
            <?php endforeach; ?>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Methods Grid (mx-5 mt-3 grid grid-cols-2 gap-3) -->
    <ul class="mx-5 mt-3 grid grid-cols-2 gap-3">
      <?php foreach ( $methods as $m ) : ?>
        <li>
          <a
            href="<?php echo esc_url( $m['action'] ); ?>"
            class="block h-full rounded-[20px] bg-secondary p-4 transition-transform hover:-translate-y-0.5"
          >
            <i data-lucide="<?php echo $m['icon'] === 'phone' ? 'phone' : 'mail'; ?>" class="h-5 w-5 text-foreground"></i>
            <p class="type-action mt-3 font-semibold text-foreground"><?php echo esc_html( $m['title'] ); ?></p>
            <p class="type-label-md mt-0.5 text-muted-foreground"><?php echo esc_html( $m['description'] ); ?></p>
            <p class="type-body-sm font-semibold mt-2 break-all text-foreground"><?php echo esc_html( $m['value'] ); ?></p>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>

    <!-- Contact Form (mx-5 mt-6) -->
    <section class="mx-5 mt-6">
      <div id="contact-form-wrapper">
        <h2 class="type-headline-sm font-semibold text-foreground"><?php echo esc_html( $form_title ); ?></h2>
        <p class="mt-1 text-[14px] leading-5 text-muted-foreground"><?php echo esc_html( $form_subtitle ); ?></p>

        <form id="ikan-contact-form" class="mt-4 space-y-4" novalidate>
          <input type="hidden" name="action" value="ikan_contact_submit">
          <input type="hidden" name="nonce" value="<?php echo wp_create_nonce( 'ikan_form_nonce' ); ?>">

          <!-- General Alert banner (for submission feedback) -->
          <div id="contact-general-error" class="hidden rounded-xl bg-error-container p-3 text-error-container text-xs font-semibold"></div>

          <!-- Name -->
          <div>
            <label for="contact-name" class="type-label-md block font-medium text-foreground">Your Name</label>
            <input
              type="text"
              id="contact-name"
              name="name"
              required
              placeholder="Your full name"
              class="mt-1.5 w-full h-12 rounded-[14px] border border-foreground/15 bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
            >
            <p id="err-name" class="hidden mt-1 text-xs font-medium text-destructive"></p>
          </div>

          <!-- Email -->
          <div>
            <label for="contact-email" class="type-label-md block font-medium text-foreground">Email Address</label>
            <input
              type="email"
              id="contact-email"
              name="email"
              required
              placeholder="you@example.com"
              class="mt-1.5 w-full h-12 rounded-[14px] border border-foreground/15 bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
            >
            <p id="err-email" class="hidden mt-1 text-xs font-medium text-destructive"></p>
          </div>

          <!-- Subject -->
          <div>
            <label for="contact-subject" class="type-label-md block font-medium text-foreground">Subject</label>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              placeholder="How can we help?"
              class="mt-1.5 w-full h-12 rounded-[14px] border border-foreground/15 bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors"
            >
            <p id="err-subject" class="hidden mt-1 text-xs font-medium text-destructive"></p>
          </div>

          <!-- Message -->
          <div>
            <label for="contact-message" class="type-label-md block font-medium text-foreground">Message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="4"
              required
              placeholder="Write a little more so we can help (10 characters or more)..."
              class="mt-1.5 w-full rounded-[14px] border border-foreground/15 bg-background p-4 text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-colors resize-none"
            ></textarea>
            <p id="err-message" class="hidden mt-1 text-xs font-medium text-destructive"></p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            id="contact-submit-btn"
            class="type-action w-full h-12 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Send message</span>
          </button>
        </form>
      </div>

      <!-- Success State (hidden by default) -->
      <div id="contact-success-state" class="hidden text-center py-6">
        <div class="h-32 w-32 mx-auto overflow-hidden rounded-[24px]">
          <?php echo function_exists( 'ikan_render_art_svg' ) ? ikan_render_art_svg( 'checkup', 'w-full h-full object-cover' ) : '<div class="size-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"><i data-lucide="check" class="size-10 text-emerald-600"></i></div>'; ?>
        </div>
        <h3 class="type-headline-sm font-semibold mt-4 text-foreground">Message sent</h3>
        <p class="type-body-md mt-2 text-muted-foreground">We usually reply within one business day.</p>
        <a
          href="<?php echo esc_url( home_url( '/' ) ); ?>"
          class="type-action inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-background font-semibold mt-5"
        >
          Back to home
        </a>
      </div>
    </section>

    <!-- FAQ Help Card Bridge (mx-5 mt-8 rounded-[24px] bg-secondary p-5) -->
    <section class="mx-5 mt-8 rounded-[24px] bg-secondary p-5 text-center">
      <p class="type-subhead font-semibold text-foreground"><?php echo esc_html( $faq_card['title'] ); ?></p>
      <p class="type-body mt-1 text-muted-foreground"><?php echo esc_html( $faq_card['description'] ); ?></p>
      <a
        href="<?php echo esc_url( home_url( '/faq' ) ); ?>"
        class="type-action mt-4 inline-flex h-11 items-center justify-center rounded-full border border-foreground/20 px-5 text-foreground font-semibold hover:bg-background transition-colors"
      >
        <?php echo esc_html( $faq_card['buttonText'] ); ?>
      </a>
    </section>

    <!-- Social Links and Copyright Footer (matching ikan2 exactly) -->
    <div class="mx-5 mt-8 border-t border-border pt-6 pb-2 text-center">
      <div class="flex justify-center gap-3">
        <a href="https://instagram.com/ikanhealth" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/70 transition-colors">
          <i data-lucide="instagram" class="h-5 w-5"></i>
        </a>
        <a href="https://linkedin.com/company/ikanhealth" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" class="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/70 transition-colors">
          <i data-lucide="linkedin" class="h-5 w-5"></i>
        </a>
        <a href="https://x.com/ikanhealth" target="_blank" rel="noopener noreferrer" aria-label="X" class="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground hover:bg-secondary/70 transition-colors">
          <i data-lucide="twitter" class="h-5 w-5"></i>
        </a>
      </div>
      <p class="type-body-sm mt-3 text-muted-foreground">© <?php echo date('Y'); ?> iKAN Health. All rights reserved.</p>
    </div>

  </main>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
  var form = document.getElementById("ikan-contact-form");
  if (!form) return;

  var btn = document.getElementById("contact-submit-btn");
  var wrapper = document.getElementById("contact-form-wrapper");
  var success = document.getElementById("contact-success-state");
  var generalErr = document.getElementById("contact-general-error");

  function clearErrors() {
    generalErr.classList.add("hidden");
    generalErr.textContent = "";
    ["name", "email", "subject", "message"].forEach(function(field) {
      var errEl = document.getElementById("err-" + field);
      if (errEl) {
        errEl.classList.add("hidden");
        errEl.textContent = "";
      }
    });
  }

  function showError(field, msg) {
    var errEl = document.getElementById("err-" + field);
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove("hidden");
    }
  }

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    clearErrors();

    var nameVal = form.name.value.trim();
    var emailVal = form.email.value.trim();
    var subjectVal = form.subject.value.trim();
    var messageVal = form.message.value.trim();

    var hasErr = false;
    if (!nameVal) {
      showError("name", "Please enter your name.");
      hasErr = true;
    }
    if (!emailVal || emailVal.indexOf("@") === -1) {
      showError("email", "Please enter a valid email address.");
      hasErr = true;
    }
    if (!messageVal || messageVal.length < 10) {
      showError("message", "Write a little more so we can help (10 characters or more).");
      hasErr = true;
    }

    if (hasErr) return;

    btn.disabled = true;
    var origText = btn.innerHTML;
    btn.textContent = "Sending...";

    var fd = new FormData(form);

    try {
      var ajaxUrl = window.ikanAjax ? window.ikanAjax.ajax_url : "/wp-admin/admin-ajax.php";
      var res = await fetch(ajaxUrl, { method: "POST", body: fd });
      var data = await res.json();

      if (data && data.success) {
        wrapper.classList.add("hidden");
        success.classList.remove("hidden");
      } else {
        var msg = (data && data.data && data.data.message) ? data.data.message : "Your message didn’t send. Check your connection and try again.";
        generalErr.textContent = msg;
        generalErr.classList.remove("hidden");
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    } catch(err) {
      generalErr.textContent = "Network error. Check your connection and try again, or email us directly.";
      generalErr.classList.remove("hidden");
      btn.disabled = false;
      btn.innerHTML = origText;
    }
  });
});
</script>

<?php get_footer(); ?>
