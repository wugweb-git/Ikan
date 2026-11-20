<?php
/**
 * Template Name: Workplace Privacy
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for workplace privacy
  $cms_content = get_post_meta( get_the_ID(), 'workplace-privacy', true );
  $privacy = [];
  if ( $cms_content ) {
    try { $privacy = json_decode( $cms_content, true ); } catch ( $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-blue-50 to-indigo-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Workplace Privacy
        </h1>
        <p class="text-lg text-gray-600">
          Your privacy at work - policies and protections.
        </p>
      </div>
    </div>
  </section>

  <!-- Privacy Policy Content -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="prose prose-in max-w-prose">
        <?php if ( $privacy ): ?>
          <?php echo wp_kses_post( $privacy['content'] ?? '' ); ?>
        <?php else: ?>
          <p class="text-gray-600">
            Workplace privacy policies will be populated from the WordPress CMS.
          </p>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <!-- Key Protections -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Key Protections</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-4 border rounded-lg">
          <p class="font-medium">Confidentiality</p>
          <p class="text-sm text-gray-500">Your information is kept confidential</p>
        </div>
        <div class="p-4 border rounded-lg">
          <p class="font-medium">Data Security</p>
          <p class="text-sm text-gray-500">Secure storage and transmission</p>
        </div>
        <div class="p-4 border rounded-lg">
          <p class="font-medium">Control</p>
          <p class="text-sm text-gray-500">You control your own data</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Workplace Rights -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Your Workplace Rights</h2>
      <ul class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <li class="p-4 border rounded-lg">
          <p class="font-medium">Right to Privacy</p>
          <p class="text-sm text-gray-500">Your mental health information is protected</p>
        </li>
        <li class="p-4 border rounded-lg">
          <p class="font-medium">Non-Discrimination</p>
          <p class="text-sm text-gray-500">Protected from discrimination</p>
        </li>
        <li class="p-4 border rounded-lg">
          <p class="font-medium">Accommodations</p>
          <p class="text-sm text-gray-500">Right to reasonable accommodations</p>
        </li>
      </ul>
    </div>
  </section>

</main>

<?php get_footer(); ?>