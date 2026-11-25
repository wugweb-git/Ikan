<?php
/**
 * iKAN Consultant Card Block — render.php
 *
 * Server-side render for the ikan/consultant-card block.
 * Matches ikan2/src/routes/consult.index.tsx ConsultantCard.
 *
 * @package iKAN_Health
 */

$name        = $attributes['name'] ?? 'Consultant';
$credentials = $attributes['credentials'] ?? '';
$role        = $attributes['role'] ?? '';
$rating      = $attributes['rating'] ?? '4.9';
$reviews     = intval( $attributes['reviews'] ?? 0 );
$years       = intval( $attributes['years'] ?? 0 );
$city        = $attributes['city'] ?? '';
$photo_url   = $attributes['photoUrl'] ?? '';
$specialties = is_array( $attributes['specialties'] ?? null ) ? $attributes['specialties'] : [];
$price_label = $attributes['priceLabel'] ?? '';
$next_slot   = $attributes['nextSlot'] ?? '';
$recommended = ! empty( $attributes['recommended'] );
$url         = $attributes['url'] ?? '/consult/';

$parts    = preg_split( '/\s+/', trim( $name ) );
$initials = strtoupper( substr( $parts[0] ?? 'C', 0, 1 ) . ( isset( $parts[1] ) ? substr( $parts[1], 0, 1 ) : '' ) );
?>
<a
  href="<?php echo esc_url( $url ); ?>"
  class="ikan2-theme block rounded-[24px] border border-foreground/10 bg-background p-4 text-foreground no-underline hover:shadow-md transition-shadow"
>
  <div class="flex gap-3">
    <?php if ( $photo_url ) : ?>
      <img src="<?php echo esc_url( $photo_url ); ?>" alt="" class="h-16 w-16 shrink-0 rounded-full object-cover" loading="lazy" decoding="async" />
    <?php else : ?>
      <span class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#DFF0E8] text-[#1E523C] font-display text-lg font-semibold">
        <?php echo esc_html( $initials ); ?>
      </span>
    <?php endif; ?>

    <div class="min-w-0 flex-1">
      <?php if ( $recommended ) : ?>
        <span class="type-label-md font-semibold mb-1 inline-flex h-6 items-center gap-1 rounded-full bg-[#DFF0E8] px-2 text-[#1E523C]">
          Recommended
        </span>
      <?php endif; ?>
      <p class="font-display text-[17px] font-semibold leading-6"><?php echo esc_html( $name ); ?></p>
      <?php if ( $credentials ) : ?>
        <p class="type-body-sm text-muted-foreground"><?php echo esc_html( $credentials ); ?></p>
      <?php endif; ?>
      <p class="type-body-sm mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <?php if ( $rating ) : ?>
          <span class="inline-flex items-center gap-1 font-semibold">
            <span class="text-[#E3A008]" aria-hidden="true">★</span>
            <?php echo esc_html( $rating ); ?>
            <?php if ( $reviews > 0 ) : ?>
              <span class="font-normal text-muted-foreground">(<?php echo esc_html( $reviews ); ?>)</span>
            <?php endif; ?>
          </span>
        <?php endif; ?>
        <?php if ( $role ) : ?>
          <span class="text-muted-foreground"><?php echo esc_html( $role ); ?></span>
        <?php endif; ?>
        <?php if ( $years > 0 ) : ?>
          <span class="text-muted-foreground"><?php echo esc_html( $years . '+ yrs' ); ?></span>
        <?php endif; ?>
      </p>
      <?php if ( $city ) : ?>
        <p class="type-body-sm mt-0.5 text-muted-foreground"><?php echo esc_html( $city ); ?></p>
      <?php endif; ?>
    </div>
  </div>

  <?php if ( ! empty( $specialties ) ) : ?>
    <div class="mt-3 flex flex-wrap gap-1.5">
      <?php foreach ( $specialties as $s ) : ?>
        <span class="type-label-md rounded-[8px] bg-secondary px-2.5 py-1"><?php echo esc_html( $s ); ?></span>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <div class="mt-3 flex items-center gap-3 border-t border-foreground/10 pt-3">
    <span class="min-w-0 flex-1">
      <?php if ( $price_label ) : ?>
        <span class="type-label-md block text-muted-foreground">From</span>
        <span class="type-subhead block"><?php echo esc_html( $price_label ); ?></span>
      <?php endif; ?>
    </span>
    <?php if ( $next_slot ) : ?>
      <span class="type-body-sm inline-flex items-center gap-1.5 text-[#2B634D]">
        <?php echo esc_html( $next_slot ); ?>
      </span>
    <?php endif; ?>
    <span class="type-body-md font-semibold inline-flex h-10 items-center rounded-full bg-foreground px-4 text-background">
      Book
    </span>
  </div>
</a>
