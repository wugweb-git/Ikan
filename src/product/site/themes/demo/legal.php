<?php
/**
 * Template Name: Legal Page
 * Template Post Type: page
 * Description: Unified Legal page template with horizontal tab switcher
 */

get_header();

// Determine current slug
$slug = get_query_var( 'legal_slug' );
if ( empty( $slug ) ) {
  $path = trim( parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), '/' );
  if ( in_array( $path, [ 'privacy-policy', 'privacy' ] ) ) $slug = 'privacy-policy';
  elseif ( in_array( $path, [ 'terms-of-use', 'terms' ] ) ) $slug = 'terms';
  elseif ( $path === 'cancellation-policy' ) $slug = 'cancellation-policy';
  elseif ( $path === 'return-policy' ) $slug = 'return-policy';
  elseif ( $path === 'workplace-privacy' ) $slug = 'workplace-privacy';
  else $slug = 'privacy-policy';
}

// Load from pages.json as fallback
$pages_file = get_template_directory() . '/assets/pages.json';
$pages_data = [];
if ( file_exists( $pages_file ) ) {
  $pages_data = json_decode( file_get_contents( $pages_file ), true ) ?: [];
}

$legal_data = $pages_data['legal'] ?? [];

$legal_tabs = [
  'privacy-policy'       => [ 'label' => 'Privacy Policy', 'url' => home_url( '/privacy-policy' ) ],
  'terms'                => [ 'label' => 'Terms of Use', 'url' => home_url( '/terms-of-use' ) ],
  'workplace-privacy'    => [ 'label' => 'Workplace Privacy', 'url' => home_url( '/workplace-privacy' ) ],
  'cancellation-policy'  => [ 'label' => 'Cancellation', 'url' => home_url( '/cancellation-policy' ) ],
  'return-policy'        => [ 'label' => 'Return Policy', 'url' => home_url( '/return-policy' ) ],
];

// Content resolution
$current_item = $legal_data[ $slug ] ?? [];
$title = $current_item['title'] ?? ( $legal_tabs[ $slug ]['label'] ?? 'Legal Notice' );
$effective_date = $current_item['effectiveDate'] ?? 'October 2026';
$sections = $current_item['sections'] ?? [];
$summary = $current_item['summary'] ?? '';
?>

<main class="site-page-below-nav w-full flex-1 pt-28 pb-20" style="background-color: var(--canvas); font-family: var(--font-sans);">
  
  <div class="max-w-4xl mx-auto px-6">
    
    <!-- Top Pill Navigation Bar -->
    <div class="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 mb-10 pb-2 no-scrollbar">
      <?php foreach ( $legal_tabs as $tab_key => $tab ) : 
        $is_active = ( $tab_key === $slug || ( $slug === 'privacy' && $tab_key === 'privacy-policy' ) || ( $slug === 'terms-of-use' && $tab_key === 'terms' ) );
      ?>
        <a 
          href="<?php echo esc_url( $tab['url'] ); ?>" 
          class="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all <?php echo $is_active ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'; ?>"
        >
          <?php echo esc_html( $tab['label'] ); ?>
        </a>
      <?php endforeach; ?>
    </div>

    <!-- Main Content Card -->
    <article class="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-8">
      
      <div class="border-b border-gray-100 pb-6">
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mb-3 inline-block">
          Official Policy
        </span>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2" style="font-family: var(--font-display);">
          <?php echo esc_html( $title ); ?>
        </h1>
        <p class="text-xs text-gray-400">
          Effective date: <?php echo esc_html( $effective_date ); ?> • iKAN Health Platform
        </p>
      </div>

      <?php if ( ! empty( $summary ) ) : ?>
        <div class="p-5 rounded-2xl bg-gray-50 border-l-4 border-emerald-600 text-sm text-gray-700 leading-relaxed">
          <?php echo esc_html( $summary ); ?>
        </div>
      <?php endif; ?>

      <!-- Sections -->
      <?php if ( ! empty( $sections ) && is_array( $sections ) ) : ?>
        <div class="space-y-8">
          <?php foreach ( $sections as $sec ) : ?>
            <div class="space-y-2">
              <h2 class="text-lg font-bold text-gray-900" style="font-family: var(--font-display);">
                <?php echo esc_html( $sec['title'] ?? '' ); ?>
              </h2>
              <div class="text-sm text-gray-600 leading-relaxed space-y-2">
                <?php if ( ! empty( $sec['content'] ) ) : ?>
                  <p><?php echo nl2br( esc_html( $sec['content'] ) ); ?></p>
                <?php endif; ?>
                <?php if ( ! empty( $sec['bullets'] ) && is_array( $sec['bullets'] ) ) : ?>
                  <ul class="list-disc pl-5 space-y-1">
                    <?php foreach ( $sec['bullets'] as $bullet ) : ?>
                      <li><?php echo esc_html( $bullet ); ?></li>
                    <?php endforeach; ?>
                  </ul>
                <?php endif; ?>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php else : ?>
        <div class="prose max-w-none text-gray-700">
          <?php the_content(); ?>
        </div>
      <?php endif; ?>

      <!-- Contact Helpline Card -->
      <div class="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>Questions about this policy? Contact our data governance officer at <a href="mailto:support@ikanhealth.in" class="underline font-semibold text-gray-900">support@ikanhealth.in</a>.</p>
        <a href="tel:+918527545503" class="font-semibold text-gray-900 hover:underline shrink-0">+91 85275 45503</a>
      </div>

    </article>

  </div>

</main>

<?php get_footer(); ?>
