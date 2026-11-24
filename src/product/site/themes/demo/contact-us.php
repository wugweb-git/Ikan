<?php
/**
 * Template Name: Contact Us
 * Template Post Type: page
 * Description: Authentic iKAN Health Contact page matching ContactUs.tsx and index-C1zkq2-P.css
 *
 * @package iKAN_Health
 */

get_header();

// Load canonical Contact data from assets/pages.json
$pages_file = get_template_directory() . '/assets/pages.json';
$pages_data = [];
if ( file_exists( $pages_file ) ) {
  $pages_data = json_decode( file_get_contents( $pages_file ), true ) ?: [];
}

$cms = $pages_data['contact'] ?? [];
$crisis = $cms['crisisCard'] ?? null;
$methods = $cms['contactMethods'] ?? [];
$faq = $cms['faqCard'] ?? null;
?>

<main id="main-content" tabindex="-1" class="flex-1 w-full relative outline-none p-[0px]" role="main" aria-label="Page content">
  <div class="ikan2-theme info-page site-page-below-nav">
    <section class="info-band">
      <div class="info-band__inner">

        <p class="info-eyebrow">Contact</p>
        <h1 class="info-title"><?php echo esc_html( $cms['heroTitle'] ?? 'Contact us' ); ?></h1>
        <?php if ( ! empty( $cms['heroSubtitle'] ) ) : ?>
          <p class="info-subtitle"><?php echo esc_html( $cms['heroSubtitle'] ); ?></p>
        <?php endif; ?>

        <!-- Crisis Helpline Card -->
        <?php if ( $crisis ) : ?>
          <aside class="contact-crisis" aria-label="Urgent help">
            <svg class="contact-crisis__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
            <div>
              <p class="contact-crisis__title"><?php echo esc_html( $crisis['title'] ); ?></p>
              <p class="contact-crisis__body"><?php echo esc_html( $crisis['description'] ); ?></p>
              <div class="contact-crisis__actions">
                <?php foreach ( $crisis['buttons'] ?? [] as $btn ) : ?>
                  <a href="<?php echo esc_url( $btn['action'] ); ?>" class="contact-crisis__button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <?php echo esc_html( $btn['label'] ); ?>
                  </a>
                <?php endforeach; ?>
              </div>
            </div>
          </aside>
        <?php endif; ?>

        <!-- Contact Methods Grid -->
        <div class="contact-methods">
          <?php foreach ( $methods as $m ) : ?>
            <a href="<?php echo esc_url( $m['action'] ); ?>" class="contact-method">
              <?php if ( ( $m['icon'] ?? '' ) === 'phone' ) : ?>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <?php else : ?>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              <?php endif; ?>
              <p class="contact-method__title"><?php echo esc_html( $m['title'] ); ?></p>
              <p class="contact-method__desc"><?php echo esc_html( $m['description'] ); ?></p>
              <p class="contact-method__value"><?php echo esc_html( $m['value'] ); ?></p>
            </a>
          <?php endforeach; ?>
        </div>

        <!-- Contact Form Section -->
        <section class="contact-form-section">
          <h2 class="contact-form__title"><?php echo esc_html( $cms['formTitle'] ?? 'Send us a message' ); ?></h2>
          <?php if ( ! empty( $cms['formSubtitle'] ) ) : ?>
            <p class="contact-form__subtitle"><?php echo esc_html( $cms['formSubtitle'] ); ?></p>
          <?php endif; ?>

          <div id="contact-success-state" style="display: none;" class="contact-sent" role="status">
            Thanks — your message is with us. We reply within 24 hours, to the address you gave.
          </div>

          <div id="contact-error-state" style="display: none;" class="contact-sent" style="background: var(--error-container); color: var(--on-error-container); margin-top: 16px;" role="alert">
            Something went wrong sending your message. Please try again or email us directly at support@ikanhealth.in.
          </div>

          <form id="contact-form" class="contact-form" novalidate>
            <label class="contact-field">
              <span>Your name</span>
              <input type="text" id="contact-name" name="name" required maxlength="100" autocomplete="name" />
              <span id="name-error" style="display: none; color: var(--destructive, #d4183d); font-size: 13px; margin-top: 4px;"></span>
            </label>
            <label class="contact-field">
              <span>Email</span>
              <input type="email" id="contact-email" name="email" required autocomplete="email" />
              <span id="email-error" style="display: none; color: var(--destructive, #d4183d); font-size: 13px; margin-top: 4px;"></span>
            </label>
            <label class="contact-field contact-field--wide">
              <span>Subject</span>
              <input type="text" id="contact-subject" name="subject" placeholder="General enquiry" maxlength="150" />
            </label>
            <label class="contact-field contact-field--wide">
              <span>Message</span>
              <textarea id="contact-message" name="message" rows="6" required maxlength="2000"></textarea>
              <span id="msg-error" style="display: none; color: var(--destructive, #d4183d); font-size: 13px; margin-top: 4px;"></span>
            </label>
            <div class="contact-field--wide">
              <button type="submit" id="contact-submit-btn" class="info-button">
                Send message
              </button>
            </div>
          </form>
        </section>

        <!-- FAQ Bridge Section -->
        <?php if ( $faq ) : ?>
          <section class="contact-faq">
            <p class="contact-faq__title"><?php echo esc_html( $faq['title'] ); ?></p>
            <p class="contact-faq__body"><?php echo esc_html( $faq['description'] ); ?></p>
            <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="info-button">
              <?php echo esc_html( $faq['buttonText'] ); ?>
            </a>
          </section>
        <?php endif; ?>

      </div>
    </section>
  </div>
</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('contact-form');
  var submitBtn = document.getElementById('contact-submit-btn');
  var successState = document.getElementById('contact-success-state');
  var errorState = document.getElementById('contact-error-state');

  var nameInput = document.getElementById('contact-name');
  var emailInput = document.getElementById('contact-email');
  var subjectInput = document.getElementById('contact-subject');
  var messageInput = document.getElementById('contact-message');

  var nameError = document.getElementById('name-error');
  var emailError = document.getElementById('email-error');
  var msgError = document.getElementById('msg-error');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var name = (nameInput.value || '').trim();
      var email = (emailInput.value || '').trim();
      var subject = (subjectInput.value || '').trim() || 'General enquiry';
      var message = (messageInput.value || '').trim();

      var hasError = false;

      if (!name) {
        nameError.textContent = 'Please enter your name.';
        nameError.style.display = 'block';
        hasError = true;
      } else {
        nameError.style.display = 'none';
      }

      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        emailError.style.display = 'block';
        hasError = true;
      } else {
        emailError.style.display = 'none';
      }

      if (!message || message.length < 10) {
        msgError.textContent = 'Write a little more so we can help (10 characters or more).';
        msgError.style.display = 'block';
        hasError = true;
      } else {
        msgError.style.display = 'none';
      }

      if (hasError) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      if (errorState) errorState.style.display = 'none';

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
          form.style.display = 'none';
          if (successState) successState.style.display = 'block';
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
          if (errorState) errorState.style.display = 'block';
        }
      })
      .catch(function(err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send message';
        if (errorState) errorState.style.display = 'block';
      });
    });
  }
});
</script>

<?php get_footer(); ?>
