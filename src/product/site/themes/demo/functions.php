<?php
/**
 * Functions for the demo block theme (iKAN Health).
 */

// Register navigation menus
function demo_theme_menus() {
  register_nav_menus(
    [
      'primary' => __( 'Primary Menu', 'demo' ),
    ]
  );
}
add_action( 'init', 'demo_theme_menus' );

// Add support for theme features
function demo_theme_features() {
  add_theme_support( 'title-tag' );
  add_theme_support( 'post-thumbnails' );
  add_theme_support( 'align-wide' );
  add_theme_support( 'block-templates' );
  add_theme_support( 'custom-logo', [
    'height'      => 60,
    'width'       => 200,
    'flex-width'  => true,
    'flex-height' => true,
  ] );
  add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ] );
}
add_action( 'after_setup_theme', 'demo_theme_features' );

// Register styles and scripts
function demo_enqueue_styles() {
  // Tailwind Play CDN
  wp_enqueue_script( 'tailwind-cdn', 'https://cdn.tailwindcss.com', [], null, false );
  
  // Google Fonts (Manrope, Sora)
  wp_enqueue_style( 'demo-fonts', 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap', [], null );
  
  // Lucide Icons
  wp_enqueue_style( 'demo-icons', 'https://cdnjs.cloudflare.com/ajax/libs/lucide/0.293.0/lucide.min.css', [], null );
  
  // Theme stylesheet with iKAN design system
  wp_enqueue_style( 'demo-style', get_stylesheet_uri(), [], '1.0.0' );
}
add_action( 'wp_enqueue_scripts', 'demo_enqueue_styles' );

// Custom sidebar support
function demo_register_sidebars() {
  register_sidebar(
    [
      'name'          => __( 'Sidebar', 'demo' ),
      'id'            => 'sidebar-1',
      'description'   => __( 'Add widgets here to appear in the sidebar.', 'demo' ),
      'before_widget' => '<section id="%1$s" class="widget %2$s">',
      'after_widget'  => '</section>',
      'before_title'  => '<h2 class="widget-title">',
      'after_title'   => '</h2>',
    ]
  );
}
add_action( 'widgets_init', 'demo_register_sidebars' );

// Register SCF (Secure Custom Fields) field group if SCF is active
add_action( 'acf/init', function() {
  if ( function_exists( 'acf_add_local_field_group' ) ) {
    acf_add_local_field_group( [
      'key'    => 'group_demo_page_cms',
      'title'  => 'Page CMS Settings',
      'fields' => [
        [
          'key'   => 'field_hero_title',
          'label' => 'Hero Title',
          'name'  => 'hero_title',
          'type'  => 'text',
        ],
        [
          'key'   => 'field_hero_subtitle',
          'label' => 'Hero Subtitle',
          'name'  => 'hero_subtitle',
          'type'  => 'textarea',
          'rows'  => 3,
        ],
      ],
      'location' => [
        [
          [
            'param'    => 'post_type',
            'operator' => '==',
            'value'    => 'page',
          ],
        ],
      ],
    ] );
  }
} );
