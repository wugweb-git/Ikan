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
  <header class="ikan2-theme">
    <div class="max-w-[1600px] mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-2xl font-bold"><?php bloginfo( 'name' ); ?></a>
        <nav>
          <?php
          $args = [
            'theme_location' => 'primary',
            'menu' => 'primary',
            'container' => false,
          ];
          wp_nav_menu( $args );
          ?>
        </nav>
      </div>
    </div>
  </header>
</body>
</html>