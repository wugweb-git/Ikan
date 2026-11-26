<?php
/**
 * iKAN Support Card Block — render.php
 *
 * Server-side render for the ikan/support-card block.
 * Matches ikan2/src/components/support-card.tsx.
 *
 * @package iKAN_Health
 */

$eyebrow     = $attributes['eyebrow'] ?? 'Support';
$headline    = $attributes['headline'] ?? "Let’s talk about it";
$description = $attributes['description'] ?? 'Consultants available with video, call and chat sessions.';
$cta_label   = $attributes['ctaLabel'] ?? 'Book a consultation';
$url         = $attributes['url'] ?? '/consult/';
?>
<section class="ikan2-theme rounded-[22px] border border-error/20 bg-error/5 p-4 text-foreground">
  <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
    <span class="grid h-10 w-10 place-items-center rounded-xl bg-background text-on-error-container" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    </span>
    <div class="min-w-0">
      <?php if ( $eyebrow ) : ?>
        <p class="type-label-md font-semibold text-on-error-container"><?php echo esc_html( $eyebrow ); ?></p>
      <?php endif; ?>
      <h2 class="type-title-md"><?php echo esc_html( $headline ); ?></h2>
      <?php if ( $description ) : ?>
        <p class="type-body-sm mt-0.5 text-muted-foreground"><?php echo esc_html( $description ); ?></p>
      <?php endif; ?>
    </div>
  </div>
  <a
    href="<?php echo esc_url( $url ); ?>"
    class="type-body-md font-semibold mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-on-error-container text-error-container no-underline transition-transform active:scale-[.98]"
  >
    <?php echo esc_html( $cta_label ); ?>
  </a>
</section>
