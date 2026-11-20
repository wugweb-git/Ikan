<?php
/**
 * Template Name: Not Found (404)
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme min-h-screen flex flex-col items-center justify-center">

  <?php
  // Get CMS content for the not found page
  $cms_content = get_post_meta( get_the_ID(), 'page-not-found', true );
  $notfound = [];
  if ( $cms_content ) {
    try { $notfound = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  ?>
  
  <?php
  $hero_title = $notfound['heroTitle'] ?? 'Page Not Found';
  $hero_subtitle = $notfound['heroSubtitle'] ?? "We couldn't find the page you're looking for.";
  $heading = $notfound['heading'] ?? 'Lost your way?';
  $description = $notfound['description'] ?? 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.';
  $home_button_text = $notfound['homeButtonText'] ?? 'Return Home';
  $back_button_text = $notfound['backButtonText'] ?? 'Go Back';
  ?>

  <!-- Hero/Image -->
  <div class="relative w-full">
    <div class="absolute inset-0">
      <!-- In a real implementation, would use the hero image from CMS -->
      <div class="bg-gray-100 h-[300px] w-full rounded-t-lg overflow-hidden">
        <!-- Placeholder -->
      </div>
    </div>
    
    <div class="relative z-10 text-center">
      <h2 class="text-5xl font-bold text-gray-900 mb-2">
        <?php echo esc_html( $hero_title ); ?>
      </h2>
      <p class="text-gray-500 mb-8">
        <?php echo esc_html( $hero_subtitle ); ?>
      </p>
    </div>
  </div>

  <!-- Error Card -->
  <div class="relative w-full max-w-md mx-auto mt-12 flex flex-col items-center justify-center">
    <div class="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
      <svg class="w-12 h-12 text-gray-300" aria-hidden="true" focusable="false">
        <use href="#icon-search" />
      </svg>
    </div>
    
    <h2 class="text-3xl font-medium text-gray-900 mb-2">
      <?php echo esc_html( $heading ); ?>
    </h2>
    
    <p class="text-gray-400 text-center mb-8 leading-relaxed">
      <?php echo esc_html( $description ); ?>
    </p>
    
    <div class="flex flex-col sm:flex-row gap-3">
      <button 
        onClick="window.location.href='<?php echo esc_url( home_url( '/' ) ) ?>'"
        class="ikan2-theme-btn text-white"
        style="
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 500;
          color: var(--background);
          background-color: var(--foreground);
          border: none;
          border-radius: var(--radius-md);
          padding: 14px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          transition: opacity 0.15s ease;
        "
      >
        <svg size={18} />
        <?php echo esc_html( $home_button_text ); ?>
      </button>
      
      <button 
        onClick="window.history.back()"
        class="relative inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-500 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        style="
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 500;
          color: var(--foreground);
          background-color: transparent;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.15s ease;
        "
      >
        <svg size={18} class="mr-2" />
        <?php echo esc_html( $back_button_text ); ?>
      </button>
    </div>
  </div>

</main>

<?php get_footer(); ?>