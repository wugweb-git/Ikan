<?php
/**
 * Template Name: Mobile Onboarding & Get Started
 * Template Post Type: page
 * Description: Authentic iKAN mobile onboarding, splash and get-started flows
 */
get_header(); ?>

<main id="main-content" tabindex="-1" class="flex-1 w-full relative outline-none p-0" role="main" aria-label="Page content">
  <div class="ikan2-theme min-h-screen">
    <!-- React MobileOnboarding / GetStarted mounts directly into #root -->
    <div id="onboarding-loading" class="site-container py-24 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mb-6 mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Understand where you stand</h1>
      <p class="text-gray-500 text-sm max-w-sm mx-auto">Seven scientifically validated assessments turn how you're feeling into a number you can track over time.</p>
    </div>
  </div>
</main>

<script type="module" crossorigin src="<?php echo esc_url( get_vite_entry_script() ); ?>"></script>

<?php get_footer(); ?>
