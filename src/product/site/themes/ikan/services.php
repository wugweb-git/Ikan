<?php
/**
 * Template Name: Services
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content and data
  $cms_content = get_post_meta( get_the_ID(), 'page-services', true );
  $services = [];
  if ( $cms_content ) {
    try { $services = json_decode( $cms_content, true ); } catch ( $e ) {}
  }
  ?>
  
  <?php
  // Get assessment data
  $assessments = get_posts([
    'post_type' => 'assessment',
    'numberposts' => 5,
  ]);
  ?>
  
  <?php
  // Get program data
  $programs = get_posts([
    'post_type' => 'program',
    'numberposts' => 3,
  ]);
  ?>

  <!-- Hero Section -->
  <section class="py-16">
    <div class="max-w-[1600px] mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Our Services
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        We offer a range of mental health services and programs designed to support your wellness journey.
      </p>
    </div>
  </section>

  <!-- Assessment Stats -->
  <section class="py-8 border-y border-gray-100">
    <div class="max-w-[1600px] mx-auto px-4 grid grid-cols-1 gap-6 md:grid-cols-4">
      <div>
        <p class="text-3xl font-bold text-primary">
          <?php echo count( $assessments ); ?>
        </p>
        <p class="text-gray-500">Assessments</p>
      </div>
      <div>
        <p class="text-3xl font-bold text-primary">
          <?php echo count( $programs ); ?>
        </p>
        <p class="text-gray-500">Programs</p>
      </div>
    </div>
  </section>

  <!-- Services Sections -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      
      <!-- Assessment Programs -->
      <div class="mb-12">
        <h2 class="text-2xl font-medium text-gray-900 mb-4">Mental Health Assessments</h2>
        <p class="text-gray-600 mb-4">
          We offer clinically validated assessments for conditions including anxiety, depression, stress, and burnout.
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <?php foreach ( $assessments as $post ): ?>
            <article class="p-4 border rounded-lg hover:border-primary transition-colors">
              <h3 class="font-medium text-gray-900">
                <?php the_title(); ?>
              </h3>
              <p class="text-gray-500 text-sm mt-1">
                <?php echo get_the_excerpt( $post->ID ); ?>
              </p>
              <a href="<?php echo get_permalink( $post->ID ); ?>" class="text-blue-600 hover:text-blue-800 mt-2 block">Take Assessment</a>
            </article>
          <?php endforeach; ?>
        </div>
      </div>

      <!-- Equip Programs -->
      <div>
        <h2 class="text-2xl font-medium text-gray-900 mb-4">Equip Programs</h2>
        <p class="text-gray-600 mb-4">
          Structured daily modules for building lasting mental wellness habits.
        </p>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <?php foreach ( $programs as $post ): ?>
            <article class="p-4 border rounded-lg hover:border-primary transition-colors">
              <h3 class="font-medium text-gray-900">
                <?php the_title(); ?>
              </h3>
              <p class="text-gray-500 text-sm mt-1">
                <?php echo get_the_excerpt( $post->ID ); ?>
              </p>
              <a href="<?php echo get_permalink( $post->ID ); ?>" class="text-blue-600 hover:text-blue-800 mt-2 block">View Program</a>
            </article>
          <?php endforeach; ?>
        </div>
      </div>

    </div>
  </section>

  <!-- Consultation Section -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">
        Consultation & Professional Support
      </h2>
      <p class="text-gray-600 mb-6">
        Our licensed professionals are available to support you with personalized care. Choose your preferred language and session mode.
      </p>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-6 border rounded-lg">
          <h3>Therapists</h3>
          <p>Licensed professionals for talk therapy and counseling</p>
        </div>
        <div class="p-6 border rounded-lg">
          <h3>Psychiatrists</h3>
          <p>Medication management and psychiatric evaluation</p>
        </div>
        <div class="p-6 border rounded-lg">
          <h3>Language Options</h3>
          <p>English, Hindi, and other languages available</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Stay Informed</h2>
      <p class="text-gray-600 mb-4">
        Get weekly mental health tips, early access to new features, and exclusive resources.
      </p>
      <form class="max-w-md">
        <div class="flex space-x-2">
          <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-2 border rounded-l-lg" />
          <button type="submit" class="px-6 py-2 bg-primary text-white rounded-r-lg font-medium">Subscribe</button>
        </div>
      </form>
    </div>
  </section>

</main>

<?php get_footer(); ?>