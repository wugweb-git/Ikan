<?php
/**
 * Template Name: Maintenance Mode
 * Template Post Type: page
 * Description: Service Unavailable - Site Under Maintenance
 */

get_header(); ?>

<main class="ikan2-theme min-h-screen flex flex-col items-center justify-center bg-gray-100">

  <?php
  // Maintenance mode status
  $maintenance_status = ' site is under maintenance. ';
  $maintenance_message = 'We will be back soon!';
  $maintenance_time = 'Expected return: soon';
  $dont_go_away_text = 'Please do not go away';
  ?>
  
  <!-- Maintenance Hero -->
  <div class="relative w-full bg-gray-800 min-h-screen flex items-center justify-center">
    <div class="absolute inset-0">
      <div class="bg-gray-900 opacity-30 rounded-t-lg h-[400px] w-full"></div>
    </div>
    
    <div class="relative z-10 text-center px-4 py-12 max-w-2xl">
      <div class="inline-block rounded-full w-20 h-20 bg-primary flex items-center justify-center text-4xl text-white mb-6">
        <svg class="w-10 h-10" aria-hidden="true" focusable="false">
          <use href="#icon-maintenance" />
        </svg>
      </div>
      
      <h1 class="text-5xl font-bold text-white mb-4">
        <?php echo esc_html( $maintenance_status ); ?>
      </h1>
      
      <p class="text-lg text-gray-300 mb-8">
        <?php echo esc_html( $maintenance_message ); ?>
      </p>
      
      <p class="text-sm text-gray-500 mb-6">
        <?php echo esc_html( $dont_go_away_text ); ?>
      </p>
      
      <p class="text-sm text-gray-500">
        <?php echo esc_html( $maintenance_time ); ?>
      </p>
      
      <a href="<?php echo esc_url( home_url( '/' ) ) ?>"
         class="ikan2-theme-btn text-white mt-6"
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
           display: inline-block;
           transition: opacity 0.15s ease;
         "
      >
        Return to Homepage
      </a>
    </div>
  </div>

</main>

<?php get_footer(); ?>