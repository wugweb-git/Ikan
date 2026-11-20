<?php
/**
 * The header for iKAN Health WordPress theme
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?php wp_title( '|', true, 'right' ); ?></title>
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
  <header class="ikan2-theme bg-white border-b border-gray-100 sticky top-0 z-50">
    <div class="max-w-[1600px] mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <?php if ( has_custom_logo() ): ?>
            <?php the_custom_logo(); ?>
          <?php else: ?>
            <span class="text-2xl font-bold tracking-tight text-gray-900">iKAN Health</span>
          <?php endif; ?>
        </a>
        <nav class="hidden md:flex items-center gap-6">
          <?php
          if ( has_nav_menu( 'primary' ) ) {
            wp_nav_menu( [
              'theme_location' => 'primary',
              'container'      => false,
              'menu_class'     => 'flex items-center gap-6 text-sm font-medium text-gray-700',
              'fallback_cb'    => false,
            ] );
          } else {
            echo '<ul class="flex items-center gap-6 text-sm font-medium text-gray-700">';
            echo '<li><a href="' . esc_url( home_url( '/' ) ) . '" class="hover:text-blue-600">Home</a></li>';
            echo '<li><a href="' . esc_url( home_url( '/about-us' ) ) . '" class="hover:text-blue-600">About</a></li>';
            echo '<li><a href="' . esc_url( home_url( '/services' ) ) . '" class="hover:text-blue-600">Services</a></li>';
            echo '<li><a href="' . esc_url( home_url( '/assessments' ) ) . '" class="hover:text-blue-600">Assessments</a></li>';
            echo '<li><a href="' . esc_url( home_url( '/equip-programs' ) ) . '" class="hover:text-blue-600">Programs</a></li>';
            echo '<li><a href="' . esc_url( home_url( '/resources' ) ) . '" class="hover:text-blue-600">Resources</a></li>';
            echo '<li><a href="' . esc_url( home_url( '/contact-us' ) ) . '" class="hover:text-blue-600">Contact</a></li>';
            echo '</ul>';
          }
          ?>
        </nav>
        <div class="flex items-center gap-4">
          <a href="<?php echo esc_url( home_url( '/consultation' ) ); ?>" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Book Consultation
          </a>
        </div>
      </div>
    </div>
  </header>
