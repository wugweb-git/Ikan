<?php
/**
 * iKAN CTA Banner Block — render.php
 *
 * Server-side render for the ikan/cta-banner block.
 * Matches the bottom-of-page CTA pattern on about, resources, and home pages.
 *
 * Variants:
 *   dark  — bg-foreground text-background (default, matches ikan2 mission card)
 *   light — bg-secondary text-foreground
 *   brand — bg-[#2B634D] text-white (iKAN brand green)
 *
 * @package iKAN_Health
 */

$headline        = $attributes['headline']       ?? 'Ready to get started?';
$subtitle        = $attributes['subtitle']       ?? '';
$primary_label   = $attributes['primaryLabel']   ?? 'Get started';
$primary_url     = $attributes['primaryUrl']     ?? '/join/';
$secondary_label = $attributes['secondaryLabel'] ?? '';
$secondary_url   = $attributes['secondaryUrl']   ?? '';
$variant         = $attributes['variant']        ?? 'dark';

$variant_classes = [
	'dark'  => 'bg-foreground text-background',
	'light' => 'bg-secondary text-foreground',
	'brand' => 'bg-[#2B634D] text-white',
];
$btn_classes = [
	'dark'  => 'bg-background text-foreground hover:bg-background/90',
	'light' => 'bg-foreground text-background hover:bg-foreground/90',
	'brand' => 'bg-white text-[#2B634D] hover:bg-white/90',
];
$sec_classes = [
	'dark'  => 'border border-background/30 text-background hover:bg-background/10',
	'light' => 'border border-foreground/20 text-foreground hover:bg-foreground/10',
	'brand' => 'border border-white/30 text-white hover:bg-white/10',
];

$wrap_cls = $variant_classes[ $variant ] ?? $variant_classes['dark'];
$btn_cls  = $btn_classes[ $variant ]     ?? $btn_classes['dark'];
$sec_cls  = $sec_classes[ $variant ]     ?? $sec_classes['dark'];
?>
<div class="ikan2-theme <?php echo esc_attr( $wrap_cls ); ?> rounded-[28px] mx-5 my-8 p-8">
  <h2 class="type-headline-sm"><?php echo esc_html( $headline ); ?></h2>

  <?php if ( $subtitle ) : ?>
    <p class="type-body mt-2 opacity-80"><?php echo esc_html( $subtitle ); ?></p>
  <?php endif; ?>

  <div class="mt-6 flex flex-wrap gap-3">
    <?php if ( $primary_label && $primary_url ) : ?>
      <a
        href="<?php echo esc_url( $primary_url ); ?>"
        class="type-action inline-flex h-12 items-center rounded-full px-6 <?php echo esc_attr( $btn_cls ); ?>"
      >
        <?php echo esc_html( $primary_label ); ?>
      </a>
    <?php endif; ?>

    <?php if ( $secondary_label && $secondary_url ) : ?>
      <a
        href="<?php echo esc_url( $secondary_url ); ?>"
        class="type-action inline-flex h-12 items-center rounded-full px-6 <?php echo esc_attr( $sec_cls ); ?>"
      >
        <?php echo esc_html( $secondary_label ); ?>
      </a>
    <?php endif; ?>
  </div>
</div>
