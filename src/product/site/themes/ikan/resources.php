<?php
/**
 * Template Name: Resources
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for the resources page
  $cms_content = get_post_meta( get_the_ID(), 'page-resources', true );
  $resources_cms = [];
  if ( $cms_content ) {
    try { $resources_cms = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-blue-50 to-indigo-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Resources
        </h1>
        <p class="text-lg text-gray-600">
          Articles, guides, and tools for your mental wellness journey.
        </p>
      </div>
    </div>
  </section>

  <!-- Resource Categories -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <?php 
        $resource_categories = [
          'Read' => ['count' => 15, 'description' => 'Articles and e-books'],
          'Watch' => ['count' => 10, 'description' => 'Video content and webinars'],
          'Listen' => ['count' => 20, 'description' => 'Podcasts and audio guides'],
        ];
        
        foreach ( $resource_categories as $category => $details ): 
        ?>
          <div class="p-6 border rounded-lg hover:border-primary transition-colors">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-blue-600" aria-hidden="true" focusable="false">
                <use href="#icon-file" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-900">
              <?php echo esc_html( $category ); ?>
            </h3>
            <p class="text-gray-500 text-sm">
              <?php echo esc_html( $details['description'] ?? '' ); ?>
            </p>
            <p class="text-gray-400 text-sm mt-1">
              <?php echo esc_html( $details['count'] ?? '0' ); ?> resources
            </p>
            <a href="#" class="text-blue-600 hover:text-blue-800 mt-2 block">View Resources</a>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- Featured Resources -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900 mb-2">Featured Article</h3>
          <p class="text-gray-600 text-sm">Understanding burnout: signs and solutions</p>
          <a href="#" class="text-blue-600 hover:text-blue-800">Read article</a>
        </div>
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900 mb-2">Guided Meditation</h3>
          <p class="text-gray-600 text-sm">10-minute mindfulness practice</p>
          <a href="#" class="text-blue-600 hover:text-blue-800">Listen now</a>
        </div>
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900 mb-2">Video Library</h3>
          <p class="text-gray-600 text-sm">Webinars on mental health topics</p>
          <a href="#" class="text-blue-600 hover:text-blue-800">Watch videos</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter Signup -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Stay Updated</h2>
      <p class="text-gray-600 mb-4">Get the latest mental health resources delivered to your inbox.</p>
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