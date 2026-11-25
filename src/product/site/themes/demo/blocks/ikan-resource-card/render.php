<?php
/**
 * iKAN Resource Card Block — render.php
 *
 * Server-side render for the ikan/resource-card block.
 * Matches ikan2/src/components/resource-card.tsx visual design.
 *
 * If postId is set, pulls title/tag/readTime/url/thumbnail from the
 * ikan_resource CPT. Otherwise uses the block attributes directly.
 *
 * @package iKAN_Health
 */

$post_id    = intval( $attributes['postId'] ?? 0 );
$title      = $attributes['title']       ?? '';
$tag        = $attributes['tag']         ?? '';
$read_time  = $attributes['readTime']    ?? '';
$url        = $attributes['url']         ?? '';
$thumb_id   = intval( $attributes['thumbnailId'] ?? 0 );

// If a real post is wired up, pull live data from it
if ( $post_id > 0 ) {
	$post = get_post( $post_id );
	if ( $post ) {
		$title     = $title     ?: get_the_title( $post );
		$url       = $url       ?: get_permalink( $post );
		$thumb_id  = $thumb_id  ?: (int) get_post_thumbnail_id( $post );
		if ( ! $tag ) {
			$terms = get_the_terms( $post, 'resource_category' );
			$tag   = ( $terms && ! is_wp_error( $terms ) ) ? $terms[0]->name : '';
		}
		if ( ! $read_time ) {
			$mins      = get_post_meta( $post->ID, '_ikan_read_time', true );
			$read_time = $mins ? $mins . ' min read' : '';
		}
	}
}

$thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'medium' ) : '';
?>
<a
  href="<?php echo esc_url( $url ); ?>"
  class="ikan2-theme resource-card block rounded-[20px] bg-secondary overflow-hidden hover:shadow-md transition-shadow"
>
  <?php if ( $thumb_url ) : ?>
    <div class="aspect-[16/9] overflow-hidden">
      <img
        src="<?php echo esc_url( $thumb_url ); ?>"
        alt=""
        class="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  <?php endif; ?>

  <div class="p-4">
    <?php if ( $tag ) : ?>
      <p class="type-label-md font-semibold text-[#2B634D] mb-2"><?php echo esc_html( $tag ); ?></p>
    <?php endif; ?>

    <h3 class="type-title-lg leading-snug"><?php echo esc_html( $title ); ?></h3>

    <?php if ( $read_time ) : ?>
      <p class="type-label-md mt-2 text-muted-foreground"><?php echo esc_html( $read_time ); ?></p>
    <?php endif; ?>
  </div>
</a>
