<?php
/**
 * iKAN Mood Journal Card Block — render.php
 *
 * Server-side render for the ikan/mood-journal-card block.
 * Matches ikan2/src/components/mood-checkin-card.tsx.
 *
 * @package iKAN_Health
 */

$eyebrow     = $attributes['eyebrow'] ?? "Today’s check-in";
$headline    = $attributes['headline'] ?? 'How are you feeling?';
$subtitle    = $attributes['subtitle'] ?? 'Mood, sleep, stress and pain in a few quick taps.';
$badge_text  = $attributes['badgeText'] ?? '40 sec';
$cta_label   = $attributes['ctaLabel'] ?? "Log today’s mood";
$journal_url = $attributes['journalUrl'] ?? '/journal/';

$moods = [
	[ 'value' => 1, 'emoji' => '😞', 'label' => 'Rough' ],
	[ 'value' => 2, 'emoji' => '😕', 'label' => 'Low' ],
	[ 'value' => 3, 'emoji' => '😐', 'label' => 'Okay' ],
	[ 'value' => 4, 'emoji' => '🙂', 'label' => 'Good' ],
	[ 'value' => 5, 'emoji' => '😄', 'label' => 'Great' ],
];
?>
<section class="ikan2-theme surface rounded-[24px] bg-background border border-foreground/10 p-4 text-foreground">
  <div class="flex items-start justify-between gap-3">
    <div>
      <?php if ( $eyebrow ) : ?>
        <p class="type-body-sm font-semibold text-muted-foreground"><?php echo esc_html( $eyebrow ); ?></p>
      <?php endif; ?>
      <h2 class="type-subhead mt-1"><?php echo esc_html( $headline ); ?></h2>
    </div>
    <?php if ( $badge_text ) : ?>
      <span class="type-label-md rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
        <?php echo esc_html( $badge_text ); ?>
      </span>
    <?php endif; ?>
  </div>

  <?php if ( $subtitle ) : ?>
    <p class="type-body-sm mt-1 text-muted-foreground"><?php echo esc_html( $subtitle ); ?></p>
  <?php endif; ?>

  <div class="mt-4 grid grid-cols-5 gap-2">
    <?php foreach ( $moods as $m ) : ?>
      <a
        href="<?php echo esc_url( add_query_arg( 'mood', $m['value'], $journal_url ) ); ?>"
        aria-label="<?php echo esc_attr( $m['label'] ); ?>"
        class="flex flex-col items-center gap-1 rounded-2xl bg-secondary py-2 text-foreground no-underline transition-transform active:scale-95"
      >
        <span class="text-2xl leading-none" aria-hidden="true"><?php echo esc_html( $m['emoji'] ); ?></span>
        <span class="text-[11px] font-medium text-muted-foreground"><?php echo esc_html( $m['label'] ); ?></span>
      </a>
    <?php endforeach; ?>
  </div>

  <a
    href="<?php echo esc_url( $journal_url ); ?>"
    class="type-body-md font-semibold mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-background no-underline transition-transform active:scale-[.98]"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
    <?php echo esc_html( $cta_label ); ?>
  </a>
</section>
