<?php
/**
 * Template Name: Professional Application
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme site-page-below-nav">

  <?php
  // Get CMS content for professional application
  $cms_content = get_post_meta( get_the_ID(), 'professional-application', true );
  $application = [];
  if ( $cms_content ) {
    try { $application = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-purple-50 to-violet-100">
    <div class="site-container">
      <div class="relative z-10 max-w-2xl">
        <p class="text-sm uppercase tracking-wider font-semibold text-purple-700 mb-2">Partner With iKAN</p>
        <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Join our mental health provider network
        </h1>
        <p class="text-base md:text-lg text-gray-600 leading-relaxed">
          Provide therapy, counselling, and psychiatric consultations with complete scheduling flexibility, guaranteed prompt payouts, and a supportive clinical ecosystem.
        </p>
      </div>
    </div>
  </section>

  <!-- Application Form -->
  <section class="py-12">
    <div class="site-container">
      <div class="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Therapist & Consultant Application</h2>
        <p class="text-gray-500 text-sm mb-8">Please complete your details below. Our clinical verification team reviews applications within 3–5 business days.</p>
        
        <?php
        if ( function_exists( 'wpFluent' ) && shortcode_exists( 'fluentform' ) ) {
          echo do_shortcode( '[fluentform id="4"]' );
        } else {
        ?>
        <form class="space-y-6" method="POST" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
          <input type="hidden" name="action" value="submit_partner_application">
          <?php wp_nonce_field( 'partner_application_nonce' ); ?>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="full_name" required 
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Dr. / Ms. / Mr. Full Name"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input type="email" name="email" required 
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="name@practice.com"/>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input type="tel" name="phone" required 
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+91 98765 43210"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Professional Title *</label>
              <select name="professional_title" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select title</option>
                <option value="Clinical Psychologist">Clinical Psychologist</option>
                <option value="Counselling Psychologist">Counselling Psychologist</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Psychotherapist">Psychotherapist</option>
                <option value="Counsellor">Counsellor</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">City / State *</label>
              <input type="text" name="city" required 
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Mumbai, Maharashtra"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">License / Registration Number</label>
              <input type="text" name="license_number" 
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="RCI / NMC / State Medical Council reg no."/>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise & Languages</label>
            <textarea name="expertise" rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. CBT, Trauma-informed care, Anxiety, Depression. Languages spoken: English, Hindi..."></textarea>
          </div>

          <button type="submit"
            class="w-full md:w-auto px-8 py-3 bg-[#1A1A1A] text-white font-medium rounded-lg hover:bg-black transition-all">
            Submit Application
          </button>
        </form>
        <?php } ?>
      </div>
    </div>
  </section>

  <!-- Why Join iKAN -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1100px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Why Join iKAN?</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-4 border rounded-lg">
          <p class="font-medium">Competitive Compensation</p>
          <p class="text-sm text-gray-500">Fair and competitive rates</p>
        </div>
        <div class="p-4 border rounded-lg">
          <p class="font-medium">Flexible Schedule</p>
          <p class="text-sm text-gray-500">Set your own hours</p>
        </div>
        <div class="p-4 border rounded-lg">
          <p class="font-medium">Professional Development</p>
          <p class="text-sm text-gray-500">Ongoing training and growth</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Benefits -->
  <section class="py-12">
    <div class="max-w-[1100px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Benefits</h2>
      <ul class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <li class="p-4 border rounded-lg">
          <p class="font-medium">Health Insurance</p>
          <p class="text-sm text-gray-500"> comprehensive medical/dental</p>
        </li>
        <li class="p-4 border rounded-lg">
          <p class="font-medium">Retirement Plan</p>
          <p class="text-sm text-gray-500">401(k) with company match</p>
        </li>
        <li class="p-4 border rounded-lg">
          <p class="font-medium">CPD Budget</p>
          <p class="text-sm text-gray-500">Annual professional development</p>
        </li>
      </ul>
    </div>
  </section>

</main>

<script>
document.addEventListener("DOMContentLoaded", function() {
  var pForm = document.querySelector("form[action*='submit_partner_application']");
  if (pForm) {
    pForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var btn = pForm.querySelector("button[type='submit']");
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = "Submitting Application...";
      }
      var fd = new FormData(pForm);
      fd.append("action", "ikan_submit_partner_application");

      fetch("<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>", {
        method: "POST",
        body: fd
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.success) {
          pForm.parentElement.innerHTML = "<div class='bg-emerald-50 border border-emerald-200 text-emerald-900 p-8 rounded-2xl text-center space-y-4 my-4'><svg xmlns='http://www.w3.org/2000/svg' width='52' height='52' viewBox='0 0 24 24' fill='none' stroke='#059669' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='mx-auto'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path><polyline points='22 4 12 14.01 9 11.01'></polyline></svg><h3 class='text-2xl font-bold'>Application Submitted!</h3><p class='text-base'>" + (data.data && data.data.message ? data.data.message : "Thank you for applying to partner with iKAN. Our clinical team will verify your details and reply within 3–5 business days.") + "</p></div>";
        } else {
          alert(data && data.data && data.data.message ? data.data.message : "An error occurred while submitting. Please try again.");
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = "Submit Application";
          }
        }
      })
      .catch(function(err) {
        alert("An error occurred. Please try again or email support@ikanhealth.in");
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = "Submit Application";
        }
      });
    });
  }
});
</script>

<?php get_footer(); ?>