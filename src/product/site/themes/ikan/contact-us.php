<?php
/**
 * Template Name: Contact Us
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  $cms_content = get_post_meta( get_the_ID(), 'page-contact', true );
  $contact = [];
  if ( $cms_content ) {
    try { $contact = json_decode( $cms_content, true ); } catch ( $e ) {}
  }
  ?>

  <!-- Hero -->
  <section class="py-16 bg-gradient-to-b from-blue-50 to-indigo-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          <?php echo esc_html( $contact['heroTitle'] ?? 'Contact Us' ); ?>
        </h1>
        <?php if ( $contact['heroSubtitle'] ): ?>
          <p class="text-lg text-gray-600 mb-8">
            <?php echo esc_html( $contact['heroSubtitle'] ); ?>
          </p>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <!-- Crisis Card -->
  <section class="py-8">
    <div class="max-w-[1600px] mx-auto px-4">
      <?php if ( $contact['crisisCard'] ): ?>
        <div class="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 class="text-lg font-medium text-red-900 mb-3">
            <?php echo esc_html( $contact['crisisCard']['title'] ?? '' ); ?>
          </h3>
          <p class="text-red-800">
            <?php echo esc_html( $contact['crisisCard']['description'] ?? '' ); ?>
          </p>
        </div>
      <?php endif; ?>
    </div>
  </section>

  <!-- Contact Methods -->
  <section class="py-8">
    <div class="max-w-[1600px] mx-auto px-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <?php 
      $methods = $contact['contactMethods'] ?? [];
      $icon_map = ['mail' => 'Mail', 'phone' => 'Phone'];
      foreach ( $methods as $method ): 
      $icon = $method['icon'] ?? 'mail';
      ?>
        <div>
          <h2 class="text-xl font-medium text-gray-900 mb-3">
            <?php echo esc_html( $method['title'] ?? '' ); ?>
          </h2>
          <p class="text-gray-600">
            <?php echo esc_html( $method['description'] ?? '' ); ?>
          </p>
          <?php if ( $method['value'] ): ?>
            <a href="<?php echo esc_attr( $method['action'] ?? '' ); ?>" class="underline text-blue-600">
              <?php echo esc_html( $method['value'] ?? '' ); ?>
            </a>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>
    </div>
  </section>

  <!-- Form -->
  <section class="py-8">
    <div class="max-w-[1600px] mx-auto px-4">
      <?php if ( $contact['sent'] ): ?>
        <p class="text-gray-600">Thanks — your message is with us.</p>
      <?php elseif ( $use_fluent ): ?>
        <!-- Fluent Forms Integration -->
        <?php 
        $form_id = empty( $fluent_form_id ) ? '1' : $fluent_form_id;
        // Try to get form data if available
        $form = null;
        if ( function_exists( 'ff_forms' ) ) {
          $form = ff_forms( $form_id );
        }
        ?>
        <?php if ( $form ): ?>
          <?php echo do_shortcode( '[fluentform id="' . esc_attr( $form_id ) . '"]' ); ?>
        <?php else: ?>
          <p class="text-gray-500">Fluent Forms plugin detected but form not found. ID: <?php echo esc_html( $form_id ); ?></p>
        <?php endif; ?>
      <?php elseif ( function_exists( 'scf_contact_form' ) || class_exists( 'Simple_Contact_Form' ) ): ?>
        <!-- SCF Integration -->
        <?php echo do_shortcode( '[scf_contact_form]' ); ?>
      <?php elseif ( class_exists( 'Fluent_CRM' ) || true ): ?>
        <!-- FluentCRM Integration - for email marketing nurture -->
        <p class="text-sm text-gray-500">
          Message received! <a href="javascript:void(0)" class="text-blue-600 hover underline"
            onClick="window.location.href='<?php echo esc_url( home_url( '/contact' ) ); }'>
            Stay connected for mental health tips and updates</a>.
        </p>
      <?php else: ?>
        <!-- Classic Fallback Form -->
        <form method="post" action="<?php echo esc_url( home_url( '/contact' ); ) ?>">
          <input type="hidden" name="contact_submit" value="1" />
          <div>
            <input type="text" name="name" required class="w-full px-4 py-2 border rounded" placeholder="Your name" />
          </div>
          <div>
            <input type="email" name="email" required class="w-full px-4 py-2 border rounded" placeholder="Email" />
          </div>
          <div>
            <input type="text" name="subject" placeholder="General enquiry" class="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <textarea name="message" rows="6" class="w-full px-4 py-2 border rounded resize-none"></textarea>
          </div>
          <button type="submit" class="w-full py-3 px-6 bg-primary text-white font-medium">Send message</button>
        </form>
      <?php endif; ?>
    </div>
  </section>

</main>

<?php get_footer(); ?>

<!-- Form Plugin Setup Notes -->
<p class="text-sm text-gray-500 mt-8">
  <?php if ( $use_fluent ): ?>
    This page is configured to use Fluent Forms (ID: <?php echo esc_html( $fluent_form_id ); ?>). 
    To set up: Go to Fluent Forms > Forms, create a form, note its ID, 
    then add it to: Appearance > Theme Editor > ikan Contact Settings (or 
    add the option value `ikan_fluent_form_id` in WordPress Dashboard > Options).
  <?php elseif ( function_exists( 'scf_contact_form' ) || class_exists( 'Simple_Contact_Form' ) ): ?>
    This page is using Simple Contact Form (SCF). 
    No additional setup needed - the form is automatically displayed.
  <?php elseif ( class_exists( 'Fluent_CRM' ) ): ?>
    This page is integrated with FluentCRM for email marketing. 
    Messages are captured and can be added to your FluentCRM lists for 
    follow-up mental health tips and updates.
  <?php else: ?>
    No specialized form plugin detected. The contact form will use the classic 
    HTML fallback. To enable advanced form features, install:
    - Fluent Forms: For drag-and-drop form builder
    - Simple Contact Form (SCF): For lightweight contact forms  
    - FluentCRM: For email marketing and nurture sequences
    Then add the respective plugin ID or enable integration in theme options.
  <?php endif; ?>
</p>