<?php
/**
 * Template Name: Legal Policy
 * Template Post Type: page
 * Description: Authentic iKAN Health Legal / Policies page (Terms, Privacy, Return, Cancellation)
 * 1:1 parity with src/product/site/pages/LegalPage.tsx
 *
 * @package iKAN_Health
 */

get_header();

// Determine current slug from query var or page slug
$query_slug = get_query_var( 'ikan_legal_slug' );
if ( ! $query_slug ) {
  $post_name = get_post_field( 'post_name', get_the_ID() );
  if ( strpos( $post_name, 'privacy' ) !== false ) {
    $query_slug = 'privacy-policy';
  } elseif ( strpos( $post_name, 'cancel' ) !== false ) {
    $query_slug = 'cancellation-policy';
  } elseif ( strpos( $post_name, 'return' ) !== false ) {
    $query_slug = 'return-policy';
  } else {
    $query_slug = 'terms';
  }
}

// Policies mapping
$policies = [
  'terms' => [
    'title'    => 'Terms of Service',
    'subtitle' => 'Important legal terms governing your use of iKan\'s mental health platform and services.',
    'url'      => home_url( '/terms-of-use' ),
  ],
  'privacy-policy' => [
    'title'    => 'Privacy Policy',
    'subtitle' => 'How we collect, use, and protect your personal information and health data.',
    'url'      => home_url( '/privacy-policy' ),
  ],
  'cancellation-policy' => [
    'title'    => 'Cancellation Policy',
    'subtitle' => 'Guidelines for booking, rescheduling, and cancelling appointments and services.',
    'url'      => home_url( '/cancellation-policy' ),
  ],
  'return-policy' => [
    'title'    => 'Return Policy',
    'subtitle' => 'Our policy regarding refunds, satisfaction guarantees, and digital product returns.',
    'url'      => home_url( '/return-policy' ),
  ],
];

$active_key = isset( $policies[ $query_slug ] ) ? $query_slug : 'terms';
$current_policy = $policies[ $active_key ];

// Clean post content from WordPress
$content = '';
if ( have_posts() ) {
  while ( have_posts() ) {
    the_post();
    $content = get_the_content();
  }
}

if ( empty( $content ) ) {
  // Fallback to static legal content
  $content = '<h3>1. Agreement to Terms</h3><p>By accessing or using the iKAN Health platform, you agree to be bound by these terms and conditions.</p><h3>2. Scope of Services</h3><p>iKAN Health provides evidence-based mental wellbeing tools, self-guided programs, professional consultations, and assessments. Our services do not constitute emergency medical care.</p><h3>3. Privacy & Confidentiality</h3><p>Your wellbeing data is held under strict confidentiality standards in compliance with applicable health data laws in India.</p>';
}

// Strip hardcoded Tailwind classes that fight .prose-ikan
$clean_html = preg_replace( '/\sclass="[^"]*"/', '', $content );
?>

<div class="ikan2-theme info-page site-page-below-nav">
  <section class="info-band">
    <div class="info-band__inner">
      <p class="info-eyebrow">Legal</p>
      <h1 class="info-title"><?php echo esc_html( $current_policy['title'] ); ?></h1>
      <p class="info-subtitle"><?php echo esc_html( $current_policy['subtitle'] ); ?></p>

      <!-- 4-Policy Tab Switcher -->
      <nav class="info-tabs" aria-label="Policies">
        <?php foreach ( $policies as $slug => $p ) : ?>
          <a
            href="<?php echo esc_url( $p['url'] ); ?>"
            class="info-tab no-underline"
            <?php if ( $slug === $active_key ) echo 'aria-current="page"'; ?>
          >
            <?php echo esc_html( $p['title'] ); ?>
          </a>
        <?php endforeach; ?>
      </nav>

      <!-- Policy Body -->
      <div class="prose-ikan info-prose mt-8">
        <?php echo wp_kses_post( $clean_html ); ?>
      </div>

    </div>
  </section>
</div>

<?php get_footer(); ?>
