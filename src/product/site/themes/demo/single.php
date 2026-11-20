<?php
/**
 * Single post template for demo block theme (iKAN Health)
 */

get_header(); ?>

<main class="ikan2-theme bg-white">
  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
    
    <article class="py-12 md:py-16">
      <div class="max-w-[800px] mx-auto px-4">
        <!-- Back Link -->
        <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Resources
        </a>

        <!-- Category & Read Time -->
        <div class="flex items-center gap-3 mb-4">
          <?php
          $categories = get_the_category();
          if ( ! empty( $categories ) ) :
          ?>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700">
              <?php echo esc_html( $categories[0]->name ); ?>
            </span>
          <?php endif; ?>
          <span class="text-xs text-gray-400 font-medium">
            <?php echo get_the_date( 'M j, Y' ); ?>
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          <?php the_title(); ?>
        </h1>

        <!-- Author Meta -->
        <div class="flex items-center gap-3 pb-8 border-b border-gray-100 mb-8">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
            <?php echo esc_html( substr( get_the_author(), 0, 1 ) ); ?>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900"><?php the_author(); ?></p>
            <p class="text-xs text-gray-500">Clinical Review Team · iKAN Health</p>
          </div>
        </div>

        <!-- Featured Image -->
        <?php if ( has_post_thumbnail() ) : ?>
          <div class="mb-10 rounded-2xl overflow-hidden shadow-sm">
            <?php the_post_thumbnail( 'large', [ 'class' => 'w-full h-auto object-cover max-h-[480px]' ] ); ?>
          </div>
        <?php endif; ?>

        <!-- Post Body -->
        <div class="prose prose-lg max-w-none text-gray-700 space-y-6 leading-relaxed">
          <?php the_content(); ?>
        </div>

        <!-- Crisis Disclaimer Note -->
        <div class="mt-12 p-6 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600">
          <p class="font-medium text-gray-900 mb-1">Medical & Clinical Disclaimer</p>
          <p>This article is provided for educational and informational purposes only. It is not a substitute for professional mental health diagnosis, clinical advice, or treatment.</p>
        </div>

      </div>
    </article>

  <?php endwhile; endif; ?>
</main>

<?php get_footer(); ?>
