<?php
/** 
 * Template Name: Terms of Use 
 * Template Post Type: page 
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  $cms_content = get_post_meta( get_the_ID(), 'page-terms', true );
  $terms = [];
  if ( $cms_content ) {
    try { $terms = json_decode( $cms_content, true ); } catch ( $e ) {}
  }
  ?>

  <section class="py-16">
    <div class="max-w-[1600px] mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        <?php echo esc_html( $terms['heroTitle'] ?? 'Terms of Use' ); ?>
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        <?php echo esc_html( $terms['heroSubtitle'] ?? '' ); ?>
      </p>
    </div>
  </section>

  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="prose max-w-prose">
        <?php echo wp_kses_post( $terms['content'] ?? '' ); ?>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>