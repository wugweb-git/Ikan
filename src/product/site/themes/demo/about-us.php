<?php
/**
 * Template Name: About Us
 * Template Post Type: page
 * Description: Exact 1:1 replica of iKAN 2 PWA About layout (ikan2/src/routes/about.tsx)
 *
 * Matches InfoShell wide container, mood illustration, story, mission/vision cards,
 * values grid, how-it-works timeline, who-it-for cards, and founders/team showcase.
 *
 * @package iKAN_Health
 */

$GLOBALS['ikan_app_shell'] = true;
get_header();

// Load canonical About content from assets/pages.json (identical to ikan2)
$pages_file = get_template_directory() . '/assets/pages.json';
$pages_data = [];
if ( file_exists( $pages_file ) ) {
  $pages_data = json_decode( file_get_contents( $pages_file ), true ) ?: [];
}
$a = $pages_data['about'] ?? [];

$hero_title    = $a['hero']['title'] ?? 'To us, mental health matters.';
$hero_subtitle = $a['hero']['subtitle'] ?? 'At iKAN, we believe mental health is for everyone.';
$story         = $a['story'] ?? [];
$mission       = $a['mission'] ?? [];
$vision        = $a['vision'] ?? [];
$values_head   = $a['valuesHeading'] ?? "Why you'll love iKAN";
$values        = $a['values'] ?? [];
$how_it_works  = $a['howItWorks'] ?? [];
$who_for       = $a['whoFor'] ?? [];
$team_head     = $a['teamHeading'] ?? 'The team behind iKAN';
$team_desc     = $a['teamDescription'] ?? 'Built by clinicians, engineers, and researchers dedicated to changing mental healthcare in India.';
$founders      = $a['founders'] ?? [];
$team          = $a['team'] ?? [];

// Helper to clean angle brackets: unmark() in ikan2
function ikan_unmark( $str ) {
  return str_replace( [ '<', '>' ], '', $str );
}

$value_icons = [
  'heart'         => 'heart',
  'shield'        => 'shield',
  'flask-conical' => 'flask-conical',
  'handshake'     => 'handshake',
];

$step_icons = [ 'clipboard-list', 'user-round-search', 'sparkles' ];
$who_arts   = [ 'checkup', 'work', 'measure' ];
?>

<div class="min-h-dvh bg-canvas text-foreground ikan2-theme ikan2-type">
  <main class="mx-auto min-h-dvh w-full bg-background pb-12 shadow-app max-w-read">
    
    <!-- TopAppBar: thin, compact sticky header with back button (matching ikan2 exactly) -->
    <header class="safe-top-sm sticky top-0 z-30 flex min-h-16 items-center gap-1 bg-background px-1 print:hidden">
      <button
        type="button"
        aria-label="Back"
        onclick="if(window.history.length>1){window.history.back();}else{window.location.href='<?php echo esc_url( home_url( '/' ) ); ?>';}"
        class="grid h-12 w-12 place-items-center rounded-full text-foreground hover:bg-foreground/5 transition-colors"
      >
        <i data-lucide="arrow-left" class="h-6 w-6"></i>
      </button>
    </header>

    <!-- Page Header (px-5) -->
    <header class="px-5">
      <h1 class="font-display text-[34px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground">
        <?php echo esc_html( $hero_title ); ?>
      </h1>
      <p class="type-body-xl mt-3 text-muted-foreground"><?php echo esc_html( $hero_subtitle ); ?></p>
    </header>

    <!-- Mood Illustration (mx-5 mt-6 h-44 rounded-[28px]) -->
    <div class="mx-5 mt-6 h-44 overflow-hidden rounded-[28px]">
      <?php echo function_exists( 'ikan_render_art_svg' ) ? ikan_render_art_svg( 'mood', 'w-full h-full object-cover' ) : '<div class="w-full h-full bg-secondary"></div>'; ?>
    </div>

    <!-- Story Section -->
    <?php if ( ! empty( $story ) ) : ?>
      <section class="mt-8 px-5">
        <p class="type-body-sm font-semibold text-[#2B634D]"><?php echo esc_html( $story['label'] ?? 'Our Story' ); ?></p>
        <h2 class="type-headline-sm mt-1"><?php echo esc_html( ikan_unmark( $story['heading'] ?? '' ) ); ?></h2>
        <div class="mt-3 space-y-4 text-[16px] leading-7 text-foreground/85">
          <?php foreach ( (array) ( $story['paragraphs'] ?? [] ) as $p ) : ?>
            <p><?php echo esc_html( ikan_unmark( $p ) ); ?></p>
          <?php endforeach; ?>
        </div>
      </section>
    <?php endif; ?>

    <!-- Mission & Vision Cards (mt-8 space-y-3 px-5) -->
    <section class="mt-8 space-y-3 px-5">
      <?php if ( ! empty( $mission ) ) : ?>
        <div class="rounded-[24px] bg-foreground p-5 text-background">
          <p class="type-body-sm font-semibold opacity-75"><?php echo esc_html( $mission['label'] ?? 'Mission' ); ?></p>
          <p class="type-title-lg mt-1"><?php echo esc_html( $mission['title'] ?? '' ); ?></p>
          <p class="type-body mt-2 opacity-85"><?php echo esc_html( $mission['description'] ?? '' ); ?></p>
        </div>
      <?php endif; ?>
      <?php if ( ! empty( $vision ) ) : ?>
        <div class="rounded-[24px] bg-[#DFF0E8] p-5 text-[#173D2F]">
          <p class="type-body-sm font-semibold opacity-75"><?php echo esc_html( $vision['label'] ?? 'Vision' ); ?></p>
          <p class="type-title-lg mt-1"><?php echo esc_html( $vision['title'] ?? '' ); ?></p>
          <p class="type-body mt-2 opacity-85"><?php echo esc_html( $vision['description'] ?? '' ); ?></p>
        </div>
      <?php endif; ?>
    </section>

    <!-- Values Grid (mt-10 px-5, grid-cols-2 gap-3) -->
    <?php if ( ! empty( $values ) ) : ?>
      <section class="mt-10 px-5">
        <h2 class="type-title-lg"><?php echo esc_html( $values_head ); ?></h2>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <?php foreach ( $values as $v ) : 
            $icon = $value_icons[ $v['iconName'] ?? '' ] ?? 'heart';
          ?>
            <div class="rounded-[20px] bg-secondary p-4">
              <i data-lucide="<?php echo esc_attr( $icon ); ?>" class="h-6 w-6"></i>
              <p class="type-title-md mt-3"><?php echo esc_html( $v['title'] ?? '' ); ?></p>
              <p class="type-body-sm mt-1 text-muted-foreground"><?php echo esc_html( $v['description'] ?? '' ); ?></p>
            </div>
          <?php endforeach; ?>
        </div>
      </section>
    <?php endif; ?>

    <!-- How iKAN Works (mt-10 px-5, vertical step timeline + Get started CTA) -->
    <?php if ( ! empty( $how_it_works['steps'] ) ) : 
      $step_list = $how_it_works['steps'];
      $total_steps = count( $step_list );
    ?>
      <section class="mt-10 px-5">
        <h2 class="type-title-lg"><?php echo esc_html( $how_it_works['heading'] ?? 'How iKAN works' ); ?></h2>
        <ol class="mt-4 space-y-4">
          <?php foreach ( $step_list as $i => $s ) : 
            $icon = $step_icons[ $i ] ?? 'sparkles';
          ?>
            <li class="flex gap-4">
              <span class="relative flex flex-col items-center">
                <span class="grid h-11 w-11 place-items-center rounded-full bg-foreground text-background">
                  <i data-lucide="<?php echo esc_attr( $icon ); ?>" class="h-5 w-5"></i>
                </span>
                <?php if ( $i < $total_steps - 1 ) : ?>
                  <span class="mt-1 w-px flex-1 bg-foreground/15"></span>
                <?php endif; ?>
              </span>
              <span class="pb-2">
                <span class="type-subhead block"><?php echo esc_html( $s['title'] ?? '' ); ?></span>
                <span class="type-label-lg block text-[#2B634D]"><?php echo esc_html( $s['tagline'] ?? '' ); ?></span>
                <span class="type-body mt-1 block text-muted-foreground">
                  <?php echo esc_html( $s['description'] ?? '' ); ?>
                </span>
              </span>
            </li>
          <?php endforeach; ?>
        </ol>
        <a
          href="<?php echo esc_url( home_url( '/assessments' ) ); ?>"
          class="type-action mt-4 flex h-12 items-center justify-center rounded-full bg-foreground text-background font-semibold"
        >
          Get started
        </a>
      </section>
    <?php endif; ?>

    <!-- Who is iKAN for? (mt-10, horizontal snap carousel) -->
    <?php if ( ! empty( $who_for['groups'] ) ) : ?>
      <section class="mt-10">
        <h2 class="type-title-lg px-5"><?php echo esc_html( $who_for['heading'] ?? 'Who is iKAN for?' ); ?></h2>
        <div class="no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
          <?php foreach ( $who_for['groups'] as $i => $g ) : 
            $art = $who_arts[ $i ] ?? 'checkup';
          ?>
            <div class="w-[260px] shrink-0 snap-start overflow-hidden rounded-[24px] border border-foreground/10">
              <div class="h-24">
                <?php echo function_exists( 'ikan_render_art_svg' ) ? ikan_render_art_svg( $art, 'w-full h-full object-cover' ) : '<div class="w-full h-full bg-secondary"></div>'; ?>
              </div>
              <div class="p-4">
                <p class="type-subhead"><?php echo esc_html( $g['title'] ?? '' ); ?></p>
                <p class="type-label-lg text-[#2B634D]"><?php echo esc_html( $g['tagline'] ?? '' ); ?></p>
                <p class="mt-2 text-[14px] leading-6 text-muted-foreground"><?php echo esc_html( $g['description'] ?? '' ); ?></p>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      </section>
    <?php endif; ?>

    <!-- Team Behind iKAN (mt-10 px-5) -->
    <?php if ( ! empty( $founders ) ) : ?>
      <section class="mt-10 px-5">
        <h2 class="type-title-lg"><?php echo esc_html( $team_head ); ?></h2>
        <p class="type-body mt-1 text-muted-foreground"><?php echo esc_html( $team_desc ); ?></p>
        
        <!-- Founders -->
        <ul class="mt-4 space-y-3">
          <?php foreach ( $founders as $f ) : 
            $fname = explode( ' ', $f['name'] ?? '' )[0] ?? 'team';
            $initials = '';
            foreach ( explode( ' ', $f['name'] ?? '' ) as $w ) {
              $initials .= strtoupper( substr( $w, 0, 1 ) );
            }
            $initials = substr( $initials, 0, 2 );
          ?>
            <li class="rounded-[24px] bg-secondary p-4">
              <div class="flex items-center gap-3">
                <div class="size-16 rounded-full bg-foreground/10 flex items-center justify-center font-semibold text-lg text-foreground shrink-0 overflow-hidden">
                  <?php echo esc_html( $initials ); ?>
                </div>
                <div>
                  <p class="type-subhead"><?php echo esc_html( $f['name'] ?? '' ); ?></p>
                  <p class="type-body-sm text-muted-foreground"><?php echo esc_html( $f['role'] ?? '' ); ?></p>
                </div>
              </div>
              <p class="mt-3 text-[14px] leading-6 text-foreground/85"><?php echo esc_html( $f['bio'] ?? '' ); ?></p>
            </li>
          <?php endforeach; ?>
        </ul>

        <!-- Advisory Team -->
        <?php if ( ! empty( $team ) ) : ?>
          <ul class="mt-3 grid grid-cols-3 gap-2">
            <?php foreach ( $team as $t ) : 
              $initials = '';
              foreach ( explode( ' ', $t['name'] ?? '' ) as $w ) {
                $initials .= strtoupper( substr( $w, 0, 1 ) );
              }
              $initials = substr( $initials, 0, 2 );
            ?>
              <li class="flex flex-col items-center rounded-[20px] border border-foreground/10 p-3 text-center">
                <div class="size-14 rounded-full bg-foreground/10 flex items-center justify-center font-semibold text-base text-foreground shrink-0 overflow-hidden">
                  <?php echo esc_html( $initials ); ?>
                </div>
                <p class="mt-2 text-[13px] font-semibold leading-4"><?php echo esc_html( $t['name'] ?? '' ); ?></p>
                <p class="mt-0.5 text-[11px] leading-4 text-muted-foreground"><?php echo esc_html( $t['role'] ?? '' ); ?></p>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </section>
    <?php endif; ?>

    <div class="h-6"></div>
  </main>
</div>

<?php get_footer(); ?>
