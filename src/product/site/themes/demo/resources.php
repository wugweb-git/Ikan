<?php
/**
 * Template Name: Resources
 * Template Post Type: page
 * Description: The iKAN Health Resources and Blog archive page (articles, videos, audio)
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

// Build Schema.org CollectionPage / ItemList JSON-LD
$items_schema = [];
$index = 1;
if ( $query->have_posts() ) {
  while ( $query->have_posts() ) {
    $query->the_post();
    $p_id = get_the_ID();
    $items_schema[] = [
      '@type'    => 'ListItem',
      'position' => $index++,
      'url'      => get_permalink(),
      'name'     => get_the_title(),
    ];
  }
  wp_reset_postdata();
}

$collection_schema = [
  '@context'        => 'https://schema.org',
  '@type'           => 'CollectionPage',
  'name'            => 'Mental Wellness Resources & Clinical Guides - iKAN Health',
  'description'     => 'Evidence-based clinical guides, psychoeducation articles, guided audio, and video resources written and medically reviewed by clinical psychologists.',
  'url'             => home_url( '/resources/' ),
  'publisher'       => [
    '@type' => 'Organization',
    'name'  => 'iKAN Health',
    'url'   => home_url(),
    'logo'  => [
      '@type' => 'ImageObject',
      'url'   => get_theme_file_uri( 'assets/img/favicon.svg' ),
    ],
  ],
  'mainEntity'      => [
    '@type'           => 'ItemList',
    'numberOfItems'   => count( $items_schema ),
    'itemListElement' => $items_schema,
  ],
];
?>

<!-- Schema.org CollectionPage JSON-LD -->
<script type="application/ld+json">
<?php echo wp_json_encode( $collection_schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ); ?>
</script>

<main class="site-page-below-nav w-full flex-1 pt-24 sm:pt-28 pb-28 md:pb-20" style="background-color: var(--canvas); font-family: var(--font-sans);">

  <!-- Hero Section -->
  <section class="max-w-4xl mx-auto px-5 sm:px-6 text-center mb-10">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800 mb-4">
      <i data-lucide="book-open" class="w-3.5 h-3.5 text-emerald-600"></i>
      <span>Evidence-Based Clinical Library • 28 Curated Guides</span>
    </div>

    <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4" style="font-family: var(--font-display); letter-spacing: -0.02em;">
      Mental Wellness Resources &amp; Guides
    </h1>
    
    <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
      Clinical guides, guided audio exercises, expert videos, and practical strategies written by psychologists to help you navigate stress, anxiety, and burnout.
    </p>

    <!-- Search Bar -->
    <div class="mt-8 max-w-md mx-auto relative">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <i data-lucide="search" class="w-4 h-4"></i>
      </span>
      <input 
        type="text" 
        id="resource-search" 
        placeholder="Search guides, anxiety, stress, sleep, tests..." 
        class="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
      />
    </div>
  </section>

  <!-- Categories Filter Bar -->
  <section class="max-w-6xl mx-auto px-5 sm:px-6 mb-8">
    <div class="flex items-center justify-center flex-wrap gap-2" id="resource-cat-filters">
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white transition-all shadow-xs cursor-pointer" data-category="all">All Topics</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer" data-category="stress">Stress</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer" data-category="mindfulness">Mindfulness</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer" data-category="general">Clinical Guides</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer" data-category="sleep">Sleep</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer" data-category="workplace">Workplace</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer" data-category="anxiety">Anxiety</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer" data-category="depression">Depression</button>
    </div>
  </section>

  <!-- Posts Grid -->
  <section class="max-w-6xl mx-auto px-5 sm:px-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="resources-grid">
      <?php
      if ( $query->have_posts() ) :
        while ( $query->have_posts() ) : $query->the_post();
          $post_id   = get_the_ID();
          $meta      = function_exists( 'ikan_get_resource_extra_meta' ) ? ikan_get_resource_extra_meta( $post_id ) : [];
          $medium    = $meta['medium'] ?? get_post_meta( $post_id, 'medium', true ) ?: 'article';
          $minutes   = $meta['minutes'] ?? intval( get_post_meta( $post_id, 'minutes', true ) ?: 5 );
          $author    = $meta['author'] ?? get_post_meta( $post_id, 'author', true ) ?: 'Dr. Divya Jain, Ph.D.';
          $categories = get_the_category();
          $cat_slug  = ! empty( $categories ) ? strtolower( $categories[0]->slug ) : 'general';
          $cat_name  = ! empty( $categories ) ? $categories[0]->name : 'General';
          $post_link = get_permalink();
          $post_title = get_the_title();
          $post_excerpt = get_the_excerpt() ?: wp_trim_words( wp_strip_all_tags( get_the_content() ), 24 );
      ?>

        <article 
          class="res-card bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all group"
          data-category="<?php echo esc_attr( $cat_slug . ' ' . strtolower( $cat_name ) ); ?>"
          data-search="<?php echo esc_attr( strtolower( $post_title . ' ' . $post_excerpt . ' ' . $cat_name . ' ' . $author ) ); ?>"
        >
          <div>
            <!-- Thumbnail / Cover -->
            <a href="<?php echo esc_url( $post_link ); ?>" class="block relative aspect-16/10 overflow-hidden bg-gray-100">
              <?php 
              $cover_url = function_exists('ikan_get_resource_cover_url') ? ikan_get_resource_cover_url( $post_id ) : ( has_post_thumbnail() ? get_the_post_thumbnail_url( $post_id, 'medium_large' ) : '' );
              if ( ! $cover_url ) {
                $cover_url = get_theme_file_uri( 'assets/img/photo-1758272422634-e8ed8e252a14' );
              }
              ?>
              <img src="<?php echo esc_url( $cover_url ); ?>" alt="<?php the_title_attribute(); ?>" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async">

              <!-- Format Badge (Video / Audio / Article) -->
              <div class="absolute top-3 left-3">
                <?php if ( $medium === 'video' ) : ?>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                    <i data-lucide="play" class="w-3 h-3 text-rose-500"></i>
                    Video • <?php echo esc_html( $minutes ); ?>m
                  </span>
                <?php elseif ( $medium === 'audio' ) : ?>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                    <i data-lucide="headphones" class="w-3 h-3 text-purple-400"></i>
                    Audio • <?php echo esc_html( $minutes ); ?>m
                  </span>
                <?php else : ?>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                    <i data-lucide="book-open" class="w-3 h-3 text-emerald-400"></i>
                    Article • <?php echo esc_html( $minutes ); ?>m
                  </span>
                <?php endif; ?>
              </div>
            </a>

            <!-- Content Area -->
            <div class="p-6">
              <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-3 inline-block">
                <?php echo esc_html( $cat_name ); ?>
              </span>

              <h2 class="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-snug">
                <a href="<?php echo esc_url( $post_link ); ?>" class="group-hover:text-emerald-700 transition-colors">
                  <?php echo esc_html( $post_title ); ?>
                </a>
              </h2>

              <p class="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                <?php echo esc_html( $post_excerpt ); ?>
              </p>
            </div>
          </div>

          <div class="px-6 pb-6 pt-3 flex items-center justify-between border-t border-gray-100 text-xs text-gray-400">
            <span class="flex items-center gap-1">
              <i data-lucide="calendar" class="w-3 h-3"></i>
              <?php echo get_the_date( 'M j, Y' ); ?>
            </span>
            <a href="<?php echo esc_url( $post_link ); ?>" class="font-bold text-gray-900 group-hover:text-emerald-700 flex items-center gap-1 transition-colors">
              <span>Read Guide</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-emerald-600"></i>
            </a>
          </div>
        </article>

      <?php
        endwhile;
        wp_reset_postdata();
      else :
      ?>
        <div class="col-span-full py-12 text-center text-gray-500">
          <p class="text-base">No resources found matching your query.</p>
        </div>
      <?php endif; ?>
    </div>
  </section>

</main>

<script>
  (function() {
    const searchInput = document.getElementById('resource-search');
    const catButtons = document.querySelectorAll('.res-cat-btn');
    const cards = document.querySelectorAll('.res-card');

    let activeCat = 'all';
    let searchQuery = '';

    function filterCards() {
      let visibleCount = 0;
      cards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const search = card.getAttribute('data-search') || '';

        const matchesCat = (activeCat === 'all' || cat.includes(activeCat));
        const matchesSearch = (!searchQuery || search.includes(searchQuery));

        if (matchesCat && matchesSearch) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
    }

    catButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        catButtons.forEach(b => {
          b.className = 'res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all cursor-pointer';
        });
        this.className = 'res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white transition-all shadow-xs cursor-pointer';
        activeCat = this.getAttribute('data-category');
        filterCards();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        searchQuery = this.value.trim().toLowerCase();
        filterCards();
      });
    }

    // Check URL parameters (e.g. ?search=anxiety or ?cat=stress)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && searchInput) {
      searchInput.value = searchParam;
      searchQuery = searchParam.trim().toLowerCase();
      filterCards();
    }

    if (window.lucide && lucide.createIcons) {
      lucide.createIcons();
    }
  })();
</script>

<?php get_footer(); ?>