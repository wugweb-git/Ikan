<?php
/**
 * Template Name: Resources
 * Template Post Type: page
 * Description: The iKAN Health Resources and Blog archive page
 */

get_header(); ?>

<main class="ikan2-theme bg-gray-50 min-h-screen pb-16">

  <!-- Hero Section -->
  <section class="py-16 md:py-20 bg-white border-b border-gray-100">
    <div class="max-w-[1600px] mx-auto px-4 text-center">
      <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 mb-4">
        Evidence-Based Library
      </span>
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
        Mental Wellness Resources & Insights
      </h1>
      <p class="max-w-2xl mx-auto text-lg text-gray-600">
        Clinical guides, practical self-care tools, and expert articles written to help you understand your mind and navigate stress.
      </p>
    </div>
  </section>

  <!-- Categories Filter Bar -->
  <section class="py-6 bg-white border-b border-gray-200 sticky top-[72px] z-40">
    <div class="max-w-[1600px] mx-auto px-4 flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">
      <div class="flex items-center gap-2">
        <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white whitespace-nowrap">
          All Topics
        </a>
        <?php
        $cats = get_categories( [ 'hide_empty' => false ] );
        foreach ( $cats as $cat ) :
        ?>
          <a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>" class="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap transition-colors">
            <?php echo esc_html( $cat->name ); ?>
          </a>
        <?php endforeach; ?>
      </div>
      <div class="text-xs text-gray-500 hidden sm:block whitespace-nowrap">
        Clinically reviewed articles
      </div>
    </div>
  </section>

  <!-- Posts Grid Section -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <?php
      $paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;
      $blog_query = new WP_Query( [
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => 9,
        'paged'          => $paged,
      ] );

      if ( $blog_query->have_posts() ) :
      ?>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <?php while ( $blog_query->have_posts() ) : $blog_query->the_post(); ?>
            <article class="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all flex flex-col group">
              <!-- Thumbnail -->
              <a href="<?php the_permalink(); ?>" class="block overflow-hidden h-52 bg-gray-100 relative">
                <?php if ( has_post_thumbnail() ) : ?>
                  <?php the_post_thumbnail( 'medium_large', [ 'class' => 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' ] ); ?>
                <?php else : ?>
                  <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-400">
                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                <?php endif; ?>
                <?php
                $item_cats = get_the_category();
                if ( ! empty( $item_cats ) ) :
                ?>
                  <span class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                    <?php echo esc_html( $item_cats[0]->name ); ?>
                  </span>
                <?php endif; ?>
              </a>

              <!-- Content -->
              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span><?php echo get_the_date( 'M j, Y' ); ?></span>
                    <span>·</span>
                    <span>5 min read</span>
                  </div>
                  <h2 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 leading-snug">
                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                  </h2>
                  <p class="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    <?php echo esc_html( wp_trim_words( get_the_excerpt(), 25 ) ); ?>
                  </p>
                </div>
                <div class="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span class="text-xs font-semibold text-gray-500"><?php the_author(); ?></span>
                  <a href="<?php the_permalink(); ?>" class="text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read article &rarr;
                  </a>
                </div>
              </div>
            </article>
          <?php endwhile; wp_reset_postdata(); ?>
        </div>

        <!-- Pagination -->
        <?php if ( $blog_query->max_num_pages > 1 ) : ?>
          <div class="mt-12 flex justify-center gap-2">
            <?php
            echo paginate_links( [
              'total'        => $blog_query->max_num_pages,
              'current'      => $paged,
              'prev_text'    => '&larr; Prev',
              'next_text'    => 'Next &rarr;',
              'type'         => 'list',
              'before_page_number' => '<span class="px-3 py-1 border rounded">',
              'after_page_number'  => '</span>',
            ] );
            ?>
          </div>
        <?php endif; ?>

      <?php else : ?>
        <div class="bg-white rounded-2xl p-12 text-center max-w-xl mx-auto border border-gray-100">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Articles Coming Soon</h3>
          <p class="text-gray-500 mb-6">Our clinical team is preparing newly reviewed guides and research articles.</p>
          <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            Take a Wellness Assessment
          </a>
        </div>
      <?php endif; ?>
    </div>
  </section>

</main>

<?php get_footer(); ?>
