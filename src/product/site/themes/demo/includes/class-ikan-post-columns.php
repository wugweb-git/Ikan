<?php
/**
 * iKAN Health — Enhanced WordPress Admin Posts Table.
 *
 * Enriches `wp-admin/edit.php` with:
 * 1. Post Author (Vedanshu or Kartik)
 * 2. Medium / Format badges (Article, Video, Audio)
 * 3. Read Time & Duration (e.g. 4 min, 106 min podcast, 6 min watch)
 * 4. Clinical Tags & Topics badges
 * 5. Equip / Assessment links & Featured highlights
 * 6. Admin quick filters for Format
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_Post_Columns {

	/**
	 * Boot hooks.
	 */
	public static function init() {
		add_filter( 'manage_post_posts_columns', array( __CLASS__, 'customize_columns' ) );
		add_action( 'manage_post_posts_custom_column', array( __CLASS__, 'render_column_content' ), 10, 2 );
		add_filter( 'manage_edit-post_sortable_columns', array( __CLASS__, 'sortable_columns' ) );
		add_action( 'restrict_manage_posts', array( __CLASS__, 'render_filters' ) );
		add_action( 'pre_get_posts', array( __CLASS__, 'filter_posts_query' ) );
		add_action( 'admin_head-edit.php', array( __CLASS__, 'inject_admin_styles' ) );
	}

	/**
	 * Define custom column layout for Posts table.
	 */
	public static function customize_columns( $columns ) {
		$new_columns = array();

		if ( isset( $columns['cb'] ) ) {
			$new_columns['cb'] = $columns['cb'];
		}

		$new_columns['title']          = __( 'Title', 'ikan' );
		$new_columns['author']         = __( 'Author', 'ikan' );
		$new_columns['content_format'] = __( 'Format', 'ikan' );
		$new_columns['read_time']       = __( 'Read Time', 'ikan' );
		$new_columns['categories']      = __( 'Categories', 'ikan' );
		$new_columns['tags']            = __( 'Tags & Topics', 'ikan' );
		$new_columns['highlights']      = __( 'Program / Focus', 'ikan' );
		$new_columns['date']            = $columns['date'] ?? __( 'Date', 'ikan' );

		return $new_columns;
	}

	/**
	 * Render custom column cell values.
	 */
	public static function render_column_content( $column, $post_id ) {
		switch ( $column ) {
			case 'author':
				$post = get_post( $post_id );
				$author_name = '—';
				if ( $post && $post->post_author ) {
					$user = get_userdata( $post->post_author );
					$author_name = $user ? $user->display_name : 'User #' . $post->post_author;
				}

				$edit_url = add_query_arg(
					array(
						'post_type' => 'post',
						'author'    => $post ? $post->post_author : 0,
					),
					admin_url( 'edit.php' )
				);

				echo '<a href="' . esc_url( $edit_url ) . '" style="font-weight: 600; color: #1E293B; text-decoration: none;">' . esc_html( $author_name ) . '</a>';
				break;

			case 'content_format':
				$medium = strtolower( (string) get_post_meta( $post_id, 'medium', true ) );
				if ( empty( $medium ) ) {
					$medium = strtolower( (string) get_post_meta( $post_id, 'content_type', true ) );
				}
				if ( empty( $medium ) ) {
					$medium = 'article';
				}

				if ( 'video' === $medium ) {
					echo '<span style="background: #FFF1F2; color: #E11D48; border: 1px solid #FECDD3; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">🎬 Video</span>';
				} elseif ( 'audio' === $medium ) {
					echo '<span style="background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">🎧 Audio</span>';
				} else {
					echo '<span style="background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">📄 Article</span>';
				}
				break;

			case 'read_time':
				$minutes   = get_post_meta( $post_id, 'minutes', true );
				$read_time = get_post_meta( $post_id, 'read_time', true );

				if ( ! empty( $read_time ) ) {
					$display_time = $read_time;
				} elseif ( ! empty( $minutes ) ) {
					$display_time = $minutes . ' min';
				} else {
					$display_time = '4 min';
				}

				echo '<span style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 3px 8px; border-radius: 6px; font-size: 12px; font-weight: 500; color: #334155;">⏱ ' . esc_html( $display_time ) . '</span>';
				break;

			case 'highlights':
				$featured  = get_post_meta( $post_id, 'featured', true );
				$programme = get_post_meta( $post_id, 'programme', true );
				$art       = get_post_meta( $post_id, 'art', true );

				$items = array();
				if ( ! empty( $featured ) && '0' !== $featured ) {
					$items[] = '<span style="background: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">★ FEATURED</span>';
				}
				if ( ! empty( $programme ) ) {
					$items[] = '<span style="background: #F1F5F9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Equip: ' . esc_html( $programme ) . '</span>';
				}
				if ( ! empty( $art ) ) {
					$items[] = '<span style="color: #94A3B8; font-size: 10px;">Art: ' . esc_html( $art ) . '</span>';
				}

				if ( empty( $items ) ) {
					echo '<span style="color: #CBD5E1;">—</span>';
				} else {
					echo implode( '<div style="margin-top: 4px;"></div>', $items );
				}
				break;
		}
	}

	/**
	 * Make custom columns sortable.
	 */
	public static function sortable_columns( $columns ) {
		$columns['author']         = 'author';
		$columns['content_format'] = 'content_format';
		$columns['read_time']      = 'read_time';
		return $columns;
	}

	/**
	 * Render format filter dropdown above Posts list table.
	 */
	public static function render_filters( $post_type ) {
		if ( 'post' !== $post_type ) {
			return;
		}

		$current_medium = isset( $_GET['filter_medium'] ) ? sanitize_text_field( $_GET['filter_medium'] ) : '';
		?>
		<select name="filter_medium">
			<option value=""><?php esc_html_e( 'All Formats (Article / Video / Audio)', 'ikan' ); ?></option>
			<option value="article" <?php selected( $current_medium, 'article' ); ?>>Articles Only</option>
			<option value="video" <?php selected( $current_medium, 'video' ); ?>>Videos Only</option>
			<option value="audio" <?php selected( $current_medium, 'audio' ); ?>>Audio / Podcasts</option>
		</select>
		<?php
	}

	/**
	 * Handle custom filter queries.
	 */
	public static function filter_posts_query( $query ) {
		global $pagenow;
		if ( ! is_admin() || 'edit.php' !== $pagenow || ! $query->is_main_query() ) {
			return;
		}

		if ( isset( $_GET['filter_medium'] ) && ! empty( $_GET['filter_medium'] ) ) {
			$medium = sanitize_text_field( $_GET['filter_medium'] );
			$query->set( 'meta_key', 'medium' );
			$query->set( 'meta_value', $medium );
		}
	}

	/**
	 * Inject custom CSS into edit.php for cleaner badge rendering.
	 */
	public static function inject_admin_styles() {
		global $typenow;
		if ( 'post' !== $typenow ) {
			return;
		}
		?>
		<style>
			.column-author { width: 11%; }
			.column-content_format { width: 9%; }
			.column-read_time { width: 10%; }
			.column-highlights { width: 13%; }
			.column-tags { width: 20%; }
			.column-categories { width: 13%; }
			.column-tags a {
				background: #F1F5F9;
				border: 1px solid #E2E8F0;
				color: #334155;
				padding: 2px 6px;
				border-radius: 4px;
				font-size: 11px;
				display: inline-block;
				margin: 1px;
				text-decoration: none;
			}
			.column-tags a:hover {
				background: #E2E8F0;
				color: #0F172A;
			}
		</style>
		<?php
	}
}

// Auto-initialize
Ikan_Post_Columns::init();
