<?php
/**
 * Template Name: Authentication & Onboarding
 * Template Post Type: page
 * Description: Dedicated Sign In, Sign Up, and User Onboarding template powered by Fluent Forms & WordPress Auth
 */

get_header(); ?>

<main class="ikan2-theme site-page-below-nav min-h-[calc(100vh-112px)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gray-50/60" style="font-family: var(--font-sans);">
  <div class="site-container w-full max-w-5xl">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      
      <!-- Left Column: Trust Pillars & Brand Messaging -->
      <div class="lg:col-span-5 space-y-6">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider border border-emerald-100">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Mental Wellbeing Platform
        </div>

        <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Your mental health journey starts here.
        </h1>

        <p class="text-base md:text-lg text-gray-600 leading-relaxed">
          Access clinically validated assessments, personalized Equip programs, and licensed therapist support tailored to your life.
        </p>

        <!-- Trust Badges -->
        <div class="space-y-4 pt-2">
          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <i data-lucide="shield-check" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Private &amp; Secure</h4>
              <p class="text-xs text-gray-500">Your health data is encrypted and never shared without your permission.</p>
            </div>
          </div>

          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <i data-lucide="award" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Evidence-Based</h4>
              <p class="text-xs text-gray-500">Built upon scientifically validated psychological models and clinical protocols.</p>
            </div>
          </div>

          <div class="flex items-start gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <i data-lucide="heart-handshake" class="w-5 h-5"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-gray-900">Professional Support</h4>
              <p class="text-xs text-gray-500">Connect seamlessly with licensed counselling psychologists and psychiatrists.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Auth Card (Sign In / Sign Up & Onboard) -->
      <div class="lg:col-span-7">
        <div class="bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/40 p-6 sm:p-10 relative overflow-hidden">
          
          <!-- Tab Navigation -->
          <div class="flex rounded-xl bg-gray-100 p-1 mb-8" role="tablist">
            <button type="button" id="tab-btn-signin" class="auth-tab flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all bg-white text-gray-900 shadow-sm" onclick="switchAuthTab('signin')">
              Sign In
            </button>
            <button type="button" id="tab-btn-signup" class="auth-tab flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all text-gray-500 hover:text-gray-900" onclick="switchAuthTab('signup')">
              Create Account
            </button>
          </div>

          <div id="auth-alert" class="hidden mb-6 p-4 rounded-xl text-sm font-medium"></div>

          <!-- ── TAB 1: SIGN IN ── -->
          <div id="auth-pane-signin" class="space-y-5">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-gray-900">Welcome back</h2>
              <p class="text-xs text-gray-500">Sign in to track your assessments and continue your journey.</p>
            </div>

            <form id="form-user-login" class="space-y-4" method="POST">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Email Address</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <i data-lucide="mail" class="w-4 h-4"></i>
                  </span>
                  <input type="email" name="email" required placeholder="you@example.com"
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600">Password</label>
                  <a href="<?php echo esc_url( wp_lostpassword_url() ); ?>" class="text-xs text-gray-500 hover:text-black">Forgot password?</a>
                </div>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <i data-lucide="lock" class="w-4 h-4"></i>
                  </span>
                  <input type="password" name="password" required placeholder="••••••••"
                    class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                </div>
              </div>

              <div class="flex items-center">
                <input type="checkbox" id="login-remember" name="remember" class="w-4 h-4 text-black rounded border-gray-300 focus:ring-black">
                <label for="login-remember" class="ml-2 block text-xs text-gray-600">Remember this device</label>
              </div>

              <button type="submit" id="btn-login-submit"
                class="w-full py-3 px-6 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm">
                <span>Sign In</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
              </button>
            </form>

            <div class="pt-2 border-t border-gray-100 text-center">
              <button type="button" onclick="fillDemoAccount()" class="inline-flex items-center justify-center min-h-[44px] py-2 px-3 text-xs text-gray-500 hover:text-black font-medium underline">
                Quick Demo: demo@ikanhealth.in / password123
              </button>
            </div>
          </div>

          <!-- ── TAB 2: SIGN UP & ONBOARDING (2 STEPS) ── -->
          <div id="auth-pane-signup" class="space-y-5 hidden">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-gray-900">Start your wellbeing journey</h2>
              <p class="text-xs text-gray-500">Create an account to save your assessments and access Equip programs.</p>
            </div>

            <form id="form-user-register" class="space-y-4" method="POST">
              <!-- Step 1: User Profile -->
              <div id="signup-step-1" class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Full Name *</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <i data-lucide="user" class="w-4 h-4"></i>
                    </span>
                    <input type="text" name="full_name" required placeholder="Enter your full name"
                      class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Email Address *</label>
                  <div class="relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <i data-lucide="mail" class="w-4 h-4"></i>
                    </span>
                    <input type="email" name="email" required placeholder="name@example.com"
                      class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Password *</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <i data-lucide="lock" class="w-4 h-4"></i>
                      </span>
                      <input type="password" name="password" required placeholder="Min 8 characters"
                        class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Phone (Optional)</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <i data-lucide="phone" class="w-4 h-4"></i>
                      </span>
                      <input type="tel" name="phone" placeholder="+91 98765 43210"
                        class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
                    </div>
                  </div>
                </div>

                <button type="button" onclick="goToStep2()"
                  class="w-full py-3 px-6 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm mt-4">
                  <span>Continue: Select Focus Areas</span>
                  <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
              </div>

              <!-- Step 2: Onboarding Focus Areas (from ikan2 GetStarted.tsx) -->
              <div id="signup-step-2" class="space-y-4 hidden">
                <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                  <p class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Step 2 of 2: Onboarding</p>
                  <h3 class="text-sm font-bold text-gray-900 mb-1">What would you like to focus on first?</h3>
                  <p class="text-xs text-gray-500">Pick any areas you care about to tailor your initial recommendations.</p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <?php
                  $areas = [ 'Sleep', 'Stress', 'Anxiety', 'Low mood', 'Burnout', 'Focus', 'Work-life balance' ];
                  foreach ( $areas as $idx => $area ) :
                    $checked = in_array( $area, [ 'Sleep', 'Stress' ] ) ? 'checked' : '';
                  ?>
                  <label class="focus-pill cursor-pointer flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-700 hover:border-black hover:bg-gray-50 transition-all select-none has-[:checked]:border-black has-[:checked]:bg-black has-[:checked]:text-white">
                    <input type="checkbox" name="focus_areas[]" value="<?php echo esc_attr( $area ); ?>" <?php echo $checked; ?> class="sr-only">
                    <span><?php echo esc_html( $area ); ?></span>
                  </label>
                  <?php endforeach; ?>
                </div>

                <div class="flex items-center gap-3 pt-3">
                  <button type="button" onclick="goToStep1()" class="py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all text-xs">
                    Back
                  </button>
                  <button type="submit" id="btn-register-submit"
                    class="flex-1 py-3 px-6 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm">
                    <span>Create Account &amp; Finish</span>
                    <i data-lucide="check" class="w-4 h-4"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <!-- Footnote -->
          <p class="mt-6 text-center text-xs text-gray-400">
            By continuing, you agree to our 
            <a href="<?php echo esc_url( home_url( '/terms/' ) ); ?>" class="text-gray-600 hover:text-black underline">Terms of Use</a> and 
            <a href="<?php echo esc_url( home_url( '/privacy-policy/' ) ); ?>" class="text-gray-600 hover:text-black underline">Privacy Policy</a>.
          </p>

        </div>
      </div>

    </div>
  </div>
</main>

<script>
function switchAuthTab(tab) {
  var bSign = document.getElementById("tab-btn-signin");
  var bReg = document.getElementById("tab-btn-signup");
  var pSign = document.getElementById("auth-pane-signin");
  var pReg = document.getElementById("auth-pane-signup");
  var alertBox = document.getElementById("auth-alert");
  if (alertBox) alertBox.classList.add("hidden");

  if (tab === "signin") {
    bSign.className = "auth-tab flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all bg-white text-gray-900 shadow-sm";
    bReg.className = "auth-tab flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all text-gray-500 hover:text-gray-900";
    pSign.classList.remove("hidden");
    pReg.classList.add("hidden");
  } else {
    bReg.className = "auth-tab flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all bg-white text-gray-900 shadow-sm";
    bSign.className = "auth-tab flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all text-gray-500 hover:text-gray-900";
    pReg.classList.remove("hidden");
    pSign.classList.add("hidden");
  }
}

function goToStep2() {
  var form = document.getElementById("form-user-register");
  var name = form.querySelector("input[name='full_name']").value.trim();
  var email = form.querySelector("input[name='email']").value.trim();
  var pass = form.querySelector("input[name='password']").value;

  var alertBox = document.getElementById("auth-alert");
  if (!name || !email || !pass) {
    showAlert("Please fill in your name, email, and password.", "error");
    return;
  }
  if (pass.length < 8) {
    showAlert("Password must be at least 8 characters long.", "error");
    return;
  }
  if (alertBox) alertBox.classList.add("hidden");

  document.getElementById("signup-step-1").classList.add("hidden");
  document.getElementById("signup-step-2").classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function goToStep1() {
  document.getElementById("signup-step-2").classList.add("hidden");
  document.getElementById("signup-step-1").classList.remove("hidden");
}

function fillDemoAccount() {
  var form = document.getElementById("form-user-login");
  form.querySelector("input[name='email']").value = "demo@ikanhealth.in";
  form.querySelector("input[name='password']").value = "password123";
}

function showAlert(msg, type) {
  var box = document.getElementById("auth-alert");
  if (!box) return;
  box.innerHTML = msg;
  box.className = "mb-6 p-4 rounded-xl text-sm font-medium " + 
    (type === "error" ? "bg-red-50 text-red-800 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200");
  box.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", function() {
  // Check URL query params for ?tab=signup or ?action=onboarding
  var params = new URLSearchParams(window.location.search);
  if (params.get("tab") === "signup" || window.location.pathname.indexOf("signup") !== -1 || window.location.pathname.indexOf("onboarding") !== -1 || window.location.pathname.indexOf("get-started") !== -1) {
    switchAuthTab("signup");
  }

  // Handle Login Form Submission
  var loginForm = document.getElementById("form-user-login");
  if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var btn = document.getElementById("btn-login-submit");
      btn.disabled = true;
      btn.innerHTML = "<span>Signing In...</span>";

      var fd = new FormData(loginForm);
      fd.append("action", "ikan_user_login");

      fetch("<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>", {
        method: "POST",
        body: fd
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.success) {
          showAlert(data.data.message || "Welcome back!", "success");
          setTimeout(function() {
            window.location.href = data.data.redirect || "<?php echo esc_url( home_url( '/assessments/' ) ); ?>";
          }, 600);
        } else {
          showAlert(data && data.data && data.data.message ? data.data.message : "Login failed. Please check credentials.", "error");
          btn.disabled = false;
          btn.innerHTML = "<span>Sign In</span><i data-lucide='arrow-right' class='w-4 h-4'></i>";
          if (window.lucide) lucide.createIcons();
        }
      })
      .catch(function() {
        showAlert("Connection error. Please try again.", "error");
        btn.disabled = false;
        btn.innerHTML = "<span>Sign In</span><i data-lucide='arrow-right' class='w-4 h-4'></i>";
      });
    });
  }

  // Handle Registration & Onboarding Form Submission
  var regForm = document.getElementById("form-user-register");
  if (regForm) {
    regForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var btn = document.getElementById("btn-register-submit");
      btn.disabled = true;
      btn.innerHTML = "<span>Creating Account...</span>";

      var fd = new FormData(regForm);
      fd.append("action", "ikan_user_register");

      fetch("<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>", {
        method: "POST",
        body: fd
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.success) {
          showAlert(data.data.message || "Account created! Redirecting...", "success");
          setTimeout(function() {
            window.location.href = data.data.redirect || "<?php echo esc_url( home_url( '/assessments/' ) ); ?>";
          }, 800);
        } else {
          showAlert(data && data.data && data.data.message ? data.data.message : "Registration failed. Please try again.", "error");
          btn.disabled = false;
          btn.innerHTML = "<span>Create Account &amp; Finish</span><i data-lucide='check' class='w-4 h-4'></i>";
          if (window.lucide) lucide.createIcons();
        }
      })
      .catch(function() {
        showAlert("Connection error. Please try again.", "error");
        btn.disabled = false;
        btn.innerHTML = "<span>Create Account &amp; Finish</span><i data-lucide='check' class='w-4 h-4'></i>";
      });
    });
  }
});
</script>

<?php get_footer(); ?>
