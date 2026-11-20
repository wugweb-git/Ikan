<?php
/**
 * Template Name: Assessments
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme site-page-below-nav">

  <?php
  // Get CMS content for the assessments page
  $cms_content = get_post_meta( get_the_ID(), 'page-assessments', true );
  $assessments_cms = [];
  if ( $cms_content ) {
    try { $assessments_cms = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Mental Health Assessments
        </h1>
        <p class="text-lg text-gray-600">
          Take our clinically validated assessments to understand your mental well-being.
        </p>
      </div>
    </div>
  </section>

  <!-- Available Assessments -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <?php 
        // Common assessments - would typically come from CMS or a custom post type
        $assessment_types = [
          ['name' => 'Anxiety (GAD-7)', 'description' => 'Generalized Anxiety Disorder assessment'],
          ['name' => 'Depression (PHQ-9)', 'description' => 'Depression severity assessment'],
          ['name' => 'Stress', 'description' => 'Perceived stress assessment'],
          ['name' => 'Burnout', 'description' => 'Employee burnout assessment'],
          ['name' => 'Well-being', 'description' => 'Overall wellness assessment'],
          ['name' => 'Sleep', 'description' => 'Sleep quality assessment'],
        ];
        
        foreach ( $assessment_types as $assessment ): 
        ?>
          <div class="p-6 border rounded-lg hover:border-primary transition-colors">
            <h3 class="text-xl font-medium text-gray-900 mb-2">
              <?php echo esc_html( $assessment['name'] ); ?>
            </h3>
            <p class="text-gray-500 text-sm">
              <?php echo esc_html( $assessment['description'] ); ?>
            </p>
            <a href="#" class="text-blue-600 hover:text-blue-800 mt-3 block">Take Assessment</a>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- Assessment Process -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium mb-3">
            1
          </div>
          <h3 class="font-medium text-gray-900">Choose an Assessment</h3>
          <p class="text-gray-500 text-sm">Select the assessment that best matches your concerns</p>
        </div>
        <div>
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium mb-3">
            2
          </div>
          <h3 class="font-medium text-gray-900">Answer Questions</h3>
          <p class="text-gray-500 text-sm">Answer a few simple, clinically-backed questions</p>
        </div>
        <div>
          <div class="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium mb-3">
            3
          </div>
          <h3 class="font-medium text-gray-900">Get Results</h3>
          <p class="text-gray-500 text-sm">Receive your results and recommendations</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Related Resources -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Related Resources</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-4 border rounded-lg">
          <p class="text-gray-500 text-sm">Mindfulness exercises</p>
        </div>
        <div class="p-4 border rounded-lg">
          <p class="text-gray-500 text-sm">Guided meditations</p>
        </div>
        <div class="p-4 border rounded-lg">
          <p class="text-gray-500 text-sm">Wellness articles</p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>