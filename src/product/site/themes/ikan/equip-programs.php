<?php
/**
 * Template Name: Equip Programs
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for the equip programs page
  $cms_content = get_post_meta( get_the_ID(), 'page-equip-programs', true );
  $equip_cms = [];
  if ( $cms_content ) {
    try { $equip_cms = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-green-50 to-green-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Equip Programs
        </h1>
        <p class="text-lg text-gray-600">
          Structured daily modules for building lasting mental wellness habits.
        </p>
      </div>
    </div>
  </section>

  <!-- Program Categories -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <?php 
        $program_categories = [
          'Sleep' => ['description' => 'Better sleep, better mental health'],
          'Stress' => ['description' => 'Stress management techniques'],
          'Anxiety' => ['description' => 'Anxiety reduction strategies'],
          'Burnout' => ['description' => 'Recover from workplace burnout'],
          'Work-Life' => ['description' => 'Balancing work and life'],
          'Wellness' => ['description' => ' holistic wellness programs'],
        ];
        
        foreach ( $program_categories as $category => $details ): 
        ?>
          <div class="p-6 border rounded-lg hover:border-primary transition-colors">
            <h3 class="text-xl font-medium text-gray-900">
              <?php echo esc_html( $category ); ?>
            </h3>
            <p class="text-gray-500 text-sm">
              <?php echo esc_html( $details['description'] ?? '' ); ?>
            </p>
            <a href="#" class="text-blue-600 hover:text-blue-800 mt-3 block">View Program</a>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- Program Features -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium mb-3">
            1
          </div>
          <h3 class="font-medium text-gray-900">Self-Paced Modules</h3>
          <p class="text-gray-500 text-sm">Complete modules at your own pace</p>
        </div>
        <div>
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium mb-3">
            2
          </div>
          <h3 class="font-medium text-gray-900">Mood Tracking</h3>
          <p class="text-gray-500 text-sm">Track your mood and progress</p>
        </div>
        <div>
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium mb-3">
            3
          </div>
          <h3 class="font-medium text-gray-900">Professional Support</h3>
          <p class="text-gray-500 text-sm">Access to consultants and therapists</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Success Stories -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Success Stories</h2>
      <p class="text-gray-600 mb-4">
        Join thousands who have improved their mental wellness with iKAN.
      </p>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-4 border rounded-lg">
          <p class="text-gray-500 text-sm">"The Equip program changed my life..."</p>
        </div>
        <div class="p-4 border rounded-lg">
          <p class="text-gray-500 text-sm">"I finally feel in control..."</p>
        </div>
        <div class="p-4 border rounded-lg">
          <p class="text-gray-500 text-sm">"Better than I expected..."</p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>