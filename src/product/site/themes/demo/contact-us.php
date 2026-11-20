<?php
/**
 * Template Name: Contact Us
 * Template Post Type: page
 * Description: Matches iKAN 2 mobile PWA & responsive contact layout
 */

get_header(); ?>

<main class="ikan2-theme bg-canvas text-foreground pb-24 md:pb-16 min-h-screen">

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
  <header class="max-w-[760px] mx-auto px-5 pt-10 md:pt-16 pb-4">
    <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900"><?php echo esc_html( $hero_title ); ?></h1>
    <p class="mt-2 text-base leading-relaxed text-gray-600"><?php echo esc_html( $hero_subtitle ); ?></p>
  </header>

  <div class="max-w-[760px] mx-auto px-5 space-y-6">

    <!-- Crisis Card (Matches ikan2 ShieldAlert styling) -->
    <section class="overflow-hidden rounded-[24px] bg-[#FDF2F2] border border-[#F8B4B4] text-[#9B1C1C] p-5 shadow-sm">
      <div class="flex items-start gap-3.5">
        <div class="w-8 h-8 rounded-full bg-[#FDE8E8] flex items-center justify-center shrink-0 text-[#E02424] mt-0.5">
          <i data-lucide="shield-alert" class="w-5 h-5"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-base font-bold text-[#9B1C1C]">Need urgent support?</h2>
          <p class="text-sm mt-1 text-[#771D1D] leading-relaxed">
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
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <!-- Method 1: Email -->
        <a href="mailto:support@ikanhealth.in" class="block rounded-[20px] bg-gray-100 hover:bg-gray-200/70 p-4 transition-colors">
          <div class="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-700 shadow-xs mb-3">
            <i data-lucide="mail" class="w-5 h-5"></i>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Email Support</p>
          <p class="text-xs text-gray-500 mt-0.5">We usually reply within 24 hours</p>
          <p class="text-sm font-bold text-gray-900 mt-2 break-all">support@ikanhealth.in</p>
        </a>

        <!-- Method 2: Phone -->
        <a href="tel:+918527545503" class="block rounded-[20px] bg-gray-100 hover:bg-gray-200/70 p-4 transition-colors">
          <div class="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-700 shadow-xs mb-3">
            <i data-lucide="phone" class="w-5 h-5"></i>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Phone & WhatsApp</p>
          <p class="text-xs text-gray-500 mt-0.5">Mon–Fri, 9am–6pm IST</p>
          <p class="text-sm font-bold text-gray-900 mt-2">+91 85275 45503</p>
        </a>

        <!-- Method 3: Clinical Care -->
        <a href="tel:+919899843330" class="block rounded-[20px] bg-gray-100 hover:bg-gray-200/70 p-4 transition-colors">
          <div class="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-700 shadow-xs mb-3">
            <i data-lucide="heart-handshake" class="w-5 h-5"></i>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Care Coordination</p>
          <p class="text-xs text-gray-500 mt-0.5">Psychologist & session inquiries</p>
          <p class="text-sm font-bold text-gray-900 mt-2">+91 98998 43330</p>
        </a>

        <!-- Method 4: Organizations -->
        <a href="mailto:partners@ikanhealth.in" class="block rounded-[20px] bg-gray-100 hover:bg-gray-200/70 p-4 transition-colors">
          <div class="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-gray-700 shadow-xs mb-3">
            <i data-lucide="building" class="w-5 h-5"></i>
          </div>
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500">Organisations & Partners</p>
          <p class="text-xs text-gray-500 mt-0.5">Workplace pilots & therapist network</p>
          <p class="text-sm font-bold text-gray-900 mt-2 break-all">partners@ikanhealth.in</p>
        </a>
      </div>
    </section>

    <!-- Message Form Section -->
    <section class="rounded-[24px] bg-white border border-gray-200 p-6 md:p-8 shadow-sm">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Send us a message</h2>
      <p class="text-sm text-gray-500 mb-6">Drop us a line and our care team will get back to you promptly.</p>

      <?php if ( shortcode_exists( 'fluentform' ) ): ?>
        <div class="fluentform-wrapper">
          <?php echo do_shortcode( '[fluentform id="1"]' ); ?>
        </div>
      <?php else: ?>
        <form method="post" action="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="space-y-4">
          <input type="hidden" name="contact_submit" value="1" />
          
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Name</label>
            <input type="text" name="name" required placeholder="Your full name" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Email</label>
            <input type="email" name="email" required placeholder="your.email@example.com" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Subject (optional)</label>
            <input type="text" name="subject" placeholder="General enquiry" class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">Message</label>
            <textarea name="message" rows="5" required placeholder="Write a little more so we can help..." class="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none resize-none"></textarea>
          </div>

          <button type="submit" class="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm">
            Send message
          </button>
        </form>
      <?php endif; ?>
    </section>

    <!-- FAQ Banner Link -->
    <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="block rounded-[24px] border border-gray-200 bg-gray-50/70 p-5 hover:bg-gray-100 transition-colors">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-gray-900">Looking for immediate answers?</h3>
          <p class="text-xs text-gray-500 mt-0.5">Explore our frequently asked questions about assessments, privacy, and therapy.</p>
        </div>
        <span class="text-xs font-bold text-blue-600 underline whitespace-nowrap ml-4">
          Visit FAQ &rarr;
        </span>
      </div>
    </a>

  </div>

</main>

<?php get_footer(); ?>
