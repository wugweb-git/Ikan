<?php
/**
 * The template for displaying 404 pages (not found)
 * Description: Exact replica of iKAN StateScreen error layout
 */

get_header(); ?>

<main class="ikan2-theme site-page-below-nav bg-canvas text-foreground min-h-[70vh] flex items-center justify-center py-16 px-5 pb-24 md:pb-16">
  <div class="max-w-[480px] w-full text-center">
    
    <!-- State Illustration / Icon -->
    <div class="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100">
      <i data-lucide="compass" class="w-10 h-10"></i>
    </div>

    <span class="text-xs font-bold uppercase tracking-wider text-gray-400">404 Error</span>
    <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mt-1 mb-3">
      Page not found
    </h1>
    <p class="text-sm md:text-base text-gray-600 leading-relaxed mb-8">
      The link you followed may have moved, expired, or doesn’t exist anymore. Let’s get you back on track.
    </p>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition-colors shadow-sm">
        <i data-lucide="home" class="w-4 h-4"></i>
        <span>Back to Home</span>
      </a>
      <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors">
        <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
        <span>Take an Assessment</span>
      </a>
    </div>

    <!-- Quick Help Card -->
    <div class="p-5 rounded-2xl bg-red-50 border border-red-100 text-left">
      <p class="text-xs font-bold text-red-900 flex items-center gap-2">
        <i data-lucide="shield-alert" class="w-4 h-4 text-red-600"></i>
        Need urgent emotional support?
      </p>
      <p class="text-xs text-red-700 mt-1">
        Call <strong>KIRAN Helpline</strong> at <a href="tel:18005990019" class="underline font-bold">1800-599-0019</a> (toll-free, 24/7) or <strong>iCALL</strong> at <a href="tel:9152987821" class="underline font-bold">9152987821</a>.
      </p>
    </div>

  </div>
</main>

<?php get_footer(); ?>
