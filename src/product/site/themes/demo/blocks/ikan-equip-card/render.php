<?php
/**
 * iKAN Equip Programme Card Block — render.php
 *
 * Server-side render for the ikan/equip-card block.
 * Matches ikan2/src/components/equip/programme-card.tsx.
 *
 * @package iKAN_Health
 */

$name           = $attributes['name'] ?? 'Equip Programme';
$description    = $attributes['description'] ?? '';
$total_days     = max( 1, intval( $attributes['totalDays'] ?? 10 ) );
$completed_days = max( 0, min( $total_days, intval( $attributes['completedDays'] ?? 0 ) ) );
$level          = $attributes['level'] ?? 'Beginner';
$cover_id       = intval( $attributes['coverId'] ?? 0 );
$cover_url      = $cover_id ? wp_get_attachment_image_url( $cover_id, 'medium' ) : ( $attributes['coverUrl'] ?? '' );
$accent         = $attributes['accent'] ?? 'calm';
$url            = $attributes['url'] ?? '/equip-programs/';

$started  = $completed_days > 0;
$next_day = min( $total_days, $completed_days + 1 );
$pct      = round( ( $completed_days / $total_days ) * 100 );

$accent_styles = [
	'calm'   => '--accent:#4E8F75;--accent-container:#DFF0E8;--accent-strong:#2B634D;',
	'sleep'  => '--accent:#355C8C;--accent-container:#E3ECF8;--accent-strong:#24446B;',
	'stress' => '--accent:#A63D5C;--accent-container:#F9E2E9;--accent-strong:#7B2942;',
	'mind'   => '--accent:#5D64B4;--accent-container:#E8E9F8;--accent-strong:#464C9E;',
];
$inline_style = $accent_styles[ $accent ] ?? $accent_styles['calm'];
$cover_alt      = $cover_id ? get_post_meta( $cover_id, '_wp_attachment_image_alt', true ) : '';
if ( ! $cover_alt ) {
	$cover_alt = $name . ' programme cover';
}
?>
<a
  href="<?php echo esc_url( $url ); ?>"
  style="<?php echo esc_attr( $inline_style ); ?>"
  class="ikan2-theme flex overflow-hidden rounded-[24px] bg-secondary text-foreground no-underline hover:shadow-md transition-shadow"
>
  <?php if ( $cover_url ) : ?>
    <img src="<?php echo esc_url( $cover_url ); ?>" alt="<?php echo esc_attr( $cover_alt ); ?>" class="w-[112px] shrink-0 object-cover" loading="lazy" decoding="async" />
  <?php else : ?>
    <div class="w-[112px] shrink-0 bg-[var(--accent-container)] flex items-center justify-center text-[var(--accent-strong)]" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
    </div>
  <?php endif; ?>

  <div class="flex min-w-0 flex-1 flex-col p-4">
    <p class="type-title-lg"><?php echo esc_html( $name ); ?></p>
    <?php if ( $description ) : ?>
      <p class="type-label-lg mt-1 line-clamp-2 text-muted-foreground"><?php echo esc_html( $description ); ?></p>
    <?php endif; ?>

    <div class="mt-auto pt-3">
      <?php if ( $started ) : ?>
        <div class="h-1.5 overflow-hidden rounded-full bg-[var(--accent-container)]">
          <div class="h-full rounded-full bg-[var(--accent)]" style="width: <?php echo esc_attr( $pct ); ?>%;"></div>
        </div>
        <p class="type-body-sm font-medium mt-2 flex items-center justify-between text-[var(--accent-strong)]">
          <span><?php echo $completed_days < $total_days ? esc_html( 'Continue with day ' . $next_day ) : 'All days done'; ?></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </p>
      <?php else : ?>
        <p class="type-body-sm flex items-center justify-between text-muted-foreground">
          <span><?php echo esc_html( $total_days . ' days, ' . ucfirst( $level ) ); ?></span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
        </p>
      <?php endif; ?>
    </div>
  </div>
</a>
