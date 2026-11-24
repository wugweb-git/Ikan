<?php
/**
 * Template Name: Resources
 * Template Post Type: page
 * Description: The iKAN Health Resources archive page (articles, videos, audio)
 * Ported 1:1 from iKAN 2 PWA (ikan2/src/routes/resources.index.tsx)
 *
 * Matches exact mobile ergonomics, snap carousel of featured/latest cards,
 * tabbed filter bar (All / Read / Listen / Watch), live search,
 * and ResourceRow card list with SVG art illustrations.
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
$featured_list  = [];

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

    $item = [
      'id'       => $p_id,
      'title'    => get_the_title(),
      'permalink'=> get_permalink(),
      'category' => $cat_name,
      'date'     => get_the_date( 'c' ),
      'date_str' => get_the_date( 'j M' ),
      'minutes'  => $minutes,
      'medium'   => $medium,
      'art'      => $art,
      'featured' => ! empty( $featured ) && '0' !== $featured,
      'excerpt'  => get_the_excerpt(),
    ];

    $resources_list[] = $item;
    if ( $item['featured'] ) {
      $featured_list[] = $item;
    }
  }
  wp_reset_postdata();
}

// In ikan2, featured carousel is: [first newest item, ...remaining featured items]
$carousel_items = [];
if ( ! empty( $resources_list ) ) {
  $carousel_items[] = $resources_list[0];
  foreach ( $resources_list as $idx => $r ) {
    if ( $idx > 0 && $r['featured'] ) {
      $carousel_items[] = $r;
    }
  }
}
?>

<main class="site-page-below-nav w-full flex-1 pt-20 sm:pt-24 pb-24 bg-background ikan2-theme ikan2-type">
  <div class="max-w-app sm:max-w-4xl lg:max-w-5xl mx-auto px-0 sm:px-6" style="--accent-strong: #10B981; --accent-container: #E6F4EA; --on-accent-container: #0D652D;">
    
    <!-- Page Header (safe-top px-4 pb-1) -->
    <header class="px-4 sm:px-0 pb-1">
      <h1 class="type-headline-lg sm:type-display-sm font-semibold text-foreground">Resources</h1>
      <p class="type-action sm:type-body-xl mt-1 text-muted-foreground font-normal">
        Articles and guides to support your mental health journey
      </p>
    </header>

    <!-- Featured Horizontal Snap Carousel (matching ikan2 exactly on mobile, responsive track on desktop) -->
    <?php if ( ! empty( $carousel_items ) ) : ?>
      <section class="mt-5 sm:mt-8" aria-label="Featured">
        <div class="no-scrollbar flex snap-x snap-mandatory gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-0 pb-1">
          <?php foreach ( $carousel_items as $i => $r ) : ?>
            <a
              href="<?php echo esc_url( $r['permalink'] ); ?>"
              class="relative block h-[232px] sm:h-[260px] w-[86%] sm:w-[340px] lg:w-[360px] shrink-0 snap-center overflow-hidden rounded-[28px] text-left text-white shadow-xs group"
            >
              <div class="absolute inset-0">
                <?php echo ikan_render_art_svg( $r['art'], 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' ); ?>
              </div>
              <span class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></span>

              <!-- Corner Badge (Latest or Featured) -->
              <?php if ( 0 === $i ) : ?>
                <span class="type-label-md font-semibold absolute left-4 top-4 inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-3 text-foreground shadow-sm">
                  <i data-lucide="<?php echo $r['featured'] ? 'star' : 'sparkles'; ?>" class="h-3.5 w-3.5 text-amber-500"></i>
                  <span><?php echo $r['featured'] ? 'Featured' : 'Latest'; ?></span>
                </span>
              <?php endif; ?>

              <!-- Card Content Overlay -->
              <div class="absolute inset-x-0 bottom-0 p-5">
                <span class="type-label-md font-semibold inline-flex h-6 items-center gap-1.5 rounded-full bg-white/20 px-2.5 backdrop-blur text-white">
                  <?php if ( $r['medium'] === 'video' ) : ?>
                    <i data-lucide="play" class="h-3.5 w-3.5"></i>
                  <?php elseif ( $r['medium'] === 'audio' ) : ?>
                    <i data-lucide="headphones" class="h-3.5 w-3.5"></i>
                  <?php else : ?>
                    <i data-lucide="book-open" class="h-3.5 w-3.5"></i>
                  <?php endif; ?>
                  <span><?php echo esc_html( $r['category'] ); ?></span>
                </span>

                <h2 class="mt-2 line-clamp-3 font-display text-[20px] font-semibold leading-6 text-white">
                  <?php echo esc_html( $r['title'] ); ?>
                </h2>

                <span class="type-body-sm mt-2 flex items-center gap-3 opacity-90 text-white/90">
                  <span class="inline-flex items-center gap-1.5">
                    <i data-lucide="calendar-days" class="h-3.5 w-3.5"></i>
                    <span><?php echo esc_html( $r['date_str'] ); ?></span>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <?php if ( $r['medium'] === 'video' ) : ?>
                      <i data-lucide="play" class="h-3.5 w-3.5"></i> Watch
                    <?php elseif ( $r['medium'] === 'audio' ) : ?>
                      <i data-lucide="headphones" class="h-3.5 w-3.5"></i> Listen
                    <?php else : ?>
                      <i data-lucide="book-open" class="h-3.5 w-3.5"></i> Read
                    <?php endif; ?>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <i data-lucide="clock-3" class="h-3.5 w-3.5"></i>
                    <span><?php echo esc_html( $r['minutes'] ); ?> min</span>
                  </span>
                </span>
              </div>
            </a>
          <?php endforeach; ?>
        </div>
      </section>
    <?php endif; ?>

    <!-- Search & Filter Controls (exact bar from ikan2 on mobile, comfortable desktop controls) -->
    <div class="mt-6 sm:mt-8 px-4 sm:px-0">
      <div class="flex items-center gap-3">
        
        <!-- Live Search Input -->
        <div class="flex h-10 sm:h-11 flex-1 sm:max-w-md items-center gap-2 rounded-[10px] border border-foreground/20 pr-2 pl-3 bg-white">
          <i data-lucide="search" class="h-4 w-4 shrink-0 text-muted-foreground"></i>
          <input
            type="text"
            id="resources-search-input"
            placeholder="Search the library..."
            aria-label="Search the library"
            class="type-body-md h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground text-sm"
          />
          <button
            type="button"
            id="resources-search-clear"
            aria-label="Clear search"
            class="hidden h-6 w-6 place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <i data-lucide="x" class="h-4 w-4"></i>
          </button>
        </div>

      </div>

      <!-- Tabbed Filter Buttons (All, Read, Listen, Watch) -->
      <div class="no-scrollbar flex gap-2 overflow-x-auto mt-3 sm:mt-4" role="tablist" aria-label="Filter resources">
        <button
          type="button"
          data-filter="all"
          class="res-filter-btn type-label-lg inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border px-3.5 transition-colors cursor-pointer border-transparent bg-[var(--accent-container)] text-[var(--on-accent-container)] font-semibold"
        >
          All
        </button>
        <button
          type="button"
          data-filter="article"
          class="res-filter-btn type-label-lg inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border border-foreground/20 px-3.5 text-foreground transition-colors cursor-pointer hover:bg-secondary"
        >
          <i data-lucide="book-open" class="h-4 w-4"></i>
          <span>Read</span>
        </button>
        <button
          type="button"
          data-filter="audio"
          class="res-filter-btn type-label-lg inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border border-foreground/20 px-3.5 text-foreground transition-colors cursor-pointer hover:bg-secondary"
        >
          <i data-lucide="headphones" class="h-4 w-4"></i>
          <span>Listen</span>
        </button>
        <button
          type="button"
          data-filter="video"
          class="res-filter-btn type-label-lg inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border border-foreground/20 px-3.5 text-foreground transition-colors cursor-pointer hover:bg-secondary"
        >
          <i data-lucide="play" class="h-4 w-4"></i>
          <span>Watch</span>
        </button>
      </div>
    </div>

    <!-- Count indicator -->
    <p id="resources-count" class="type-body-sm mt-4 px-4 sm:px-0 text-muted-foreground">
      <?php echo count( $resources_list ); ?> resources
    </p>

    <!-- Empty State Container -->
    <div id="resources-empty" class="hidden mx-4 sm:mx-0 mt-3 overflow-hidden rounded-[24px] bg-secondary p-8 text-center">
      <p class="type-subhead font-semibold text-foreground">Nothing matches that</p>
      <p class="type-body-md mt-1 text-muted-foreground">Try another word, like sleep, stress, or anxiety.</p>
    </div>

    <!-- Resource List: 1-column mobile list, 2-column grid on desktop >= 640px -->
    <ul id="resources-list" class="mt-2 px-4 sm:px-0 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <?php foreach ( $resources_list as $r ) : ?>
        <li 
          class="res-item rounded-[20px] p-2.5 sm:p-3 hover:bg-secondary/60 transition-colors" 
          data-title="<?php echo esc_attr( strtolower( $r['title'] ) ); ?>" 
          data-category="<?php echo esc_attr( strtolower( $r['category'] ) ); ?>" 
          data-medium="<?php echo esc_attr( strtolower( $r['medium'] ) ); ?>"
        >
          <div class="flex items-center gap-3">
            <a
              href="<?php echo esc_url( $r['permalink'] ); ?>"
              class="flex min-w-0 flex-1 items-center gap-3 rounded-[16px] text-left group"
            >
              <span class="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[16px] bg-secondary">
                <?php echo ikan_render_art_svg( $r['art'], 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-200' ); ?>
              </span>
              <span class="min-w-0 flex-1">
                <span class="type-label-md font-semibold block text-[var(--accent-strong,#10B981)]">
                  <?php echo esc_html( $r['category'] ); ?>
                </span>
                <h3 class="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-5 text-foreground group-hover:text-[var(--accent-strong,#10B981)] transition-colors">
                  <?php echo esc_html( $r['title'] ); ?>
                </h3>
                <p class="type-body-sm mt-1 flex items-center gap-3 text-muted-foreground">
                  <span class="inline-flex items-center gap-1.5">
                    <i data-lucide="calendar-days" class="h-3.5 w-3.5"></i>
                    <span><?php echo esc_html( $r['date_str'] ); ?></span>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <?php if ( $r['medium'] === 'video' ) : ?>
                      <i data-lucide="play" class="h-3.5 w-3.5"></i> Watch
                    <?php elseif ( $r['medium'] === 'audio' ) : ?>
                      <i data-lucide="headphones" class="h-3.5 w-3.5"></i> Listen
                    <?php else : ?>
                      <i data-lucide="book-open" class="h-3.5 w-3.5"></i> Read
                    <?php endif; ?>
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <i data-lucide="clock-3" class="h-3.5 w-3.5"></i>
                    <span><?php echo esc_html( $r['minutes'] ); ?> min</span>
                  </span>
                </p>
              </span>
            </a>
          </div>
        </li>
      <?php endforeach; ?>
    </ul>

  </div>
</main>

<script>
// Filter & Search Engine (Native & Reactive)
document.addEventListener('DOMContentLoaded', function() {
  var searchInput = document.getElementById('resources-search-input');
  var clearBtn    = document.getElementById('resources-search-clear');
  var filterBtns  = document.querySelectorAll('.res-filter-btn');
  var items       = document.querySelectorAll('.res-item');
  var countEl     = document.getElementById('resources-count');
  var emptyEl     = document.getElementById('resources-empty');

  var currentFilter = 'all';
  var currentQuery  = '';

  function applyFilters() {
    var visible = 0;
    items.forEach(function(item) {
      var title    = item.getAttribute('data-title') || '';
      var cat      = item.getAttribute('data-category') || '';
      var med      = item.getAttribute('data-medium') || '';

      var matchesQuery  = !currentQuery || title.indexOf(currentQuery) !== -1 || cat.indexOf(currentQuery) !== -1;
      var matchesMedium = (currentFilter === 'all') || (med === currentFilter);

      if (matchesQuery && matchesMedium) {
        item.style.display = '';
        visible++;
      } else {
        item.style.display = 'none';
      }
    });

    if (countEl) {
      countEl.textContent = visible + ' ' + (visible === 1 ? 'resource' : 'resources');
    }
    if (emptyEl) {
      emptyEl.classList.toggle('hidden', visible > 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentQuery = this.value.trim().toLowerCase();
      if (clearBtn) {
        clearBtn.classList.toggle('hidden', !currentQuery);
      }
      applyFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (searchInput) {
        searchInput.value = '';
        currentQuery = '';
        this.classList.add('hidden');
        applyFilters();
      }
    });
  }

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) {
        b.className = 'res-filter-btn type-label-lg inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border border-foreground/20 px-3.5 text-foreground transition-colors cursor-pointer hover:bg-secondary';
      });
      this.className = 'res-filter-btn type-label-lg inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] border border-transparent bg-[var(--accent-container)] text-[var(--on-accent-container)] px-3.5 transition-colors cursor-pointer font-semibold';
      currentFilter = this.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }
});
</script>

<?php get_footer(); ?>
