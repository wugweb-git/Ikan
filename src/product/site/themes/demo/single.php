<?php
/**
 * Single post template for demo block theme (iKAN Health)
 * Styled 1:1 with iKAN 2 PWA (ikan2/src/routes/resources.$slug.tsx)
 *
 * Matches exact mobile ergonomics, cover layout (h-60, -mt-8 rounded-t-[28px]),
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
  $minutes   = $meta['minutes'] ?? intval( get_post_meta( $post_id, 'minutes', true ) ?: 4 );
  $author    = $meta['author'] ?? get_post_meta( $post_id, 'author', true ) ?: get_the_author_meta( 'display_name', $post->post_author ) ?: 'Vedanshu';
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
  <div id="reading-progress-bar" class="h-full bg-[var(--accent-strong,#2B634D)] w-0 transition-all duration-75"></div>
</div>

<main class="site-page-below-nav w-full flex-1 pt-16 sm:pt-20 pb-24 bg-canvas text-foreground ikan2-theme ikan2-type">
  <div class="mx-auto min-h-dvh w-full bg-background max-w-read lg:shadow-app pb-12">
    
    <article style="--accent-strong: #2B634D; --accent-container: #DFF0E8; --on-accent-container: #173D2F;" aria-labelledby="article-title">
      
      <!-- Cover Header with SVG Art from ikan2 (240px tall, constant across breakpoints) -->
      <header id="cover" class="relative" aria-label="Cover">
        <div class="h-60 overflow-hidden">
          <?php echo ikan_render_art_svg( $art, 'h-full w-full object-cover' ); ?>
        </div>

        <!-- Floating Action Icons (Back & Share/Bookmark) -->
        <div class="absolute inset-x-0 top-0 flex items-center justify-between p-2">
          <a
            href="<?php echo esc_url( home_url( '/resources/' ) ); ?>"
            aria-label="Back"
            class="grid h-12 w-12 place-items-center rounded-full bg-background/85 backdrop-blur text-foreground shadow-xs hover:bg-foreground/5 transition-colors"
          >
            <i data-lucide="arrow-left" class="h-6 w-6"></i>
          </a>

          <button
            type="button"
            aria-label="Save for later"
            onclick="if (navigator.share) { navigator.share({title: document.title, url: window.location.href}); } else { navigator.clipboard.writeText(window.location.href); alert('Article link copied to clipboard!'); }"
            class="grid h-12 w-12 place-items-center rounded-full bg-background/85 backdrop-blur text-foreground shadow-xs hover:bg-foreground/5 transition-colors cursor-pointer"
          >
            <i data-lucide="bookmark" class="h-5 w-5"></i>
          </button>
        </div>
      </header>

      <!-- Article Body Card: exact rounded-t-[28px] -mt-8 overlap from ikan2 -->
      <div id="article" class="relative -mt-8 rounded-t-[28px] bg-background px-5 pt-6">
        
        <!-- Category Eyebrow -->
        <p class="type-body-sm font-semibold text-[var(--accent-strong,#2B634D)]">
          <?php echo esc_html( $cat_name ); ?>
        </p>

        <!-- Headline / Title -->
        <h1 id="article-title" class="type-headline-md mt-1 text-balance font-semibold text-foreground">
          <?php the_title(); ?>
        </h1>

        <!-- Standfirst / Description -->
        <?php if ( $post_excerpt ) : ?>
          <p class="type-title-lg mt-3 font-medium text-muted-foreground text-balance">
            <?php echo esc_html( $post_excerpt ); ?>
          </p>
        <?php endif; ?>

        <!-- Metadata Row (Author, Date, Medium, Read Time) -->
        <p class="type-label-lg mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-foreground/10 pb-5 text-muted-foreground">
          <span class="inline-flex items-center gap-1.5">
            <i data-lucide="user-round" class="h-4 w-4"></i>
            <span><?php echo esc_html( $author ); ?></span>
          </span>

          <span class="inline-flex items-center gap-1.5">
            <i data-lucide="calendar-days" class="h-4 w-4"></i>
            <span><?php echo get_the_date( 'j F Y' ); ?></span>
          </span>

          <span class="inline-flex items-center gap-1.5">
            <?php if ( $medium === 'video' ) : ?>
              <i data-lucide="play" class="h-4 w-4"></i>
              <span>Watch</span>
            <?php elseif ( $medium === 'audio' ) : ?>
              <i data-lucide="headphones" class="h-4 w-4"></i>
              <span>Listen</span>
            <?php else : ?>
              <i data-lucide="book-open" class="h-4 w-4"></i>
              <span>Read</span>
            <?php endif; ?>
          </span>

          <span class="inline-flex items-center gap-1.5">
            <i data-lucide="clock-3" class="h-4 w-4"></i>
            <span><?php echo esc_html( $minutes ); ?> min</span>
          </span>
        </p>

        <!-- Video Player Embed (if video resource) -->
        <?php if ( $medium === 'video' && ( $video_url || $youtube_embed ) ) : ?>
          <div class="mt-6 overflow-hidden rounded-[20px] bg-secondary aspect-video relative">
            <?php if ( $youtube_embed ) : ?>
              <iframe
                src="<?php echo esc_url( $youtube_embed ); ?>"
                title="<?php echo esc_attr( get_the_title() ); ?>"
                class="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            <?php else : ?>
              <video controls class="w-full h-full object-cover">
                <source src="<?php echo esc_url( $video_url ); ?>" type="video/mp4">
                Your browser does not support HTML5 video.
              </video>
            <?php endif; ?>
          </div>
        <?php endif; ?>

        <!-- Audio Player Box (if audio resource) -->
        <?php if ( $medium === 'audio' && $audio_url ) : ?>
          <div class="mt-6 rounded-[20px] bg-secondary p-4 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent-strong,#2B634D)] text-white">
                <i data-lucide="headphones" class="h-5 w-5"></i>
              </span>
              <div>
                <p class="type-label-lg font-semibold text-foreground">Audio Episode</p>
                <p class="type-body-sm text-muted-foreground"><?php echo esc_html( $minutes ); ?> minutes listening time</p>
              </div>
            </div>
            <audio controls class="w-full mt-2">
              <source src="<?php echo esc_url( $audio_url ); ?>" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
          </div>
        <?php endif; ?>

        <!-- HTML Article Body (prose-ikan: exact typography, headings, tables, lists from ikan2) -->
        <div id="article-body" class="prose-ikan mt-6">
          <?php echo $body_content; ?>
        </div>

        <div id="article-end" aria-hidden="true" class="h-1"></div>

        <!-- External Source Attribution Card (SourceCard from ikan2) -->
        <?php if ( ! empty( $source ) && ! empty( $source['name'] ) ) : 
          $source_facts = array_filter( [ $source['cost'] ?? null, $source['language'] ?? null, $source['licence'] ?? null ] );
        ?>
          <section id="source" aria-label="Source" class="mt-10">
            <?php if ( ! empty( $source['url'] ) ) : ?>
              <a href="<?php echo esc_url( $source['url'] ); ?>" target="_blank" rel="noopener noreferrer" class="block rounded-[20px] bg-secondary p-4 hover:bg-secondary/80 transition-colors">
            <?php else : ?>
              <div class="block rounded-[20px] bg-secondary p-4">
            <?php endif; ?>
              <span class="flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
                <i data-lucide="info" class="h-3.5 w-3.5" aria-hidden="true"></i> Source
              </span>
              <span class="mt-1.5 flex items-start gap-3">
                <span class="min-w-0 flex-1">
                  <span class="type-title-md block font-medium text-foreground"><?php echo esc_html( $source['name'] ); ?></span>
                  <?php if ( ! empty( $source['note'] ) ) : ?>
                    <span class="type-body-sm mt-0.5 block text-muted-foreground"><?php echo esc_html( $source['note'] ); ?></span>
                  <?php endif; ?>
                  <?php if ( ! empty( $source_facts ) ) : ?>
                    <span class="mt-2 flex flex-wrap gap-1.5">
                      <?php foreach ( $source_facts as $f ) : ?>
                        <span class="type-label-md rounded-full bg-background px-2.5 py-1 text-foreground"><?php echo esc_html( $f ); ?></span>
                      <?php endforeach; ?>
                    </span>
                  <?php endif; ?>
                </span>
                <?php if ( ! empty( $source['url'] ) ) : ?>
                  <i data-lucide="arrow-up-right" class="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"></i>
                <?php endif; ?>
              </span>
              <?php if ( ! empty( $source['url'] ) ) : ?>
                <span class="type-body-sm font-semibold mt-3 block text-[var(--accent-strong,#2B634D)]">
                  Open the original
                </span>
              <?php endif; ?>
            <?php if ( ! empty( $source['url'] ) ) : ?>
              </a>
            <?php else : ?>
              </div>
            <?php endif; ?>
          </section>
        <?php endif; ?>

        <!-- Related in iKAN Section (Assessment / Programme / Journal) -->
        <?php if ( $assessment || $programme || $journal || $consult ) : ?>
          <section id="external" aria-label="Related in iKAN" class="mt-10 space-y-8">
            
            <?php if ( $assessment ) : 
              $ass_label = ( $assessmentRole === 'next' ) ? 'The fuller test this article points to' : 'The test this article explains';
              $ass_info  = function_exists( 'ikan_get_assessment_summary' ) ? ikan_get_assessment_summary( $assessment ) : null;
              if ( ! $ass_info ) {
                $ass_info = [
                  'name'      => strtoupper( $assessment ),
                  'title'     => 'Mental Health Assessment',
                  'questions' => 10,
                  'minutes'   => 3,
                  'url'       => home_url( '/assessments/' . $assessment . '/' ),
                  'category'  => 'general',
                ];
              }
              $ass_art = $ass_info['category'] ?? 'checkup';
            ?>
              <div>
                <p class="type-body-sm font-semibold text-[var(--accent-strong,#2B634D)]">
                  <?php echo esc_html( $ass_label ); ?>
                </p>
                <a
                  href="<?php echo esc_url( $ass_info['url'] ); ?>"
                  class="mt-3 block overflow-hidden rounded-[24px] bg-secondary hover:opacity-90 transition-opacity"
                >
                  <span class="block h-28">
                    <?php echo ikan_render_art_svg( $ass_art, 'w-full h-full object-cover' ); ?>
                  </span>
                  <span class="block px-4 pb-4">
                    <span class="-mt-7 grid h-14 w-14 place-items-center rounded-[18px] bg-[var(--accent-container,#DFF0E8)] text-[var(--on-accent-container,#173D2F)] ring-4 ring-secondary">
                      <i data-lucide="clipboard-list" class="h-7 w-7"></i>
                    </span>
                    <span class="type-body-sm font-medium mt-3 block text-[var(--accent-strong,#2B634D)]">
                      <?php echo esc_html( $ass_info['name'] ); ?>
                    </span>
                    <span class="type-title-lg mt-0.5 block text-foreground">
                      <?php echo esc_html( $ass_info['title'] ); ?>
                    </span>
                    <span class="type-body-sm mt-2 flex items-center justify-between gap-3 text-muted-foreground">
                      <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span class="inline-flex items-center gap-1">
                          <i data-lucide="list-checks" class="h-3.5 w-3.5"></i>
                          <span><?php echo esc_html( $ass_info['questions'] ); ?> questions</span>
                        </span>
                        <span class="inline-flex items-center gap-1">
                          <i data-lucide="clock-3" class="h-3.5 w-3.5"></i>
                          <span><?php echo esc_html( $ass_info['minutes'] ); ?> min</span>
                        </span>
                      </span>
                      <i data-lucide="chevron-right" class="h-5 w-5 shrink-0"></i>
                    </span>
                  </span>
                </a>
              </div>
            <?php endif; ?>

            <?php if ( $programme ) : ?>
              <div>
                <p class="type-body-sm font-semibold text-[var(--accent-strong,#2B634D)]">
                  A programme that works on this
                </p>
                <a
                  href="<?php echo esc_url( home_url( '/equip-programs/' . $programme . '/' ) ); ?>"
                  class="mt-3 block rounded-[20px] bg-secondary p-4 hover:bg-secondary/80 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <span class="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent-strong,#2B634D)] text-white">
                      <i data-lucide="sparkles" class="h-5 w-5"></i>
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="type-label-lg font-semibold text-foreground capitalize"><?php echo esc_html( str_replace( '-', ' ', $programme ) ); ?></p>
                      <p class="type-body-sm text-muted-foreground">Daily guided practices and tools</p>
                    </div>
                    <i data-lucide="chevron-right" class="h-5 w-5 text-muted-foreground"></i>
                  </div>
                </a>
              </div>
            <?php endif; ?>

            <?php if ( $journal ) : ?>
              <div>
                <p class="type-body-sm font-semibold text-[var(--accent-strong,#2B634D)]">
                  Keep track of how you feel
                </p>
                <div class="mt-3 rounded-[20px] bg-secondary p-4 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="grid h-10 w-10 place-items-center rounded-full bg-amber-500/10 text-amber-600">
                      <i data-lucide="notebook-pen" class="h-5 w-5"></i>
                    </span>
                    <div>
                      <p class="type-label-lg font-semibold text-foreground">Daily Mood Check-in</p>
                      <p class="type-body-sm text-muted-foreground">Notice your patterns over time</p>
                    </div>
                  </div>
                  <a href="<?php echo esc_url( home_url( '/journal/' ) ); ?>" class="type-body-sm font-semibold text-[var(--accent-strong,#2B634D)] hover:underline inline-flex items-center gap-1">
                    <span>Open journal</span>
                    <i data-lucide="chevron-right" class="h-3.5 w-3.5"></i>
                  </a>
                </div>
              </div>
            <?php endif; ?>

            <?php if ( $consult ) : ?>
              <div>
                <p class="type-body-sm font-semibold text-[var(--accent-strong,#2B634D)]">
                  Talk it through with someone
                </p>
                <div class="mt-3 rounded-[20px] bg-secondary p-4 flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="grid h-10 w-10 place-items-center rounded-full bg-rose-500/10 text-rose-600">
                      <i data-lucide="life-buoy" class="h-5 w-5"></i>
                    </span>
                    <div>
                      <p class="type-label-lg font-semibold text-foreground">Professional Support</p>
                      <p class="type-body-sm text-muted-foreground">Connect with licensed practitioners</p>
                    </div>
                  </div>
                  <a href="<?php echo esc_url( home_url( '/consultation/' ) ); ?>" class="type-body-sm font-semibold text-[var(--accent-strong,#2B634D)] hover:underline inline-flex items-center gap-1">
                    <span>Find support</span>
                    <i data-lucide="chevron-right" class="h-3.5 w-3.5"></i>
                  </a>
                </div>
              </div>
            <?php endif; ?>

          </section>
        <?php endif; ?>

        <!-- Inline Sources Section (if present in article body) -->
        <?php if ( ! empty( $sources_content ) ) : ?>
          <section id="sources" aria-label="Sources" class="mt-8">
            <div class="prose-ikan">
              <?php echo $sources_content; ?>
            </div>
          </section>
        <?php endif; ?>

        <!-- Keep Reading / Related Resources: 1:1 with ikan2 ResourceRow list -->
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
          <section
            id="keep-reading"
            aria-labelledby="keep-reading-title"
            class="-mx-5 mt-12 rounded-t-[28px] border-t border-foreground/10 bg-secondary/50 px-5 pb-8 pt-7"
          >
            <h2 id="keep-reading-title" class="type-title-lg font-semibold text-foreground">
              Keep reading
            </h2>
            <ul class="mt-2">
              <?php while ( $related_query->have_posts() ) : $related_query->the_post(); 
                $rel_id      = get_the_ID();
                $rel_meta    = function_exists( 'ikan_get_resource_extra_meta' ) ? ikan_get_resource_extra_meta( $rel_id ) : [];
                $rel_art     = $rel_meta['art'] ?? 'checkup';
                $rel_cat     = get_the_category( $rel_id );
                $rel_catname = ! empty( $rel_cat ) ? $rel_cat[0]->name : 'Resource';
                $rel_minutes = $rel_meta['minutes'] ?? ( get_post_meta( $rel_id, 'minutes', true ) ?: 5 );
                $rel_medium  = $rel_meta['medium'] ?? ( get_post_meta( $rel_id, 'medium', true ) ?: 'article' );
              ?>
                <li class="border-b border-foreground/10 last:border-0">
                  <div class="flex items-center gap-3 py-3">
                    <a href="<?php the_permalink(); ?>" class="flex min-w-0 flex-1 items-center gap-3 rounded-[16px] text-left hover:opacity-85 transition-opacity group">
                      <span class="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[16px] bg-secondary">
                        <?php echo ikan_render_art_svg( $rel_art, 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-200' ); ?>
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="type-label-md font-semibold block text-[var(--accent-strong,#2B634D)]">
                          <?php echo esc_html( $rel_catname ); ?>
                        </span>
                        <h3 class="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-5 text-foreground group-hover:text-[var(--accent-strong,#2B634D)] transition-colors">
                          <?php the_title(); ?>
                        </h3>
                        <span class="type-label-md mt-1 flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-muted-foreground">
                          <span class="inline-flex items-center gap-1">
                            <i data-lucide="calendar-days" class="h-3.5 w-3.5"></i>
                            <span><?php echo get_the_date( 'j M' ); ?></span>
                          </span>
                          <span class="inline-flex items-center gap-1">
                            <?php if ( $rel_medium === 'video' ) : ?>
                              <i data-lucide="play" class="h-3.5 w-3.5"></i>
                              <span>Watch</span>
                            <?php elseif ( $rel_medium === 'audio' ) : ?>
                              <i data-lucide="headphones" class="h-3.5 w-3.5"></i>
                              <span>Listen</span>
                            <?php else : ?>
                              <i data-lucide="book-open" class="h-3.5 w-3.5"></i>
                              <span>Read</span>
                            <?php endif; ?>
                          </span>
                          <span class="inline-flex items-center gap-1">
                            <i data-lucide="clock-3" class="h-3.5 w-3.5"></i>
                            <span><?php echo esc_html( $rel_minutes ); ?>m</span>
                          </span>
                        </span>
                      </span>
                    </a>
                  </div>
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
