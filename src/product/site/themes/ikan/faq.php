<?php
/**
 * Template Name: FAQ
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for the FAQ page
  $cms_content = get_post_meta( get_the_ID(), 'page-faq', true );
  $faq = [];
  if ( $cms_content ) {
    try { $faq = json_decode( $cms_content, true ); } catch ( $e ) {}
  }
  ?>
  
  <?php
  // Get FAQ data from CMS
  $faq_data = $faq ?? [];
  $hero_title = $faq_data['heroTitle'] ?? 'FAQs & Help Center';
  $hero_subtitle = $faq_data['heroSubtitle'] ?? '';
  $search_placeholder = $faq_data['searchPlaceholder'] ?? 'Search for answers...';
  $no_results_text = $faq_data['noResultsText'] ?? 'No results found.';
  $cta_title = $faq_data['ctaTitle'] ?? 'Need More Help?';
  $cta_description = $faq_data['ctaDescription'] ?? '';
  $cta_button_text = $faq_data['ctaButtonText'] ?? 'Contact Support';
  $cta_button_route = $faq_data['ctaButtonRoute'] ?? '/contact';
  ?>

  <!-- Hero Section -->
  <section class="py-16">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            <?php echo esc_html( $hero_title ); ?>
          </h1>
          <?php if ( $hero_subtitle ): ?>
            <p class="text-lg text-gray-600">
              <?php echo esc_html( $hero_subtitle ); ?>
            </p>
          <?php endif; ?>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-400" aria-hidden="true" focusable="false">
            <use href="#icon-search" />
          </svg>
          <input type="search"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary w-64"
            placeholder="<?php echo esc_attr( $search_placeholder ); ?>"
            />
        </div>
      </div>
    </div>
  </section>

  <!-- Topics/Tabs -->
  <section class="py-8 border-b border-gray-100">
    <div class="max-w-[1600px] mx-auto px-4 flex gap-2">
      <div class="flex">
        <button type="button"
          class="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary border-b-2 border-transparent transition-colors"
          data-category="all"
          <?php echo ( !isset( $_GET['category'] ) || $_GET['category'] === 'all' ) ? 'aria-current="page"' : ''; ?>>
          All
        </button>
        <?php 
        // Get categories from FAQ data
        $categories = $faq_data['categories'] ?? [];
        $seen = [];
        foreach ( $categories as $cat ): 
          $cat_id = $cat['id'] ?? '';
          if ( !in_array( $cat_id, $seen ) ): 
            $seen[] = $cat_id;
        ?>
          <button type="button"
            class="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary border-b-2 border-transparent transition-colors"
            data-category="<?php echo esc_attr( $cat_id ); ?>"
            <?php echo ( isset( $_GET['category'] ) && $_GET['category'] === $cat_id ) ? 'aria-current="page"' : ''; ?>>
            <?php echo esc_html( $cat['title'] ?? $cat_id ); ?>
          </button>
        <?php endif; endforeach; ?>
      </div>
    </div>
  </section>

  <!-- FAQ Groups -->
  <section class="py-8">
    <div class="max-w-[1600px] mx-auto px-4">
      <?php 
      $groups = $faq_data['categories'] ?? [];
      $query = strtolower( $_GET['q'] ?? '' );
      ?>
      
      <?php if ( empty( $groups ) ): ?>
        <p class="text-gray-500">
          <?php echo esc_html( $no_results_text ); ?>
        </p>
      <?php else: ?>
        <?php foreach ( $groups as $group ): 
          $group_id = $group['id'] ?? '';
          $items = $group['items'] ?? [];
          // Filter items based on search query
          $filtered_items = $items;
          if ( $query ): 
            $filtered_items = array_filter( $items, function( $item ) use ( $query ) {
              return stripos( $item['question'], $query ) !== false || 
                     stripos( $item['answer'], $query ) !== false;
            } );
          endif;
        ?>
          <?php if ( count( $filtered_items ) > 0 ): ?>
            <section class="faq-group">
              <h2 class="faq-group__title text-xl font-medium text-gray-900 mb-4">
                <?php echo esc_html( $group['title'] ?? '' ); ?>
              </h2>
              <div class="faq-list">
                <?php foreach ( $filtered_items as $item ): 
                  $question = $item['question'] ?? '';
                  $answer = $item['answer'] ?? '';
                ?>
                  <details key="<?php echo esc_attr( $question ); ?>"
                    class="faq-item"
                    <?php echo ( $query ) ? 'open' : ''; ?>>
                    <summary><?php echo esc_html( $question ); ?></summary>
                    <p><?php echo wp_kses_post( $answer ); ?></p>
                  </details>
                <?php endforeach; ?>
              </div>
            </section>
          <?php endif; endforeach; ?>
      <?php endif; ?>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-8 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="border rounded-lg p-6">
        <p class="text-lg mb-2">
          <?php echo esc_html( $cta_title ); ?>
        </p>
        <p class="text-gray-600">
          <?php echo esc_html( $cta_description ); ?>
        </p>
        <button type="button"
          class="info-button mt-4 w-full"
          onClick="window.location.href='<?php echo esc_url( $cta_button_route ); ?>'">
          <?php echo esc_html( $cta_button_text ); ?>
        </button>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>