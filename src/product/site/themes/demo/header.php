<?php
/**
 * The header for iKAN Health WordPress theme
 * 1:1 authentic Vercel build design system
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?> style="--root-scrollbar: 8px; --ikan-color-primary-default: #2A2A2A; --ikan-color-primary-on: #FFFFFF; --ikan-color-accent-default: #E9EBEF; --ikan-color-accent-on: #2A2A2A; --ikan-color-background-page: #F5F5F5; --ikan-color-background-card: #FFFFFF; --ikan-color-background-muted: #F0F0F0; --ikan-color-background-input: #F3F3F5; --ikan-color-text-primary: #151515; --ikan-color-text-muted: #717182; --ikan-color-text-inverse: #FFFFFF; --ikan-color-border-default: #0000001A; --ikan-color-border-light: #0000000D; --ikan-color-status-success: #22C55E; --ikan-color-status-success-light: #DCFCE7; --ikan-color-status-danger: #D4183D; --ikan-color-status-danger-light: #FEECEE; --ikan-color-status-warning: #EAB308; --ikan-color-status-warning-light: #FFF7D6; --ikan-color-status-info: #8B5CF6; --ikan-color-status-info-light: #F3F4F6; --ikan-color-grey-0: #FFFFFF; --ikan-color-grey-1: #F5F5F5; --ikan-color-grey-2: #E4E4E4; --ikan-color-grey-3: #D9D9D9; --ikan-color-grey-4: #BDBDBD; --ikan-color-grey-5: #9E9E9E; --ikan-color-grey-6: #757575; --ikan-color-grey-7: #545454; --ikan-color-grey-8: #333333; --ikan-color-grey-9: #1A1A1A; --ikan-color-grey-10: #0D0D0D; --ikan-color-neutral-100: #FAFAFA; --ikan-color-neutral-200: #F5F5F5; --ikan-color-neutral-300: #E5E5E5; --ikan-color-neutral-400: #8B8B8B; --ikan-color-neutral-500: #4A4A4A; --ikan-color-neutral-600: #2A2A2A; --ikan-color-neutral-700: #1A1A1A; --ikan-color-charts: #2A2A2A,#4A4A4A,#6A6A6A,#8A8A8A,#AAAAAA; --ikan-type-fontfamily-base: Inter, system-ui, -apple-system, \x27Segoe UI\x27, Roboto, \x27Helvetica Neue\x27, Arial, sans-serif; --ikan-type-fontfamily-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, \x27Courier New\x27, monospace; --ikan-type-size-xs: 12px; --ikan-type-size-sm: 14px; --ikan-type-size-md: 16px; --ikan-type-size-lg: 18px; --ikan-type-size-xl: 20px; --ikan-type-size-2xl: 24px; --ikan-type-size-3xl: 32px; --ikan-type-size-4xl: 48px; --ikan-type-lineheight-xs: 1.2; --ikan-type-lineheight-sm: 1.4; --ikan-type-lineheight-md: 1.5; --ikan-type-lineheight-lg: 1.6; --ikan-type-weight-regular: 400; --ikan-type-weight-medium: 500; --ikan-type-letterspacing-tight: -0.025em; --ikan-type-letterspacing-normal: 0; --ikan-type-letterspacing-wide: 0.06em; --ikan-space-0: 0px; --ikan-space-1: 4px; --ikan-space-2: 8px; --ikan-space-3: 12px; --ikan-space-4: 16px; --ikan-space-5: 20px; --ikan-space-6: 24px; --ikan-space-7: 28px; --ikan-space-8: 32px; --ikan-space-unit: 4; --ikan-radius-xs: 2px; --ikan-radius-sm: 6px; --ikan-radius-md: 12px; --ikan-radius-lg: 16px; --ikan-radius-pill: 9999px; --ikan-shadow-xs: 0 1px 2px rgba(0,0,0,0.04); --ikan-shadow-sm: 0 2px 6px rgba(0,0,0,0.06); --ikan-shadow-md: 0 6px 20px rgba(0,0,0,0.08); --ikan-shadow-lg: 0 20px 40px rgba(0,0,0,0.12); --ikan-motion-fast: 150ms; --ikan-motion-normal: 300ms; --ikan-motion-slow: 500ms; --ikan-z-nav: 50; --ikan-z-sticky: 60; --ikan-z-modal: 100; --ikan-z-tooltip: 200; --ikan-z-toast: 40; --ikan-z-overlay: 20;">
<head>
  <meta charset="<?php bloginfo( "charset" ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <link rel="preconnect" href="https://fonts.googleapis.com/">
  <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap">
  <link rel="icon" type="image/svg+xml" href="<?php echo esc_url( get_theme_file_uri( "assets/img/favicon.svg" ) ); ?>">
  <link rel="apple-touch-icon" href="<?php echo esc_url( get_theme_file_uri( "assets/img/apple-touch-icon.png" ) ); ?>">
  <link rel="stylesheet" crossorigin="" href="<?php echo esc_url( get_theme_file_uri( "assets/css/index-C1zkq2-P.css" ) ); ?>">
  <style id="ikan-keyframes">
    @keyframes ikan-fadeIn { 0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)} }
    @keyframes ikan-fadeOut { 0%{opacity:1}100%{opacity:0} }
    @keyframes ikan-slideUp { 0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)} }
    @keyframes ikan-slideDown { 0%{opacity:0;transform:translateY(-8px)}100%{opacity:1;transform:translateY(0)} }
    @keyframes ikan-slideLeft { 0%{opacity:0;transform:translateX(8px)}100%{opacity:1;transform:translateX(0)} }
    @keyframes ikan-slideRight { 0%{opacity:0;transform:translateX(-8px)}100%{opacity:1;transform:translateX(0)} }
    @keyframes ikan-scaleIn { 0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:scale(1)} }
    @keyframes ikan-pulse { 0%{transform:scale(1);opacity:1}50%{transform:scale(1.03);opacity:.95}100%{transform:scale(1);opacity:1} }
    @keyframes ikan-bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)} }
    @keyframes ikan-wiggle { 0%{transform:rotate(0)}25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}100%{transform:rotate(0)} }
    @keyframes ikan-spin { 0%{transform:rotate(0)}100%{transform:rotate(360deg)} }
    @keyframes ikan-ripple { 0%{transform:scale(.6);opacity:.35}100%{transform:scale(1.6);opacity:0} }
  </style>
  <style id="ikan-hero-marquee-style">
    @keyframes ikan-marquee-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .ikan-marquee-track {
      display: flex;
      width: max-content;
      animation: ikan-marquee-scroll var(--marquee-duration, 40s) linear infinite;
    }
    .ikan-marquee-track:hover,
    .ikan-marquee-track.paused {
      animation-play-state: paused;
    }
    .ikan-marquee-container {
      position: relative;
      overflow: hidden;
      width: 100%;
    }
    .ikan-marquee-container::before,
    .ikan-marquee-container::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      width: 60px;
      z-index: 2;
      pointer-events: none;
    }
    .ikan-marquee-container::before {
      left: 0;
      background: linear-gradient(to right, var(--canvas, #f5f5f5), transparent);
    }
    .ikan-marquee-container::after {
      right: 0;
      background: linear-gradient(to left, var(--canvas, #f5f5f5), transparent);
    }
  </style>
  <style id="ikan-logo-carousel-keyframes">
    @keyframes ikan-logo-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  </style>
  <style>
    /* Responsive Navigation Controls */
    @media (max-width: 1023px) {
      .nav-fixed-wrapper { display: none !important; }
      .mnav { display: block !important; }
    }
    @media (min-width: 1024px) {
      .nav-fixed-wrapper { display: flex !important; }
      .mnav { display: none !important; }
    }
  </style>
  <?php wp_head(); ?>
</head>
<body <?php body_class( "antialiased" ); ?>>
  <div id="root">
    <div class="flex flex-col min-h-[100dvh] bg-background font-sans antialiased text-foreground">
      <a href="#main-content" class="skip-to-main" style="position: absolute; left: -9999px; z-index: 9999; padding: var(--spacing-2) var(--spacing-4); background-color: var(--color-primary-default); color: var(--color-primary-on); border-radius: var(--radius-sm); font-weight: var(--font-weight-medium); text-decoration: none;">Skip to main content</a>
      
      <!-- Desktop Capsule Nav -->
      <header class="ikan2-theme nav-fixed-wrapper" role="banner">
        <nav class="ikan-capsule-nav px-[16px] py-[24px] m-[0px]" aria-label="Primary navigation" style="border-radius: 9999px;">
          <a href="<?php echo esc_url( home_url( "/" ) ); ?>" class="nav-brand no-underline" aria-label="iKAN home">
            <img src="<?php echo esc_url( get_theme_file_uri( "assets/img/favicon.svg" ) ); ?>" alt="" width="40" height="40">
            <span class="type-subhead">iKAN</span>
          </a>
          <div class="hidden md:flex items-center gap-2">
            <a href="<?php echo esc_url( home_url( "/" ) ); ?>" class="nav-link no-underline <?php echo is_front_page() ? "active" : ""; ?>">Home</a>
            <a href="<?php echo esc_url( home_url( "/services" ) ); ?>" class="nav-link no-underline <?php echo is_page( "services" ) ? "active" : ""; ?>">Services</a>
            <a href="<?php echo esc_url( home_url( "/resources" ) ); ?>" class="nav-link no-underline <?php echo (is_page( "resources" ) || is_home()) ? "active" : ""; ?>">Resources</a>
            <a href="<?php echo esc_url( home_url( "/about-us" ) ); ?>" class="nav-link no-underline <?php echo is_page( "about-us" ) ? "active" : ""; ?>">About Us</a>
            <a href="<?php echo esc_url( home_url( "/faq" ) ); ?>" class="nav-link no-underline <?php echo is_page( "faq" ) ? "active" : ""; ?>">FAQ</a>
          </div>
          <div class="flex items-center gap-4">
            <a href="<?php echo esc_url( home_url( "/contact-us" ) ); ?>" class="btn-nav-secondary gap-2 no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
              Let\x27s Talk
            </a>
            <a href="https://app.ikanhealth.in/login" class="btn-nav-primary gap-2 no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line></svg>
              Sign in
            </a>
          </div>
        </nav>
      </header>

      <!-- Mobile Public Capsule Navigation Bar -->
      <nav class="ikan2-theme mnav" aria-label="Public navigation">
        <div class="mnav__bar">
          <a href="<?php echo esc_url( home_url( "/" ) ); ?>" class="mnav__brand" aria-label="iKAN home">
            <img src="<?php echo esc_url( get_theme_file_uri( "assets/img/favicon.svg" ) ); ?>" alt="" width="40" height="40">
            <span class="type-subhead">iKAN</span>
          </a>
          <button type="button" class="mnav__toggle" aria-label="Open navigation menu" aria-expanded="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="mnav__menu" style="display: none;">
          <a href="<?php echo esc_url( home_url( "/" ) ); ?>" class="mnav__item type-label-lg <?php echo is_front_page() ? "is-active" : ""; ?>" style="text-decoration:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            Home
          </a>
          <a href="<?php echo esc_url( home_url( "/services" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "services" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check" aria-hidden="true"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path></svg>
            Services
          </a>
          <a href="<?php echo esc_url( home_url( "/resources" ) ); ?>" class="mnav__item type-label-lg <?php echo (is_page( "resources" ) || is_home()) ? "is-active" : ""; ?>" style="text-decoration:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            Resources
          </a>
          <a href="<?php echo esc_url( home_url( "/about-us" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "about-us" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            About Us
          </a>
          <a href="<?php echo esc_url( home_url( "/faq" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "faq" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-help" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
            FAQ
          </a>
          <div class="mnav__actions">
            <a href="<?php echo esc_url( home_url( "/contact-us" ) ); ?>" class="mnav__talk type-label-lg no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
              Let\x27s Talk
            </a>
            <a href="https://app.ikanhealth.in/login" class="mnav__signin type-label-lg no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line></svg>
              Sign in
            </a>
          </div>
        </div>
      </nav>
