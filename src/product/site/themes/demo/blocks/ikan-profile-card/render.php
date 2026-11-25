<?php
/**
 * iKAN Profile Card Block — render.php
 *
 * Server-side render for the ikan/profile-card block.
 * Matches ikan2/src/routes/profile.tsx profile header & details card.
 *
 * @package iKAN_Health
 */

$use_current = ! isset( $attributes['useCurrentUser'] ) || (bool) $attributes['useCurrentUser'];
$name        = $attributes['name'] ?? 'Member';
$email       = $attributes['email'] ?? '';
$city        = $attributes['city'] ?? '';
$bio         = $attributes['bio'] ?? '';
$avatar_url  = $attributes['avatarUrl'] ?? '';
$edit_label  = $attributes['editLabel'] ?? 'Edit profile';
$edit_url    = $attributes['editUrl'] ?? '/profile/';

if ( $use_current && is_user_logged_in() ) {
	$user       = wp_get_current_user();
	$name       = $user->display_name ?: $name;
	$email      = $user->user_email ?: $email;
	$avatar_url = $avatar_url ?: get_avatar_url( $user->ID, [ 'size' => 128 ] );
	$user_city  = get_user_meta( $user->ID, 'ikan_city', true );
	if ( $user_city ) {
		$city = $user_city;
	}
	$user_bio = get_user_meta( $user->ID, 'description', true );
	if ( $user_bio ) {
		$bio = $user_bio;
	}
}

$parts    = preg_split( '/\s+/', trim( $name ) );
$initials = strtoupper( substr( $parts[0] ?? 'M', 0, 1 ) . ( isset( $parts[1] ) ? substr( $parts[1], 0, 1 ) : '' ) );
?>
<section class="ikan2-theme rounded-[24px] bg-secondary p-4 text-foreground">
  <div class="flex items-center gap-3.5">
    <?php if ( $avatar_url ) : ?>
      <img src="<?php echo esc_url( $avatar_url ); ?>" alt="" class="h-14 w-14 shrink-0 rounded-full object-cover" />
    <?php else : ?>
      <span class="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#2B634D] text-white font-display text-lg font-semibold">
        <?php echo esc_html( $initials ); ?>
      </span>
    <?php endif; ?>
    <div class="min-w-0 flex-1">
      <h3 class="type-title-lg truncate"><?php echo esc_html( $name ); ?></h3>
      <?php if ( $email ) : ?>
        <p class="type-body-sm truncate text-muted-foreground"><?php echo esc_html( $email ); ?></p>
      <?php endif; ?>
      <?php if ( $city ) : ?>
        <p class="type-label-md mt-0.5 text-muted-foreground"><?php echo esc_html( $city ); ?></p>
      <?php endif; ?>
    </div>
  </div>
  <?php if ( $bio ) : ?>
    <p class="type-body-sm mt-3 text-foreground/80"><?php echo esc_html( $bio ); ?></p>
  <?php endif; ?>
  <?php if ( $edit_url ) : ?>
    <div class="mt-3 pt-3 border-t border-foreground/10">
      <a
        href="<?php echo esc_url( $edit_url ); ?>"
        class="type-body-sm font-semibold inline-flex items-center gap-1.5 text-foreground no-underline hover:underline"
      >
        <?php echo esc_html( $edit_label ); ?>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
      </a>
    </div>
  <?php endif; ?>
</section>
