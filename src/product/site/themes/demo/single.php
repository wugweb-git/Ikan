<?php
/**
 * Single post template for demo block theme (iKAN Health)
 * 1:1 parity with src/product/site/pages/ResourceDetail.tsx
 *
 * @package iKAN_Health
 */

get_header();
?>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); 
  $post_id   = get_the_ID();
  $meta      = function_exists( 'ikan_get_resource_extra_meta' ) ? ikan_get_resource_extra_meta( $post_id ) : [];

  $medium    = $meta['medium'] ?? get_post_meta( $post_id, 'medium', true ) ?: 'article';
  $minutes   = $meta['minutes'] ?? intval( get_post_meta( $post_id, 'minutes', true ) ?: 4 );
  $author    = $meta['author'] ?? get_post_meta( $post_id, 'author', true ) ?: get_the_author_meta( 'display_name', $post->post_author ) ?: 'iKAN Health';
  $art       = $meta['art'] ?? 'checkup';

  $categories = get_the_category();
  $cat_name  = ! empty( $categories ) ? $categories[0]->name : 'Mental Wellbeing';

  $post_excerpt = get_the_excerpt() ?: wp_trim_words( wp_strip_all_tags( get_the_content() ), 24 );

  // Schema.org Structured Data
  $schema_data = [
    '@context'          => 'https://schema.org',
    '@type'             => 'Article',
    'headline'          => get_the_title(),
    'description'       => $post_excerpt,
    'datePublished'     => get_the_date( 'c' ),
    'dateModified'      => get_the_modified_date( 'c' ),
    'mainEntityOfPage'  => [
      '@type' => 'WebPage',
      '@id'   => get_permalink(),
    ],
    'inLanguage'        => 'en-IN',
    'articleSection'    => $cat_name,
    'timeRequired'      => 'PT' . $minutes . 'M',
    'author'            => [
      '@type' => 'Person',
      'name'  => $author,
    ],
    'publisher'         => [
      '@type' => 'Organization',
      'name'  => 'iKAN Health',
      'url'   => home_url(),
      'logo'  => [
        '@type' => 'ImageObject',
        'url'   => get_theme_file_uri( 'assets/img/favicon.svg' ),
      ],
    ],
  ];

  // Fetch related posts in same category
  $related_query = new WP_Query( [
    'category__in'   => wp_get_post_categories( $post_id ),
    'post__not_in'   => [ $post_id ],
    'posts_per_page' => 4,
    'post_status'    => 'publish',
  ] );
?>

<?php if ( ! defined( 'RANK_MATH_VERSION' ) ) : ?>
<!-- Schema.org JSON-LD Structured Data (fallback when Rank Math is inactive) -->
<script type="application/ld+json">
<?php echo wp_json_encode( $schema_data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ); ?>
</script>
<?php endif; ?>

<main id="main-content" class="ikan2-theme info-page site-page-below-nav w-full flex-1">
  <section class="info-band">
    <div class="info-band__inner">
      
      <!-- Back to Resources Link -->
      <a class="article-back inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors no-underline" href="<?php echo esc_url( home_url( '/resources/' ) ); ?>">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>
        </svg>
        <span>All resources</span>
      </a>

      <!-- Category Eyebrow -->
      <?php if ( ! empty( $cat_name ) ) : ?>
        <p class="info-eyebrow"><?php echo esc_html( $cat_name ); ?></p>
      <?php endif; ?>

      <!-- Article Title -->
      <h1 class="info-title"><?php the_title(); ?></h1>

      <!-- Article Excerpt Subtitle -->
      <?php if ( ! empty( $post_excerpt ) ) : ?>
        <p class="info-subtitle"><?php echo esc_html( $post_excerpt ); ?></p>
      <?php endif; ?>

      <!-- Article Meta Line (Author, Date, Read Time) -->
      <p class="article-meta flex items-center gap-3 text-sm text-muted-foreground mt-3 mb-6">
        <?php if ( ! empty( $author ) ) : ?>
          <span class="article-meta__author font-medium text-foreground"><?php echo esc_html( $author ); ?></span>
          <span>·</span>
        <?php endif; ?>
        <span class="article-meta__date inline-flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>
          </svg>
          <span><?php echo esc_html( get_the_date( 'j M Y' ) ); ?></span>
        </span>
        <span>·</span>
        <span><?php echo esc_html( $minutes ); ?> min read</span>
      </p>

      <!-- Hero Image or SVG Art -->
      <?php if ( has_post_thumbnail() ) : ?>
        <figure class="article-hero my-8 overflow-hidden rounded-[24px]">
          <?php the_post_thumbnail( 'large', [ 'class' => 'w-full h-auto object-cover' ] ); ?>
        </figure>
      <?php elseif ( ! empty( $art ) ) : ?>
        <figure class="article-hero my-8 h-64 sm:h-80 md:h-96 w-full rounded-[24px] overflow-hidden bg-secondary">
          <?php echo ikan_render_art_svg( $art, 'w-full h-full object-cover' ); ?>
        </figure>
      <?php endif; ?>

      <!-- Article Content Body -->
      <div class="prose-ikan article-body mt-8 leading-relaxed">
        <?php the_content(); ?>
      </div>

      <!-- Related Reading Rail -->
      <?php if ( $related_query->have_posts() ) : ?>
        <section class="article-related mt-14 pt-10 border-t border-border" aria-labelledby="related-heading">
          <h2 id="related-heading" class="article-related__title font-display text-2xl font-semibold text-foreground mb-6">
            More in <?php echo esc_html( $cat_name ); ?>
          </h2>
          <ul class="library-grid library-grid--compact">
            <?php while ( $related_query->have_posts() ) : $related_query->the_post(); 
              $rel_id   = get_the_ID();
              $rel_meta = function_exists( 'ikan_get_resource_extra_meta' ) ? ikan_get_resource_extra_meta( $rel_id ) : [];
              $rel_art  = $rel_meta['art'] ?? 'checkup';
              $rel_min  = $rel_meta['minutes'] ?? ( get_post_meta( $rel_id, 'minutes', true ) ?: 4 );
            ?>
              <li>
                <a href="<?php echo esc_url( get_permalink() ); ?>" class="library-card group no-underline">
                  <span class="library-card__media">
                    <?php echo ikan_render_art_svg( $rel_art, 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' ); ?>
                  </span>
                  <strong class="library-card__title group-hover:text-[var(--accent-strong,#10B981)] transition-colors">
                    <?php the_title(); ?>
                  </strong>
                  <span class="library-card__meta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>
                    </svg>
                    <span><?php echo esc_html( get_the_date( 'j M Y' ) ); ?></span>
                    <span>·</span>
                    <span><?php echo esc_html( $rel_min ); ?> min</span>
                  </span>
                </a>
              </li>
            <?php endwhile; wp_reset_postdata(); ?>
          </ul>
        </section>
      <?php endif; ?>

    </div>
  </section>
</main>

<?php endwhile; endif; ?>

<?php get_footer(); ?>
