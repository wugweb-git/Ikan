<?php
/**
 * iKAN Settings Card Block — render.php
 *
 * Server-side render for the ikan/settings-card block.
 * Matches ikan2/src/routes/settings.tsx settings groups.
 *
 * @package iKAN_Health
 */

$title       = $attributes['title'] ?? 'Settings';
$description = $attributes['description'] ?? '';
$items       = is_array( $attributes['items'] ?? null ) ? $attributes['items'] : [];
?>
<section class="ikan2-theme rounded-[24px] bg-secondary p-4 text-foreground">
  <div class="mb-3">
    <h3 class="type-title-md"><?php echo esc_html( $title ); ?></h3>
    <?php if ( $description ) : ?>
      <p class="type-body-sm mt-0.5 text-muted-foreground"><?php echo esc_html( $description ); ?></p>
    <?php endif; ?>
  </div>

  <?php if ( ! empty( $items ) ) : ?>
    <div class="divide-y divide-foreground/10 rounded-[16px] bg-background px-3.5">
      <?php foreach ( $items as $item ) :
        $label  = $item['label'] ?? '';
        $sub    = $item['sub'] ?? '';
        $status = $item['status'] ?? '';
        $url    = $item['url'] ?? '';
        if ( ! $label ) {
          continue;
        }
        $tag = $url ? 'a' : 'div';
      ?>
        <<?php echo $tag; ?>
          <?php if ( $url ) : ?>href="<?php echo esc_url( $url ); ?>"<?php endif; ?>
          class="flex items-center justify-between gap-3 py-3 text-foreground no-underline"
        >
          <span class="min-w-0 flex-1">
            <span class="type-body-md font-medium block truncate"><?php echo esc_html( $label ); ?></span>
            <?php if ( $sub ) : ?>
              <span class="type-body-sm block truncate text-muted-foreground"><?php echo esc_html( $sub ); ?></span>
            <?php endif; ?>
          </span>
          <?php if ( $status ) : ?>
            <span class="type-label-md shrink-0 rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
              <?php echo esc_html( $status ); ?>
            </span>
          <?php endif; ?>
          <?php if ( $url ) : ?>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-muted-foreground" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
          <?php endif; ?>
        </<?php echo $tag; ?>>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>
</section>
