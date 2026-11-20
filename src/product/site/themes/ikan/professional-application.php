<?php
/**
 * Template Name: Professional Application
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for professional application
  $cms_content = get_post_meta( get_the_ID(), 'professional-application', true );
  $application = [];
  if ( $cms_content ) {
    try { $application = json_decode( $cms_content, true ); } catch ( $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-purple-50 to-violet-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Professional Application
        </h1>
        <p class="text-lg text-gray-600">
          Join our team of mental health professionals.
        </p>
      </div>
    </div>
  </section>

  <!-- Application Form -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Apply to Join iKAN</h2>
        
        <form class="space-y-6">
          <div>
            <label class="block text-gray-700 mb-2">Full Name</label>
            <input type="text" name="full_name" required 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Your full name"/>
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Email</label>
            <input type="email" name="email" required 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="your.email@example.com"/>
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Credentials</label>
            <input type="text" name="credentials" required 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="e.g., LCSW, PhD, MD"/>
          </div>
          <div>
            <label class="block text-gray-700 mb-2">License Number</label>
            <input type="text" name="license_number" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="State license number"/>
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Areas of Expertise</label>
            <textarea name="expertise" rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary resize-none"></textarea>
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Availability</label>
            <select name="availability" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary">
              <option value="">Select availability</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <button type="submit"
            class="w-full py-3 px-6 bg-primary text-white font-medium">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  </section>

  <!-- Why Join iKAN -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
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
    <div class="max-w-[1600px] mx-auto px-4">
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

<?php get_footer(); ?>