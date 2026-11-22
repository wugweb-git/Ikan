<?php
/**
 * Single post template for demo block theme (iKAN Health)
 * Comprehensive Clinical Resource Template with Schema.org JSON-LD,
 * Lucide Icons, Clinical Authors & Advisory Review, Read Time & Progress,
 * Source Attributions, Linked Assessments, and Equip Programs.
 */

get_header(); ?>

<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); 
  $post_id   = get_the_ID();
  $post_slug = get_post_field( 'post_name', $post_id );
  $meta      = function_exists( 'ikan_get_resource_extra_meta' ) ? ikan_get_resource_extra_meta( $post_id ) : [];

  $medium    = $meta['medium'] ?? get_post_meta( $post_id, 'medium', true ) ?: 'article';
  $minutes   = $meta['minutes'] ?? intval( get_post_meta( $post_id, 'minutes', true ) ?: 5 );
  $author    = $meta['author'] ?? get_post_meta( $post_id, 'author', true ) ?: 'Dr. Divya Jain, Ph.D. & iKAN Advisory Board';
  $source    = $meta['source'] ?? null;
  $assessment = $meta['assessment'] ?? null;
  $assessmentRole = $meta['assessmentRole'] ?? 'explains';
  $programme = $meta['programme'] ?? null;
  $tags      = $meta['tags'] ?? [];

  $video_url = get_post_meta( $post_id, 'video_url', true );
  $audio_url = get_post_meta( $post_id, 'audio_url', true );
  $categories = get_the_category();
  $cat_name  = ! empty( $categories ) ? $categories[0]->name : 'Mental Wellbeing';
  $cat_slug  = ! empty( $categories ) ? $categories[0]->slug : 'mental-wellbeing';

  // Cover image
  $cover_url = function_exists('ikan_get_resource_cover_url') ? ikan_get_resource_cover_url( $post_id ) : ( has_post_thumbnail() ? get_the_post_thumbnail_url( $post_id, 'full' ) : '' );
  if ( ! $cover_url ) {
    $cover_url = get_theme_file_uri( 'assets/img/photo-1758272422634-e8ed8e252a14' );
  }

  // Parse YouTube ID
  $youtube_embed = '';
  if ( $video_url ) {
    if ( preg_match( '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i', $video_url, $match ) ) {
      $youtube_embed = 'https://www.youtube-nocookie.com/embed/' . $match[1] . '?rel=0&modestbranding=1';
    }
  }

  // Schema.org Structured Data
  $schema_type = ( $medium === 'video' ) ? 'VideoObject' : ( ( $medium === 'audio' ) ? 'AudioObject' : 'Article' );
  $post_url    = get_permalink();
  $post_excerpt = get_the_excerpt() ?: wp_trim_words( wp_strip_all_tags( get_the_content() ), 30 );
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
      '@type'  => 'Person',
      'name'   => $author,
      'jobTitle' => 'Clinical Psychologist & Researcher',
      'worksFor' => [
        '@type' => 'Organization',
        'name'  => 'iKAN Health',
      ],
    ],
    'reviewedBy'        => [
      '@type'    => 'Person',
      'name'     => 'Dr. Divya Jain, Ph.D.',
      'jobTitle' => 'Head of Psychological Services & Senior Consultant Psychologist',
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
    'image'             => $cover_url,
  ];

  if ( $medium === 'video' && $video_url ) {
    $schema_data['uploadDate']    = $date_published;
    $schema_data['contentUrl']    = $video_url;
    $schema_data['embedUrl']      = $youtube_embed ?: $video_url;
    $schema_data['thumbnailUrl']  = $cover_url;
    $schema_data['duration']      = 'PT' . $minutes . 'M';
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

<!-- Sticky Reading Progress Bar -->
<div id="reading-progress-container" class="fixed top-0 left-0 w-full h-1 z-50 bg-gray-100 pointer-events-none">
  <div id="reading-progress-bar" class="h-full bg-emerald-600 transition-all duration-75" style="width: 0%;"></div>
</div>

<main class="site-page-below-nav w-full flex-1 pt-24 sm:pt-28 pb-24 bg-white" style="font-family: var(--font-sans);">
  <article class="max-w-4xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
    
    <!-- Top Navigation / Breadcrumbs -->
    <div class="flex items-center justify-between mb-6 pb-2">
      <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>Back to Resources &amp; Guides</span>
      </a>

      <!-- Share Link Action -->
      <button 
        type="button" 
        id="copy-share-btn" 
        onclick="navigator.clipboard.writeText(window.location.href); alert('Article link copied to clipboard!');"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-700 transition-colors px-2.5 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
        title="Share this article"
      >
        <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
        <span class="hidden sm:inline">Share</span>
      </button>
    </div>

    <!-- Category & Metadata Badges -->
    <div class="flex flex-wrap items-center gap-2.5 mb-5">
      <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100 inline-flex items-center gap-1.5">
        <i data-lucide="tag" class="w-3 h-3 text-emerald-600"></i>
        <?php echo esc_html( $cat_name ); ?>
      </span>

      <?php if ( $medium === 'video' ) : ?>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-100 inline-flex items-center gap-1.5">
          <i data-lucide="play" class="w-3.5 h-3.5 text-rose-600"></i>
          Video • <?php echo esc_html( $minutes ); ?> min watch
        </span>
      <?php elseif ( $medium === 'audio' ) : ?>
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-100 inline-flex items-center gap-1.5">
          <i data-lucide="headphones" class="w-3.5 h-3.5 text-purple-600"></i>
          Audio • <?php echo esc_html( $minutes ); ?> min listen
        </span>
      <?php else : ?>
        <span class="px-3 py-1 rounded-full text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 inline-flex items-center gap-1.5">
          <i data-lucide="book-open" class="w-3.5 h-3.5 text-gray-500"></i>
          Article • <?php echo esc_html( $minutes ); ?> min read
        </span>
      <?php endif; ?>

      <span class="inline-flex items-center gap-1.5 text-xs text-gray-400">
        <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
        <?php echo get_the_date( 'M j, Y' ); ?>
      </span>
    </div>

    <!-- Title -->
    <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.18]" style="font-family: var(--font-display); letter-spacing: -0.02em;">
      <?php the_title(); ?>
    </h1>

    <!-- Author & Clinical Review Byline -->
    <div class="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-100 mb-8">
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base shadow-xs" style="background-color: var(--brand-teal, #006A60);">
          <?php echo esc_html( strtoupper( substr( $author, 0, 1 ) ) ); ?>
        </div>
        <div>
          <p class="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <span><?php echo esc_html( $author ); ?></span>
            <i data-lucide="badge-check" class="w-4 h-4 text-emerald-600" title="Verified Author"></i>
          </p>
          <p class="text-xs text-gray-500">Clinical Review &amp; Advisory Board • iKAN Health</p>
        </div>
      </div>

      <div class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
        <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
        <span>Medically Reviewed</span>
      </div>
    </div>

    <!-- Video Player Embed -->
    <?php if ( $medium === 'video' && $youtube_embed ) : ?>
      <div class="mb-10 rounded-3xl overflow-hidden shadow-lg border border-black/5 aspect-video w-full bg-black">
        <iframe 
          src="<?php echo esc_url( $youtube_embed ); ?>" 
          title="<?php the_title_attribute(); ?>"
          class="w-full h-full border-0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
        ></iframe>
      </div>
    <?php endif; ?>

    <!-- Audio Player Box -->
    <?php if ( $medium === 'audio' && $audio_url ) : ?>
      <div class="mb-10 p-6 sm:p-8 rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-50/70 to-indigo-50/40 shadow-xs space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <i data-lucide="headphones" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">Audio Experience &amp; Guided Practice</h3>
            <p class="text-xs text-gray-600">Clinical Mindfulness &amp; Psychological Guidance</p>
          </div>
        </div>

        <?php if ( strpos( $audio_url, "spotify.com" ) !== false ) : 
          $spotify_embed = str_replace( "open.spotify.com/episode/", "open.spotify.com/embed/episode/", $audio_url );
        ?>
          <div class="rounded-2xl overflow-hidden shadow-xs">
            <iframe src="<?php echo esc_url( $spotify_embed ); ?>" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
          </div>
        <?php else : ?>
          <audio controls class="w-full mt-2 rounded-xl focus:outline-none">
            <source src="<?php echo esc_url( $audio_url ); ?>" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        <?php endif; ?>
        
        <p class="text-[11px] text-gray-400">Headphones recommended. Best practiced in a quiet, undisturbed posture.</p>
      </div>
    <?php endif; ?>

    <!-- Featured Image (for standard articles or when no video embed) -->
    <?php if ( $medium !== 'video' ) : ?>
      <div class="mb-10 rounded-3xl overflow-hidden shadow-xs border border-gray-100">
        <img src="<?php echo esc_url( $cover_url ); ?>" alt="<?php the_title_attribute(); ?>" class="w-full h-auto object-cover max-h-[500px]" loading="eager" decoding="async">
      </div>
    <?php endif; ?>

    <!-- Article Excerpt Standfirst -->
    <?php if ( has_excerpt() ) : ?>
      <div class="text-lg text-gray-700 leading-relaxed font-medium mb-8 p-6 rounded-2xl bg-[#F8FAF9] border-l-4 border-emerald-600">
        <?php the_excerpt(); ?>
      </div>
    <?php endif; ?>

    <!-- Post HTML Body -->
    <div id="article-body" class="prose-ikan prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
      <?php the_content(); ?>
    </div>

    <!-- Tags Section -->
    <?php if ( ! empty( $tags ) ) : ?>
      <div class="mt-10 pt-6 border-t border-gray-100">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mr-1">
            <i data-lucide="tags" class="w-3.5 h-3.5"></i>
            Tags:
          </span>
          <?php foreach ( $tags as $t ) : ?>
            <a href="<?php echo esc_url( home_url( '/resources?search=' . urlencode( $t ) ) ); ?>" class="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200/60 transition-colors">
              #<?php echo esc_html( $t ); ?>
            </a>
          <?php endforeach; ?>
        </div>
      </div>
    <?php endif; ?>

    <!-- Source Attribution Card (SourceCard from ikan2) -->
    <?php if ( ! empty( $source ) && ! empty( $source['name'] ) ) : 
      $facts = array_filter( [ $source['cost'] ?? '', $source['language'] ?? '', $source['licence'] ?? '' ] );
    ?>
      <section class="mt-10 block rounded-2xl bg-[#f8faf9] border border-gray-200/80 p-5 sm:p-6" aria-label="Original Source Attribution">
        <span class="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
          <i data-lucide="info" class="w-3.5 h-3.5"></i> Source Attribution
        </span>
        <div class="mt-2 flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <h3 class="text-base font-bold text-gray-900"><?php echo esc_html( $source['name'] ); ?></h3>
            <?php if ( ! empty( $source['note'] ) ) : ?>
              <p class="text-xs text-gray-500 mt-1"><?php echo esc_html( $source['note'] ); ?></p>
            <?php endif; ?>
            <?php if ( ! empty( $facts ) ) : ?>
              <div class="mt-3 flex flex-wrap gap-2">
                <?php foreach ( $facts as $f ) : ?>
                  <span class="text-xs font-medium bg-white px-2.5 py-1 rounded-full border border-gray-200 text-gray-700 shadow-2xs">
                    <?php echo esc_html( $f ); ?>
                  </span>
                <?php endforeach; ?>
              </div>
            <?php endif; ?>
          </div>
          <?php if ( ! empty( $source['url'] ) ) : ?>
            <a href="<?php echo esc_url( $source['url'] ); ?>" target="_blank" rel="noopener noreferrer" class="shrink-0 p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-700 shadow-2xs hover:shadow-xs transition-all" title="Open source">
              <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
            </a>
          <?php endif; ?>
        </div>
        <?php if ( ! empty( $source['url'] ) ) : ?>
          <a href="<?php echo esc_url( $source['url'] ); ?>" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 mt-4 transition-colors">
            <span>Open the original source publication</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        <?php endif; ?>
      </section>
    <?php endif; ?>

    <!-- Related in iKAN Section -->
    <?php if ( $assessment || $programme ) : ?>
      <section class="mt-12 pt-8 border-t border-gray-100" aria-label="Related in iKAN">
        <h2 class="text-lg font-bold text-gray-900 mb-4" style="font-family: var(--font-display);">Related in iKAN Health</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Stacked Assessment Card -->
          <?php if ( $assessment ) : ?>
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  <?php echo ( $assessmentRole === 'next' ) ? 'Fuller Screener Next' : 'Assessment Explained'; ?>
                </span>
                <h3 class="text-base font-bold text-gray-900 mb-1"><?php echo esc_html( $assessment['title'] ); ?></h3>
                <p class="text-xs text-gray-500 mb-3"><?php echo esc_html( $assessment['category'] ); ?> • <?php echo esc_html( $assessment['questions'] ); ?> questions</p>
              </div>
              <a href="<?php echo esc_url( home_url( '/assessments/' ) ); ?>" class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors pt-2 border-t border-gray-100">
                <span>Take free screening</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          <?php endif; ?>

          <!-- Equip Program Card -->
          <?php if ( $programme ) : ?>
            <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <span class="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  Equip 14-Day Micro-Cadence
                </span>
                <h3 class="text-base font-bold text-gray-900 mb-1"><?php echo esc_html( $programme['title'] ); ?></h3>
                <p class="text-xs text-gray-500 mb-3"><?php echo esc_html( $programme['tagline'] ); ?></p>
              </div>
              <a href="<?php echo esc_url( home_url( '/equip-programs/' ) ); ?>" class="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors pt-2 border-t border-gray-100">
                <span>Explore program curriculum</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </a>
            </div>
          <?php endif; ?>
        </div>
      </section>
    <?php endif; ?>

    <!-- Clinical Review & Crisis Notice Box -->
    <div class="mt-12 p-6 sm:p-7 rounded-3xl bg-[#F8FAF9] border border-gray-200/80 text-xs sm:text-sm text-gray-600 space-y-3">
      <div class="flex items-center gap-2">
        <i data-lucide="shield-check" class="w-5 h-5 text-emerald-700 shrink-0"></i>
        <p class="font-bold text-gray-900 text-sm">
          Medically Reviewed by Dr. Divya Jain, Ph.D. &amp; iKAN Advisory Board
        </p>
      </div>
      <p class="leading-relaxed text-xs sm:text-xs text-gray-500">
        All iKAN Health articles and educational guides are written in accordance with clinically validated psychological benchmarks (DSM-5, ICD-11, and WHO guidelines). This material is intended for psychoeducation and does not replace professional clinical evaluation.
      </p>
      <div class="pt-3 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span class="text-gray-500">In crisis? Immediate free support:</span>
        <div class="flex items-center gap-4 font-semibold text-gray-700">
          <span>KIRAN: <a href="tel:18005990019" class="text-emerald-700 hover:underline">1800-599-0019</a></span>
          <span>iCALL: <a href="tel:9152987821" class="text-emerald-700 hover:underline">9152987821</a></span>
          <span>Tele-MANAS: <a href="tel:14416" class="text-emerald-700 hover:underline">14416</a></span>
        </div>
      </div>
    </div>

    <!-- Keep Reading / Related Resources Section -->
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
      <section class="mt-14 pt-8 border-t border-gray-100" aria-label="Keep Reading">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900" style="font-family: var(--font-display);">Keep Reading</h2>
          <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors flex items-center gap-1">
            <span>View all resources</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <?php while ( $related_query->have_posts() ) : $related_query->the_post(); 
            $rel_id = get_the_ID();
            $rel_cover = function_exists('ikan_get_resource_cover_url') ? ikan_get_resource_cover_url( $rel_id ) : ( has_post_thumbnail() ? get_the_post_thumbnail_url( $rel_id, 'medium' ) : '' );
            $rel_minutes = get_post_meta( $rel_id, 'minutes', true ) ?: 5;
            $rel_medium = get_post_meta( $rel_id, 'medium', true ) ?: 'article';
          ?>
            <a href="<?php the_permalink(); ?>" class="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-2xs hover:shadow-md transition-all">
              <div class="relative aspect-16/10 overflow-hidden bg-gray-100">
                <img src="<?php echo esc_url( $rel_cover ); ?>" alt="<?php the_title_attribute(); ?>" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
                <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs">
                  <?php echo esc_html( $rel_medium ); ?> • <?php echo esc_html( $rel_minutes ); ?>m
                </span>
              </div>
              <div class="p-4">
                <h3 class="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                  <?php the_title(); ?>
                </h3>
                <p class="text-[11px] text-gray-400 mt-2 flex items-center justify-between">
                  <span><?php echo get_the_date( 'M j, Y' ); ?></span>
                  <span class="text-emerald-700 font-semibold flex items-center gap-0.5">Read <i data-lucide="chevron-right" class="w-3 h-3"></i></span>
                </p>
              </div>
            </a>
          <?php endwhile; wp_reset_postdata(); ?>
        </div>
      </section>
    <?php endif; ?>

  </article>
<?php endwhile; endif; ?>
</main>

<script>
// Reading progress bar calculator
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