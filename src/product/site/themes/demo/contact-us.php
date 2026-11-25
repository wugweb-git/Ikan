<?php
/**
 * Template Name: Contact Us
 * Template Post Type: page
 * Description: Authentic iKAN Health Contact page
 * 1:1 parity with src/product/site/pages/ContactUs.tsx & iKAN 2 Design Tokens
 *
 * @package iKAN_Health
 */

get_header();
?>

<div class="ikan2-theme info-page site-page-below-nav">
  <section class="info-band">
    <div class="info-band__inner">
      <p class="info-eyebrow">Contact</p>
      <h1 class="info-title">We're Here to Help</h1>
      <p class="info-subtitle">Your mental health journey matters to us. Reach out for support, questions, or just to connect.</p>

      <!-- Urgent Crisis Alert (First on page) -->
      <aside class="contact-crisis" aria-label="Urgent help">
        <svg class="contact-crisis__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
          <path d="M12 8v4"/><path d="M12 16h.01"/>
        </svg>
        <div>
          <p class="contact-crisis__title">Need Immediate Help?</p>
          <p class="contact-crisis__body">If you're having thoughts of self-harm or suicide, please reach out for immediate support.</p>
          <div class="contact-crisis__actions">
            <a href="tel:9152987821" class="contact-crisis__button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call iCALL - 9152987821
            </a>
            <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="contact-crisis__button contact-crisis__button--secondary">
              More helplines
            </a>
          </div>
        </div>
      </aside>

      <!-- Contact Methods Grid -->
      <div class="contact-methods">
        <a href="mailto:support@ikanhealth.in" class="contact-method">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <p class="contact-method__title">Email Support</p>
          <p class="contact-method__desc">Get help with your account and services</p>
          <p class="contact-method__value">support@ikanhealth.in</p>
        </a>
        <a href="tel:9152987821" class="contact-method">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <p class="contact-method__title">Crisis Support</p>
          <p class="contact-method__desc">iCALL Suicide Prevention Helpline</p>
          <p class="contact-method__value">9152987821</p>
        </a>
      </div>

      <!-- Contact Form Section -->
      <section class="contact-form-section">
        <h2 class="contact-form__title">Send us a Message</h2>
        <p class="contact-form__subtitle">We typically respond within 24 hours during business days.</p>

        <form id="contact-form" class="contact-form" onsubmit="event.preventDefault(); document.getElementById('contact-form-success').style.display='block'; this.style.display='none';">
          <label class="contact-field">
            <span>Name</span>
            <input
              type="text"
              id="contact-name"
              name="name"
              required
              autocomplete="name"
              maxlength="60"
              placeholder="Your full name"
            />
          </label>
          <label class="contact-field">
            <span>Email</span>
            <input
              type="email"
              id="contact-email"
              name="email"
              required
              autocomplete="email"
              maxlength="254"
              placeholder="you@example.com"
            />
          </label>
          <label class="contact-field contact-field--wide">
            <span>Subject (optional)</span>
            <input
              type="text"
              id="contact-subject"
              name="subject"
              maxlength="120"
              placeholder="How can we help?"
            />
          </label>
          <label class="contact-field contact-field--wide">
            <span style="display: flex; justify-content: space-between; align-items: baseline;">
              <span>Message</span>
              <span id="msg-counter" class="text-xs text-muted-foreground" style="font-variant-numeric: tabular-nums;">0/2000</span>
            </span>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              maxlength="2000"
              required
              placeholder="Write a little more so we can help..."
              oninput="document.getElementById('msg-counter').textContent = this.value.length + '/2000'"
            ></textarea>
          </label>
          <button
            type="submit"
            class="info-button"
          >
            Send message
          </button>
        </form>

        <div id="contact-form-success" class="contact-sent" style="display: none;" role="status">
          <p style="font-weight: 600; margin: 0 0 4px 0;">Message sent.</p>
          <p style="margin: 0; color: var(--muted-foreground);">We’ll reply within 24 hours to the email address you provided.</p>
        </div>
      </section>

      <!-- FAQ Teaser Card -->
      <section class="contact-faq">
        <p class="contact-faq__title">Looking for Quick Answers?</p>
        <p class="contact-faq__body">Check our FAQ section for instant answers to common questions about our programs, therapists, and platform.</p>
        <a
          href="<?php echo esc_url( home_url( '/faq' ) ); ?>"
          class="info-button"
          style="text-decoration: none; display: inline-flex;"
        >
          Visit FAQ Section
        </a>
      </section>

    </div>
  </section>
</div>

<?php get_footer(); ?>
