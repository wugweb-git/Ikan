<?php
/**
 * iKAN Summary Card Block — render.php
 *
 * Server-side render for the ikan/summary-card block.
 * Matches ikan2/src/routes/wellness.tsx ScorePage and result summary cards.
 *
 * @package iKAN_Health
 */

$eyebrow    = $attributes['eyebrow'] ?? 'iKAN Score';
$score      = $attributes['score'] ?? '';
$score_max  = $attributes['scoreMax'] ?? '';
$band_label = $attributes['bandLabel'] ?? '';
$summary    = $attributes['summary'] ?? '';
$delta_text = $attributes['deltaText'] ?? '';
$cta_label  = $attributes['ctaLabel'] ?? '';
$cta_url    = $attributes['ctaUrl'] ?? '/wellness/';
$variant    = $attributes['variant'] ?? 'dark';

$is_dark = ( 'light' !== $variant );
$wrap_cls = $is_dark
	? 'ikan2-theme rounded-[28px] bg-[#0F1A17] p-5 text-white'
	: 'ikan2-theme rounded-[28px] bg-secondary p-5 text-foreground';
$muted_cls = $is_dark ? 'text-white/70' : 'text-muted-foreground';
$pill_cls  = $is_dark ? 'bg-white/12 text-white' : 'bg-background text-foreground';
$btn_cls   = $is_dark
	? 'bg-white text-[#0F1A17]'
	: 'bg-foreground text-background';
?>
<section class="<?php echo esc_attr( $wrap_cls ); ?>">
  <div class="flex items-start justify-between gap-3">
    <div>
      <?php if ( $eyebrow ) : ?>
        <p class="type-label-md font-semibold <?php echo esc_attr( $muted_cls ); ?>"><?php echo esc_html( $eyebrow ); ?></p>
      <?php endif; ?>
      <?php if ( $score !== '' ) : ?>
        <p class="font-display text-4xl font-bold tracking-tight mt-1">
          <?php echo esc_html( $score ); ?>
          <?php if ( $score_max !== '' ) : ?>
            <span class="type-body-md font-normal <?php echo esc_attr( $muted_cls ); ?>">/ <?php echo esc_html( $score_max ); ?></span>
          <?php endif; ?>
        </p>
      <?php endif; ?>
    </div>
    <div class="flex flex-col items-end gap-1.5">
      <?php if ( $band_label ) : ?>
        <span class="type-label-md rounded-full px-3 py-1 font-semibold <?php echo esc_attr( $pill_cls ); ?>">
          <?php echo esc_html( $band_label ); ?>
        </span>
      <?php endif; ?>
      <?php if ( $delta_text ) : ?>
        <span class="type-label-md <?php echo esc_attr( $muted_cls ); ?>"><?php echo esc_html( $delta_text ); ?></span>
      <?php endif; ?>
    </div>
  </div>

  <?php if ( $summary ) : ?>
    <p class="type-body-sm mt-3 leading-6 <?php echo esc_attr( $muted_cls ); ?>"><?php echo esc_html( $summary ); ?></p>
  <?php endif; ?>

  <?php if ( $cta_label && $cta_url ) : ?>
    <a
      href="<?php echo esc_url( $cta_url ); ?>"
      class="type-body-md font-semibold mt-4 inline-flex h-11 w-full items-center justify-center rounded-full no-underline transition-transform active:scale-[.98] <?php echo esc_attr( $btn_cls ); ?>"
    >
      <?php echo esc_html( $cta_label ); ?>
    </a>
  <?php endif; ?>
</section>
