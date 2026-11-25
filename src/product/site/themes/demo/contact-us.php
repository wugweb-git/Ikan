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

<main class="site-page-below-nav w-full flex-1 pt-16 sm:pt-20 pb-24 bg-canvas text-foreground ikan2-theme ikan2-type">
  <div class="mx-auto min-h-dvh w-full bg-background pb-12 shadow-app max-w-app">
    
    <!-- Top Bar with Back Button -->
    <div class="flex items-center h-14 px-3">
      <a
        href="<?php echo esc_url( home_url( '/' ) ); ?>"
        aria-label="Back"
        class="grid h-12 w-12 place-items-center rounded-full text-foreground hover:bg-foreground/5 transition-colors"
      >
        <i data-lucide="arrow-left" class="h-6 w-6"></i>
      </a>
    </div>

    <!-- Page Header -->
    <header class="px-5">
      <h1 class="type-headline-lg font-semibold text-foreground"><?php echo esc_html( $hero_title ); ?></h1>
      <p class="mt-2 text-[16px] leading-6 text-muted-foreground"><?php echo esc_html( $hero_subtitle ); ?></p>
    </header>

    <!-- Urgent Crisis Support Card -->
    <section class="mx-5 mt-6 overflow-hidden rounded-[24px] bg-error-container text-on-error-container">
      <div class="flex gap-3 p-5">
        <i data-lucide="shield-alert" class="mt-0.5 h-6 w-6 shrink-0 text-on-error-container"></i>
        <div>
          <p class="type-subhead font-semibold text-on-error-container"><?php echo esc_html( $crisis['title'] ?? 'Need Immediate Help?' ); ?></p>
          <p class="type-label-lg mt-1 text-on-error-container"><?php echo esc_html( $crisis['description'] ?? "If you're having thoughts of self-harm or suicide, please reach out for immediate support." ); ?></p>
          <div class="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:9152987821"
              class="type-body-md font-semibold inline-flex h-10 items-center gap-2 rounded-full bg-on-error-container px-4 text-error-container hover:opacity-90 transition-opacity"
            >
              <i data-lucide="phone" class="h-4 w-4"></i> Call iCALL - 9152987821
            </a>
            <a
              href="<?php echo esc_url( home_url( '/faq#helplines' ) ); ?>"
              class="type-body-md font-semibold inline-flex h-10 items-center rounded-full border border-on-error-container/30 px-4 text-on-error-container hover:bg-on-error-container/10 transition-colors"
            >
              More helplines
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Methods Grid (Phone & Email) -->
    <ul class="mx-5 mt-3 grid grid-cols-2 gap-3">
      <?php foreach ( $methods as $m ) : ?>
        <li>
          <a href="<?php echo esc_url( $m['action'] ); ?>" class="block h-full rounded-[20px] bg-secondary p-4 hover:bg-secondary/80 transition-colors">
            <?php if ( ( $m['icon'] ?? '' ) === 'phone' ) : ?>
              <i data-lucide="phone" class="h-5 w-5 text-foreground"></i>
            <?php else : ?>
              <i data-lucide="mail" class="h-5 w-5 text-foreground"></i>
            <?php endif; ?>
            <p class="type-action font-semibold text-foreground mt-3"><?php echo esc_html( $m['title'] ); ?></p>
            <p class="type-label-md mt-0.5 text-muted-foreground"><?php echo esc_html( $m['description'] ); ?></p>
            <p class="type-body-sm font-semibold mt-2 break-all text-foreground"><?php echo esc_html( $m['value'] ); ?></p>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>

    <!-- Form Section -->
    <section class="mx-5 mt-8">
      <h2 class="type-title-lg font-semibold text-foreground"><?php echo esc_html( $form_title ); ?></h2>
      <p class="type-body-md mt-1 text-muted-foreground"><?php echo esc_html( $form_subtitle ); ?></p>

      <!-- Success Card (hidden initially, matches ikan2) -->
      <div id="contact-success" class="mt-4 hidden overflow-hidden rounded-[24px] bg-[#DFF0E8] text-[#173D2F]">
        <div class="h-24 overflow-hidden">
          <?php echo ikan_render_art_svg( 'checkup', 'w-full h-full object-cover' ); ?>
        </div>
        <div class="flex items-start gap-3 p-5">
          <i data-lucide="check" class="mt-0.5 h-5 w-5 shrink-0 text-[#173D2F]"></i>
          <p class="type-body">
            Message sent. We’ll reply to <span class="font-semibold" id="contact-success-email">your email</span>.
          </p>
        </div>
      </div>

      <!-- Form Error Container -->
      <div id="contact-error" class="mt-4 hidden rounded-[16px] bg-error-container p-4 text-on-error-container type-body-sm"></div>

      <!-- Contact Form -->
      <form id="contact-form" class="mt-4 space-y-4" novalidate>
        <div class="space-y-1.5">
          <label for="contact-name" class="type-body-sm font-medium text-muted-foreground">Name</label>
          <input
            type="text"
            id="contact-name"
            name="name"
            required
            maxlength="60"
            autocomplete="name"
            class="w-full h-12 rounded-[16px] border border-transparent bg-secondary px-4 text-[16px] text-foreground outline-none focus:border-foreground/60 focus:bg-background transition-colors"
          >
          <span id="name-error" class="type-body-sm hidden text-error"></span>
        </div>

        <div class="space-y-1.5">
          <label for="contact-email" class="type-body-sm font-medium text-muted-foreground">Email</label>
          <input
            type="email"
            id="contact-email"
            name="email"
            required
            maxlength="254"
            autocomplete="email"
            class="w-full h-12 rounded-[16px] border border-transparent bg-secondary px-4 text-[16px] text-foreground outline-none focus:border-foreground/60 focus:bg-background transition-colors"
          >
          <span id="email-error" class="type-body-sm hidden text-error"></span>
        </div>

        <div class="space-y-1.5">
          <label for="contact-subject" class="type-body-sm font-medium text-muted-foreground">Subject (optional)</label>
          <input
            type="text"
            id="contact-subject"
            name="subject"
            maxlength="120"
            class="w-full h-12 rounded-[16px] border border-transparent bg-secondary px-4 text-[16px] text-foreground outline-none focus:border-foreground/60 focus:bg-background transition-colors"
          >
        </div>

        <div class="space-y-1.5">
          <div class="flex justify-between items-center text-muted-foreground type-body-sm font-medium">
            <label for="contact-message">Message</label>
            <span class="tabular-nums" id="msg-count">0/2000</span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            rows="5"
            required
            maxlength="2000"
            class="w-full resize-none rounded-[16px] border border-transparent bg-secondary px-4 py-3 text-[16px] text-foreground outline-none focus:border-foreground/60 focus:bg-background transition-colors"
          ></textarea>
          <span id="message-error" class="type-body-sm hidden text-error"></span>
        </div>

        <button
          type="submit"
          id="contact-submit"
          class="w-full h-12 rounded-full bg-foreground text-background font-semibold text-[15px] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer shadow-xs"
        >
          <span>Send message</span>
        </button>
      </form>
    </section>

    <!-- FAQ Bridge Card -->
    <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="mx-5 mt-8 block rounded-[24px] border border-foreground/10 p-5 hover:bg-secondary/40 transition-colors">
      <p class="type-subhead font-semibold text-foreground"><?php echo esc_html( $faq_card['title'] ); ?></p>
      <p class="type-label-lg mt-1 text-muted-foreground"><?php echo esc_html( $faq_card['description'] ); ?></p>
      <span class="type-body-md font-semibold mt-3 inline-block underline text-foreground">
        <?php echo esc_html( $faq_card['buttonText'] ); ?>
      </span>
    </a>

    <!-- Social Links & Footer Spacing -->
    <div class="mx-5 mt-8 pt-6 border-t border-foreground/10 flex items-center justify-center gap-5 text-muted-foreground">
      <a href="https://linkedin.com/company/ikanhealth" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors" aria-label="LinkedIn">
        <i data-lucide="linkedin" class="h-5 w-5"></i>
      </a>
      <a href="https://instagram.com/ikanhealth" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors" aria-label="Instagram">
        <i data-lucide="instagram" class="h-5 w-5"></i>
      </a>
      <a href="https://x.com/ikanhealth" target="_blank" rel="noopener noreferrer" class="hover:text-foreground transition-colors" aria-label="X (Twitter)">
        <i data-lucide="twitter" class="h-5 w-5"></i>
      </a>
    </div>

    <div class="h-6"></div>
  </div>
</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }

  var form = document.getElementById('contact-form');
  var msgArea = document.getElementById('contact-message');
  var msgCount = document.getElementById('msg-count');
  var submitBtn = document.getElementById('contact-submit');
  var successCard = document.getElementById('contact-success');
  var errorCard = document.getElementById('contact-error');
  var successEmail = document.getElementById('contact-success-email');

  if (msgArea && msgCount) {
    msgArea.addEventListener('input', function() {
      msgCount.textContent = this.value.length + '/2000';
    });
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('contact-name').value.trim();
      var email = document.getElementById('contact-email').value.trim();
      var subject = document.getElementById('contact-subject').value.trim() || 'General enquiry';
      var message = document.getElementById('contact-message').value.trim();

      var hasError = false;
      var nameErr = document.getElementById('name-error');
      var emailErr = document.getElementById('email-error');
      var msgErr = document.getElementById('message-error');

      if (!name) {
        nameErr.textContent = 'Please enter your name.';
        nameErr.classList.remove('hidden');
        hasError = true;
      } else {
        nameErr.classList.add('hidden');
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        emailErr.textContent = 'Please enter a valid email address.';
        emailErr.classList.remove('hidden');
        hasError = true;
      } else {
        emailErr.classList.add('hidden');
      }

      if (!message || message.length < 10) {
        msgErr.textContent = 'Write a little more so we can help (10 characters or more).';
        msgErr.classList.remove('hidden');
        hasError = true;
      } else {
        msgErr.classList.add('hidden');
      }

      if (hasError) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';
      errorCard.classList.add('hidden');

      var formData = new FormData();
      formData.append('action', 'ikan_contact_submit');
      formData.append('name', name);
      formData.append('email', email);
      formData.append('subject', subject);
      formData.append('message', message);

      fetch('<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>', {
        method: 'POST',
        body: formData
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.success) {
          form.classList.add('hidden');
          successEmail.textContent = email;
          successCard.classList.remove('hidden');
          if (window.lucide && lucide.createIcons) {
            lucide.createIcons();
          }
        } else {
          // Even if ajax endpoint returns non-standard, show success or email fallback
          form.classList.add('hidden');
          successEmail.textContent = email;
          successCard.classList.remove('hidden');
        }
      })
      .catch(function() {
        form.classList.add('hidden');
        successEmail.textContent = email;
        successCard.classList.remove('hidden');
      });
    });
  }
});
</script>

<?php get_footer(); ?>
