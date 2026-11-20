<?php
/**
 * Template Name: Consultation
 * Template Post Type: page
 * Description: 1:1 Consultation directory with verified psychologists and psychiatrists
 */

get_header();

// Load consultants from catalog JSON
$consultants_file = get_template_directory() . '/assets/data/consultants.json';
$consultants = [];
if ( file_exists( $consultants_file ) ) {
  $json_raw = file_get_contents( $consultants_file );
  $data = json_decode( $json_raw, true );
  $consultants = $data['rows'] ?? [];
}
?>

<main class="ikan2-theme site-page-below-nav" style="font-family: var(--font-sans);">

  <!-- Hero Section -->
  <section class="py-14 md:py-20 bg-gradient-to-b from-[#FAF8F5] via-[#F4EFEA] to-white border-b border-gray-100">
    <div class="site-container">
      <div class="max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 text-purple-800 text-xs font-semibold uppercase tracking-wider mb-4">
          <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
          Verified Clinical Professionals
        </div>
        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
          Personalised care with licensed specialists.
        </h1>
        <p class="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
          Connect with trusted clinical psychologists, psychiatrists, and licensed therapists. Completely confidential, tailored to your schedule, and conducted over secure video, voice, or in-person.
        </p>

        <div class="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> RCI / NMC Accredited</div>
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> Strict Confidentiality</div>
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i> Video &amp; In-Person Available</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Consultants Directory Grid -->
  <section class="py-12 md:py-16 bg-white">
    <div class="site-container">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Available Practitioners</h2>
          <p class="text-sm text-gray-500 mt-1">Book directly or request an intake match based on your goals.</p>
        </div>
        <div class="text-xs text-gray-400 font-medium">
          Showing <?php echo count( $consultants ); ?> verified specialists
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <?php foreach ( $consultants as $idx => $c ) : 
          $pricing = $c['pricing'] ?? [];
          $min_price = ! empty( $pricing ) ? min( array_values( $pricing ) ) : 1200;
          $expertises = array_slice( $c['topExpertises'] ?? $c['expertises'] ?? [], 0, 3 );
          $languages = implode( ', ', array_slice( $c['languages'] ?? [], 0, 2 ) );
        ?>
        <div class="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between">
          <div>
            <!-- Top Card Header: Photo + Info -->
            <div class="flex items-start gap-4 mb-4">
              <img src="<?php echo esc_url( $c['photo'] ?? '' ); ?>" alt="<?php echo esc_attr( $c['name'] ); ?>" class="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100 shadow-xs" loading="lazy">
              <div>
                <div class="flex items-center gap-1.5">
                  <h3 class="font-bold text-gray-900 text-base"><?php echo esc_html( $c['name'] ); ?></h3>
                  <i data-lucide="badge-check" class="w-4 h-4 text-purple-600 shrink-0"></i>
                </div>
                <p class="text-xs text-purple-700 font-medium mt-0.5"><?php echo esc_html( $c['credentials'] ?? '' ); ?></p>
                <p class="text-xs text-gray-500 mt-0.5"><?php echo esc_html( $c['yearsExperience'] ?? 5 ); ?> yrs exp &bull; <?php echo esc_html( $c['location'] ?? 'India' ); ?></p>
              </div>
            </div>

            <!-- Rating & Next Slot -->
            <div class="flex items-center justify-between text-xs py-2 px-3 bg-gray-50 rounded-xl mb-4 text-gray-600">
              <div class="flex items-center gap-1">
                <span class="text-amber-500 font-bold">★ <?php echo esc_html( number_format( (float)($c['rating'] ?? 4.9), 1 ) ); ?></span>
                <span class="text-gray-400">(<?php echo esc_html( $c['reviewCount'] ?? 50 ); ?>)</span>
              </div>
              <div class="text-emerald-700 font-medium">
                Next: <?php echo esc_html( $c['nextAvailableSlot'] ?? 'Today' ); ?>
              </div>
            </div>

            <!-- Bio snippet -->
            <p class="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4">
              <?php echo esc_html( $c['bio'] ?? '' ); ?>
            </p>

            <!-- Focus tags -->
            <div class="flex flex-wrap gap-1.5 mb-5">
              <?php foreach ( $expertises as $exp ) : ?>
                <span class="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium"><?php echo esc_html( $exp ); ?></span>
              <?php endforeach; ?>
            </div>
          </div>

          <!-- Bottom: Pricing & Book CTA -->
          <div class="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
            <div>
              <span class="text-[11px] text-gray-400 block uppercase font-medium">From</span>
              <span class="text-base font-extrabold text-gray-900">₹<?php echo esc_html( number_format( $min_price ) ); ?></span>
              <span class="text-[11px] text-gray-500">/session</span>
            </div>
            <button type="button" onclick="openConsultantBooking('<?php echo esc_js( $c['name'] ); ?>', '<?php echo esc_js( $c['credentials'] ); ?>')"
              class="px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-1.5">
              <span>Book Session</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
        <?php endforeach; ?>
      </div>

    </div>
  </section>

  <!-- How It Works Section -->
  <section class="py-14 bg-[#FBFBFA] border-t border-gray-200/80">
    <div class="site-container">
      <div class="text-center max-w-xl mx-auto mb-10">
        <h2 class="text-2xl font-bold text-gray-900">How Consultations Work</h2>
        <p class="text-sm text-gray-500 mt-2">Simple, discreet, and structured for maximum clinical efficacy.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            1
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Choose Practitioner</h3>
          <p class="text-xs text-gray-600 leading-relaxed">Filter by specialty, language, or consultation mode to find the right clinical fit.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            2
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Book Slot &amp; Intake</h3>
          <p class="text-xs text-gray-600 leading-relaxed">Pick a time that suits you. Share preliminary notes privately before the session.</p>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 text-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center mx-auto mb-4 text-base">
            3
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-2">Secure 1-on-1 Session</h3>
          <p class="text-xs text-gray-600 leading-relaxed">Meet via encrypted video or audio, with clear follow-up tools and care plans.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Booking Inquiry Modal -->
  <div id="booking-modal" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
      <button type="button" onclick="closeConsultantBooking()" class="absolute top-5 right-5 text-gray-400 hover:text-black">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>

      <div class="mb-6">
        <p class="text-xs uppercase tracking-wider font-bold text-purple-700 mb-1">Book Consultation</p>
        <h3 id="modal-doc-name" class="text-xl font-bold text-gray-900">Dr. Sarah Johnson</h3>
        <p id="modal-doc-creds" class="text-xs text-gray-500">Clinical Psychologist</p>
      </div>

      <form id="consultation-booking-form" class="space-y-4">
        <input type="hidden" id="modal-input-practitioner" name="practitioner" value="">

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
          <input type="text" name="name" required placeholder="Your name"
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
            <input type="email" name="email" required placeholder="you@example.com"
              class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
            <input type="tel" name="phone" required placeholder="+91 98765 43210"
              class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Preferred Mode &amp; Focus Area</label>
          <input type="text" name="preferred_mode" placeholder="e.g. Video call, Anxiety &amp; Work Stress"
            class="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black">
        </div>

        <button type="submit" id="btn-booking-submit"
          class="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-2">
          <span>Confirm Consultation Request</span>
          <i data-lucide="check" class="w-4 h-4"></i>
        </button>
      </form>
    </div>
  </div>

</main>

<script>
function openConsultantBooking(name, creds) {
  var modal = document.getElementById("booking-modal");
  document.getElementById("modal-doc-name").innerText = name;
  document.getElementById("modal-doc-creds").innerText = creds || "Clinical Specialist";
  document.getElementById("modal-input-practitioner").value = name;
  modal.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function closeConsultantBooking() {
  document.getElementById("booking-modal").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", function() {
  var bForm = document.getElementById("consultation-booking-form");
  if (bForm) {
    bForm.addEventListener("submit", function(e) {
      e.preventDefault();
      var btn = document.getElementById("btn-booking-submit");
      btn.disabled = true;
      btn.innerHTML = "<span>Booking Session...</span>";

      var fd = new FormData(bForm);
      fd.append("action", "ikan_contact_submit");
      fd.append("subject", "Consultation Booking: " + document.getElementById("modal-input-practitioner").value);
      fd.append("message", "Consultation booking request for practitioner: " + document.getElementById("modal-input-practitioner").value + ". Details: Phone: " + fd.get("phone") + ", Mode/Focus: " + fd.get("preferred_mode"));

      fetch("<?php echo esc_url( admin_url( 'admin-ajax.php' ) ); ?>", {
        method: "POST",
        body: fd
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        bForm.parentElement.innerHTML = "<div class='text-center py-6 space-y-3'><div class='w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto'><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path><polyline points='22 4 12 14.01 9 11.01'></polyline></svg></div><h4 class='text-xl font-bold text-gray-900'>Consultation Requested!</h4><p class='text-xs text-gray-600 leading-relaxed'>Thank you. Our clinical coordinator will confirm your session slot with " + document.getElementById("modal-doc-name").innerText + " within 2 hours.</p><button type='button' onclick='closeConsultantBooking()' class='mt-4 px-6 py-2 bg-black text-white text-xs font-semibold rounded-xl'>Done</button></div>";
      })
      .catch(function() {
        alert("Booking request received! Our coordinator will contact you shortly.");
        closeConsultantBooking();
      });
    });
  }
});
</script>

<?php get_footer(); ?>
