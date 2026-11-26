<?php
/**
 * iKAN Header Block — render.php
 *
 * Server-side render for the ikan/header block.
 * Emits the authentic fixed capsule navigation on desktop (≥1024px)
 * and the compact capsule top bar on mobile (<1024px).
 *
 * @package iKAN_Health
 */

$cta_text    = ! empty( $attributes['ctaText'] ) ? $attributes['ctaText'] : "Let's Talk";
$cta_url     = ! empty( $attributes['ctaUrl'] ) ? home_url( $attributes['ctaUrl'] ) : home_url( '/contact-us' );
$signin_url  = ! empty( $attributes['signInUrl'] ) ? $attributes['signInUrl'] : 'https://app.ikanhealth.in/login';
$current_url = home_url( add_query_arg( [] ) );

// Fetch primary menu items if configured in WP, else use canonical defaults
$primary_items = [];
$menu_locations = get_nav_menu_locations();
if ( isset( $menu_locations['primary'] ) ) {
  $menu_obj = wp_get_nav_menu_object( $menu_locations['primary'] );
  if ( $menu_obj ) {
    $primary_items = wp_get_nav_menu_items( $menu_obj->term_id ) ?: [];
  }
}
?>
<div class="ikan-header-block-wrapper w-full">
  <!-- Desktop Capsule Nav (hidden below 1024px) -->
  <header class="ikan2-theme nav-fixed-wrapper hidden lg:flex" role="banner">
    <nav class="ikan-capsule-nav px-[16px] py-[12px] m-[0px]" aria-label="Primary navigation" style="border-radius: 9999px;">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="nav-brand no-underline shrink-0" aria-label="iKAN home">
        <img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>" alt="" width="40" height="40">
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
          <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="nav-link no-underline <?php echo is_front_page() ? 'active' : ''; ?>">Home</a>
          <a href="<?php echo esc_url( home_url( '/about' ) ); ?>" class="nav-link no-underline <?php echo ( is_page( 'about' ) || is_page( 'about-us' ) ) ? 'active' : ''; ?>">About Us</a>
          <a href="<?php echo esc_url( home_url( '/services' ) ); ?>" class="nav-link no-underline <?php echo is_page( 'services' ) ? 'active' : ''; ?>">Services</a>
          <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="nav-link no-underline <?php echo ( is_page( 'assessments' ) || is_page( 'assessment' ) ) ? 'active' : ''; ?>">Assessments</a>
          <a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="nav-link no-underline <?php echo ( is_page( 'equip-programs' ) || is_page( 'equip' ) || is_page( 'program' ) ) ? 'active' : ''; ?>">Equip Programs</a>
          <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="nav-link no-underline <?php echo ( is_page( 'resources' ) || is_page( 'resource' ) || is_home() ) ? 'active' : ''; ?>">Resources</a>
          <a href="<?php echo esc_url( home_url( '/org' ) ); ?>" class="nav-link no-underline <?php echo is_page( 'org' ) ? 'active' : ''; ?>">For Organisations</a>
          <a href="<?php echo esc_url( home_url( '/join/partner' ) ); ?>" class="nav-link no-underline <?php echo ( is_page( 'partner' ) || is_page( 'professional-application' ) || is_page( 'join/partner' ) ) ? 'active' : ''; ?>">Join as Partner</a>
          <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="nav-link no-underline <?php echo is_page( 'burnout-cost-calculator' ) ? 'active' : ''; ?>">Calculator</a>
          <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="nav-link no-underline <?php echo is_page( 'faq' ) ? 'active' : ''; ?>">FAQ</a>
        <?php endif; ?>
      </div>
      <div class="flex items-center gap-2 xl:gap-3 shrink-0">
        <a href="<?php echo esc_url( $cta_url ); ?>" class="btn-nav-secondary gap-2 no-underline text-xs xl:text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
          <?php echo esc_html( $cta_text ); ?>
        </a>
        <a href="<?php echo esc_url( $signin_url ); ?>" class="btn-nav-primary gap-2 no-underline text-xs xl:text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line></svg>
          Sign in
        </a>
      </div>
    </nav>
  </header>

  <!-- Mobile Public Capsule Navigation Bar (<1024px) -->
  <nav class="ikan2-theme mnav block lg:hidden" aria-label="Public navigation">
    <div class="mnav__bar">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="mnav__brand" aria-label="iKAN home">
        <img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>" alt="" width="40" height="40">
        <span class="type-subhead">iKAN</span>
      </a>
      <div class="mnav__actions">
        <a href="<?php echo esc_url( $cta_url ); ?>" class="mnav__talk">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
          Talk
        </a>
        <a href="<?php echo esc_url( $signin_url ); ?>" class="mnav__signin">Sign in</a>
        <button type="button" class="mnav__toggle" aria-expanded="false" aria-label="Toggle navigation menu">
          <span class="mnav__toggle-bar"></span>
          <span class="mnav__toggle-bar"></span>
          <span class="mnav__toggle-bar"></span>
        </button>
      </div>
    </div>
    <div class="mnav__menu" style="display: none;">
      <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="mnav__link <?php echo is_front_page() ? 'active' : ''; ?>">Home</a>
      <a href="<?php echo esc_url( home_url( '/about' ) ); ?>" class="mnav__link <?php echo ( is_page( 'about' ) || is_page( 'about-us' ) ) ? 'active' : ''; ?>">About Us</a>
      <a href="<?php echo esc_url( home_url( '/services' ) ); ?>" class="mnav__link <?php echo is_page( 'services' ) ? 'active' : ''; ?>">Services</a>
      <a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="mnav__link <?php echo ( is_page( 'assessments' ) || is_page( 'assessment' ) ) ? 'active' : ''; ?>">Assessments</a>
      <a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="mnav__link <?php echo ( is_page( 'equip-programs' ) || is_page( 'equip' ) || is_page( 'program' ) ) ? 'active' : ''; ?>">Equip Programs</a>
      <a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="mnav__link <?php echo ( is_page( 'resources' ) || is_page( 'resource' ) || is_home() ) ? 'active' : ''; ?>">Resources</a>
      <a href="<?php echo esc_url( home_url( '/org' ) ); ?>" class="mnav__link <?php echo is_page( 'org' ) ? 'active' : ''; ?>">For Organisations</a>
      <a href="<?php echo esc_url( home_url( '/join/partner' ) ); ?>" class="mnav__link <?php echo ( is_page( 'partner' ) || is_page( 'professional-application' ) || is_page( 'join/partner' ) ) ? 'active' : ''; ?>">Join as Partner</a>
      <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="mnav__link <?php echo is_page( 'burnout-cost-calculator' ) ? 'active' : ''; ?>">Burnout Calculator</a>
      <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="mnav__link <?php echo is_page( 'faq' ) ? 'active' : ''; ?>">FAQ</a>
      <a href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="mnav__link <?php echo ( is_page( 'contact' ) || is_page( 'contact-us' ) ) ? 'active' : ''; ?>">Contact Us</a>
    </div>
  </nav>
</div>
