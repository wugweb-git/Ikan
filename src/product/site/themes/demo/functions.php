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
  // Production Compiled Tailwind v4 & App CSS
  wp_enqueue_style( 'demo-tailwind', get_theme_file_uri( 'assets/css/tailwind.css' ), [], '1.0.3' );
  wp_enqueue_style( 'demo-app', get_theme_file_uri( 'assets/css/app.css' ), [ 'demo-tailwind' ], '1.0.3' );

  // Google Fonts (Manrope, Sora)
  wp_enqueue_style( 'demo-fonts', 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap', [], null );
  
  // Lucide Icons (script and style)
  wp_enqueue_script( 'lucide-js', 'https://unpkg.com/lucide@latest/dist/umd/lucide.js', [], null, true );
  wp_enqueue_style( 'demo-icons', 'https://cdnjs.cloudflare.com/ajax/libs/lucide/0.293.0/lucide.min.css', [], null );
  
  // Theme stylesheet with iKAN design system
  wp_enqueue_style( 'demo-style', get_stylesheet_uri(), [ 'demo-tailwind', 'demo-app' ], '1.0.3' );

  // Pass AJAX URL and Nonce to frontend scripts
  wp_localize_script( 'lucide-js', 'ikanAjax', [
    'ajax_url' => admin_url( 'admin-ajax.php' ),
    'nonce'    => wp_create_nonce( 'ikan_form_nonce' ),
  ] );
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

// Route blog archive and single post requests to dedicated PHP templates
add_filter( 'template_include', function( $template ) {
  if ( is_home() || is_page( 'resources' ) ) {
    $php_file = get_template_directory() . '/resources.php';
    if ( file_exists( $php_file ) ) {
      return $php_file;
    }
  }
  if ( is_singular( 'post' ) ) {
    $php_file = get_template_directory() . '/single.php';
    if ( file_exists( $php_file ) ) {
      return $php_file;
    }
  }
  return $template;
}, 99 );

// ── FluentCRM Profiling & Data Collection Engine (NO SUPABASE) ───────────────

/**
 * Get or create a FluentCRM list ID
 */
function ikan_fluentcrm_get_list_id( $title, $slug ) {
  if ( ! function_exists( 'FluentCrmApi' ) ) return null;
  try {
    $api = FluentCrmApi( 'lists' );
    $all = $api->all();
    foreach ( $all as $item ) {
      if ( $item->slug === $slug || strcasecmp( $item->title, $title ) === 0 ) {
        return $item->id;
      }
    }
    $created = $api->create( [ 'title' => $title, 'slug' => $slug ] );
    return is_object( $created ) ? $created->id : ( $created['id'] ?? null );
  } catch ( Throwable $e ) {
    return null;
  }
}

/**
 * Get or create a FluentCRM tag ID
 */
function ikan_fluentcrm_get_tag_id( $title, $slug ) {
  if ( ! function_exists( 'FluentCrmApi' ) ) return null;
  try {
    $api = FluentCrmApi( 'tags' );
    $all = $api->all();
    foreach ( $all as $item ) {
      if ( $item->slug === $slug || strcasecmp( $item->title, $title ) === 0 ) {
        return $item->id;
      }
    }
    $created = $api->create( [ 'title' => $title, 'slug' => $slug ] );
    return is_object( $created ) ? $created->id : ( $created['id'] ?? null );
  } catch ( Throwable $e ) {
    return null;
  }
}

/**
 * Add a note to a FluentCRM subscriber
 */
function ikan_fluentcrm_add_note( $subscriber_id, $title, $description ) {
  global $wpdb;
  $table = $wpdb->prefix . 'fc_subscriber_notes';
  if ( $wpdb->get_var( "SHOW TABLES LIKE '$table'" ) === $table ) {
    $wpdb->insert( $table, [
      'subscriber_id' => $subscriber_id,
      'title'         => sanitize_text_field( $title ),
      'description'   => wp_kses_post( $description ),
      'type'          => 'note',
      'status'        => 'open',
      'created_at'    => current_time( 'mysql' ),
      'updated_at'    => current_time( 'mysql' ),
    ] );
  }
}

/**
 * Ingest or update a contact in FluentCRM with rich profiling
 */
function ikan_record_lead_in_fluentcrm( $data ) {
  if ( ! function_exists( 'FluentCrmApi' ) ) return false;

  $email = sanitize_email( $data['email'] ?? '' );
  if ( ! is_email( $email ) ) return false;

  $first_name = sanitize_text_field( $data['name'] ?? '' );
  $list_slug = $data['list_slug'] ?? 'contact-enquiries';
  $list_title = $data['list_title'] ?? 'Website Contact Enquiries';
  $tag_slug = $data['tag_slug'] ?? 'contact-form';
  $tag_title = $data['tag_title'] ?? 'Contact Form';

  $list_id = ikan_fluentcrm_get_list_id( $list_title, $list_slug );
  $tag_id = ikan_fluentcrm_get_tag_id( $tag_title, $tag_slug );

  try {
    $contactApi = FluentCrmApi( 'contacts' );
    $contact_data = [
      'email'      => $email,
      'first_name' => $first_name,
      'status'     => 'subscribed',
      'source'     => 'iKAN Web PWA',
    ];

    if ( $list_id ) $contact_data['lists'] = [ $list_id ];
    if ( $tag_id )  $contact_data['tags'] = [ $tag_id ];

    $contact = $contactApi->createOrUpdate( $contact_data );
    $sub_id = is_object( $contact ) ? $contact->id : ( $contact['id'] ?? null );

    if ( $sub_id && ! empty( $data['note_title'] ) ) {
      ikan_fluentcrm_add_note( $sub_id, $data['note_title'], $data['note_desc'] ?? '' );
    }

    return true;
  } catch ( Throwable $e ) {
    error_log( 'FluentCRM record lead error: ' . $e->getMessage() );
    return false;
  }
}

// ── Form AJAX Handlers ────────────────────────────────────────────────────────

// 1. Contact Form Submit
function ikan_handle_ajax_contact() {
  check_ajax_referer( 'ikan_form_nonce', 'nonce', false );

  $name = trim( sanitize_text_field( $_POST['name'] ?? '' ) );
  $email = trim( sanitize_email( $_POST['email'] ?? '' ) );
  $subject = trim( sanitize_text_field( $_POST['subject'] ?? 'General enquiry' ) );
  $message = trim( sanitize_textarea_field( $_POST['message'] ?? '' ) );

  $errors = [];
  if ( empty( $name ) || strlen( $name ) < 2 ) {
    $errors['name'] = 'Please enter your full name.';
  }
  if ( empty( $email ) || ! is_email( $email ) ) {
    $errors['email'] = 'Please enter a valid email address.';
  }
  if ( empty( $message ) || strlen( $message ) < 10 ) {
    $errors['message'] = 'Please write a little more so we can help (10 characters or more).';
  }

  if ( ! empty( $errors ) ) {
    wp_send_json_error( [ 'errors' => $errors ] );
    return;
  }

  $note_desc = "<strong>Subject:</strong> " . esc_html( $subject ) . "<br><br><strong>Message:</strong><br>" . nl2br( esc_html( $message ) );
  $recorded = ikan_record_lead_in_fluentcrm( [
    'email'      => $email,
    'name'       => $name,
    'list_slug'  => 'contact-enquiries',
    'list_title' => 'Website Contact Enquiries',
    'tag_slug'   => 'contact-form',
    'tag_title'  => 'Contact Form',
    'note_title' => 'Website Message: ' . $subject,
    'note_desc'  => $note_desc,
  ] );

  wp_send_json_success( [
    'message' => 'Message sent. We’ll reply to ' . esc_html( $email ) . ' within 24 hours.',
    'email'   => $email,
  ] );
}
add_action( 'wp_ajax_ikan_contact_submit', 'ikan_handle_ajax_contact' );
add_action( 'wp_ajax_nopriv_ikan_contact_submit', 'ikan_handle_ajax_contact' );

// 2. Org / Workplace Demo Inquiry Submit
function ikan_handle_ajax_org_inquiry() {
  check_ajax_referer( 'ikan_form_nonce', 'nonce', false );

  $name = trim( sanitize_text_field( $_POST['name'] ?? '' ) );
  $email = trim( sanitize_email( $_POST['email'] ?? '' ) );
  $company = trim( sanitize_text_field( $_POST['company'] ?? '' ) );
  $team_size = trim( sanitize_text_field( $_POST['team_size'] ?? '51-200' ) );
  $message = trim( sanitize_textarea_field( $_POST['message'] ?? '' ) );

  $errors = [];
  if ( empty( $name ) || strlen( $name ) < 2 ) {
    $errors['name'] = 'Please enter your name.';
  }
  if ( empty( $email ) || ! is_email( $email ) ) {
    $errors['email'] = 'Please enter your work email.';
  }
  if ( empty( $company ) ) {
    $errors['company'] = 'Please enter your company or organisation name.';
  }

  if ( ! empty( $errors ) ) {
    wp_send_json_error( [ 'errors' => $errors ] );
    return;
  }

  $note_desc = "<strong>Company:</strong> " . esc_html( $company ) . "<br><strong>Team Size:</strong> " . esc_html( $team_size ) . "<br><br><strong>Goals / Requirements:</strong><br>" . nl2br( esc_html( $message ) );
  ikan_record_lead_in_fluentcrm( [
    'email'      => $email,
    'name'       => $name,
    'list_slug'  => 'org-leads',
    'list_title' => 'Workplace & Org Leads',
    'tag_slug'   => 'org-lead',
    'tag_title'  => 'Org Lead',
    'note_title' => 'Organisation Demo Inquiry — ' . $company,
    'note_desc'  => $note_desc,
  ] );

  wp_send_json_success( [
    'message' => 'Thank you! Our workplace mental health lead will reach out to ' . esc_html( $email ) . ' to tailor your demo and pilot.',
    'email'   => $email,
  ] );
}
add_action( 'wp_ajax_ikan_org_inquiry', 'ikan_handle_ajax_org_inquiry' );
add_action( 'wp_ajax_nopriv_ikan_org_inquiry', 'ikan_handle_ajax_org_inquiry' );

// 3. Newsletter Subscription Submit
function ikan_handle_ajax_newsletter() {
  check_ajax_referer( 'ikan_form_nonce', 'nonce', false );

  $email = trim( sanitize_email( $_POST['email'] ?? '' ) );
  if ( empty( $email ) || ! is_email( $email ) ) {
    wp_send_json_error( [ 'message' => 'Please enter a valid email address.' ] );
    return;
  }

  ikan_record_lead_in_fluentcrm( [
    'email'      => $email,
    'list_slug'  => 'newsletter-subscribers',
    'list_title' => 'Newsletter Subscribers',
    'tag_slug'   => 'newsletter',
    'tag_title'  => 'Newsletter',
    'note_title' => 'Newsletter Opt-in',
    'note_desc'  => 'User subscribed to iKAN mental wellness insights on ' . current_time( 'mysql' ),
  ] );

  wp_send_json_success( [
    'message' => 'Thank you! You are now subscribed to iKAN wellness insights.',
  ] );
}
add_action( 'wp_ajax_ikan_newsletter_submit', 'ikan_handle_ajax_newsletter' );
add_action( 'wp_ajax_nopriv_ikan_newsletter_submit', 'ikan_handle_ajax_newsletter' );
