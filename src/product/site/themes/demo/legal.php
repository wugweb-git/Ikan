<?php
/**
 * Template Name: Legal Page
 * Template Post Type: page
 * Description: Legal pages (Privacy, Terms, etc.)
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get the legal slug from the query var
  $slug = get_query_var( 'legal_slug' ) ? get_query_var( 'legal_slug' ) : 'privacy';
  $legal_slugs = [ 'privacy', 'terms', 'return-policy', 'cancellation-policy' ];
  if ( ! in_array( $slug, $legal_slugs ) ) {
    $slug = 'privacy';
  }
  
  // Get CMS content for the legal page
  $cms_key = $slug === 'privacy' ? 'privacy' : $slug;
  $cms_content = get_post_meta( get_the_ID(), $cms_key, true );
  $legal = [];
  if ( $cms_content ) {
    try { $legal = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  ?>
  
  <?php
  // Legal page content keys
  $legal_pages = [
    'privacy' => [
      'title' => 'Privacy Policy',
      'subtitle' => 'Your privacy and data security are fundamental to our mission.',
    ],
    'terms' => [
      'title' => 'Terms of Service',
      'subtitle' => "Important legal terms governing your use of iKAN's platform and services.",
    ],
    'return-policy' => [
      'title' => 'Return & Refund Policy',
      'subtitle' => 'Understanding our refund and return policy for iKAN services.',
    ],
    'cancellation-policy' => [
      'title' => 'Cancellation Policy',
      'subtitle' => 'We understand plans change. Cancel anytime with no penalties or hidden fees.',
    ],
  ];
  $page_info = $legal_pages[ $slug ] ?? $legal_pages['privacy'];
  ?>

  <!-- Legal Page Header -->
  <section class="py-12 border-b border-gray-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="flex items-center space-x-4">
        <p class="text-sm font-medium text-gray-500">Legal</p>
        <h1 class="text-3xl font-bold text-gray-900">
          <?php echo esc_html( $page_info['title'] ); ?>
        </h1>
        <?php if ( $page_info['subtitle'] ): ?>
          <p class="text-gray-500">
            <?php echo esc_html( $page_info['subtitle'] ); ?>
          </p>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <!-- Legal Content -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4 prose prose-in max-w-prose">
      <?php if ( $legal ): ?>
        <?php echo wp_kses_post( $legal ); ?>
      <?php else: ?>
        <p class="text-gray-600">
          Content for <?php echo esc_html( $page_info['title'] ); ?> will be populated from the WordPress CMS.
        </p>
      <?php endif; ?>
    </div>
  </section>

  <!-- Legal Navigation (for the four legal pages) -->
  <section class="py-8 border-t border-gray-100">
    <div class="max-w-[1600px] mx-auto px-4 flex flex-col md:flex-row justify-center space-x-8">
      <?php foreach ( $legal_pages as $key => $info ): 
        $is_active = $key === $slug ? 'border-b-2 border-primary' : '';
      ?>
        <a href="<?php echo esc_url( add_query_arg( 'legal_slug', $key ) ); ?>"
          class="text-gray-600 hover:text-primary font-medium py-2 border-b-2 transition-colors <?php echo esc_attr( $is_active ); ?>">
          <?php echo esc_html( $info['title'] ); ?>
        </a>
      <?php endforeach; ?>
    </div>
  </section>

</main>

<?php get_footer(); ?>