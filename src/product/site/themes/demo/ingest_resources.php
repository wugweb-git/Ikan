<?php
/**
 * Ingestion script for all 26 iKAN Health resources into WordPress.
 * Usage: wp eval-file wp-content/themes/demo/ingest_resources.php
 */

if ( ! defined( 'ABSPATH' ) ) {
    require_once( dirname( __FILE__ ) . '/../../../wp-load.php' );
}

require_once( ABSPATH . 'wp-admin/includes/image.php' );
require_once( ABSPATH . 'wp-admin/includes/file.php' );
require_once( ABSPATH . 'wp-admin/includes/media.php' );

$theme_dir = get_template_directory();
$json_file = $theme_dir . '/assets/resources.json';

if ( ! file_exists( $json_file ) ) {
    WP_CLI::error( "Resources JSON not found: {$json_file}" );
    exit( 1 );
}

$resources = json_decode( file_get_contents( $json_file ), true );
if ( empty( $resources ) ) {
    WP_CLI::error( "Empty resources list in JSON." );
    exit( 1 );
}

WP_CLI::line( sprintf( "Found %d resources to ingest.", count( $resources ) ) );

$covers_dir = $theme_dir . '/assets/resources/covers';

foreach ( $resources as $r ) {
    $slug = sanitize_title( $r['slug'] );
    $title = $r['title'];
    $category = $r['category'];
    $date = $r['date'] . ' 10:00:00';
    $minutes = intval( $r['minutes'] );
    $medium = $r['medium']; // video, audio, article
    $src = $r['src'];
    $poster = $r['poster'];
    $author = $r['author'];
    $desc = $r['description'];
    $html = $r['html'];
    $featured = ! empty( $r['featured'] ) ? '1' : '0';

    // Check if post exists by slug
    $existing = get_page_by_path( $slug, OBJECT, 'post' );
    $post_data = [
        'post_title'   => $title,
        'post_name'    => $slug,
        'post_content' => $html,
        'post_excerpt' => $desc,
        'post_status'  => 'publish',
        'post_type'    => 'post',
        'post_date'    => $date,
        'post_author'  => 1,
    ];

    if ( $existing ) {
        $post_data['ID'] = $existing->ID;
        $post_id = wp_update_post( $post_data );
        WP_CLI::line( "Updated post #{$post_id}: {$title}" );
    } else {
        $post_id = wp_insert_post( $post_data );
        WP_CLI::line( "Created post #{$post_id}: {$title}" );
    }

    if ( is_wp_error( $post_id ) ) {
        WP_CLI::warning( "Failed to save post for {$title}: " . $post_id->get_error_message() );
        continue;
    }

    // Assign Category
    if ( ! empty( $category ) ) {
        $cat_id = wp_create_category( $category );
        if ( $cat_id ) {
            wp_set_post_categories( $post_id, [ $cat_id ] );
        }
    }

    // Set Custom Fields / Post Meta
    update_post_meta( $post_id, 'medium', $medium );
    update_post_meta( $post_id, 'minutes', $minutes );
    update_post_meta( $post_id, 'read_time', "{$minutes} min" );
    update_post_meta( $post_id, 'featured', $featured );
    update_post_meta( $post_id, 'author', $author );
    update_post_meta( $post_id, 'poster', $poster );

    if ( ! empty( $r['source'] ) ) {
        update_post_meta( $post_id, 'source', maybe_serialize( $r['source'] ) );
    }
    if ( ! empty( $r['assessment'] ) ) {
        update_post_meta( $post_id, 'assessment', $r['assessment'] );
    }
    if ( ! empty( $r['assessmentRole'] ) ) {
        update_post_meta( $post_id, 'assessment_role', $r['assessmentRole'] );
    }
    if ( ! empty( $r['programme'] ) ) {
        update_post_meta( $post_id, 'programme', $r['programme'] );
    }
    if ( ! empty( $r['journal'] ) ) {
        update_post_meta( $post_id, 'journal', '1' );
    }
    if ( ! empty( $r['consult'] ) ) {
        update_post_meta( $post_id, 'consult', '1' );
    }
    if ( ! empty( $r['art'] ) ) {
        update_post_meta( $post_id, 'art', $r['art'] );
    }

    if ( $medium === 'video' ) {
        update_post_meta( $post_id, 'video_url', $src );
    } elseif ( $medium === 'audio' ) {
        // If relative src, link to theme assets
        if ( str_starts_with( $src, '/resources/' ) ) {
            $audio_file = basename( $src );
            $theme_audio_uri = get_theme_file_uri( "assets/resources/{$audio_file}" );
            update_post_meta( $post_id, 'audio_url', $theme_audio_uri );
        } else {
            update_post_meta( $post_id, 'audio_url', $src );
        }
    }

    // RankMath Meta
    update_post_meta( $post_id, 'rank_math_title', $title . ' | iKAN Health' );
    update_post_meta( $post_id, 'rank_math_description', $desc );

    // Cover Image attachment
    // Match cover file in covers_dir
    $matched_cover = null;
    if ( is_dir( $covers_dir ) ) {
        $files = scandir( $covers_dir );
        foreach ( $files as $f ) {
            if ( $f === '.' || $f === '..' ) continue;
            // check if slug matches filename without extension
            $base = pathinfo( $f, PATHINFO_FILENAME );
            if ( $base === $slug || str_starts_with( $slug, $base ) || str_starts_with( $base, $slug ) ) {
                $matched_cover = $covers_dir . '/' . $f;
                break;
            }
        }
    }

    if ( $matched_cover && file_exists( $matched_cover ) ) {
        // Check if already has thumbnail
        if ( ! has_post_thumbnail( $post_id ) ) {
            $filename = basename( $matched_cover );
            $upload_file = wp_upload_bits( $filename, null, file_get_contents( $matched_cover ) );
            if ( empty( $upload_file['error'] ) ) {
                $wp_filetype = wp_check_filetype( $filename, null );
                $attachment = [
                    'post_mime_type' => $wp_filetype['type'] ?: 'image/webp',
                    'post_title'     => preg_replace( '/\.[^.]+$/', '', $filename ),
                    'post_content'   => '',
                    'post_status'    => 'inherit'
                ];
                $attach_id = wp_insert_attachment( $attachment, $upload_file['file'], $post_id );
                $attach_data = wp_generate_attachment_metadata( $attach_id, $upload_file['file'] );
                wp_update_attachment_metadata( $attach_id, $attach_data );
                set_post_thumbnail( $post_id, $attach_id );
                WP_CLI::line( "  -> Attached featured image: {$filename}" );
            }
        }
    }
}

WP_CLI::success( "Successfully ingested all 26 resources with categories, meta, and media." );
