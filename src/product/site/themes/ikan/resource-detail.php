<?php
/**
 * Template Name: Resource Detail
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for resource detail
  $cms_content = get_post_meta( get_the_ID(), 'resource-detail', true );
  $resource = [];
  if ( $cms_content ) {
    try { $resource = json_decode( $cms_content, true ); } catch ( Throwable $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-blue-50 to-indigo-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Resource Detail
        </h1>
        <p class="text-lg text-gray-600">
          Deep dive into a specific mental health resource.
        </p>
      </div>
    </div>
  </section>

  <!-- Resource Content -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="prose prose-in max-w-prose">
        <?php if ( $resource ): ?>
          <?php echo wp_kses_post( $resource['content'] ?? '' ); ?>
        <?php else: ?>
          <p class="text-gray-600">
            Resource details will be populated from the WordPress CMS.
          </p>
        <?php endif; ?>
      </div>
    </div>
  </section>

  <!-- Related Resources -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Related Resources</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900 mb-3">Article: Understanding Stress</h3>
          <p class="text-gray-500 text-sm">10-minute read on stress management</p>
          <a href="#" class="text-blue-600 hover:text-blue-800 small">Read article</a>
        </div>
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900 mb-3">Video: Mindfulness Basics</h3>
          <p class="text-gray-500 text-sm">8-minute guided practice</p>
          <a href="#" class="text-blue-600 hover:text-blue-800 small">Watch video</a>
        </div>
        <div class="p-4 border rounded-lg">
          <h3 class="font-medium text-gray-900 mb-3">Podcast Episode</h3>
          <p class="text-gray-500 text-sm">20-minute discussion on anxiety</p>
          <a href="#" class="text-blue-600 hover:text-blue-800 small">Listen now</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Resource Metadata -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p class="text-gray-500">Author</p>
          <p class="font-medium"><?php echo esc_html( $resource['author'] ?? 'iKAN Team' ); ?></p>
        </div>
        <div>
          <p class="text-gray-500">Published</p>
          <p class="font-medium"><?php echo esc_html( $resource['date'] ?? '2024' ); ?></p>
        </div>
        <div>
          <p class="text-gray-500">Category</p>
          <p class="font-medium"><?php echo esc_html( $resource['category'] ?? 'General' ); ?></p>
        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>