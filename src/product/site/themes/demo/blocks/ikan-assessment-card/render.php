<?php
/**
 * iKAN Assessment Card Block — render.php
 *
 * Server-side render for the ikan/assessment-card block.
 * Matches ikan2/src/routes/assessments.index.tsx AssessmentCard.
 *
 * @package iKAN_Health
 */

$name           = $attributes['name'] ?? 'Assessment';
$title          = $attributes['title'] ?? '';
$question_count = intval( $attributes['questionCount'] ?? 0 );
$minutes        = intval( $attributes['minutes'] ?? 0 );
$status_text    = $attributes['statusText'] ?? '';
$accent         = $attributes['accent'] ?? 'mind';
$url            = $attributes['url'] ?? '/assessments/';

$accent_styles = [
	'mind'   => '--accent-container:#E8E9F8;--on-accent-container:#31367A;--accent-strong:#464C9E;',
	'sleep'  => '--accent-container:#E3ECF8;--on-accent-container:#24446B;--accent-strong:#355C8C;',
	'stress' => '--accent-container:#F9E2E9;--on-accent-container:#7B2942;--accent-strong:#A63D5C;',
	'calm'   => '--accent-container:#DFF0E8;--on-accent-container:#1E523C;--accent-strong:#2B634D;',
];
$inline_style = $accent_styles[ $accent ] ?? $accent_styles['mind'];
?>
<a
  href="<?php echo esc_url( $url ); ?>"
  style="<?php echo esc_attr( $inline_style ); ?>"
  class="ikan2-theme flex items-center gap-4 rounded-[24px] bg-secondary p-4 text-foreground no-underline hover:shadow-md transition-shadow"
>
  <span class="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[var(--accent-container)] text-[var(--on-accent-container)]" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  </span>
  <span class="min-w-0 flex-1">
    <?php if ( $name ) : ?>
      <span class="type-body-sm font-medium block text-[var(--accent-strong)]"><?php echo esc_html( $name ); ?></span>
    <?php endif; ?>
    <span class="block font-display text-[17px] font-semibold leading-6"><?php echo esc_html( $title ); ?></span>
    <span class="type-body-sm mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
      <?php if ( $question_count > 0 ) : ?>
        <span class="inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 17l2 2 4-4"/><path d="M3 7l2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
          <?php echo esc_html( $question_count . ' questions' ); ?>
        </span>
      <?php endif; ?>
      <?php if ( $minutes > 0 ) : ?>
        <span class="inline-flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <?php echo esc_html( $minutes . ' min' ); ?>
        </span>
      <?php endif; ?>
      <?php if ( $status_text ) : ?>
        <span class="font-medium text-foreground"><?php echo esc_html( $status_text ); ?></span>
      <?php endif; ?>
    </span>
  </span>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
</a>
