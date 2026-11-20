<?php
/**
 * Template Name: Homepage
 * Template Post Type: page
 * Description: The iKAN Health landing/homepage
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for the homepage
  $cms_content = get_post_meta( get_the_ID(), 'homepage-hero', true );
  $hero = [];
  if ( $cms_content ) {
    try {
      $hero = json_decode( $cms_content, true );
    } catch ( $e ) {
      // fall through to empty
    }
  }
  ?>

  <!-- Hero Section -->
  <section class="relative w-full flex flex-col items-center justify-center text-center overflow-hidden pt-[100px] pb-[36px] md:pt-[160px] md:pb-[80px]">
    <div class="absolute inset-0 z-0">
      <?php 
      $hero_image = get_post_meta( get_the_ID(), 'homepage-hero-image', true );
      $default_banner = 'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBhc3Nlc3NtZW50JTIwcXVlc3Rpb25uYWlyZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzczMzIxNTcyfDA&ixlib=rb-4.1.0&q=80&w=1080';
      $image = $hero_image ? $hero_image : $default_banner;
      ?>
      <img src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $hero['title'] ?? 'Home' ); ?> background" class="absolute inset-0 w-full h-full object-cover" style="opacity: 0.55; object-position: 50% 30%; transform: scale(1.08);" loading="eager" decoding="async" />
      <div class="absolute inset-0" style="background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%);"></div>
    </div>

    <div class="relative z-10 max-w-[800px] mx-auto px-4 text-center">
      <h1 style="font-family: var(--font-sans); font-size: clamp(28px, 5vw, 48px); font-weight: 500; line-height: 1.2; color: var(--background); margin: 0 0 16px 0;">
        <?php echo esc_html( $hero['title'] ?? 'Mental Health Support & Programs' ); ?>
      </h1>
      
      <?php if ( $hero['subtitle'] ): ?>
        <p style="font-weight: 400; font-size: 16px; line-height: var(--line-height-md); color: var(--foreground); opacity: 0.9; font-family: var(--font-sans);">
          <?php echo esc_html( $hero['subtitle'] ); ?>
        </p>
      <?php endif; ?>
    </div>
  </section>

  <!-- Assessment Section -->
  <section id="assessment" class="py-12 border-y border-gray-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Assessment Section</h2>
      <p>Assessment content would be populated from WordPress CMS</p>
    </div>
  </section>

  <!-- Mission Section -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Mission</h2>
      <p>Mission content would be populated from WordPress CMS</p>
    </div>
  </section>

  <!-- Programs Section -->
  <section id="programs" class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Programs</h2>
      <p>Programs content would be populated from WordPress CMS</p>
    </div>
  </section>

  <!-- Benefits Section -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Benefits</h2>
      <p>Benefits content would be populated from WordPress CMS</p>
    </div>
  </section>

  <!-- Testimonial Section -->
  <section class="py-12 border-y border-gray-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Testimonials</h2>
      <p>Testimonial content would be populated from WordPress CMS</p>
    </div>
  </section>

  <!-- Newsletter Section -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Newsletter</h2>
      <p>Newsletter content would be populated from WordPress CMS</p>
    </div>
  </section>

</main>

<?php get_footer(); ?>