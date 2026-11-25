<?php
/**
 * The header for iKAN Health WordPress theme
 * 1:1 authentic Vercel build design system
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?> style="--root-scrollbar: 8px; --ikan-color-primary-default: #2A2A2A; --ikan-color-primary-on: #FFFFFF; --ikan-color-accent-default: #E9EBEF; --ikan-color-accent-on: #2A2A2A; --ikan-color-background-page: #F5F5F5; --ikan-color-background-card: #FFFFFF; --ikan-color-background-muted: #F0F0F0; --ikan-color-background-input: #F3F3F5; --ikan-color-text-primary: #151515; --ikan-color-text-muted: #717182; --ikan-color-text-inverse: #FFFFFF; --ikan-color-border-default: #0000001A; --ikan-color-border-light: #0000000D; --ikan-color-status-success: #22C55E; --ikan-color-status-success-light: #DCFCE7; --ikan-color-status-danger: #D4183D; --ikan-color-status-danger-light: #FEECEE; --ikan-color-status-warning: #EAB308; --ikan-color-status-warning-light: #FFF7D6; --ikan-color-status-info: #8B5CF6; --ikan-color-status-info-light: #F3F4F6; --ikan-color-grey-0: #FFFFFF; --ikan-color-grey-1: #F5F5F5; --ikan-color-grey-2: #E4E4E4; --ikan-color-grey-3: #D9D9D9; --ikan-color-grey-4: #BDBDBD; --ikan-color-grey-5: #9E9E9E; --ikan-color-grey-6: #757575; --ikan-color-grey-7: #545454; --ikan-color-grey-8: #333333; --ikan-color-grey-9: #1A1A1A; --ikan-color-grey-10: #0D0D0D; --ikan-color-neutral-100: #FAFAFA; --ikan-color-neutral-200: #F5F5F5; --ikan-color-neutral-300: #E5E5E5; --ikan-color-neutral-400: #8B8B8B; --ikan-color-neutral-500: #4A4A4A; --ikan-color-neutral-600: #2A2A2A; --ikan-color-neutral-700: #1A1A1A; --ikan-color-charts: #2A2A2A,#4A4A4A,#6A6A6A,#8A8A8A,#AAAAAA; --ikan-type-fontfamily-base: Inter, system-ui, -apple-system, \x27Segoe UI\x27, Roboto, \x27Helvetica Neue\x27, Arial, sans-serif; --ikan-type-fontfamily-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, \x27Courier New\x27, monospace; --ikan-type-size-xs: 12px; --ikan-type-size-sm: 14px; --ikan-type-size-md: 16px; --ikan-type-size-lg: 18px; --ikan-type-size-xl: 20px; --ikan-type-size-2xl: 24px; --ikan-type-size-3xl: 32px; --ikan-type-size-4xl: 48px; --ikan-type-lineheight-xs: 1.2; --ikan-type-lineheight-sm: 1.4; --ikan-type-lineheight-md: 1.5; --ikan-type-lineheight-lg: 1.6; --ikan-type-weight-regular: 400; --ikan-type-weight-medium: 500; --ikan-type-letterspacing-tight: -0.025em; --ikan-type-letterspacing-normal: 0; --ikan-type-letterspacing-wide: 0.06em; --ikan-space-0: 0px; --ikan-space-1: 4px; --ikan-space-2: 8px; --ikan-space-3: 12px; --ikan-space-4: 16px; --ikan-space-5: 20px; --ikan-space-6: 24px; --ikan-space-7: 28px; --ikan-space-8: 32px; --ikan-space-unit: 4; --ikan-radius-xs: 2px; --ikan-radius-sm: 6px; --ikan-radius-md: 12px; --ikan-radius-lg: 16px; --ikan-radius-pill: 9999px; --ikan-shadow-xs: 0 1px 2px rgba(0,0,0,0.04); --ikan-shadow-sm: 0 2px 6px rgba(0,0,0,0.06); --ikan-shadow-md: 0 6px 20px rgba(0,0,0,0.08); --ikan-shadow-lg: 0 20px 40px rgba(0,0,0,0.12); --ikan-motion-fast: 150ms; --ikan-motion-normal: 300ms; --ikan-motion-slow: 500ms; --ikan-z-nav: 50; --ikan-z-sticky: 60; --ikan-z-modal: 100; --ikan-z-tooltip: 200; --ikan-z-toast: 40; --ikan-z-overlay: 20;">
<head>
  <meta charset="<?php bloginfo( "charset" ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content">
  <meta name="theme-color" content="#FBFBFD">
  <meta name="background-color" content="#FBFBFD">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="iKAN Health">
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="manifest" href="<?php echo esc_url( get_theme_file_uri( "manifest.json" ) ); ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com/">
  <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin="">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap">
  <link rel="icon" type="image/svg+xml" href="<?php echo esc_url( get_theme_file_uri( "assets/img/favicon.svg" ) ); ?>">
  <link rel="apple-touch-icon" href="<?php echo esc_url( get_theme_file_uri( "assets/img/apple-touch-icon.png" ) ); ?>">
  <?php
  $vite_assets = function_exists( 'ikan_get_vite_assets' ) ? ikan_get_vite_assets() : [];
  $vite_css_url = ! empty( $vite_assets['css'] ) ? home_url( $vite_assets['css'] ) : get_theme_file_uri( "assets/css/index-C1zkq2-P.css" );
  ?>
  <link rel="stylesheet" crossorigin="" href="<?php echo esc_url( $vite_css_url ); ?>">
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
    /* Responsive Navigation Controls & Sitewide Spacing */
    :root, html, body, .ikan2-theme {
      --font-display: 'Sora', system-ui, -apple-system, sans-serif !important;
      --font-sans: 'Manrope', 'Inter', system-ui, -apple-system, sans-serif !important;
      --nav-clearance: 112px;
    }
    .font-display {
      font-family: var(--font-display) !important;
    }
    @media (max-width: 1023px) {
      .ikan-desktop-only { display: none !important; }
      .ikan-mobile-only { display: block !important; }
      .faq-two-col { display: grid !important; grid-template-columns: 1fr !important; gap: 32px !important; }
      @media (max-width: 767px) {
        input:not([type=checkbox]):not([type=radio]), select, textarea {
          font-size: 16px !important;
        }
      }
    }
    @media (min-width: 1024px) {
      .ikan-mobile-only { display: none !important; }
      .ikan-desktop-only { display: block !important; }
      .faq-two-col { display: grid !important; grid-template-columns: 1fr 340px !important; gap: 40px !important; }
    }
    @media (max-width: 1023px) {
      :root, .ikan2-theme {
        --nav-clearance: calc(84px + env(safe-area-inset-top, 0px));
      }
      .nav-fixed-wrapper { display: none !important; }
      .mnav {
        display: block !important;
        padding-top: max(10px, env(safe-area-inset-top, 10px)) !important;
      }
      .mnav__menu {
        width: calc(min(100% - (var(--page-gutter, 16px)*2), var(--page-max, 1100px)) + (var(--nav-outset, 0px)*2));
        margin-inline: auto;
        max-height: calc(100dvh - 84px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
      }
      .mnav__talk, .mnav__signin {
        min-height: 44px;
      }
    }
    @media (min-width: 1024px) {
      .nav-fixed-wrapper { display: flex !important; }
      .mnav { display: none !important; }
    }
    .site-page-below-nav {
      padding-top: var(--nav-clearance, 112px) !important;
    }
    .site-container, .ikan-container {
      width: 100%;
      max-width: 1100px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }
    @media (min-width: 768px) {
      .site-container, .ikan-container {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }
  </style>
  <!-- Google Tag Manager (GTM-5XF9PNPX) -->
  <script async src="https://www.googletagmanager.com/gtm.js?id=GTM-5XF9PNPX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('set', 'linker', {
      domains: ['ikanhealth.in', 'app.ikanhealth.in']
    });
  </script>
  <!-- End Google Tag Manager -->
  <?php wp_head(); ?>
</head>
<body <?php body_class( "antialiased ikan2-theme" ); ?>>
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5XF9PNPX"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
  <?php
  // Query WordPress Primary menu or provide fallback items
  $primary_items = [];
  $menu_locations = get_nav_menu_locations();
  if ( isset( $menu_locations['primary'] ) ) {
    $menu_obj = wp_get_nav_menu_object( $menu_locations['primary'] );
    if ( $menu_obj ) {
      $primary_items = wp_get_nav_menu_items( $menu_obj->term_id ) ?: [];
    }
  }
  $current_url = home_url( add_query_arg( [] ) );
  ?>
  <div id="root">
    <div class="flex flex-col min-h-[100dvh] bg-background font-sans antialiased text-foreground">
      <a href="#main-content" class="skip-to-main" style="position: absolute; left: -9999px; z-index: 9999; padding: var(--spacing-2) var(--spacing-4); background-color: var(--color-primary-default); color: var(--color-primary-on); border-radius: var(--radius-sm); font-weight: var(--font-weight-medium); text-decoration: none;">Skip to main content</a>
      
      <?php
      $is_app_shell = ! empty( $GLOBALS['ikan_app_shell'] )
        || is_page( [ 'about', 'about-us', 'contact', 'contact-us', 'faq', 'terms', 'terms-of-use', 'privacy', 'privacy-policy', 'cancellation-policy', 'return-policy', 'legal' ] )
        || get_query_var( 'ikan_contact_page' )
        || get_query_var( 'ikan_legal_page' )
        || get_query_var( 'ikan_about_page' )
        || is_singular( 'post' );
      ?>
      <?php if ( ! $is_app_shell ) : ?>
      <!-- Desktop Capsule Nav -->
      <header class="ikan2-theme nav-fixed-wrapper hidden lg:flex" role="banner">
        <nav class="ikan-capsule-nav px-[16px] py-[12px] m-[0px]" aria-label="Primary navigation" style="border-radius: 9999px;">
          <a href="<?php echo esc_url( home_url( "/" ) ); ?>" class="nav-brand no-underline shrink-0" aria-label="iKAN home">
            <img src="<?php echo esc_url( get_theme_file_uri( "assets/img/favicon.svg" ) ); ?>" alt="" width="40" height="40">
            <span class="type-subhead">iKAN</span>
          </a>
          <div class="flex items-center gap-1 xl:gap-2">
            <?php if ( ! empty( $primary_items ) ) : ?>
              <?php foreach ( $primary_items as $item ) : 
                $active = ( rtrim( $item->url, '/' ) === rtrim( $current_url, '/' ) ) || ( is_front_page() && rtrim( $item->url, '/' ) === rtrim( home_url(), '/' ) );
              ?>
                <a href="<?php echo esc_url( $item->url ); ?>" class="nav-link no-underline <?php echo $active ? 'active' : ''; ?>">
                  <?php echo esc_html( $item->title ); ?>
                </a>
              <?php endforeach; ?>
            <?php else : ?>
              <a href="<?php echo esc_url( home_url( "/" ) ); ?>" class="nav-link no-underline <?php echo is_front_page() ? "active" : ""; ?>">Home</a>
              <a href="<?php echo esc_url( home_url( "/about" ) ); ?>" class="nav-link no-underline <?php echo (is_page( "about" ) || is_page( "about-us" )) ? "active" : ""; ?>">About Us</a>
              <a href="<?php echo esc_url( home_url( "/services" ) ); ?>" class="nav-link no-underline <?php echo is_page( "services" ) ? "active" : ""; ?>">Services</a>
              <a href="<?php echo esc_url( home_url( "/assessments" ) ); ?>" class="nav-link no-underline <?php echo (is_page( "assessments" ) || is_page( "assessment" )) ? "active" : ""; ?>">Assessments</a>
              <a href="<?php echo esc_url( home_url( "/equip-programs" ) ); ?>" class="nav-link no-underline <?php echo (is_page( "equip-programs" ) || is_page( "equip" ) || is_page( "program" )) ? "active" : ""; ?>">Equip Programs</a>
              <a href="<?php echo esc_url( home_url( "/resources" ) ); ?>" class="nav-link no-underline <?php echo (is_page( "resources" ) || is_page( "resource" ) || is_home()) ? "active" : ""; ?>">Resources</a>
              <a href="<?php echo esc_url( home_url( "/org" ) ); ?>" class="nav-link no-underline <?php echo is_page( "org" ) ? "active" : ""; ?>">For Organisations</a>
              <a href="<?php echo esc_url( home_url( "/join/partner" ) ); ?>" class="nav-link no-underline <?php echo (is_page( "partner" ) || is_page( "professional-application" ) || is_page( "join/partner" )) ? "active" : ""; ?>">Join as Partner</a>
              <a href="<?php echo esc_url( home_url( "/burnout-cost-calculator" ) ); ?>" class="nav-link no-underline <?php echo is_page( "burnout-cost-calculator" ) ? "active" : ""; ?>">Calculator</a>
              <a href="<?php echo esc_url( home_url( "/faq" ) ); ?>" class="nav-link no-underline <?php echo is_page( "faq" ) ? "active" : ""; ?>">FAQ</a>
            <?php endif; ?>
          </div>
          <div class="flex items-center gap-2 xl:gap-3 shrink-0">
            <a href="<?php echo esc_url( home_url( "/contact-us" ) ); ?>" class="btn-nav-secondary gap-2 no-underline text-xs xl:text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
              Let's Talk
            </a>
            <a href="https://app.ikanhealth.in/login" class="btn-nav-primary gap-2 no-underline text-xs xl:text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line></svg>
              Sign in
            </a>
          </div>
        </nav>
      </header>

      <!-- Mobile Public Capsule Navigation Bar -->
      <nav class="ikan2-theme mnav block lg:hidden" aria-label="Public navigation">
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
          <?php if ( ! empty( $primary_items ) ) : ?>
            <?php foreach ( $primary_items as $item ) : 
              $active = ( rtrim( $item->url, '/' ) === rtrim( $current_url, '/' ) ) || ( is_front_page() && rtrim( $item->url, '/' ) === rtrim( home_url(), '/' ) );
              $slug = sanitize_title( $item->title );
              $icon = 'circle';
              if ( strpos( $slug, 'home' ) !== false ) $icon = 'house';
              elseif ( strpos( $slug, 'about' ) !== false ) $icon = 'info';
              elseif ( strpos( $slug, 'service' ) !== false ) $icon = 'clipboard-check';
              elseif ( strpos( $slug, 'assess' ) !== false ) $icon = 'activity';
              elseif ( strpos( $slug, 'equip' ) !== false || strpos( $slug, 'program' ) !== false ) $icon = 'sparkles';
              elseif ( strpos( $slug, 'resource' ) !== false ) $icon = 'book-open';
              elseif ( strpos( $slug, 'contact' ) !== false ) $icon = 'message-circle';
              elseif ( strpos( $slug, 'faq' ) !== false ) $icon = 'circle-help';
              elseif ( strpos( $slug, 'burnout' ) !== false || strpos( $slug, 'calc' ) !== false ) $icon = 'calculator';
              elseif ( strpos( $slug, 'partner' ) !== false || strpos( $slug, 'join' ) !== false ) $icon = 'user-plus';
            ?>
              <a href="<?php echo esc_url( $item->url ); ?>" class="mnav__item type-label-lg <?php echo $active ? "is-active" : ""; ?>" style="text-decoration:none;">
                <i data-lucide="<?php echo esc_attr( $icon ); ?>" class="w-4 h-4"></i>
                <?php echo esc_html( $item->title ); ?>
              </a>
            <?php endforeach; ?>
          <?php else : ?>
            <a href="<?php echo esc_url( home_url( "/" ) ); ?>" class="mnav__item type-label-lg <?php echo is_front_page() ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="house" class="w-4 h-4"></i> Home
            </a>
            <a href="<?php echo esc_url( home_url( "/about-us" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "about-us" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="info" class="w-4 h-4"></i> About Us
            </a>
            <a href="<?php echo esc_url( home_url( "/services" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "services" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="clipboard-check" class="w-4 h-4"></i> Services
            </a>
            <a href="<?php echo esc_url( home_url( "/assessments" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "assessments" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="activity" class="w-4 h-4"></i> Assessments
            </a>
            <a href="<?php echo esc_url( home_url( "/equip-programs" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "equip-programs" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="sparkles" class="w-4 h-4"></i> Equip Programs
            </a>
            <a href="<?php echo esc_url( home_url( "/resources" ) ); ?>" class="mnav__item type-label-lg <?php echo (is_page( "resources" ) || is_home()) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="book-open" class="w-4 h-4"></i> Resources
            </a>
            <a href="<?php echo esc_url( home_url( "/org" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "org" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="building" class="w-4 h-4"></i> For Organisations
            </a>
            <a href="<?php echo esc_url( home_url( "/join/partner" ) ); ?>" class="mnav__item type-label-lg <?php echo (is_page( "partner" ) || is_page( "professional-application" ) || is_page( "join/partner" )) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Join as Partner
            </a>
            <a href="<?php echo esc_url( home_url( "/burnout-cost-calculator" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "burnout-cost-calculator" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="calculator" class="w-4 h-4"></i> Burnout Calculator
            </a>
            <a href="<?php echo esc_url( home_url( "/faq" ) ); ?>" class="mnav__item type-label-lg <?php echo is_page( "faq" ) ? "is-active" : ""; ?>" style="text-decoration:none;">
              <i data-lucide="circle-help" class="w-4 h-4"></i> FAQ
            </a>
          <?php endif; ?>
          <div class="mnav__actions">
            <a href="<?php echo esc_url( home_url( "/contact-us" ) ); ?>" class="mnav__talk type-label-lg no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
              Let's Talk
            </a>
            <a href="https://app.ikanhealth.in/login" class="mnav__signin type-label-lg no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line></svg>
              Sign in
            </a>
          </div>
        </div>
      </nav>
      <?php endif; ?>
