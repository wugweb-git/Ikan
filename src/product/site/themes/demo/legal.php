<?php
/**
 * Template Name: Legal Page
 * Template Post Type: page
 * Description: Authentic iKAN Health Legal page matching LegalPage.tsx and index-C1zkq2-P.css
 *
 * Matches info-page, info-band, info-band__inner container, horizontal tab switcher,
 * info-title, and prose-ikan info-prose across Terms, Privacy Policy, Cancellation Policy, and Return Policy.
 *
 * @package iKAN_Health
 */

get_header();

// Determine current slug
$slug = get_query_var( 'legal_slug' );
if ( empty( $slug ) ) {
  $raw_path = trim( parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );
  $path = preg_replace( '#^legal/#', '', $raw_path );

  if ( in_array( $path, [ 'privacy-policy', 'privacy' ], true ) ) {
    $slug = 'privacy-policy';
  } elseif ( in_array( $path, [ 'terms-of-use', 'terms-of-service', 'terms' ], true ) ) {
    $slug = 'terms';
  } elseif ( in_array( $path, [ 'cancellation-policy', 'cancellation' ], true ) ) {
    $slug = 'cancellation-policy';
  } elseif ( in_array( $path, [ 'return-policy', 'refund-policy', 'refund' ], true ) ) {
    $slug = 'return-policy';
  } else {
    $slug = 'privacy-policy';
  }
}

// Canonical slug normalization
if ( $slug === 'privacy' ) $slug = 'privacy-policy';
if ( $slug === 'terms-of-use' || $slug === 'terms-of-service' ) $slug = 'terms';
if ( $slug === 'refund-policy' || $slug === 'refund' ) $slug = 'return-policy';

// Load canonical legal content from assets/pages.json (byte-identical to ikan2)
$pages_file = get_template_directory() . '/assets/pages.json';
$pages_data = [];
if ( file_exists( $pages_file ) ) {
  $pages_data = json_decode( file_get_contents( $pages_file ), true ) ?: [];
}

$legal_pages = $pages_data['legal'] ?? [];
$legal_order = [ 'privacy-policy', 'terms', 'cancellation-policy', 'return-policy' ];

// Fallback if slug not found
$page = $legal_pages[ $slug ] ?? ( $legal_pages['privacy-policy'] ?? [] );

$page_title    = $page['title'] ?? 'Privacy Policy';
$page_subtitle = $page['subtitle'] ?? '';
$page_html     = $page['html'] ?? '';

// Fallback to post content if html is empty
if ( empty( $page_html ) ) {
  $page_html = apply_filters( 'the_content', get_the_content() );
}

// Clean any hardcoded utility classes from html so .prose-ikan styles it purely
$page_html = preg_replace( '/\sclass="[^"]*"/', '', $page_html );

// Route mapping for tabs
$tab_routes = [
  'privacy-policy'      => home_url( '/privacy-policy' ),
  'terms'               => home_url( '/terms' ),
  'cancellation-policy' => home_url( '/cancellation-policy' ),
  'return-policy'       => home_url( '/return-policy' ),
];
?>

<main id="main-content" tabindex="-1" class="flex-1 w-full relative outline-none p-[0px]" role="main" aria-label="Page content">
  <div class="ikan2-theme info-page site-page-below-nav">
    <section class="info-band">
      <div class="info-band__inner">
        
        <p class="info-eyebrow">Legal</p>
        <h1 class="info-title"><?php echo esc_html( $page_title ); ?></h1>
        <?php if ( ! empty( $page_subtitle ) ) : ?>
          <p class="info-subtitle"><?php echo esc_html( $page_subtitle ); ?></p>
        <?php endif; ?>

        <!-- Legal Tabs Switcher (matching LegalPage.tsx and ikan2) -->
        <nav class="info-tabs" aria-label="Policies" style="margin-top: 24px;">
          <?php foreach ( $legal_order as $s ) : 
            $tab_info  = $legal_pages[ $s ] ?? [];
            $is_active = ( $s === $slug );
            $tab_url   = $tab_routes[ $s ] ?? home_url( '/' . $s );
          ?>
            <a
              href="<?php echo esc_url( $tab_url ); ?>"
              class="info-tab"
              <?php if ( $is_active ) echo 'aria-current="page"'; ?>
            >
              <?php echo esc_html( $tab_info['title'] ?? ucfirst( str_replace( '-', ' ', $s ) ) ); ?>
            </a>
          <?php endforeach; ?>
        </nav>

        <!-- Legal Prose Content -->
        <div class="prose-ikan info-prose">
          <?php echo $page_html; ?>
        </div>

      </div>
    </section>
  </div>
</main>

<?php get_footer(); ?>
