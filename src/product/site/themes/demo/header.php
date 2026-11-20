<?php
/**
 * The header for iKAN Health WordPress theme
 * Mapped to iKAN 2 Design System and authentic capsule navigation
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="ikan2-theme">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
  <link rel="icon" type="image/svg+xml" href="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>">
  <link rel="apple-touch-icon" href="<?php echo esc_url( get_theme_file_uri( 'assets/img/apple-touch-icon.png' ) ); ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?php echo esc_url( get_theme_file_uri( 'assets/css/tailwind.css' ) ); ?>">
  <link rel="stylesheet" href="<?php echo esc_url( get_theme_file_uri( 'assets/css/app.css' ) ); ?>">
  <?php wp_head(); ?>
</head>
<body <?php body_class( 'ikan2-theme antialiased' ); ?> style="background-color: var(--canvas); color: var(--foreground); font-family: var(--font-sans); min-height: 100vh; display: flex; flex-direction: column;">

  <!-- Desktop Floating Capsule Navigation -->
  <header class="nav-fixed-wrapper w-full fixed top-0 left-0 z-50 pointer-events-none" role="banner" style="padding: 16px 20px;">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <nav 
        class="ikan-capsule-nav pointer-events-auto flex items-center justify-between w-full px-5 py-3 shadow-app transition-all"
        style="
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 9999px;
          min-height: 56px;
        "
        aria-label="Primary navigation"
      >
        <!-- Brand Squircle + Wordmark -->
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="nav-brand flex items-center gap-2.5 shrink-0" aria-label="iKAN home">
          <img 
            src="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>" 
            alt="iKAN" 
            width="28" 
            height="28" 
            class="w-7 h-7 rounded-[9px] object-contain shadow-xs"
          />
          <span class="type-subhead font-semibold text-lg tracking-tight" style="font-family: var(--font-display); color: var(--foreground);">iKAN</span>
        </a>

        <!-- Center Menu Links (Desktop) -->
        <div class="hidden lg:flex items-center gap-6 text-sm font-medium" style="color: var(--muted-foreground);">
          <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hover:text-black transition-colors">Home</a>
          <a href="<?php echo esc_url( home_url( '/services' ) ); ?>" class="hover:text-black transition-colors">Services</a>
          <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="hover:text-black transition-colors">Assessments</a>
          <a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="hover:text-black transition-colors">Programs</a>
          <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="hover:text-black transition-colors">Resources</a>
          <a href="<?php echo esc_url( home_url( '/about-us' ) ); ?>" class="hover:text-black transition-colors">About Us</a>
          <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="hover:text-black transition-colors">FAQ</a>
          <a href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="hover:text-black transition-colors">Contact</a>
        </div>

        <!-- Right Action Button (Desktop) -->
        <div class="hidden sm:flex items-center gap-3 shrink-0">
          <a 
            href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" 
            class="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-400 text-gray-700 transition-colors hidden xl:inline-block"
          >
            Burnout Calculator
          </a>
          <a 
            href="<?php echo esc_url( home_url( '/org' ) ); ?>" 
            class="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors hidden xl:inline-block"
          >
            For Organizations
          </a>
          <a 
            href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" 
            class="text-xs font-semibold px-4 py-2 rounded-full text-white shadow-xs hover:opacity-90 transition-opacity"
            style="background-color: var(--foreground);"
          >
            Talk to Us
          </a>
        </div>

        <!-- Mobile Trigger Button in Capsule -->
        <div class="flex lg:hidden items-center gap-2">
          <button 
            type="button" 
            id="mobile-menu-trigger" 
            class="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>
    </div>
  </header>

  <!-- Mobile Floating Bottom Navigation Bar (PublicBottomNavMobile) -->
  <div class="block lg:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none max-w-sm mx-auto">
    <div 
      class="pointer-events-auto flex items-center justify-between px-5 py-3 shadow-dock rounded-full border border-black/10 bg-white/95 backdrop-blur-md"
      style="box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);"
    >
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="flex items-center gap-2" aria-label="iKAN home">
        <img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>" alt="iKAN" width="24" height="24" class="w-6 h-6 rounded-[7px]">
        <span class="font-bold text-sm" style="font-family: var(--font-display); color: var(--foreground);">iKAN</span>
      </a>

      <div class="flex items-center gap-2">
        <a 
          href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" 
          class="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
          style="background-color: var(--foreground);"
        >
          Talk to Us
        </a>
        <button 
          type="button" 
          id="mobile-bottom-menu-trigger" 
          class="p-2 rounded-full hover:bg-gray-100 text-gray-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Drawer / Bottom Sheet Modal -->
  <div id="mobile-drawer" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300 opacity-0 pointer-events-none" aria-hidden="true">
    <div 
      id="mobile-drawer-sheet" 
      class="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl p-6 shadow-2xl transition-transform duration-300 transform translate-y-full"
    >
      <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
        <div class="flex items-center gap-2.5">
          <img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>" alt="iKAN" width="28" height="28" class="w-7 h-7 rounded-[8px]">
          <span class="font-bold text-base" style="font-family: var(--font-display);">iKAN Menu</span>
        </div>
        <button type="button" id="mobile-drawer-close" class="p-2 rounded-full hover:bg-gray-100 text-gray-500" aria-label="Close menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="space-y-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Main Pages</p>
          <div class="grid grid-cols-2 gap-2 text-sm font-medium text-gray-800">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="p-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2">Home</a>
            <a href="<?php echo esc_url( home_url( '/services' ) ); ?>" class="p-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2">Services</a>
            <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="p-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2">Assessments</a>
            <a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="p-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2">Equip Programs</a>
            <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="p-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2">Resources & Blog</a>
            <a href="<?php echo esc_url( home_url( '/about-us' ) ); ?>" class="p-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2">About Us</a>
            <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="p-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2">FAQ</a>
            <a href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="p-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2">Contact Us</a>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Workplace & Tools</p>
          <div class="space-y-2 text-sm font-medium">
            <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-gray-900">
              <span>Burnout Cost Calculator</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Free</span>
            </a>
            <a href="<?php echo esc_url( home_url( '/org' ) ); ?>" class="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between text-emerald-900">
              <span>Organisation Portal</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">Teams</span>
            </a>
            <a href="<?php echo esc_url( home_url( '/consultation' ) ); ?>" class="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-gray-900">
              <span>Book Consultation</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Therapists</span>
            </a>
            <a href="<?php echo esc_url( home_url( '/professional-application' ) ); ?>" class="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-gray-900">
              <span>Become a Partner</span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Apply</span>
            </a>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex flex-col gap-3">
          <a 
            href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" 
            class="w-full py-3 rounded-xl text-center text-sm font-semibold text-white shadow-xs"
            style="background-color: var(--foreground);"
          >
            Get In Touch
          </a>
          <a 
            href="tel:+918527545503" 
            class="w-full py-3 rounded-xl text-center text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Call: +91 85275 45503
          </a>
        </div>
      </div>
    </div>
  </div>

  <script>
    (function() {
      const drawer = document.getElementById('mobile-drawer');
      const sheet = document.getElementById('mobile-drawer-sheet');
      const triggers = [document.getElementById('mobile-menu-trigger'), document.getElementById('mobile-bottom-menu-trigger')];
      const closeBtn = document.getElementById('mobile-drawer-close');

      function openDrawer() {
        if (!drawer || !sheet) return;
        drawer.classList.remove('pointer-events-none', 'opacity-0');
        drawer.classList.add('opacity-100');
        sheet.classList.remove('translate-y-full');
        sheet.classList.add('translate-y-0');
        document.body.style.overflow = 'hidden';
      }

      function closeDrawer() {
        if (!drawer || !sheet) return;
        drawer.classList.remove('opacity-100');
        drawer.classList.add('opacity-0', 'pointer-events-none');
        sheet.classList.remove('translate-y-0');
        sheet.classList.add('translate-y-full');
        document.body.style.overflow = '';
      }

      triggers.forEach(t => { if (t) t.addEventListener('click', openDrawer); });
      if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
      if (drawer) {
        drawer.addEventListener('click', function(e) {
          if (e.target === drawer) closeDrawer();
        });
      }
    })();
  </script>
