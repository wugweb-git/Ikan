<?php
/**
 * iKAN Hero Block — render.php
 *
 * Server-side render for the ikan/hero block.
 * Matches the InfoShell <header> pattern from ikan2/src/routes/*.tsx:
 *   <header class="px-5">
 *     <p class="type-label-lg ...">Eyebrow</p>
 *     <h1 class="type-headline-lg">Headline</h1>
 *     <p class="type-body-xl mt-2 text-muted-foreground">Subtitle</p>
 *   </header>
 *
 * @package iKAN_Health
 */

$eyebrow   = $attributes['eyebrow']  ?? '';
$headline  = $attributes['headline'] ?? '';
$subtitle  = $attributes['subtitle'] ?? '';
$cta_label = $attributes['ctaLabel'] ?? '';
$cta_url   = $attributes['ctaUrl']   ?? '';
$wide      = ! empty( $attributes['wide'] );

// Container class mirrors InfoShell's max-w-app / max-w-read + mx-auto + bg-background
$container_class = $wide ? 'max-w-read' : 'max-w-app';
?>
<div class="ikan2-theme bg-canvas">
  <header class="<?php echo esc_attr( $container_class ); ?> mx-auto bg-background shadow-app px-5 pt-8 pb-6">
    <?php if ( $eyebrow ) : ?>
      <p class="type-label-lg font-semibold text-[#2B634D] mb-1"><?php echo esc_html( $eyebrow ); ?></p>
    <?php endif; ?>

    <?php if ( $headline ) : ?>
      <h1 class="type-headline-lg"><?php echo esc_html( $headline ); ?></h1>
    <?php endif; ?>

    <?php if ( $subtitle ) : ?>
      <p class="type-body-xl mt-2 text-muted-foreground"><?php echo esc_html( $subtitle ); ?></p>
    <?php endif; ?>

    <?php if ( $cta_label && $cta_url ) : ?>
      <div class="mt-6">
        <a
          href="<?php echo esc_url( $cta_url ); ?>"
          class="type-action inline-flex h-12 items-center rounded-full bg-foreground px-6 text-background"
        >
          <?php echo esc_html( $cta_label ); ?>
        </a>
      </div>
    <?php endif; ?>
  </header>
</div>
