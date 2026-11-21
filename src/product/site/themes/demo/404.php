<?php
/**
 * The template for displaying 404 pages (not found)
 * Description: 1:1 Parity with ikan2 StateScreen (NotFoundScreen)
 */

get_header(); ?>

<main class="ikan2-theme site-page-below-nav bg-canvas text-foreground min-h-[75vh] flex items-center justify-center py-16 px-6 pb-24 md:pb-16 font-sans">
  <div class="max-w-[420px] w-full text-center flex flex-col items-center">
    
    <!-- iKAN Wordmark Header -->
    <span class="inline-flex items-center gap-1.5 text-gray-400 mb-8">
      <svg class="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
      <span class="font-display text-[13px] font-semibold tracking-[0.08em] uppercase text-gray-500">iKAN Health</span>
    </span>

    <!-- State Illustration / Scene: Lost -->
    <div class="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100">
      <i data-lucide="compass" class="w-10 h-10"></i>
    </div>

    <!-- Title (Sora Display) -->
    <h1 class="font-display text-[26px] md:text-[28px] font-semibold leading-8 tracking-[-0.01em] text-gray-900 mb-2.5">
      We can’t find that one
    </h1>

    <!-- Body (Manrope) -->
    <p class="text-[15px] leading-6 text-gray-600 mb-8 max-w-sm">
      The link may be old, or the page has moved since. Nothing you’ve saved has gone anywhere.
    </p>

    <!-- Actions (ikan2 Primary & Secondary Pill Tokens) -->
    <div class="flex flex-col w-full gap-2.5 mb-8">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#151515] hover:bg-black text-white font-semibold text-[15px] transition-colors shadow-sm">
        <i data-lucide="home" class="w-4 h-4"></i>
        <span>Take me home</span>
      </a>
      <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-gray-300 hover:bg-gray-100/60 text-gray-900 font-semibold text-[15px] transition-colors">
        <i data-lucide="book-open" class="w-4 h-4"></i>
        <span>Browse the library</span>
      </a>
    </div>

    <!-- Crisis Helpline Card (ikan2 Support Banner Parity) -->
    <div class="w-full flex items-center gap-3 rounded-[20px] border border-red-200/80 bg-red-50/60 p-4 text-left">
      <i data-lucide="life-buoy" class="h-5 w-5 shrink-0 text-red-600"></i>
      <div class="min-w-0 flex-1">
        <span class="block text-[14px] font-semibold text-red-950">
          Need help now?
        </span>
        <span class="block text-[12px] leading-snug text-red-700 mt-0.5">
          Free, confidential helplines are open right now. Call KIRAN at <a href="tel:18005990019" class="underline font-semibold">1800-599-0019</a> or iCALL at <a href="tel:9152987821" class="underline font-semibold">9152987821</a>.
        </span>
      </div>
    </div>

  </div>
</main>

<?php get_footer(); ?>
