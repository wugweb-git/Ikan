<?php
/**
 * Single post template for demo block theme (iKAN Health)
 * Supports Video, Audio (HTML5 player), and Clinical Articles with media capacity
 */

get_header(); ?>

<main class="w-full flex-1 pt-24 pb-20 bg-white" style="font-family: var(--font-sans);">
  <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); 
    $post_id   = get_the_ID();
    $medium    = get_post_meta( $post_id, 'medium', true ) ?: 'article';
    $minutes   = get_post_meta( $post_id, 'minutes', true ) ?: 5;
    $video_url = get_post_meta( $post_id, 'video_url', true );
    $audio_url = get_post_meta( $post_id, 'audio_url', true );
    $poster    = get_post_meta( $post_id, 'poster', true );
    $author    = get_post_meta( $post_id, 'author', true ) ?: 'iKAN Clinical Team';
    $categories = get_the_category();
    $cat_name  = ! empty( $categories ) ? $categories[0]->name : 'Mental Wellbeing';

    // Parse YouTube ID
    $youtube_embed = '';
    if ( $video_url ) {
      if ( preg_match( '/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i', $video_url, $match ) ) {
        $youtube_embed = 'https://www.youtube-nocookie.com/embed/' . $match[1] . '?rel=0&modestbranding=1';
      }
    }
  ?>
    
    <article class="max-w-4xl mx-auto px-6 py-8">
      
      <!-- Back to Resources -->
      <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-black mb-6 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back to Resources & Blog
      </a>

      <!-- Category & Badges -->
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100">
          <?php echo esc_html( $cat_name ); ?>
        </span>

        <?php if ( $medium === 'video' ) : ?>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-100 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-rose-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Video • <?php echo esc_html( $minutes ); ?> min watch
          </span>
        <?php elseif ( $medium === 'audio' ) : ?>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-100 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            Audio • <?php echo esc_html( $minutes ); ?> min listen
          </span>
        <?php else : ?>
          <span class="px-3 py-1 rounded-full text-xs font-semibold text-gray-500 bg-gray-100">
            Article • <?php echo esc_html( $minutes ); ?> min read
          </span>
        <?php endif; ?>

        <span class="text-xs text-gray-400">
          Published <?php echo get_the_date( 'M j, Y' ); ?>
        </span>
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight" style="font-family: var(--font-display); letter-spacing: -0.02em;">
        <?php the_title(); ?>
      </h1>

      <!-- Author Byline -->
      <div class="flex items-center gap-3.5 pb-8 border-b border-gray-100 mb-8">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style="background-color: var(--brand-teal);">
          <?php echo esc_html( substr( $author, 0, 1 ) ); ?>
        </div>
        <div>
          <p class="text-sm font-bold text-gray-900"><?php echo esc_html( $author ); ?></p>
          <p class="text-xs text-gray-400">iKAN Health Clinical Review & Advisory Team</p>
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
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">Guided Audio Exercise</h3>
              <p class="text-xs text-gray-600">Diana Winston, UCLA Mindful Awareness Research Center (MARC)</p>
            </div>
          </div>

          <audio controls class="w-full mt-2 rounded-xl focus:outline-none">
            <source src="<?php echo esc_url( $audio_url ); ?>" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
          
          <p class="text-[11px] text-gray-400">Headphones recommended. Best practiced in a quiet, undisturbed posture.</p>
        </div>
      <?php endif; ?>

      <!-- Featured Image (for standard articles or when no video embed) -->
      <?php if ( $medium !== 'video' && has_post_thumbnail() ) : ?>
        <div class="mb-10 rounded-3xl overflow-hidden shadow-xs border border-gray-100">
          <?php the_post_thumbnail( 'full', [ 'class' => 'w-full h-auto object-cover max-h-[500px]' ] ); ?>
        </div>
      <?php endif; ?>

      <!-- Article Excerpt Standfirst -->
      <?php if ( has_excerpt() ) : ?>
        <div class="text-lg text-gray-600 leading-relaxed font-medium mb-8 p-6 rounded-2xl bg-gray-50/80 border-l-4 border-emerald-600">
          <?php the_excerpt(); ?>
        </div>
      <?php endif; ?>

      <!-- Post HTML Body -->
      <div class="post-content prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
        <?php the_content(); ?>
      </div>

      <!-- Clinical & Crisis Disclaimer Note -->
      <div class="mt-14 p-6 sm:p-8 rounded-3xl bg-gray-50 border border-gray-200/70 text-xs sm:text-sm text-gray-600 space-y-2">
        <p class="font-bold text-gray-900 flex items-center gap-1.5">
          <svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Clinical Review & Medical Information Notice
        </p>
        <p class="leading-relaxed">
          The content on iKAN Health is written and reviewed in accordance with clinically validated psychological benchmarks. This content is provided for educational and self-reflection purposes and does not constitute individual medical diagnosis or psychiatric prescription.
        </p>
      </div>

    </article>

  <?php endwhile; endif; ?>
</main>

<?php get_footer(); ?>
