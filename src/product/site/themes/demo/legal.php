<?php
/**
 * Template Name: Legal Page
 * Template Post Type: page
 * Description: Exact 1:1 replica of iKAN 2 PWA Legal layout (ikan2/src/routes/legal.$slug.tsx)
 *
 * Matches InfoShell wide container, horizontal tab bar, font-display heading,
 * and prose-ikan body styling across Terms, Privacy Policy, Cancellation Policy, and Return Policy.
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
    $slug = 'terms';
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
$legal_order = [ 'terms', 'privacy-policy', 'cancellation-policy', 'return-policy' ];

// Fallback if slug not found
$page = $legal_pages[ $slug ] ?? ( $legal_pages['terms'] ?? [] );

$page_title    = $page['title'] ?? 'Terms of Service';
$page_subtitle = $page['subtitle'] ?? '';
$page_html     = $page['html'] ?? '';

// Fallback to post content if html is empty
if ( empty( $page_html ) ) {
  $page_html = apply_filters( 'the_content', get_the_content() );
}

// Route mapping for tabs matching ikan2
$tab_routes = [
  'terms'               => home_url( '/terms' ),
  'privacy-policy'      => home_url( '/privacy-policy' ),
  'cancellation-policy' => home_url( '/cancellation-policy' ),
  'return-policy'       => home_url( '/return-policy' ),
];
?>

<main class="site-page-below-nav w-full flex-1 pt-16 sm:pt-20 pb-24 bg-canvas text-foreground ikan2-theme ikan2-type">
  <div class="mx-auto min-h-dvh w-full bg-background pb-12 shadow-app max-w-read">
    
    <!-- Top Bar with Back Button -->
    <div class="flex items-center h-14 px-3">
      <a
        href="<?php echo esc_url( home_url( '/' ) ); ?>"
        aria-label="Back"
        class="grid h-12 w-12 place-items-center rounded-full text-foreground hover:bg-foreground/5 transition-colors"
      >
        <i data-lucide="arrow-left" class="h-6 w-6"></i>
      </a>
    </div>

    <!-- Legal Tabs Switcher (matching ikan2 exactly) -->
    <div
      class="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-2"
      role="navigation"
      aria-label="Legal pages"
    >
      <?php foreach ( $legal_order as $s ) : 
        $tab_info  = $legal_pages[ $s ] ?? [];
        $is_active = ( $s === $slug );
        $tab_url   = $tab_routes[ $s ] ?? home_url( '/' . $s );
      ?>
        <a
          href="<?php echo esc_url( $tab_url ); ?>"
          class="type-label-lg inline-flex h-9 shrink-0 items-center rounded-[8px] border px-3.5 font-medium transition-colors <?php echo $is_active ? 'border-transparent bg-foreground text-background' : 'border-foreground/20 text-foreground hover:bg-secondary'; ?>"
        >
          <?php echo esc_html( $tab_info['title'] ?? ucfirst( str_replace( '-', ' ', $s ) ) ); ?>
        </a>
      <?php endforeach; ?>
    </div>

    <!-- Header -->
    <header class="px-5 pt-4">
      <h1 class="font-display text-[30px] font-semibold leading-9 text-foreground"><?php echo esc_html( $page_title ); ?></h1>
      <?php if ( ! empty( $page_subtitle ) ) : ?>
        <p class="mt-2 text-[16px] leading-6 text-muted-foreground"><?php echo esc_html( $page_subtitle ); ?></p>
      <?php endif; ?>
    </header>

    <!-- Legal Prose Content (prose-ikan: exact styling from ikan2) -->
    <div class="prose-ikan mt-6 px-5">
      <?php echo $page_html; ?>
    </div>

    <div class="h-8"></div>
  </div>
</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }
});
</script>

<?php get_footer(); ?>
