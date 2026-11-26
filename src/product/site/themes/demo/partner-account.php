<?php
/**
 * Template Name: Partner Account Portal
 * Template Post Type: page
 * Description: Dedicated Sign In and Account Management for iKAN Mental Health Clinicians & Therapists
 */

$assets = ikan_get_vite_assets();
$vite_js = $assets['js'] ?? '/assets/index-5S_-3E9M.js';
$vite_css = $assets['css'] ?? '/assets/index-ioCBHsFn.css';

$is_logged_in = is_user_logged_in();
$current_user = $is_logged_in ? wp_get_current_user() : null;

// Handle login POST if submitted directly
$login_error = '';
if ( 'POST' === $_SERVER['REQUEST_METHOD'] && isset( $_POST['partner_login_nonce'] ) ) {
  if ( wp_verify_nonce( $_POST['partner_login_nonce'], 'partner_login_action' ) ) {
    $creds = [
      'user_login'    => sanitize_text_field( $_POST['email'] ?? '' ),
      'user_password' => $_POST['password'] ?? '',
      'remember'      => ! empty( $_POST['remember'] ),
    ];
    $signon = wp_signon( $creds, is_ssl() );
    if ( is_wp_error( $signon ) ) {
      $login_error = $signon->get_error_message();
    } else {
      wp_safe_redirect( home_url( '/partner/account/' ) );
      exit;
    }
  } else {
    $login_error = 'Security check failed. Please refresh and try again.';
  }
}

get_header(); ?>

<main id="main-content" tabindex="-1" class="flex-1 w-full relative outline-none p-0" role="main" aria-label="Partner Account Portal">
  <div class="ikan2-theme ikan2-type accent-calm site-page-below-nav min-h-[calc(100vh-112px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="font-family: var(--font-sans); background: #FAF9F6; color: #151515;">
    
    <div class="site-container w-full max-w-4xl mx-auto">
      
      <?php if ( $is_logged_in ) : ?>
        <!-- ── Logged In Clinician Account Dashboard ── -->
        <div class="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/90 shadow-lg">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl" style="font-family: var(--font-display);">
                <?php echo esc_html( strtoupper( substr( $current_user->display_name ?: 'Clinician', 0, 1 ) ) ); ?>
              </div>
              <div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold mb-1">
                  <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                  Verified Provider
                </div>
                <h1 class="text-2xl font-bold text-gray-900" style="font-family: var(--font-display);">
                  Welcome, <?php echo esc_html( $current_user->display_name ?: $current_user->user_email ); ?>
                </h1>
                <p class="text-xs text-gray-500 mt-0.5">
                  Provider ID: #<?php echo esc_html( $current_user->ID ); ?> &bull; <?php echo esc_html( $current_user->user_email ); ?>
                </p>
              </div>
            </div>

            <a href="<?php echo esc_url( wp_logout_url( home_url( '/partner/account/' ) ) ); ?>" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
              <i data-lucide="log-out" class="w-4 h-4"></i>
              <span>Sign out</span>
            </a>
          </div>

          <!-- Quick Navigation Actions -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <a href="<?php echo esc_url( admin_url() ); ?>" class="p-5 rounded-2xl bg-gray-50 hover:bg-teal-50/50 border border-gray-200/80 hover:border-teal-300 transition-all group">
              <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
              </div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-teal-900">Clinical Dashboard</h3>
              <p class="text-xs text-gray-500 mt-1">Manage consultation slots, view patient intake summaries, and clinical tools.</p>
            </a>

            <div class="p-5 rounded-2xl bg-gray-50 border border-gray-200/80">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
                <i data-lucide="wallet" class="w-5 h-5"></i>
              </div>
              <h3 class="text-sm font-bold text-gray-900">Daily Settlements</h3>
              <p class="text-xs text-gray-500 mt-1">90% direct payouts reconciled to your registered bank account post session.</p>
            </div>

            <a href="<?php echo esc_url( home_url( '/partner/' ) ); ?>" class="p-5 rounded-2xl bg-gray-50 hover:bg-teal-50/50 border border-gray-200/80 hover:border-teal-300 transition-all group">
              <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3 group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <i data-lucide="file-text" class="w-5 h-5"></i>
              </div>
              <h3 class="text-sm font-bold text-gray-900 group-hover:text-purple-900">Network Guidelines</h3>
              <p class="text-xs text-gray-500 mt-1">Review the Anti-Interference Charter and matching protocol handbook.</p>
            </a>
          </div>

          <!-- Practice Status Callout -->
          <div class="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 text-teal-900">
              <i data-lucide="check-circle" class="w-4 h-4 text-teal-700 shrink-0"></i>
              <span>Your provider account is active. New client match introductions will be emailed to <strong><?php echo esc_html( $current_user->user_email ); ?></strong>.</span>
            </div>
            <a href="mailto:partner@ikanhealth.in" class="text-teal-800 hover:text-teal-950 font-semibold underline shrink-0 ml-4">Support</a>
          </div>

        </div>

      <?php else : ?>
        <!-- ── Provider Sign In Form ── -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Left Column: Trust & Portal Context -->
          <div class="lg:col-span-6 space-y-6">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase">
              <i data-lucide="shield-check" class="w-4 h-4 text-teal-600"></i>
              <span>Provider Network Portal</span>
            </div>

            <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight" style="font-family: var(--font-display);">
              Sign in to your<br>
              <span class="text-teal-800 italic font-serif">Practitioner Account</span>
            </h1>

            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              Access your consultation appointments, pre-screened client intake context, daily payout statements, and practice schedule.
            </p>

            <div class="space-y-3 pt-2 text-xs text-gray-600">
              <div class="flex items-center gap-2.5">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0"></i>
                <span>Strict clinical confidentiality &bull; Zero session recording</span>
              </div>
              <div class="flex items-center gap-2.5">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0"></i>
                <span>Direct daily settlement reports &bull; Fortnightly statements</span>
              </div>
              <div class="flex items-center gap-2.5">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-teal-600 shrink-0"></i>
                <span>Autonomous scheduling &bull; 100% agency over client care</span>
              </div>
            </div>

            <!-- New Partner Card -->
            <div class="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs mt-6">
              <h3 class="text-sm font-bold text-gray-900">Not yet an iKAN Provider?</h3>
              <p class="text-xs text-gray-600 mt-1 mb-3">Join verified therapists and psychologists across India. 90/10 split, zero listing fees.</p>
              <a href="<?php echo esc_url( home_url( '/partner/join/' ) ); ?>" class="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 underline">
                <span>Apply to join the network &rarr;</span>
              </a>
            </div>
          </div>

          <!-- Right Column: Sign In Card -->
          <div class="lg:col-span-6">
            <div class="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/90 shadow-xl max-w-md mx-auto">
              
              <div class="mb-6">
                <h2 class="text-xl font-bold text-gray-900" style="font-family: var(--font-display);">Provider Sign In</h2>
                <p class="text-xs text-gray-500 mt-1">Enter your registered clinician credentials</p>
              </div>

              <?php if ( ! empty( $login_error ) ) : ?>
                <div class="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs mb-5 flex items-start gap-2">
                  <i data-lucide="alert-circle" class="w-4 h-4 text-red-600 shrink-0 mt-0.5"></i>
                  <div><?php echo wp_kses_post( $login_error ); ?></div>
                </div>
              <?php endif; ?>

              <form method="post" action="<?php echo esc_url( home_url( '/partner/account/' ) ); ?>" class="space-y-4">
                <?php wp_nonce_field( 'partner_login_action', 'partner_login_nonce' ); ?>

                <div>
                  <label for="partner-email" class="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Registered Email</label>
                  <input 
                    type="email" 
                    id="partner-email" 
                    name="email" 
                    required 
                    placeholder="doctor@practice.com" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label for="partner-password" class="block text-xs font-bold uppercase tracking-wider text-gray-700">Password</label>
                    <a href="<?php echo esc_url( wp_lostpassword_url() ); ?>" class="text-[11px] text-teal-800 hover:underline">Forgot password?</a>
                  </div>
                  <input 
                    type="password" 
                    id="partner-password" 
                    name="password" 
                    required 
                    placeholder="••••••••••••" 
                    class="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:border-gray-900 focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div class="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="remember-me" name="remember" value="1" class="rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                  <label for="remember-me" class="text-xs text-gray-600">Keep me signed in on this device</label>
                </div>

                <button type="submit" class="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm shadow-md transition-colors mt-2">
                  <span>Sign In</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
              </form>

              <div class="border-t border-gray-100 mt-6 pt-5 text-center">
                <p class="text-xs text-gray-500">
                  Need help accessing your provider account?<br>
                  Contact <a href="mailto:partner@ikanhealth.in" class="text-teal-800 font-semibold hover:underline">partner@ikanhealth.in</a>
                </p>
              </div>

            </div>
          </div>

        </div>
      <?php endif; ?>

    </div>

  </div>
</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }
});
</script>

<!-- Vite React SPA Module Mount -->
<script type="module" crossorigin src="<?php echo esc_url( $vite_js ); ?>"></script>

<?php get_footer(); ?>
