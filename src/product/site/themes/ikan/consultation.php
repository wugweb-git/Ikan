<?php
/**
 * Template Name: Consultation
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for consultation page
  $cms_content = get_post_meta( get_the_ID(), 'page-consultation', true );
  $consultation = [];
  if ( $cms_content ) {
    try { $consultation = json_decode( $cms_content, true ); } catch ( $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-blue-50 to-indigo-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Consultation & Professional Support
        </h1>
        <p class="text-lg text-gray-600">
          Connect with licensed therapists, psychiatrists, and counselors.
        </p>
      </div>
    </div>
  </section>

  <!-- Consultation Options -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-medium mb-3">
            📅
          </div>
          <h3 class="font-medium text-gray-900">Schedule a Session</h3>
          <p class="text-gray-500 text-sm">Book an appointment at your convenience</p>
        </div>
        <div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-medium mb-3">
            💬
          </div>
          <h3 class="font-medium text-gray-900">Talk Therapy</h3>
          <p class="text-gray-500 text-sm">Individual counseling sessions</p>
        </div>
        <div>
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-medium mb-3">
            💊
          </div>
          <h3 class="font-medium text-gray-900">Psychiatrist Evaluation</h3>
          <p class="text-gray-500 text-medical">Medication management and assessment</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Language & Mode Selection -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Choose Your Support</h2>
      <div>
        <p class="text-gray-600 mb-4">Select your preferred language and session mode:</p>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="font-medium">Languages:</p>
            <p class="text-sm text-gray-500">English, Hindi, Spanish, More</p>
          </div>
          <div>
            <p class="font-medium">Session Types:</p>
            <p class="text-sm text-gray-500">Video, Phone, In-person</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Find a Consultant -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Our Consultants</h2>
      <p class="text-gray-600 mb-4">Licensed professionals ready to support your mental health journey.</p>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-4 border rounded-lg hover:border-blue-500 transition-colors">
          <h3 class="font-medium text-gray-900">Dr. Sarah Johnson</h3>
          <p class="text-gray-500 text-sm">Clinical Psychologist</p>
        </div>
        <div class="p-4 border rounded-lg hover:border-blue-500 transition-colors">
          <h3 class="font-medium text-gray-900">Dr. Michael Chen</h3>
          <p class="text-gray-500 text-sm">Psychiatrist</p>
        </div>
        <div class="p-4 border rounded-lg hover:border-blue-500 transition-colors">
          <h3 class="font-medium text-gray-900">Maria Rodriguez</h3>
          <p class="text-gray-500 text-sm">Licensed Counselor</p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>