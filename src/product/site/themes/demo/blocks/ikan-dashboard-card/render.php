<?php
/**
 * iKAN Dashboard Card Block — render.php
 *
 * Server-side render for the ikan/dashboard-card block.
 * Matches ikan2 dashboard quick-jump / overview cards.
 *
 * @package iKAN_Health
 */

$eyebrow  = $attributes['eyebrow'] ?? '';
$title    = $attributes['title'] ?? 'Dashboard';
$subtitle = $attributes['subtitle'] ?? '';
$badge    = $attributes['badge'] ?? '';
$tint     = $attributes['tint'] ?? '#DFF0E8';
$url      = $attributes['url'] ?? '/';
?>
<a
  href="<?php echo esc_url( $url ); ?>"
  class="ikan2-theme flex items-center gap-3.5 rounded-[24px] bg-secondary p-4 text-foreground no-underline hover:shadow-md transition-shadow"
>
  <span
    class="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] text-foreground"
    style="background-color: <?php echo esc_attr( $tint ); ?>;"
    aria-hidden="true"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>
  </span>
  <span class="min-w-0 flex-1">
    <?php if ( $eyebrow ) : ?>
      <span class="type-label-md block font-semibold text-muted-foreground"><?php echo esc_html( $eyebrow ); ?></span>
    <?php endif; ?>
    <span class="type-title-md block truncate"><?php echo esc_html( $title ); ?></span>
    <?php if ( $subtitle ) : ?>
      <span class="type-body-sm block truncate text-muted-foreground"><?php echo esc_html( $subtitle ); ?></span>
    <?php endif; ?>
  </span>
  <?php if ( $badge ) : ?>
    <span class="type-label-md shrink-0 rounded-full bg-background px-2.5 py-1 font-medium text-foreground">
      <?php echo esc_html( $badge ); ?>
    </span>
  <?php endif; ?>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
</a>
