<?php
/**
 * iKAN Disclosure Block — render.php
 *
 * Server-side render for the ikan/disclosure block.
 * Matches the ikan2 Disclosure/DisclosureGroup component from:
 *   ikan2/src/components/kit/disclosure.tsx
 *
 * Rendered as a native <details>/<summary> element so it works with
 * zero JavaScript — progressive enhancement only.
 *
 * @package iKAN_Health
 */

$question = $attributes['question'] ?? '';
$answer   = $attributes['answer']   ?? '';
$open     = ! empty( $attributes['open'] );
?>
<details
  class="ikan2-theme disclosure-item border-b border-foreground/10 py-4"
  <?php echo $open ? 'open' : ''; ?>
>
  <summary class="type-subhead flex cursor-pointer list-none items-start justify-between gap-4 outline-none">
    <span><?php echo esc_html( $question ); ?></span>
    <!-- Chevron icon — rotates via CSS when open -->
    <span class="disclosure-chevron mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </span>
  </summary>
  <div class="type-body mt-3 text-foreground/80 leading-7">
    <?php echo wp_kses_post( $answer ); ?>
  </div>
</details>
