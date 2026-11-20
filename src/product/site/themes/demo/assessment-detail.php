<?php
/**
 * Template Name: Assessment Detail
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme site-page-below-nav">

  <?php
  // Get CMS content for assessment detail
  $cms_content = get_post_meta( get_the_ID(), 'assessment-detail', true );
  $assessment = [];
  if ( $cms_content ) {
    try { $assessment = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-gray-50 to-gray-100">
    <div class="max-w-[1100px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Assessment Detail
        </h1>
        <p class="text-lg text-gray-600">
          Clinically validated mental health assessment.
        </p>
      </div>
    </div>
  </section>

  <!-- Assessment Content -->
  <section class="py-12">
    <div class="max-w-[1100px] mx-auto px-4">
      <div class="prose prose-in max-w-prose">
        <?php if ( $assessment ): ?>
          <?php echo wp_kses_post( $assessment['content'] ?? '' ); ?>
        <?php else: ?>
          <p class="text-gray-600">
            Assessment details will be populated from the WordPress CMS.
          </p>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <!-- Assessment Results -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1100px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Your Results</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900">Score Interpretation</h3>
          <p class="text-gray-500 text-sm">Based on your responses...</p>
        </div>
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900">Recommendations</h3>
          <p class="text-gray-500 text-sm">Personalized suggestions for your well-being.</p>
        </div>
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900">Next Steps</h3>
          <p class="text-gray-500 text-sm">Recommended actions based on your results.</p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>