<?php
/**
 * iKAN Bottom Dock Nav Block — render.php
 *
 * Server-side render for the ikan/bottom-nav block.
 * Emits the authentic mobile floating bottom dock matching:
 * ikan2/src/components/ikan-shell.tsx (.shadow-dock, .nav-item, .nav-icon)
 * Visible on mobile (<1024px), hidden on desktop.
 *
 * @package iKAN_Health
 */

$app_url     = ! empty( $attributes['appUrl'] ) ? $attributes['appUrl'] : 'https://app.ikanhealth.in';
$current_url = home_url( add_query_arg( [] ) );
$path        = trim( parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );

$is_home    = is_front_page() || empty( $path );
$is_program = is_page( 'equip-programs' ) || str_starts_with( $path, 'equip' ) || str_starts_with( $path, 'program' );
$is_assess  = is_page( 'assessments' ) || str_starts_with( $path, 'assessment' );
$is_journal = is_page( 'resources' ) || str_starts_with( $path, 'resource' ) || str_starts_with( $path, 'journal' );
?>
<div class="ikan-bottom-dock-wrapper pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center lg:hidden print:hidden">
  <nav aria-label="Mobile Dock Navigation" class="pointer-events-auto mb-[max(12px,calc(env(safe-area-inset-bottom,0px)+6px))] w-full max-w-app px-3">
    <div class="grid grid-cols-5 rounded-[24px] border border-border/80 bg-background/92 p-2 shadow-dock backdrop-blur-xl">
      <!-- 1. Home -->
      <a
        href="<?php echo esc_url( home_url( '/' ) ); ?>"
        class="<?php echo $is_home ? 'nav-item text-foreground active' : 'nav-item text-muted-foreground'; ?>"
      >
        <span class="<?php echo $is_home ? 'nav-icon bg-foreground text-background' : 'nav-icon'; ?>">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </span>
        <span>Home</span>
      </a>

      <!-- 2. Programs -->
      <a
        href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>"
        class="<?php echo $is_program ? 'nav-item text-foreground active' : 'nav-item text-muted-foreground'; ?>"
      >
        <span class="<?php echo $is_program ? 'nav-icon bg-foreground text-background' : 'nav-icon'; ?>">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
        </span>
        <span>Programs</span>
      </a>

      <!-- 3. Assess -->
      <a
        href="<?php echo esc_url( home_url( '/assessments' ) ); ?>"
        class="<?php echo $is_assess ? 'nav-item text-foreground active' : 'nav-item text-muted-foreground'; ?>"
      >
        <span class="<?php echo $is_assess ? 'nav-icon bg-foreground text-background' : 'nav-icon'; ?>">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
        </span>
        <span>Assess</span>
      </a>

      <!-- 4. Journal / Resources -->
      <a
        href="<?php echo esc_url( home_url( '/resources' ) ); ?>"
        class="<?php echo $is_journal ? 'nav-item text-foreground active' : 'nav-item text-muted-foreground'; ?>"
      >
        <span class="<?php echo $is_journal ? 'nav-icon bg-foreground text-background' : 'nav-icon'; ?>">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </span>
        <span>Journal</span>
      </a>

      <!-- 5. More (Toggles Drawer) -->
      <button
        type="button"
        id="ikan-dock-more-btn"
        aria-expanded="false"
        aria-controls="ikan-dock-more-drawer"
        class="nav-item text-muted-foreground"
      >
        <span class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </span>
        <span>More</span>
      </button>
    </div>
  </nav>

  <!-- More Drawer Sheet (hidden by default, slides up on More click) -->
  <div
    id="ikan-dock-more-drawer"
    class="pointer-events-auto fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
    style="display: none;"
    aria-hidden="true"
  >
    <div
      class="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[28px] border-t border-border/80 bg-background p-6 shadow-2xl"
    >
      <div class="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted"></div>
      <div class="flex items-center justify-between pb-4 border-b border-border/60">
        <h2 class="type-title-md font-semibold text-foreground">Explore iKAN</h2>
        <button
          type="button"
          id="ikan-dock-more-close"
          class="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground text-sm font-bold"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <a href="<?php echo esc_url( home_url( '/about' ) ); ?>" class="block rounded-[16px] bg-secondary p-3 text-foreground no-underline">
          <p class="font-semibold text-sm">About Us</p>
          <p class="text-xs text-muted-foreground mt-0.5">Our mission & story</p>
        </a>
        <a href="<?php echo esc_url( home_url( '/services' ) ); ?>" class="block rounded-[16px] bg-secondary p-3 text-foreground no-underline">
          <p class="font-semibold text-sm">Services</p>
          <p class="text-xs text-muted-foreground mt-0.5">Care options</p>
        </a>
        <a href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="block rounded-[16px] bg-secondary p-3 text-foreground no-underline">
          <p class="font-semibold text-sm">Contact Us</p>
          <p class="text-xs text-muted-foreground mt-0.5">Reach out</p>
        </a>
        <a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="block rounded-[16px] bg-secondary p-3 text-foreground no-underline">
          <p class="font-semibold text-sm">FAQs</p>
          <p class="text-xs text-muted-foreground mt-0.5">Common questions</p>
        </a>
        <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="block rounded-[16px] bg-secondary p-3 text-foreground no-underline">
          <p class="font-semibold text-sm">Calculator</p>
          <p class="text-xs text-muted-foreground mt-0.5">Burnout risk check</p>
        </a>
        <a href="<?php echo esc_url( home_url( '/org' ) ); ?>" class="block rounded-[16px] bg-secondary p-3 text-foreground no-underline">
          <p class="font-semibold text-sm">Organisations</p>
          <p class="text-xs text-muted-foreground mt-0.5">Corporate wellness</p>
        </a>
        <a href="<?php echo esc_url( home_url( '/join/partner' ) ); ?>" class="block rounded-[16px] bg-secondary p-3 text-foreground no-underline">
          <p class="font-semibold text-sm">Join Partner</p>
          <p class="text-xs text-muted-foreground mt-0.5">Therapist portal</p>
        </a>
        <a href="https://app.ikanhealth.in/login" class="block rounded-[16px] bg-foreground p-3 text-background no-underline">
          <p class="font-semibold text-sm text-background">Member Login</p>
          <p class="text-xs opacity-80 text-background mt-0.5">Sign in to app</p>
        </a>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  var moreBtn = document.getElementById('ikan-dock-more-btn');
  var drawer = document.getElementById('ikan-dock-more-drawer');
  var closeBtn = document.getElementById('ikan-dock-more-close');
  if (!moreBtn || !drawer) return;

  function openDrawer() {
    drawer.style.display = 'block';
    drawer.setAttribute('aria-hidden', 'false');
    moreBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.style.display = 'none';
    drawer.setAttribute('aria-hidden', 'true');
    moreBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  moreBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (drawer.style.display === 'none' || !drawer.style.display) {
      openDrawer();
    } else {
      closeDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  drawer.addEventListener('click', function(e) {
    if (e.target === drawer) closeDrawer();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer.style.display === 'block') closeDrawer();
  });
})();
</script>
