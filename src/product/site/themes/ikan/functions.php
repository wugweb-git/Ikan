<?php
/**
 * Functions for the iKAN Health WordPress theme.
 */

// Register navigation menus
function ikan_theme_menus() {
  register_nav_menus(
    [
      'primary' => __( 'Primary Menu', 'ikan' ),
    ]
  );
}
add_action( 'init', 'ikan_theme_menus' );;

// Enable featured images
add_theme_support( 'post-thumbnails' );;

// Register custom CSS
function ikan_enqueue_styles() {
  wp_enqueue_style( 'ikan-style', get_stylesheet_uri() );
  wp_enqueue_style( 'ikan-fonts', 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600&display=swap', array(), null );
  wp_enqueue_style( 'ikan-icons', 'https://cdnjs.cloudflare.com/ajax/libs/lucide/0.293.0/lucide.min.css', array(), null );
  wp_enqueue_script( 'ikan-main', get_template_directory_uri() . '/dist/main.js', array(), null, true );
}
add_action( 'wp_enqueue_scripts', 'ikan_enqueue_styles' );;

// Add support for theme features
function ikan_theme_features() {
  add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ] );
  add_theme_support( 'title-tag' );
}
add_action( 'after_setup_theme', 'ikan_theme_features' );;

// Custom sidebar support
function ikan_register_sidebars() {
  register_sidebar(
    [
      'name' => __( 'Sidebar', 'ikan' ),
      'id' => 'sidebar-1',
      'description' => __( 'Add widgets here to appear in the sidebar.', 'ikan' ),
      'before_widget' => '<section id="%1$s" class="widget %2$s">',
      'after_widget' => '</section>',
      'before_title' => '<h2 class="widget-title">',
      'after_title' => '</h2>',
    ]
  );
}
add_action( 'widgets_init', 'ikan_register_sidebars' );