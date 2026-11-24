<?php
/**
 * Single post template for demo block theme (iKAN Health)
 * Styled 1:1 with iKAN 2 PWA (ikan2/src/routes/resources.$slug.tsx)
 *
 * Matches exact mobile ergonomics, cover layout (-mt-8 rounded-t-[28px]),
 * typography hierarchy (type-headline-md, type-title-lg, type-label-lg, prose-ikan),
 * inline Lucide icons, sticky reading progress, source attribution cards,
 * related assessment & equip cards, and Keep Reading list.
 *
 * @package iKAN_Health
 */

get_header(); ?>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); 
  $post_id   = get_the_ID();
  $post_slug = get_post_field( 'post_name', $post_id );
  $meta      = function_exists( 'ikan_get_resource_extra_meta' ) ? ikan_get_resource_extra_meta( $post_id ) : [];

  $medium    = $meta['medium'] ?? get_post_meta( $post_id, 'medium', true ) ?: 'article';
  $minutes   = $meta['minutes'] ?? intval( get_post_meta( $post_id, 'minutes', true ) ?: 5 );
  $author    = $meta['author'] ?? 'Vedanshu';
  $art       = $meta['art'] ?? 'checkup';
  $source    = $meta['source'] ?? null;
  $assessment = $meta['assessment'] ?? null;
  $assessmentRole = $meta['assessmentRole'] ?? 'explains';
  $programme = $meta['programme'] ?? null;
  $journal   = $meta['journal'] ?? false;
  $consult   = $meta['consult'] ?? false;
  $tags      = $meta['tags'] ?? [];

  $video_url = get_post_meta( $post_id, 'video_url', true );
  $audio_url = get_post_meta( $post_id, 'audio_url', true );
  $categories = get_the_category();
  $cat_name  = ! empty( $categories ) ? $categories[0]->name : 'Mental Wellbeing';
  $cat_slug  = ! empty( $categories ) ? $categories[0]->slug : 'mental-wellbeing';

  // Parse YouTube embed if video
  $youtube_embed = '';
  if ( $video_url ) {
    if ( preg_match( '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i', $video_url, $match ) ) {
      $youtube_embed = 'https://www.youtube-nocookie.com/embed/' . $match[1] . '?rel=0&modestbranding=1';
    }
  }

  // Split post content into body and sources section (matching ikan2)
  $raw_content = get_the_content();
  $raw_content = apply_filters( 'the_content', $raw_content );

  $cut = strpos( $raw_content, '<section class="sources">' );
  if ( false === $cut ) {
    $cut = strpos( $raw_content, '<section class=\'sources\'>' );
  }

  if ( false !== $cut ) {
    $body_content    = substr( $raw_content, 0, $cut );
    $sources_content = substr( $raw_content, $cut );
  } else {
    $body_content    = $raw_content;
    $sources_content = '';
  }

  // Schema.org Structured Data (matching ikan2)
  $schema_type = ( $medium === 'video' ) ? 'VideoObject' : ( ( $medium === 'audio' ) ? 'AudioObject' : 'Article' );
  $post_url    = get_permalink();
  $post_excerpt = get_the_excerpt() ?: wp_trim_words( wp_strip_all_tags( $raw_content ), 30 );
  $date_published = get_the_date( 'c' );
  $date_modified  = get_the_modified_date( 'c' );

  $schema_data = [
    '@context'          => 'https://schema.org',
    '@type'             => $schema_type,
    'headline'          => get_the_title(),
    'name'              => get_the_title(),
    'description'       => $post_excerpt,
    'datePublished'     => $date_published,
    'dateModified'      => $date_modified,
    'mainEntityOfPage'  => [
      '@type' => 'WebPage',
      '@id'   => $post_url,
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

  if ( $medium === 'video' && $video_url ) {
    $schema_data['uploadDate'] = $date_published;
    $schema_data['contentUrl'] = $video_url;
    $schema_data['embedUrl']   = $youtube_embed ?: $video_url;
    $schema_data['duration']   = 'PT' . $minutes . 'M';
  } elseif ( $medium === 'audio' && $audio_url ) {
    $schema_data['contentUrl']    = $audio_url;
    $schema_data['duration']      = 'PT' . $minutes . 'M';
    $schema_data['encodingFormat']= 'audio/mpeg';
  }
?>

<!-- Schema.org JSON-LD Structured Data -->
<script type="application/ld+json">
<?php echo wp_json_encode( $schema_data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ); ?>
</script>

<!-- Reading Progress Bar -->
<div id="reading-progress-container" class="fixed top-0 left-0 w-full h-1 z-50 bg-foreground/10 pointer-events-none">
  <div id="reading-progress-bar" class="h-full bg-[var(--accent-strong,#10B981)] transition-all duration-75" style="width: 0%;"></div>
</div>

<main class="site-page-below-nav w-full flex-1 pt-20 sm:pt-24 pb-24 bg-background ikan2-theme ikan2-type">
  <div class="max-w-app sm:max-w-3xl lg:max-w-4xl mx-auto px-0 sm:px-6">
    
    <article style="--accent-strong: #10B981;" aria-labelledby="article-title">
      
      <!-- Cover Header with SVG Art from ikan2 -->
      <header id="cover" class="relative overflow-hidden sm:rounded-[28px]" aria-label="Cover">
        <div class="h-60 sm:h-80 md:h-96 overflow-hidden">
          <?php echo ikan_render_art_svg( $art, 'w-full h-full object-cover' ); ?>
        </div>

        <!-- Floating Action Icons (Back & Share/Bookmark) -->
        <div class="absolute inset-x-0 top-0 flex items-center justify-between p-3 sm:p-5">
          <a
            href="<?php echo esc_url( home_url( '/resources/' ) ); ?>"
            aria-label="Back to resources"
            class="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-background/85 backdrop-blur text-foreground shadow-xs hover:bg-background transition-colors"
          >
            <i data-lucide="arrow-left" class="h-5 w-5"></i>
          </a>

          <button
            type="button"
            aria-label="Share article"
            onclick="if (navigator.share) { navigator.share({title: document.title, url: window.location.href}); } else { navigator.clipboard.writeText(window.location.href); alert('Article link copied to clipboard!'); }"
            class="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-full bg-background/85 backdrop-blur text-foreground shadow-xs hover:bg-background transition-colors cursor-pointer"
          >
            <i data-lucide="bookmark" class="h-5 w-5"></i>
          </button>
        </div>
      </header>

      <!-- Article Body Card: exact rounded-t-[28px] -mt-8 overlap from ikan2 on mobile, comfortable paper card on desktop -->
      <div id="article" class="relative -mt-8 sm:-mt-10 rounded-t-[28px] sm:rounded-[28px] bg-background px-5 sm:px-10 lg:px-14 pt-6 sm:pt-10 shadow-xs border border-foreground/5">
        
        <!-- Category Eyebrow -->
        <p class="type-body-sm font-semibold text-[var(--accent-strong,#10B981)]">
          <?php echo esc_html( $cat_name ); ?>
        </p>

        <!-- Headline / Title -->
        <h1 id="article-title" class="type-headline-md sm:type-headline-lg mt-1 text-balance font-semibold text-foreground">
          <?php the_title(); ?>
        </h1>

        <!-- Standfirst / Description -->
        <?php if ( has_excerpt() ) : ?>
          <p class="type-title-lg sm:type-subhead mt-3 font-medium text-muted-foreground text-balance">
            <?php echo esc_html( get_the_excerpt() ); ?>
          </p>
        <?php endif; ?>

        <!-- Metadata Row: Author, Date, Medium, Read Time (lucide icons) -->
        <p class="type-label-lg mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-foreground/10 pb-5 text-muted-foreground">
          <?php if ( ! empty( $author ) ) : ?>
            <span class="inline-flex items-center gap-1.5 text-foreground font-medium">
              <i data-lucide="user-round" class="h-4 w-4 text-muted-foreground"></i>
              <span><?php echo esc_html( $author ); ?></span>
            </span>
          <?php endif; ?>

          <span class="inline-flex items-center gap-1.5">
            <i data-lucide="calendar-days" class="h-4 w-4"></i>
            <span><?php echo get_the_date( 'j F Y' ); ?></span>
          </span>

          <span class="inline-flex items-center gap-1.5">
            <?php if ( $medium === 'video' ) : ?>
              <i data-lucide="play" class="h-4 w-4 text-rose-500"></i>
              <span>Watch</span>
            <?php elseif ( $medium === 'audio' ) : ?>
              <i data-lucide="headphones" class="h-4 w-4 text-indigo-500"></i>
              <span>Listen</span>
            <?php else : ?>
              <i data-lucide="book-open" class="h-4 w-4 text-emerald-600"></i>
              <span>Read</span>
            <?php endif; ?>
          </span>

          <span class="inline-flex items-center gap-1.5">
            <i data-lucide="clock-3" class="h-4 w-4"></i>
            <span><?php echo esc_html( $minutes ); ?> min</span>
          </span>
        </p>

        <!-- Video Player Embed (if video resource) -->
        <?php if ( $medium === 'video' && $youtube_embed ) : ?>
          <div class="mt-6 rounded-2xl overflow-hidden aspect-video w-full bg-black shadow-xs">
            <iframe 
              src="<?php echo esc_url( $youtube_embed ); ?>" 
              title="<?php the_title_attribute(); ?>"
              class="w-full h-full border-0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
            ></iframe>
          </div>
        <?php endif; ?>

        <!-- Audio Player Box (if audio resource) -->
        <?php if ( $medium === 'audio' && $audio_url ) : ?>
          <div class="mt-6 p-5 rounded-2xl bg-secondary space-y-3">
            <div class="flex items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-white shadow-xs">
                <i data-lucide="headphones" class="h-5 w-5"></i>
              </span>
              <div>
                <p class="type-body-sm font-semibold text-foreground">Audio Resource</p>
                <p class="type-label-md text-muted-foreground"><?php echo esc_html( $minutes ); ?> minutes • Listen anytime</p>
              </div>
            </div>
            <audio controls class="w-full rounded-lg focus:outline-none">
              <source src="<?php echo esc_url( $audio_url ); ?>" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
          </div>
        <?php endif; ?>

        <!-- HTML Article Body (prose-ikan: exact h2, h3, lists, tables, charts from ikan2) -->
        <div id="article-body" class="prose-ikan mt-6">
          <?php echo $body_content; ?>
        </div>

        <div id="article-end" aria-hidden="true" class="h-1"></div>

        <!-- External Source Attribution Card (SourceCard from ikan2) -->
        <?php if ( ! empty( $source ) && ! empty( $source['name'] ) ) : 
          $facts = array_filter( [ $source['cost'] ?? '', $source['language'] ?? '', $source['licence'] ?? '' ] );
        ?>
          <section id="source" class="mt-8" aria-label="Source">
            <div class="rounded-2xl bg-secondary p-5 border border-foreground/5">
              <p class="type-label-md font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <i data-lucide="info" class="h-3.5 w-3.5"></i>
                <span>Source</span>
              </p>
              <div class="mt-2 flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <h3 class="type-title-md text-foreground"><?php echo esc_html( $source['name'] ); ?></h3>
                  <?php if ( ! empty( $source['note'] ) ) : ?>
                    <p class="type-body-sm text-muted-foreground mt-1"><?php echo esc_html( $source['note'] ); ?></p>
                  <?php endif; ?>
                  <?php if ( ! empty( $facts ) ) : ?>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <?php foreach ( $facts as $f ) : ?>
                        <span class="type-label-md bg-background px-2.5 py-1 rounded-full border border-foreground/10 text-muted-foreground">
                          <?php echo esc_html( $f ); ?>
                        </span>
                      <?php endforeach; ?>
                    </div>
                  <?php endif; ?>
                </div>
                <?php if ( ! empty( $source['url'] ) ) : ?>
                  <a href="<?php echo esc_url( $source['url'] ); ?>" target="_blank" rel="noopener noreferrer" class="shrink-0 p-2 rounded-xl bg-background border border-foreground/10 text-foreground hover:text-[var(--accent-strong,#10B981)] transition-colors" title="Open source">
                    <i data-lucide="arrow-up-right" class="h-4 w-4"></i>
                  </a>
                <?php endif; ?>
              </div>
            </div>
          </section>
        <?php endif; ?>

        <!-- Inline Sources Section (if present in article body) -->
        <?php if ( ! empty( $sources_content ) ) : ?>
          <div class="prose-ikan mt-4">
            <?php echo $sources_content; ?>
          </div>
        <?php endif; ?>

        <!-- Related in iKAN Section (Assessment / Programme / Journal) -->
        <?php if ( $assessment || $programme || $journal ) : ?>
          <section id="external" class="mt-10 border-t border-foreground/10 pt-8" aria-label="Related in iKAN">
            
            <?php if ( $assessment ) : ?>
              <div class="rounded-2xl bg-secondary p-5 border border-foreground/5 mb-6">
                <p class="type-body-sm font-semibold text-[var(--accent-strong,#10B981)]">
                  <?php echo ( $assessmentRole === 'next' ) ? 'The fuller test this article points to' : 'The test this article explains'; ?>
                </p>
                <div class="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 class="type-title-md text-foreground"><?php echo esc_html( $assessment['title'] ); ?></h3>
                    <p class="type-body-sm text-muted-foreground mt-1"><?php echo esc_html( $assessment['category'] ); ?> • <?php echo esc_html( $assessment['questions'] ); ?> questions • <?php echo esc_html( $assessment['minutes'] ?? 3 ); ?> min</p>
                  </div>
                  <a href="<?php echo esc_url( home_url( '/assessments/' ) ); ?>" class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                    <span>Take Test</span>
                    <i data-lucide="arrow-right" class="h-3.5 w-3.5"></i>
                  </a>
                </div>
              </div>
            <?php endif; ?>

            <?php if ( $programme ) : ?>
              <div class="rounded-2xl bg-secondary p-5 border border-foreground/5 mb-6">
                <p class="type-body-sm font-semibold text-[var(--accent-strong,#10B981)]">
                  A programme that works on this
                </p>
                <div class="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 class="type-title-md text-foreground"><?php echo esc_html( $programme['title'] ); ?></h3>
                    <p class="type-body-sm text-muted-foreground mt-1"><?php echo esc_html( $programme['tagline'] ); ?></p>
                  </div>
                  <a href="<?php echo esc_url( home_url( '/equip-programs/' ) ); ?>" class="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity">
                    <span>Explore</span>
                    <i data-lucide="arrow-right" class="h-3.5 w-3.5"></i>
                  </a>
                </div>
              </div>
            <?php endif; ?>

          </section>
        <?php endif; ?>

        <!-- Keep Reading / Related Resources: 1-column mobile list, 3-column grid on desktop -->
        <?php
        $related_query = new WP_Query( [
          'post_type'      => 'post',
          'posts_per_page' => 3,
          'post_status'    => 'publish',
          'post__not_in'   => [ $post_id ],
          'category_name'  => $cat_slug,
        ] );

        if ( ! $related_query->have_posts() ) {
          $related_query = new WP_Query( [
            'post_type'      => 'post',
            'posts_per_page' => 3,
            'post_status'    => 'publish',
            'post__not_in'   => [ $post_id ],
          ] );
        }

        if ( $related_query->have_posts() ) :
        ?>
          <section class="mt-12 sm:mt-16 border-t border-foreground/10 pt-8 pb-4" aria-label="Keep Reading">
            <div class="flex items-center justify-between mb-6">
              <h2 class="type-title-lg font-semibold text-foreground">Keep reading</h2>
              <a href="<?php echo esc_url( home_url( '/resources/' ) ); ?>" class="type-label-lg font-semibold text-[var(--accent-strong,#10B981)] hover:underline inline-flex items-center gap-1">
                <span>All resources</span>
                <i data-lucide="chevron-right" class="h-4 w-4"></i>
              </a>
            </div>

            <ul class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <?php while ( $related_query->have_posts() ) : $related_query->the_post(); 
                $rel_id      = get_the_ID();
                $rel_meta    = function_exists( 'ikan_get_resource_extra_meta' ) ? ikan_get_resource_extra_meta( $rel_id ) : [];
                $rel_art     = $rel_meta['art'] ?? 'checkup';
                $rel_cat     = get_the_category( $rel_id );
                $rel_catname = ! empty( $rel_cat ) ? $rel_cat[0]->name : 'Resource';
                $rel_minutes = $rel_meta['minutes'] ?? ( get_post_meta( $rel_id, 'minutes', true ) ?: 5 );
                $rel_medium  = $rel_meta['medium'] ?? ( get_post_meta( $rel_id, 'medium', true ) ?: 'article' );
              ?>
                <li class="rounded-2xl p-2.5 hover:bg-secondary/60 transition-colors">
                  <a href="<?php the_permalink(); ?>" class="flex md:flex-col items-center md:items-start gap-3 text-left group">
                    <span class="h-[84px] w-[84px] md:h-36 md:w-full shrink-0 overflow-hidden rounded-[16px] bg-secondary">
                      <?php echo ikan_render_art_svg( $rel_art, 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-200' ); ?>
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="type-label-md font-semibold block text-[var(--accent-strong,#10B981)]">
                        <?php echo esc_html( $rel_catname ); ?>
                      </span>
                      <h3 class="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-5 text-foreground group-hover:text-[var(--accent-strong,#10B981)] transition-colors">
                        <?php the_title(); ?>
                      </h3>
                      <p class="type-body-sm mt-1 flex items-center gap-3 text-muted-foreground">
                        <span class="inline-flex items-center gap-1.5">
                          <i data-lucide="calendar-days" class="h-3.5 w-3.5"></i>
                          <span><?php echo get_the_date( 'j M' ); ?></span>
                        </span>
                        <span class="inline-flex items-center gap-1.5">
                          <i data-lucide="clock-3" class="h-3.5 w-3.5"></i>
                          <span><?php echo esc_html( $rel_minutes ); ?>m</span>
                        </span>
                      </p>
                    </span>
                  </a>
                </li>
              <?php endwhile; wp_reset_postdata(); ?>
            </ul>
          </section>
        <?php endif; ?>

      </div>
    </article>
  </div>
</main>
<?php endwhile; endif; ?>

<script>
// Scroll progress bar calculator (native, responsive)
document.addEventListener('DOMContentLoaded', function() {
  var bar = document.getElementById('reading-progress-bar');
  if (bar) {
    window.addEventListener('scroll', function() {
      var h = document.documentElement,
          b = document.body,
          st = 'scrollTop',
          sh = 'scrollHeight';
      var percent = (h[st]||b[st]) / ((h[sh]||b[sh]) - h.clientHeight) * 100;
      bar.style.width = Math.min(100, Math.max(0, percent)) + '%';
    }, { passive: true });
  }
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }
});
</script>

<?php get_footer(); ?>
