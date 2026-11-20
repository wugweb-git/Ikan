<?php
/**
 * Template Name: Resources
 * Template Post Type: page
 * Description: The iKAN Health Resources and Blog archive page (articles, videos, audio)
 */

get_header(); ?>

<main class="site-page-below-nav w-full flex-1 pt-28 pb-24" style="background-color: var(--canvas); font-family: var(--font-sans);">

  <!-- Hero Section -->
  <section class="max-w-4xl mx-auto px-6 text-center mb-10">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-800 mb-4">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
      Evidence-Based Library • 26 Curated Resources
    </div>

    <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4" style="font-family: var(--font-display); letter-spacing: -0.02em;">
      Mental Wellness Resources & Guides
    </h1>
    
    <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
      Clinical guides, guided audio exercises, expert videos, and practical strategies written by psychologists to help you navigate stress, anxiety, and burnout.
    </p>

    <!-- Search Bar -->
    <div class="mt-8 max-w-md mx-auto relative">
      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </span>
      <input 
        type="text" 
        id="resource-search" 
        placeholder="Search articles, guides, anxiety, stress..." 
        class="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
      />
    </div>
  </section>

  <!-- Categories Filter Bar -->
  <section class="max-w-6xl mx-auto px-6 mb-8">
    <div class="flex items-center justify-center flex-wrap gap-2" id="resource-cat-filters">
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white transition-all shadow-xs" data-category="all">All Topics</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all" data-category="stress">Stress</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all" data-category="mindfulness">Mindfulness</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all" data-category="general">Clinical Guides</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all" data-category="sleep">Sleep</button>
      <button type="button" class="res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all" data-category="workplace">Workplace</button>
    </div>
  </section>

  <!-- Posts Grid -->
  <section class="max-w-6xl mx-auto px-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="resources-grid">
      <?php
      $args = [
        'post_type'      => 'post',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
        'orderby'        => 'date',
        'order'          => 'DESC',
      ];
      $query = new WP_Query( $args );

      if ( $query->have_posts() ) :
        while ( $query->have_posts() ) : $query->the_post();
          $post_id   = get_the_ID();
          $medium    = get_post_meta( $post_id, 'medium', true ) ?: 'article';
          $minutes   = get_post_meta( $post_id, 'minutes', true ) ?: 5;
          $categories = get_the_category();
          $cat_slug  = ! empty( $categories ) ? strtolower( $categories[0]->slug ) : 'general';
          $cat_name  = ! empty( $categories ) ? $categories[0]->name : 'General';
          $post_link = get_permalink();
          $post_title = get_the_title();
          $post_excerpt = get_the_excerpt();
      ?>

        <article 
          class="res-card bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all"
          data-category="<?php echo esc_attr( $cat_slug ); ?>"
          data-search="<?php echo esc_attr( strtolower( $post_title . ' ' . $post_excerpt . ' ' . $cat_name ) ); ?>"
        >
          <div>
            <!-- Thumbnail / Cover -->
            <a href="<?php echo esc_url( $post_link ); ?>" class="block relative aspect-[16/10] overflow-hidden bg-gray-100">
              <?php 
              $cover_url = function_exists('ikan_get_resource_cover_url') ? ikan_get_resource_cover_url( $post_id ) : ( has_post_thumbnail() ? get_the_post_thumbnail_url( $post_id, 'medium_large' ) : '' );
              if ( ! $cover_url ) {
                $cover_url = get_theme_file_uri( 'assets/img/photo-1758272422634-e8ed8e252a14' );
              }
              ?>
              <img src="<?php echo esc_url( $cover_url ); ?>" alt="<?php the_title_attribute(); ?>" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" loading="lazy" decoding="async">

              <!-- Format Badge (Video / Audio / Article) -->
              <div class="absolute top-3 left-3">
                <?php if ( $medium === 'video' ) : ?>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs flex items-center gap-1">
                    <svg class="w-3 h-3 fill-current text-rose-500" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Video • <?php echo esc_html( $minutes ); ?>m
                  </span>
                <?php elseif ( $medium === 'audio' ) : ?>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs flex items-center gap-1">
                    <svg class="w-3 h-3 fill-current text-purple-400" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                    Audio • <?php echo esc_html( $minutes ); ?>m
                  </span>
                <?php else : ?>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur-xs">
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
                <a href="<?php echo esc_url( $post_link ); ?>" class="hover:text-emerald-800 transition-colors">
                  <?php echo esc_html( $post_title ); ?>
                </a>
              </h2>

              <p class="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                <?php echo esc_html( $post_excerpt ); ?>
              </p>
            </div>
          </div>

          <div class="px-6 pb-6 pt-2 flex items-center justify-between border-t border-gray-50 text-xs text-gray-400">
            <span><?php echo get_the_date( 'M j, Y' ); ?></span>
            <a href="<?php echo esc_url( $post_link ); ?>" class="font-bold text-gray-900 hover:text-emerald-700 flex items-center gap-1">
              <span>Read</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
          </div>
        </article>

      <?php
        endwhile;
        wp_reset_postdata();
      else :
      ?>
        <!-- Skeleton Placeholders -->
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
      cards.forEach(card => {
        const cat = card.getAttribute('data-category') || '';
        const search = card.getAttribute('data-search') || '';

        const matchesCat = (activeCat === 'all' || cat.includes(activeCat));
        const matchesSearch = (!searchQuery || search.includes(searchQuery));

        if (matchesCat && matchesSearch) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    catButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        catButtons.forEach(b => {
          b.className = 'res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 transition-all';
        });
        this.className = 'res-cat-btn px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white transition-all shadow-xs';
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
  })();
</script>

<?php get_footer(); ?>
