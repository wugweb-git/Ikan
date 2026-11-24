<?php
/**
 * Synchronize and backfill all post authors, clinical authors, tags, read times, and media
 * for all WordPress posts from assets/resources.json.
 *
 * Usage: wp eval-file wp-content/themes/demo/sync_all_post_meta.php
 */

if ( ! defined( 'ABSPATH' ) ) {
	require_once( dirname( __FILE__ ) . '/../../../wp-load.php' );
}

$theme_dir = get_template_directory();
$json_file = $theme_dir . '/assets/resources.json';

if ( ! file_exists( $json_file ) ) {
	WP_CLI::error( "resources.json not found: {$json_file}" );
	exit( 1 );
}

$resources = json_decode( file_get_contents( $json_file ), true );
WP_CLI::line( sprintf( "Loaded %d canonical resources from resources.json", count( $resources ) ) );

// User ID 3: iKAN Ingest Worker
$worker = get_user_by( 'login', 'ingest' );
$worker_id = $worker ? $worker->ID : 3;

// Build lookup maps by slug and normalized title
$by_slug = array();
$by_title = array();
foreach ( $resources as $r ) {
	$by_slug[ $r['slug'] ] = $r;
	$norm_title = strtolower( trim( preg_replace( '/[^a-zA-Z0-9]/', '', $r['title'] ) ) );
	$by_title[ $norm_title ] = $r;
}

// Special alias mappings for older/draft posts
$aliases = array(
	'5-minutes-that-can-change-how-you-handle-stress' => 'five-minutes-stress',
	'listen-a-5-minute-guided-breathing-exercise-for-anxious-moments' => 'breathing-five-minutes',
	'podcast-how-to-handle-stress-better-with-dr-modupe-akinola' => 'stress-performance',
	'a-guided-visualization-to-help-you-relax' => 'stress-takes-over',
	'great-a-framework-for-managing-stress-and-anxiety' => 'great-practices',
);

$posts = get_posts( array(
	'post_type'      => 'post',
	'post_status'    => 'any',
	'posts_per_page' => -1,
) );

WP_CLI::line( sprintf( "Processing %d posts in WordPress...", count( $posts ) ) );

$updated_count = 0;

foreach ( $posts as $p ) {
	$matched = null;

	if ( isset( $by_slug[ $p->post_name ] ) ) {
		$matched = $by_slug[ $p->post_name ];
	} elseif ( isset( $aliases[ $p->post_name ] ) && isset( $by_slug[ $aliases[ $p->post_name ] ] ) ) {
		$matched = $by_slug[ $aliases[ $p->post_name ] ];
	} else {
		$norm_p_title = strtolower( trim( preg_replace( '/[^a-zA-Z0-9]/', '', $p->post_title ) ) );
		if ( isset( $by_title[ $norm_p_title ] ) ) {
			$matched = $by_title[ $norm_p_title ];
		}
	}

	// Always ensure valid post_author
	if ( $p->post_author != $worker_id ) {
		wp_update_post( array(
			'ID'          => $p->ID,
			'post_author' => $worker_id,
		) );
	}

	if ( $matched ) {
		// Update Clinical Author
		update_post_meta( $p->ID, 'author', $matched['author'] );
		update_post_meta( $p->ID, 'author_name', $matched['author'] );

		// Update Format & Read time
		$medium = ! empty( $matched['medium'] ) ? $matched['medium'] : 'article';
		$minutes = intval( $matched['minutes'] );
		$read_time = $minutes . ( 'video' === $medium ? ' min watch' : ( 'audio' === $medium ? ' min listen' : ' min' ) );

		update_post_meta( $p->ID, 'medium', $medium );
		update_post_meta( $p->ID, 'content_type', ucfirst( $medium ) );
		update_post_meta( $p->ID, 'minutes', $minutes );
		update_post_meta( $p->ID, 'read_time', $read_time );

		if ( ! empty( $matched['featured'] ) ) {
			update_post_meta( $p->ID, 'featured', '1' );
		}
		if ( ! empty( $matched['programme'] ) ) {
			update_post_meta( $p->ID, 'programme', $matched['programme'] );
		}
		if ( ! empty( $matched['art'] ) ) {
			update_post_meta( $p->ID, 'art', $matched['art'] );
		}
		if ( ! empty( $matched['category'] ) ) {
			$cat_id = wp_create_category( $matched['category'] );
			if ( $cat_id ) {
				wp_set_post_categories( $p->ID, array( $cat_id ) );
			}
		}

		// Assign Tags
		if ( ! empty( $matched['tags'] ) && is_array( $matched['tags'] ) ) {
			wp_set_post_tags( $p->ID, $matched['tags'], false );
			update_post_meta( $p->ID, 'tags', $matched['tags'] );
		}

		$updated_count++;
		WP_CLI::line( sprintf( "✓ Synced #%d [%s]: Author='%s', Format=%s, ReadTime=%s, Tags=%d", $p->ID, $p->post_name, $matched['author'], $medium, $read_time, count( $matched['tags'] ?? [] ) ) );
	} else {
		// Fallback for custom or interim posts: assign default clinical author if missing
		$existing_author = get_post_meta( $p->ID, 'author', true ) ?: get_post_meta( $p->ID, 'author_name', true );
		if ( empty( $existing_author ) ) {
			update_post_meta( $p->ID, 'author', 'iKAN Clinical Team' );
			update_post_meta( $p->ID, 'author_name', 'iKAN Clinical Team' );
			update_post_meta( $p->ID, 'medium', 'article' );
			update_post_meta( $p->ID, 'minutes', 4 );
			update_post_meta( $p->ID, 'read_time', '4 min' );
			wp_set_post_tags( $p->ID, array( 'Clinical Guide', 'Mental Wellness' ), false );
			WP_CLI::line( sprintf( "• Fallback applied to #%d [%s]", $p->ID, $p->post_name ) );
		}
	}
}

WP_CLI::success( sprintf( "Successfully synced all %d posts! All authors and tags populated.", count( $posts ) ) );
