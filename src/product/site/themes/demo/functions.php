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
  add_theme_support( 'editor-styles' );
  add_editor_style( 'style.css' );
  add_theme_support( 'custom-logo', [
    'height'      => 60,
    'width'       => 200,
    'flex-width'  => true,
    'flex-height' => true,
  ] );
  add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ] );
}
add_action( 'after_setup_theme', 'demo_theme_features' );

// Load Hostinger Mail Integration & PHP SDK
require_once get_template_directory() . '/includes/class-hostinger-mail.php';

// Enqueue Block Editor Assets (Fonts & Design System for Gutenberg)
add_action( 'enqueue_block_editor_assets', function() {
  wp_enqueue_style( 'demo-editor-fonts', 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;600;700;800&display=swap', [], null );
  wp_enqueue_style( 'demo-editor-style', get_stylesheet_uri(), [], '1.0.4' );
} );

// Register styles and scripts
function demo_enqueue_styles() {
  // Production Compiled Tailwind v4 & App CSS
  wp_enqueue_style( 'demo-tailwind', get_theme_file_uri( 'assets/css/tailwind.css' ), [], '1.0.3' );
  wp_enqueue_style( 'demo-app', get_theme_file_uri( 'assets/css/app.css' ), [ 'demo-tailwind' ], '1.0.3' );

  // Google Fonts (Manrope, Sora)
  wp_enqueue_style( 'demo-fonts', 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap', [], null );
  
  // Lucide Icons (script)
  wp_enqueue_script( 'lucide-js', 'https://unpkg.com/lucide@latest/dist/umd/lucide.js', [], null, true );
  
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

// Direct redirect for marketing login requests to member PWA app
add_action( 'template_redirect', function() {
  $req_path = trim( parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );
  if ( $req_path === 'login' || is_page( 'login' ) ) {
    wp_redirect( 'https://app.ikanhealth.in/login', 302 );
    exit;
  }

  // Intercept partner, professional application, and org routes before canonical redirects
  if (
    $req_path === 'join/partner' || str_starts_with( $req_path, 'join/partner/' ) ||
    $req_path === 'join/professional' || str_starts_with( $req_path, 'join/professional/' ) ||
    $req_path === 'partner' || str_starts_with( $req_path, 'partner/' ) ||
    $req_path === 'professional-application' || str_starts_with( $req_path, 'professional-application/' )
  ) {
    status_header( 200 );
    $tpl = locate_template( 'professional-application.php' );
    if ( $tpl ) {
      load_template( $tpl );
      exit;
    }
  }

  if ( $req_path === 'org' || str_starts_with( $req_path, 'org/' ) || $req_path === 'organisation' ) {
    status_header( 200 );
    $tpl = locate_template( 'org.php' );
    if ( $tpl ) {
      load_template( $tpl );
      exit;
    }
  }
} );

// Prevent WordPress from redirecting /join/professional or /join/partner away
add_filter( 'redirect_canonical', function( $redirect_url, $requested_url ) {
  $path = trim( parse_url( $requested_url, PHP_URL_PATH ), '/' );
  if (
    $path === 'join/professional' || str_starts_with( $path, 'join/professional/' ) ||
    $path === 'join/partner' || str_starts_with( $path, 'join/partner/' ) ||
    $path === 'partner' || str_starts_with( $path, 'partner/' ) ||
    $path === 'org' || str_starts_with( $path, 'org/' ) ||
    $path === 'professional-application' || str_starts_with( $path, 'professional-application/' )
  ) {
    return false;
  }
  return $redirect_url;
}, 10, 2 );

// Helper to resolve current Vite production entry script
function get_vite_entry_script() {
  $assets_dir = ABSPATH . 'assets';
  if ( is_dir( $assets_dir ) ) {
    $files = glob( $assets_dir . '/index-*.js' );
    if ( ! empty( $files ) ) {
      usort( $files, function( $a, $b ) {
        return filemtime( $b ) - filemtime( $a );
      } );
      return '/assets/' . basename( $files[0] );
    }
  }
  return '/assets/index-BN9O1lzE.js';
}

// Route blog archive, single post, and custom page requests to dedicated PHP templates
add_filter( 'template_include', function( $template ) {
  $req_path = trim( parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );

  // Handle prefix routes for multi-step applications and sub-pages
  if ( str_starts_with( $req_path, 'org' ) ) {
    return get_template_directory() . '/org.php';
  }
  if ( str_starts_with( $req_path, 'join/partner' ) || str_starts_with( $req_path, 'join/professional' ) || $req_path === 'partner' ) {
    return get_template_directory() . '/professional-application.php';
  }
  if ( str_starts_with( $req_path, 'onboarding' ) || str_starts_with( $req_path, 'get-started' ) || $req_path === 'splash' ) {
    $onboard_file = get_template_directory() . '/onboarding.php';
    if ( file_exists( $onboard_file ) ) return $onboard_file;
  }

  // Explicit URL alias to template map for 100% URL parity
  $alias_map = [
    'about'                   => 'about-us.php',
    'about-us'                => 'about-us.php',
    'service'                 => 'services.php',
    'services'                => 'services.php',
    'resource'                => 'resources.php',
    'resources'               => 'resources.php',
    'article'                 => 'resources.php',
    'articles'                => 'resources.php',
    'assessment'              => 'assessments.php',
    'assessments'             => 'assessments.php',
    'equip'                   => 'equip-programs.php',
    'equip-programs'          => 'equip-programs.php',
    'program'                 => 'equip-programs.php',
    'programs'                => 'equip-programs.php',
    'calculator'              => 'burnout-cost-calculator.php',
    'calc'                    => 'burnout-cost-calculator.php',
    'burnout-cost-calculator' => 'burnout-cost-calculator.php',
    'burnout-calculator'      => 'burnout-cost-calculator.php',
    'contact'                 => 'contact-us.php',
    'contact-us'              => 'contact-us.php',
    'faq'                     => 'faq.php',
    'faqs'                    => 'faq.php',
    'consult'                 => 'consultation.php',
    'consultation'            => 'consultation.php',
    'org'                     => 'org.php',
    'organisation'            => 'org.php',
    'privacy'                 => 'privacy-policy.php',
    'privacy-policy'          => 'privacy-policy.php',
    'terms'                   => 'terms-of-use.php',
    'terms-of-use'            => 'terms-of-use.php',
    'cancellation'            => 'cancellation-policy.php',
    'cancellation-policy'     => 'cancellation-policy.php',
    'return-policy'           => 'return-policy.php',
    'returns'                 => 'return-policy.php',
    'workplace-privacy'       => 'workplace-privacy.php',
    'partner'                 => 'professional-application.php',
    'join/partner'            => 'professional-application.php',
    'join/professional'       => 'professional-application.php',
    'professional-application'=> 'professional-application.php',
  ];

  if ( isset( $alias_map[ $req_path ] ) ) {
    $mapped_file = get_template_directory() . '/' . $alias_map[ $req_path ];
    if ( file_exists( $mapped_file ) ) {
      return $mapped_file;
    }
  }

  if ( is_front_page() ) {
    $front = get_template_directory() . '/front-page.php';
    if ( file_exists( $front ) ) {
      return $front;
    }
  }

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

  if ( is_page() ) {
    $post_slug = get_post_field( 'post_name', get_post() );
    if ( isset( $alias_map[ $post_slug ] ) ) {
      $mapped_file = get_template_directory() . '/' . $alias_map[ $post_slug ];
      if ( file_exists( $mapped_file ) ) {
        return $mapped_file;
      }
    }
    $page_file = get_template_directory() . '/' . $post_slug . '.php';
    if ( $post_slug && file_exists( $page_file ) ) {
      return $page_file;
    }
  }

  // Fallback for direct path match to template file (e.g. /assessments, /services, /equip-programs)
  if ( $req_path && ! str_contains( $req_path, '/' ) ) {
    $direct_file = get_template_directory() . '/' . $req_path . '.php';
    if ( file_exists( $direct_file ) ) {
      return $direct_file;
    }
  }

  return $template;
}, 99 );

/**
 * Resolves authentic cover image URL for a resource post.
 * Checks post thumbnail, poster metadata, title-matched cover in assets/resources/covers,
 * and audio/video posters in assets/resources.
 */
function ikan_get_resource_cover_url( $post_id ) {
  if ( has_post_thumbnail( $post_id ) ) {
    $thumb = get_the_post_thumbnail_url( $post_id, 'large' );
    if ( $thumb ) return $thumb;
  }

  $poster = get_post_meta( $post_id, 'poster', true );
  if ( $poster ) {
    $theme_poster = 'assets/' . ltrim( $poster, '/' );
    if ( file_exists( get_template_directory() . '/' . $theme_poster ) ) {
      return get_theme_file_uri( $theme_poster );
    }
  }

  $title = get_the_title( $post_id );
  $words = preg_split( '/[^a-zA-Z0-9]+/', strtolower( $title ), -1, PREG_SPLIT_NO_EMPTY );
  $covers_dir = get_template_directory() . '/assets/resources/covers';
  if ( is_dir( $covers_dir ) ) {
    $best_match = null;
    $best_score = 0;
    foreach ( scandir( $covers_dir ) as $f ) {
      if ( $f === '.' || $f === '..' ) continue;
      $f_words = preg_split( '/[^a-zA-Z0-9]+/', strtolower( $f ), -1, PREG_SPLIT_NO_EMPTY );
      $intersect = array_intersect( $words, $f_words );
      $score = count( $intersect );
      if ( $score > $best_score && $score >= 2 ) {
        $best_score = $score;
        $best_match = $f;
      }
    }
    if ( $best_match ) {
      return get_theme_file_uri( 'assets/resources/covers/' . $best_match );
    }
  }

  return get_theme_file_uri( 'assets/img/photo-1758272422634-e8ed8e252a14' );
}

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

    if ( ! empty( $data['phone'] ) )       $contact_data['phone']       = sanitize_text_field( $data['phone'] );
    if ( ! empty( $data['city'] ) )        $contact_data['city']        = sanitize_text_field( $data['city'] );
    if ( ! empty( $data['postal_code'] ) ) $contact_data['postal_code'] = sanitize_text_field( $data['postal_code'] );

    if ( $list_id ) $contact_data['lists'] = [ $list_id ];
    if ( $tag_id )  $contact_data['tags'] = [ $tag_id ];

    $contact = $contactApi->createOrUpdate( $contact_data );
    $sub_id = is_object( $contact ) ? $contact->id : ( $contact['id'] ?? null );

    if ( $sub_id && ! empty( $data['meta'] ) && is_array( $data['meta'] ) ) {
      global $wpdb;
      $meta_table = $wpdb->prefix . 'fc_subscriber_meta';
      foreach ( $data['meta'] as $mk => $mv ) {
        $meta_key = sanitize_key( $mk );
        $meta_val = is_array( $mv ) ? json_encode( $mv ) : (string) $mv;
        $existing = $wpdb->get_var( $wpdb->prepare( "SELECT id FROM {$meta_table} WHERE subscriber_id = %d AND `key` = %s LIMIT 1", $sub_id, $meta_key ) );
        if ( $existing ) {
          $wpdb->update( $meta_table, [ 'value' => $meta_val, 'updated_at' => current_time( 'mysql' ) ], [ 'id' => $existing ] );
        } else {
          $wpdb->insert( $meta_table, [
            'subscriber_id' => $sub_id,
            'key'           => $meta_key,
            'value'         => $meta_val,
            'object_type'   => 'option',
            'created_at'    => current_time( 'mysql' ),
            'updated_at'    => current_time( 'mysql' ),
          ] );
        }
      }
    }

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

  // 1. Insert into Fluent Forms Submissions (Form ID 1)
  $parts = explode( ' ', $name, 2 );
  $ff_payload = [
    'names' => [
      'first_name' => $parts[0] ?? $name,
      'last_name'  => $parts[1] ?? '',
    ],
    'email'   => $email,
    'subject' => $subject,
    'message' => $message,
  ];
  if ( function_exists( 'wpFluent' ) ) {
    try {
      wpFluent()->table( 'fluentform_submissions' )->insert([
        'form_id'    => 1,
        'response'   => json_encode( $ff_payload ),
        'source_url' => home_url( '/contact-us/' ),
        'status'     => 'unread',
        'created_at' => current_time( 'mysql' ),
        'updated_at' => current_time( 'mysql' ),
      ]);
    } catch ( Throwable $e ) {}
  }

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

  // Insert into Fluent Forms Submissions (Form ID 1 - Contact Form / Org demo)
  $parts = explode( ' ', $name, 2 );
  $ff_payload = [
    'names' => [
      'first_name' => $parts[0] ?? $name,
      'last_name'  => $parts[1] ?? '',
    ],
    'email'   => $email,
    'subject' => 'Org Demo Request: ' . $company . ' (' . $team_size . ' members)',
    'message' => $message ?: 'Requested pilot/demo for ' . $company,
  ];
  if ( function_exists( 'wpFluent' ) ) {
    try {
      wpFluent()->table( 'fluentform_submissions' )->insert([
        'form_id'    => 1,
        'response'   => json_encode( $ff_payload ),
        'source_url' => home_url( '/org/' ),
        'status'     => 'unread',
        'created_at' => current_time( 'mysql' ),
        'updated_at' => current_time( 'mysql' ),
      ]);
    } catch ( Throwable $e ) {}
  }

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

  // Insert into Fluent Forms Submissions (Form ID 2 - Subscription Form)
  if ( function_exists( 'wpFluent' ) ) {
    try {
      wpFluent()->table( 'fluentform_submissions' )->insert([
        'form_id'    => 2,
        'response'   => json_encode( [ 'email' => $email ] ),
        'source_url' => home_url( '/' ),
        'status'     => 'unread',
        'created_at' => current_time( 'mysql' ),
        'updated_at' => current_time( 'mysql' ),
      ]);
    } catch ( Throwable $e ) {}
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

// ── Burnout Cost Calculator Lead Submission Handler ─────────────────
function ikan_handle_ajax_burnout_lead() {
  $name = sanitize_text_field( $_POST['name'] ?? '' );
  $email = sanitize_email( $_POST['email'] ?? '' );
  $company = sanitize_text_field( $_POST['company'] ?? '' );
  $role = sanitize_text_field( $_POST['role'] ?? '' );
  $note = sanitize_textarea_field( $_POST['note'] ?? '' );
  $cost = sanitize_text_field( $_POST['calculated_cost'] ?? '' );
  $sector = sanitize_text_field( $_POST['sector'] ?? '' );
  $team_size = intval( $_POST['team_size'] ?? 0 );

  if ( empty( $email ) || ! is_email( $email ) ) {
    wp_send_json_error( [ 'message' => 'Please enter a valid work email.' ] );
    return;
  }

  $payload = [
    'full_name'       => $name,
    'email'           => $email,
    'company_name'    => $company,
    'role'            => $role,
    'note'            => $note,
    'team_size'       => $team_size,
    'sector'          => $sector,
    'calculated_cost' => $cost,
  ];

  if ( function_exists( 'wpFluent' ) ) {
    try {
      wpFluent()->table( 'fluentform_submissions' )->insert([
        'form_id'    => 3,
        'response'   => json_encode( $payload ),
        'source_url' => home_url( '/burnout-cost-calculator/' ),
        'status'     => 'unread',
        'created_at' => current_time( 'mysql' ),
        'updated_at' => current_time( 'mysql' ),
      ]);
    } catch ( Throwable $e ) {}
  }

  ikan_record_lead_in_fluentcrm( [
    'email'      => $email,
    'name'       => $name,
    'list_slug'  => 'burnout-leads',
    'list_title' => 'Burnout Calculator Leads',
    'tag_slug'   => 'burnout-calculator',
    'tag_title'  => 'Burnout Calculator',
    'note_title' => 'Burnout Estimate: ' . ( $cost ?: 'Calculated' ),
    'note_desc'  => sprintf( "Company: %s\nRole: %s\nTeam Size: %d\nSector: %s\nNote: %s", $company, $role, $team_size, $sector, $note ),
  ] );

  wp_send_json_success( [
    'message' => 'Thanks' . ( $name ? ', ' . esc_html( explode( ' ', $name )[0] ) : '' ) . '. Your request is with us. We reply within 24 hours to ' . esc_html( $email ) . '.',
  ] );
}
add_action( 'wp_ajax_ikan_submit_burnout_lead', 'ikan_handle_ajax_burnout_lead' );
add_action( 'wp_ajax_nopriv_ikan_submit_burnout_lead', 'ikan_handle_ajax_burnout_lead' );

// ── Partner Onboarding Application Submission Handler ──────────────
function ikan_handle_ajax_partner_application() {
  $name = sanitize_text_field( $_POST['full_name'] ?? '' );
  $email = sanitize_email( $_POST['email'] ?? '' );
  $phone = sanitize_text_field( $_POST['phone'] ?? '' );
  $title = sanitize_text_field( $_POST['professional_title'] ?? '' );
  $city = sanitize_text_field( $_POST['city'] ?? '' );
  $license = sanitize_text_field( $_POST['license_number'] ?? '' );
  $expertise = sanitize_textarea_field( $_POST['expertise'] ?? '' );

  if ( empty( $email ) || ! is_email( $email ) ) {
    wp_send_json_error( [ 'message' => 'Please enter a valid email address.' ] );
    return;
  }

  $payload = [
    'full_name'             => $name,
    'email'                 => $email,
    'phone'                 => $phone,
    'professional_title'    => $title,
    'city'                  => $city,
    'license_registration'  => $license,
    'specialisations'       => $expertise,
  ];

  if ( function_exists( 'wpFluent' ) ) {
    try {
      wpFluent()->table( 'fluentform_submissions' )->insert([
        'form_id'    => 4,
        'response'   => json_encode( $payload ),
        'source_url' => home_url( '/join/partner/' ),
        'status'     => 'unread',
        'created_at' => current_time( 'mysql' ),
        'updated_at' => current_time( 'mysql' ),
      ]);
    } catch ( Throwable $e ) {}
  }

  ikan_record_lead_in_fluentcrm( [
    'email'      => $email,
    'name'       => $name,
    'list_slug'  => 'partner-applicants',
    'list_title' => 'Partner & Therapist Applicants',
    'tag_slug'   => 'therapist-partner',
    'tag_title'  => 'Therapist Partner',
    'note_title' => 'Partner Application: ' . ( $title ?: 'Therapist' ),
    'note_desc'  => sprintf( "Phone: %s\nTitle: %s\nCity: %s\nLicense: %s\nExpertise: %s", $phone, $title, $city, $license, $expertise ),
  ] );

  wp_send_json_success( [
    'message' => 'Thank you for applying to partner with iKAN. Our clinical team will verify your details and reply within 3–5 business days.',
  ] );
}
add_action( 'wp_ajax_ikan_submit_partner_application', 'ikan_handle_ajax_partner_application' );
add_action( 'wp_ajax_nopriv_ikan_submit_partner_application', 'ikan_handle_ajax_partner_application' );

// ── User Registration & Onboarding Submission Handler ───────────────
function ikan_handle_ajax_user_register() {
  $name = trim( sanitize_text_field( $_POST['full_name'] ?? '' ) );
  $email = trim( sanitize_email( $_POST['email'] ?? '' ) );
  $password = $_POST['password'] ?? '';
  $phone = trim( sanitize_text_field( $_POST['phone'] ?? '' ) );
  $focus_areas = isset( $_POST['focus_areas'] ) ? (array) $_POST['focus_areas'] : [];
  $focus_areas = array_map( 'sanitize_text_field', $focus_areas );

  if ( empty( $name ) ) {
    wp_send_json_error( [ 'message' => 'Please enter your full name.' ] );
    return;
  }
  if ( empty( $email ) || ! is_email( $email ) ) {
    wp_send_json_error( [ 'message' => 'Please enter a valid email address.' ] );
    return;
  }
  if ( empty( $password ) || strlen( $password ) < 8 ) {
    wp_send_json_error( [ 'message' => 'Password must be at least 8 characters long.' ] );
    return;
  }

  if ( email_exists( $email ) || username_exists( $email ) ) {
    wp_send_json_error( [ 'message' => 'An account with this email already exists. Please sign in.' ] );
    return;
  }

  // 1. Create WordPress User
  $username = sanitize_user( current( explode( '@', $email ) ) );
  if ( username_exists( $username ) ) {
    $username .= '_' . wp_rand( 100, 999 );
  }

  $user_id = wp_create_user( $username, $password, $email );
  if ( is_wp_error( $user_id ) ) {
    wp_send_json_error( [ 'message' => $user_id->get_error_message() ] );
    return;
  }

  // Update display name and metadata
  $parts = explode( ' ', $name, 2 );
  wp_update_user([
    'ID'           => $user_id,
    'display_name' => $name,
    'first_name'   => $parts[0] ?? $name,
    'last_name'    => $parts[1] ?? '',
  ]);
  if ( ! empty( $phone ) ) update_user_meta( $user_id, 'phone', $phone );
  if ( ! empty( $focus_areas ) ) update_user_meta( $user_id, 'focus_areas', $focus_areas );

  // 2. Insert into Fluent Forms Submissions (Form ID 5)
  $payload = [
    'full_name'   => $name,
    'email'       => $email,
    'phone'       => $phone,
    'focus_areas' => implode( ', ', $focus_areas ),
  ];

  if ( function_exists( 'wpFluent' ) ) {
    try {
      wpFluent()->table( 'fluentform_submissions' )->insert([
        'form_id'    => 5,
        'response'   => json_encode( $payload ),
        'source_url' => home_url( '/signup/' ),
        'status'     => 'unread',
        'created_at' => current_time( 'mysql' ),
        'updated_at' => current_time( 'mysql' ),
      ]);
    } catch ( Throwable $e ) {}
  }

  // 3. Insert / Update into FluentCRM
  ikan_record_lead_in_fluentcrm( [
    'email'      => $email,
    'name'       => $name,
    'list_slug'  => 'members',
    'list_title' => 'iKAN Members',
    'tag_slug'   => 'onboarding',
    'tag_title'  => 'Onboarding Completed',
    'note_title' => 'New User Onboarding Registered',
    'note_desc'  => sprintf( "Phone: %s\nFocus Areas: %s", $phone, implode( ', ', $focus_areas ) ),
  ] );

  // 4. Log in the new user automatically
  wp_set_current_user( $user_id );
  wp_set_auth_cookie( $user_id, true );

  wp_send_json_success([
    'message'  => 'Account created successfully! Welcome to iKAN.',
    'redirect' => home_url( '/assessments/' ),
    'user_id'  => $user_id,
  ]);
}
add_action( 'wp_ajax_ikan_user_register', 'ikan_handle_ajax_user_register' );
add_action( 'wp_ajax_nopriv_ikan_user_register', 'ikan_handle_ajax_user_register' );

// ── User Login Submission Handler ──────────────────────────────────
function ikan_handle_ajax_user_login() {
  $email = trim( sanitize_email( $_POST['email'] ?? '' ) );
  $password = $_POST['password'] ?? '';
  $remember = ! empty( $_POST['remember'] );

  if ( empty( $email ) || ! is_email( $email ) ) {
    wp_send_json_error( [ 'message' => 'Please enter a valid email address.' ] );
    return;
  }
  if ( empty( $password ) ) {
    wp_send_json_error( [ 'message' => 'Please enter your password.' ] );
    return;
  }

  $user = get_user_by( 'email', $email );
  if ( ! $user ) {
    wp_send_json_error( [ 'message' => 'No account found with this email address.' ] );
    return;
  }

  $creds = [
    'user_login'    => $user->user_login,
    'user_password' => $password,
    'remember'      => $remember,
  ];

  $signon = wp_signon( $creds, is_ssl() );

  if ( is_wp_error( $signon ) ) {
    wp_send_json_error( [ 'message' => 'Incorrect password. Please try again or reset your password.' ] );
    return;
  }

  wp_send_json_success([
    'message'  => 'Welcome back, ' . esc_html( $signon->first_name ?: $signon->display_name ) . '!',
    'redirect' => home_url( '/assessments/' ),
  ]);
}
add_action( 'wp_ajax_ikan_user_login', 'ikan_handle_ajax_user_login' );
add_action( 'wp_ajax_nopriv_ikan_user_login', 'ikan_handle_ajax_user_login' );

// ── CORS & App API Bridge for ikan2 (https://app.ikanhealth.in) ─────────────

/**
 * Microsoft Clarity analytics integration (if configured in wp_options)
 */
add_action( 'wp_head', function() {
  $clarity_id = get_option( 'ikan_clarity_id' );
  if ( ! empty( $clarity_id ) ) {
    ?>
    <!-- Microsoft Clarity snippet -->
    <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "<?php echo esc_js( $clarity_id ); ?>");
    </script>
    <?php
  }
}, 3 );

/**
 * Centralized Webmaster & Search Engine Verifications (Google, Bing)
 */
add_action( 'wp_head', function() {
  $gsc = get_option( 'ikan_google_verification' );
  if ( ! empty( $gsc ) ) {
    echo '<meta name="google-site-verification" content="' . esc_attr( $gsc ) . "\" />\n";
  }
  $bing = get_option( 'ikan_bing_verification' );
  if ( ! empty( $bing ) ) {
    echo '<meta name="msvalidate.01" content="' . esc_attr( $bing ) . "\" />\n";
  }
}, 1 );

/**
 * Configure Google Site Kit GA4 tag options:
 * - Enables cross-domain linker between ikanhealth.in and app.ikanhealth.in
 * - Prevents duplicate gtag snippets by letting Site Kit own the single tag
 */
add_filter( 'googlesitekit_gtag_opt', function( $gtag_opt ) {
  $gtag_opt['linker'] = [
    'domains' => [ 'ikanhealth.in', 'app.ikanhealth.in' ],
  ];
  return $gtag_opt;
} );

add_action( 'init', function() {
  // Professional Admin URL alias: /portal -> WordPress Admin / Login
  add_rewrite_rule( '^portal/?$', 'index.php?ikan_portal=1', 'top' );
  // Unified naming across repos: /program -> Equip Programs overview
  add_rewrite_rule( '^program/?$', 'index.php?ikan_program_page=1', 'top' );

  $allowed_origins = [
    'https://app.ikanhealth.in',
    'https://ikanhealth.in',
    'http://localhost:5173',
    'http://localhost:3000',
    'capacitor://localhost',
  ];
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ( in_array( $origin, $allowed_origins, true ) ) {
    header( "Access-Control-Allow-Origin: $origin" );
    header( 'Access-Control-Allow-Credentials: true' );
    header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE' );
    header( 'Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type, X-Requested-With' );
    if ( 'OPTIONS' === ( $_SERVER['REQUEST_METHOD'] ?? '' ) ) {
      status_header( 200 );
      exit;
    }
  }
} );

add_filter( 'query_vars', function( $vars ) {
  $vars[] = 'ikan_portal';
  $vars[] = 'ikan_program_page';
  return $vars;
} );

add_action( 'template_redirect', function() {
  if ( get_query_var( 'ikan_program_page' ) ) {
    locate_template( 'equip-programs.php', true );
    exit;
  }
  if ( get_query_var( 'ikan_portal' ) ) {
    if ( is_user_logged_in() && current_user_can( 'read' ) ) {
      wp_safe_redirect( admin_url() );
    } else {
      wp_safe_redirect( wp_login_url( admin_url() ) );
    }
    exit;
  }
} );

// ── Rank Math & Search Engine Sitemaps Bridge for ikan2 ─────────────────────

/**
 * Hook into Rank Math's sitemap index to add ikan2 app sitemap
 */
add_filter( 'rank_math/sitemap/index', function( $xml ) {
  $app_sitemap = "\n\t<sitemap>\n\t\t<loc>https://app.ikanhealth.in/sitemap.xml</loc>\n\t\t<lastmod>" . date( 'c' ) . "</lastmod>\n\t</sitemap>";
  if ( strpos( $xml, '</sitemapindex>' ) !== false ) {
    return str_replace( '</sitemapindex>', $app_sitemap . "\n</sitemapindex>", $xml );
  }
  return $xml;
} );

/**
 * Clean Crawler & Robots Rules:
 * Disallow wp-admin, wp-login.php, and portal from search indexation.
 */
add_filter( 'robots_txt', function( $output, $public ) {
  if ( '1' == $public ) {
    $output = "User-agent: *\n";
    $output .= "Disallow: /wp-admin/\n";
    $output .= "Disallow: /wp-login.php\n";
    $output .= "Disallow: /portal\n";
    $output .= "Allow: /wp-admin/admin-ajax.php\n\n";
    $output .= "Sitemap: " . esc_url( home_url( '/sitemap_index.xml' ) ) . "\n";
    $output .= "# iKAN Health Member App Sitemap\n";
    $output .= "Sitemap: https://app.ikanhealth.in/sitemap.xml\n";
  }
  return $output;
}, 99, 2 );

/**
 * Never index WordPress Login or Admin endpoints
 */
add_action( 'login_head', function() {
  echo "<meta name=\"robots\" content=\"noindex, nofollow, noarchive\" />\n";
} );

// ── WordPress Admin & Login Branding (Logo Only) ───────────────────────────

add_action( 'login_enqueue_scripts', function() {
  $logo_url = get_theme_file_uri( 'assets/img/favicon.svg' );
  ?>
  <style type="text/css">
    #login h1 a, .login h1 a {
      background-image: url('<?php echo esc_url( $logo_url ); ?>') !important;
      background-size: contain !important;
      background-position: center !important;
      background-repeat: no-repeat !important;
      width: 64px !important;
      height: 64px !important;
      margin: 0 auto 16px auto !important;
    }
  </style>
  <?php
} );

add_filter( 'login_headerurl', function() {
  return home_url( '/' );
} );

add_filter( 'login_headertext', function() {
  return 'iKAN Health';
} );

// ── iKAN REST API for ikan2 App & SEO Integration ──────────────────────────

add_action( 'rest_api_init', function() {
  // 1. App Configuration & SEO Settings
  register_rest_route( 'ikan/v1', '/app-config', [
    'methods'             => 'GET',
    'callback'            => function() {
      return rest_ensure_response([
        'brand'     => [
          'name'        => 'iKAN Health',
          'description' => 'Clinical Wellbeing & Burnout Prevention Architecture',
          'web_origin'  => 'https://ikanhealth.in',
          'app_origin'  => 'https://app.ikanhealth.in',
        ],
        'analytics' => [
          'google_tag_id'        => 'GT-MJJ5RG2N',
          'ga4_measurement_id'   => 'G-ZD4D5LZBQG',
          'cross_domain_domains' => [ 'ikanhealth.in', 'app.ikanhealth.in' ],
          'use_snippet'          => true,
        ],
        'seo'       => [
          'title_separator' => '-',
          'default_title'   => 'iKAN Health | Clinically Validated Wellbeing & Burnout Prevention',
          'sitemaps'        => [
            'portal' => 'https://ikanhealth.in/sitemap_index.xml',
            'app'    => 'https://app.ikanhealth.in/sitemap.xml',
          ],
        ],
        'theme'     => [
          'typography' => [
            'display'  => 'Sora',
            'headings' => 'Sora',
            'body'     => 'Manrope',
          ],
          'colors'     => [
            'primary'    => '#1B4D3E',
            'secondary'  => '#2A2A2A',
            'background' => '#F8FAF9',
            'surface'    => '#FFFFFF',
            'border'     => '#E5E7EB',
          ],
          'tokens'     => [
            'content_max' => '1100px',
            'radius_card' => '12px',
            'radius_pill' => '9999px',
          ],
        ],
      ]);
    },
    'permission_callback' => '__return_true',
  ] );

  // 2. Assessments Catalog API
  register_rest_route( 'ikan/v1', '/assessments', [
    'methods'             => 'GET',
    'callback'            => function() {
      $file = get_template_directory() . '/assets/data/assessments.json';
      if ( file_exists( $file ) ) {
        $json = json_decode( file_get_contents( $file ), true );
        return rest_ensure_response( $json ?: [] );
      }
      return rest_ensure_response( [] );
    },
    'permission_callback' => '__return_true',
  ] );

  // 3. Equip Programs Catalog API
  register_rest_route( 'ikan/v1', '/equip-programs', [
    'methods'             => 'GET',
    'callback'            => function() {
      $file = get_template_directory() . '/assets/data/equip-programs.json';
      if ( file_exists( $file ) ) {
        $json = json_decode( file_get_contents( $file ), true );
        return rest_ensure_response( $json ?: [] );
      }
      return rest_ensure_response( [] );
    },
    'permission_callback' => '__return_true',
  ] );

  // 4. Consultants Directory API
  register_rest_route( 'ikan/v1', '/consultants', [
    'methods'             => 'GET',
    'callback'            => function() {
      $file = get_template_directory() . '/assets/data/consultants.json';
      if ( file_exists( $file ) ) {
        $json = json_decode( file_get_contents( $file ), true );
        return rest_ensure_response( $json ?: [] );
      }
      return rest_ensure_response( [] );
    },
    'permission_callback' => '__return_true',
  ] );

  // 5. Telemetry & Lead Ingestion from ikan2
  register_rest_route( 'ikan/v1', '/telemetry', [
    'methods'             => 'POST',
    'callback'            => function( WP_REST_Request $request ) {
      $data = $request->get_json_params();
      if ( empty( $data ) ) {
        $data = $request->get_params();
      }

      $email = sanitize_email( $data['email'] ?? '' );
      if ( ! is_email( $email ) ) {
        return new WP_Error( 'invalid_email', 'Valid email required', [ 'status' => 400 ] );
      }

      $name = sanitize_text_field( $data['name'] ?? '' );
      $event = sanitize_text_field( $data['event'] ?? 'app_telemetry' );
      $tag = sanitize_text_field( $data['tag'] ?? 'app-user' );
      $metadata = $data['metadata'] ?? [];

      $note_title = sprintf( 'iKAN App Event: %s (%s)', $event, current_time( 'Y-m-d H:i' ) );
      $note_desc  = is_array( $metadata ) ? json_encode( $metadata, JSON_PRETTY_PRINT ) : (string) $metadata;

      $recorded = ikan_record_lead_in_fluentcrm([
        'email'      => $email,
        'name'       => $name,
        'list_slug'  => 'members',
        'list_title' => 'iKAN Members',
        'tag_slug'   => $tag,
        'tag_title'  => ucwords( str_replace( '-', ' ', $tag ) ),
        'note_title' => $note_title,
        'note_desc'  => $note_desc,
      ]);

      return rest_ensure_response([
        'success' => true,
        'message' => 'Event ingested into FluentCRM',
        'email'   => $email,
      ]);
    },
    'permission_callback' => '__return_true',
  ] );

  // 6. Dynamic Headless Page Content API for ikan2 (About, FAQ, Contact, etc.)
  register_rest_route( 'ikan/v1', '/page/(?P<slug>[a-zA-Z0-9-]+)', [
    'methods'             => 'GET',
    'callback'            => function( WP_REST_Request $request ) {
      $slug = sanitize_title( $request->get_param( 'slug' ) );
      $meta_key_map = [
        'about'      => [ 'page-about-us', 'page-about' ],
        'about-us'   => [ 'page-about-us', 'page-about' ],
        'contact'    => [ 'page-contact', 'page-contact-us' ],
        'contact-us' => [ 'page-contact', 'page-contact-us' ],
        'faq'        => [ 'page-faq' ],
      ];

      // 1. Try to find content from WordPress post meta
      $page = get_page_by_path( $slug );
      if ( ! $page && isset( $meta_key_map[ $slug ] ) ) {
        // Try fallback slug (e.g. about -> about-us)
        $alt_slug = ( $slug === 'about' ) ? 'about-us' : ( ( $slug === 'about-us' ) ? 'about' : $slug );
        $page = get_page_by_path( $alt_slug );
      }

      if ( $page ) {
        $keys = $meta_key_map[ $slug ] ?? [ 'page-' . $slug ];
        foreach ( $keys as $k ) {
          $raw = get_post_meta( $page->ID, $k, true );
          if ( ! empty( $raw ) ) {
            $parsed = is_string( $raw ) ? json_decode( $raw, true ) : $raw;
            if ( ! empty( $parsed ) ) {
              return rest_ensure_response( [
                'source' => 'wordpress_meta',
                'page_id' => $page->ID,
                'slug'   => $slug,
                'data'   => $parsed,
              ] );
            }
          }
        }
      }

      // 2. Fallback to bundled assets/pages.json
      $file = get_template_directory() . '/assets/pages.json';
      if ( file_exists( $file ) ) {
        $all_pages = json_decode( file_get_contents( $file ), true );
        $json_key = ( $slug === 'about-us' ) ? 'about' : ( ( $slug === 'contact-us' ) ? 'contact' : $slug );
        if ( isset( $all_pages[ $json_key ] ) ) {
          return rest_ensure_response( [
            'source' => 'bundled_json',
            'slug'   => $slug,
            'data'   => $all_pages[ $json_key ],
          ] );
        }
      }

      return new WP_Error( 'not_found', 'Page content not found', [ 'status' => 404 ] );
    },
    'permission_callback' => '__return_true',
  ] );

  // 7. Full Resources / Blog Articles Catalog API for ikan2
  register_rest_route( 'ikan/v1', '/resources', [
    'methods'             => 'GET',
    'callback'            => function( WP_REST_Request $request ) {
      $category_filter = sanitize_text_field( $request->get_param( 'category' ) );
      
      // 1. First try loading from published WordPress posts
      $args = [
        'post_type'      => 'post',
        'post_status'    => 'publish',
        'posts_per_page' => 100,
        'orderby'        => 'date',
        'order'          => 'DESC',
      ];
      if ( ! empty( $category_filter ) ) {
        $args['category_name'] = $category_filter;
      }
      $query = new WP_Query( $args );

      if ( $query->have_posts() ) {
        $items = [];
        while ( $query->have_posts() ) {
          $query->the_post();
          $post_id = get_the_ID();
          $cats = get_the_category();
          $cat_name = ! empty( $cats ) ? $cats[0]->name : 'General';
          $thumb_id = get_post_thumbnail_id( $post_id );
          $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'full' ) : '';

          $items[] = [
            'id'          => 'resource-' . $post_id,
            'slug'        => get_post_field( 'post_name', $post_id ),
            'title'       => get_the_title(),
            'category'    => $cat_name,
            'date'        => get_the_date( 'Y-m-d' ),
            'minutes'     => intval( get_post_meta( $post_id, '_resource_minutes', true ) ?: 4 ),
            'medium'      => get_post_meta( $post_id, '_resource_medium', true ) ?: 'article',
            'src'         => get_post_meta( $post_id, '_resource_src', true ) ?: '',
            'poster'      => get_post_meta( $post_id, '_resource_poster', true ) ?: $thumb_url,
            'cover_url'   => $thumb_url,
            'featured'    => get_post_meta( $post_id, '_resource_featured', true ) === '1',
            'author'      => get_post_meta( $post_id, '_resource_author', true ) ?: get_the_author(),
            'description' => get_the_excerpt(),
          ];
        }
        wp_reset_postdata();
        return rest_ensure_response( [
          'source' => 'wordpress_posts',
          'count'  => count( $items ),
          'data'   => $items,
        ] );
      }

      // 2. Fallback to bundled assets/resources.json
      $file = get_template_directory() . '/assets/resources.json';
      if ( file_exists( $file ) ) {
        $resources = json_decode( file_get_contents( $file ), true );
        if ( is_array( $resources ) ) {
          if ( ! empty( $category_filter ) ) {
            $resources = array_values( array_filter( $resources, function( $r ) use ( $category_filter ) {
              return strcasecmp( $r['category'] ?? '', $category_filter ) === 0;
            } ) );
          }
          return rest_ensure_response( [
            'source' => 'bundled_json',
            'count'  => count( $resources ),
            'data'   => $resources,
          ] );
        }
      }

      return rest_ensure_response( [ 'source' => 'empty', 'count' => 0, 'data' => [] ] );
    },
    'permission_callback' => '__return_true',
  ] );

  // 8. Single Resource / Article Detail API for ikan2
  register_rest_route( 'ikan/v1', '/resources/(?P<slug>[a-zA-Z0-9-]+)', [
    'methods'             => 'GET',
    'callback'            => function( WP_REST_Request $request ) {
      $slug = sanitize_title( $request->get_param( 'slug' ) );

      // 1. Try finding published WordPress post
      $post = get_page_by_path( $slug, OBJECT, 'post' );
      if ( $post && $post->post_status === 'publish' ) {
        $post_id = $post->ID;
        $cats = get_the_category( $post_id );
        $cat_name = ! empty( $cats ) ? $cats[0]->name : 'General';
        $thumb_id = get_post_thumbnail_id( $post_id );
        $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'full' ) : '';

        return rest_ensure_response( [
          'source'      => 'wordpress_post',
          'id'          => 'resource-' . $post_id,
          'slug'        => $post->post_name,
          'title'       => $post->post_title,
          'category'    => $cat_name,
          'date'        => get_the_date( 'Y-m-d', $post ),
          'minutes'     => intval( get_post_meta( $post_id, '_resource_minutes', true ) ?: 4 ),
          'medium'      => get_post_meta( $post_id, '_resource_medium', true ) ?: 'article',
          'src'         => get_post_meta( $post_id, '_resource_src', true ) ?: '',
          'poster'      => get_post_meta( $post_id, '_resource_poster', true ) ?: $thumb_url,
          'cover_url'   => $thumb_url,
          'featured'    => get_post_meta( $post_id, '_resource_featured', true ) === '1',
          'author'      => get_post_meta( $post_id, '_resource_author', true ) ?: get_the_author_meta( 'display_name', $post->post_author ),
          'description' => $post->post_excerpt ?: wp_trim_words( $post->post_content, 30 ),
          'html'        => apply_filters( 'the_content', $post->post_content ),
        ] );
      }

      // 2. Fallback to bundled assets/resources.json
      $file = get_template_directory() . '/assets/resources.json';
      if ( file_exists( $file ) ) {
        $resources = json_decode( file_get_contents( $file ), true );
        if ( is_array( $resources ) ) {
          foreach ( $resources as $r ) {
            if ( ( $r['slug'] ?? '' ) === $slug || ( $r['id'] ?? '' ) === $slug || ( $r['id'] ?? '' ) === 'resource-' . $slug ) {
              return rest_ensure_response( [
                'source' => 'bundled_json',
                'data'   => $r,
              ] );
            }
          }
        }
      }

      return new WP_Error( 'not_found', 'Resource article not found', [ 'status' => 404 ] );
    },
    'permission_callback' => '__return_true',
  ] );

  // 9. Assessment & Equip Educational Writeups API
  register_rest_route( 'ikan/v1', '/writeups', [
    'methods'             => 'GET',
    'callback'            => function() {
      $file = get_template_directory() . '/assets/data/writeups.json';
      if ( file_exists( $file ) ) {
        $json = json_decode( file_get_contents( $file ), true );
        return rest_ensure_response( $json ?: [] );
      }
      return rest_ensure_response( [] );
    },
    'permission_callback' => '__return_true',
  ] );
} );


