<?php
/**
 * Template Name: Resources
 * Template Post Type: page
 * Description: The iKAN Health Resources library page (articles, videos, audio)
 * 1:1 parity with src/product/site/pages/Resources.tsx
 *
 * @package iKAN_Health
 */

get_header();

// Fetch all published posts
$args = [
  'post_type'      => 'post',
  'posts_per_page' => -1,
  'post_status'    => 'publish',
  'orderby'        => 'date',
  'order'          => 'DESC',
];
$query = new WP_Query( $args );

// Build post models array
$resources_list = [];
$unique_categories = [];

if ( $query->have_posts() ) {
  while ( $query->have_posts() ) {
    $query->the_post();
    $p_id   = get_the_ID();
    $meta   = function_exists( 'ikan_get_resource_extra_meta' ) ? ikan_get_resource_extra_meta( $p_id ) : [];
    $art    = $meta['art'] ?? 'checkup';
    $medium = $meta['medium'] ?? get_post_meta( $p_id, 'medium', true ) ?: 'article';
    $minutes = $meta['minutes'] ?? ( get_post_meta( $p_id, 'minutes', true ) ?: 5 );
    $featured = get_post_meta( $p_id, 'featured', true );
    $categories = get_the_category();
    $cat_name = ! empty( $categories ) ? $categories[0]->name : 'Mental Health';

    if ( ! in_array( $cat_name, $unique_categories, true ) ) {
      $unique_categories[] = $cat_name;
    }

    $item = [
      'id'       => $p_id,
      'title'    => get_the_title(),
      'permalink'=> get_permalink(),
      'category' => $cat_name,
      'date'     => get_the_date( 'c' ),
      'date_str' => get_the_date( 'j M Y' ),
      'minutes'  => $minutes,
      'medium'   => $medium,
      'art'      => $art,
      'featured' => ! empty( $featured ) && '0' !== $featured,
      'excerpt'  => get_the_excerpt(),
    ];

    $resources_list[] = $item;
  }
  wp_reset_postdata();
}

sort( $unique_categories );
?>

<main id="main-content" class="ikan2-theme info-page site-page-below-nav w-full flex-1">
  <section class="info-band">
    <div class="info-band__inner">
      <p class="info-eyebrow">Library</p>
      <h1 class="info-title">Resources</h1>
      <p class="info-subtitle">
        Articles on sleep, stress, burnout and balance — what the measures actually mean, and what to do next. Free to read, no account needed.
      </p>

      <div class="library-controls">
        <!-- Live Search Bar -->
        <div class="library-search">
          <svg class="library-search__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <label class="sr-only" for="library-search-input">Search resources</label>
          <input
            id="library-search-input"
            type="search"
            placeholder="Search resources"
            aria-label="Search resources"
          />
        </div>

        <!-- Filter Chips by Topic -->
        <?php if ( count( $unique_categories ) > 0 ) : ?>
          <div class="library-filters" role="group" aria-label="Filter by topic">
            <button
              type="button"
              class="library-chip"
              aria-pressed="true"
              data-cat="all"
            >
              All
            </button>
            <?php foreach ( $unique_categories as $cat ) : ?>
              <button
                type="button"
                class="library-chip"
                aria-pressed="false"
                data-cat="<?php echo esc_attr( strtolower( $cat ) ); ?>"
              >
                <?php echo esc_html( $cat ); ?>
              </button>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>

      <!-- Count Status Indicator -->
      <p id="resources-count" class="library-note" role="status">
        <?php echo count( $resources_list ); ?> <?php echo count( $resources_list ) === 1 ? 'resource' : 'resources'; ?>
      </p>

      <!-- Empty Filter State -->
      <p id="resources-empty" class="library-empty" style="display: none;">
        Nothing matches that yet. Try a different word, or clear the filters.
      </p>

      <!-- 3-Column Library Grid on Desktop, 2 on Tablet, 1 on Mobile -->
      <ul id="resources-grid" class="library-grid">
        <?php foreach ( $resources_list as $r ) : ?>
          <li
            class="library-item"
            data-title="<?php echo esc_attr( strtolower( $r['title'] ) ); ?>"
            data-desc="<?php echo esc_attr( strtolower( $r['excerpt'] ) ); ?>"
            data-category="<?php echo esc_attr( strtolower( $r['category'] ) ); ?>"
          >
            <a href="<?php echo esc_url( $r['permalink'] ); ?>" class="library-card">
              <span class="library-card__media">
                <?php echo ikan_render_art_svg( $r['art'], 'w-full h-full object-cover' ); ?>
                <?php if ( ! empty( $r['category'] ) ) : ?>
                  <span class="library-card__tag"><?php echo esc_html( $r['category'] ); ?></span>
                <?php endif; ?>
              </span>
              <strong class="library-card__title">
                <?php echo esc_html( $r['title'] ); ?>
              </strong>
              <?php if ( ! empty( $r['excerpt'] ) ) : ?>
                <span class="library-card__desc">
                  <?php echo esc_html( wp_trim_words( $r['excerpt'], 20 ) ); ?>
                </span>
              <?php endif; ?>
              <span class="library-card__meta">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>
                </svg>
                <span><?php echo esc_html( $r['date_str'] ); ?></span>
                <span>·</span>
                <span><?php echo esc_html( $r['minutes'] ); ?> min</span>
              </span>
            </a>
          </li>
        <?php endforeach; ?>
      </ul>

    </div>
  </section>
</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var searchInput = document.getElementById('library-search-input');
  var chips       = document.querySelectorAll('.library-chip');
  var items       = document.querySelectorAll('.library-item');
  var countEl     = document.getElementById('resources-count');
  var emptyEl     = document.getElementById('resources-empty');
  var totalItems  = items.length;

  var currentCat   = 'all';
  var currentQuery = '';

  function filterResources() {
    var visible = 0;
    items.forEach(function(item) {
      var title = item.getAttribute('data-title') || '';
      var desc  = item.getAttribute('data-desc') || '';
      var cat   = item.getAttribute('data-category') || '';

      var matchesQuery = !currentQuery || (title.indexOf(currentQuery) !== -1) || (desc.indexOf(currentQuery) !== -1) || (cat.indexOf(currentQuery) !== -1);
      var matchesCat   = (currentCat === 'all') || (cat === currentCat);

      if (matchesQuery && matchesCat) {
        item.style.display = '';
        visible++;
      } else {
        item.style.display = 'none';
      }
    });

    if (countEl) {
      if (visible === totalItems) {
        countEl.textContent = totalItems + (totalItems === 1 ? ' resource' : ' resources');
      } else {
        countEl.textContent = visible + ' of ' + totalItems + ' resources';
      }
    }

    if (emptyEl) {
      emptyEl.style.display = (visible === 0) ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentQuery = this.value.trim().toLowerCase();
      filterResources();
    });
  }

  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      chips.forEach(function(c) {
        c.setAttribute('aria-pressed', 'false');
      });
      this.setAttribute('aria-pressed', 'true');
      currentCat = this.getAttribute('data-cat') || 'all';
      filterResources();
    });
  });
});
</script>

<?php get_footer(); ?>
