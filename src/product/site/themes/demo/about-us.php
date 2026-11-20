<?php
/**
 * Template Name: About Us
 * Template Post Type: page
 * Description: The About Us page for iKAN Health
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for the about page
  $cms_content = get_post_meta( get_the_ID(), 'page-about-us', true );
  $about = [];
  if ( $cms_content ) {
    try {
      $about = json_decode( $cms_content, true );
    } catch ( Throwable $e ) {
      // fall through to empty
    }
  }
  ?>

  <!-- Hero Section -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        <?php echo esc_html( $about['hero']['title'] ?? 'About iKAN' ); ?>
      </h1>
      <?php if ( $about['hero']['subtitle'] ): ?>
        <p class="text-lg text-gray-600 mb-8">
          <?php echo esc_html( $about['hero']['subtitle'] ); ?>
        </p>
      <?php endif; ?>
    </div>
  </section>

  <!-- Story Section -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <?php if ( $about['story'] ): ?>
        <div class="prose max-w-prose">
          <?php echo wp_kses_post( $about['story']['paragraphs'][0] ?? '' ); ?>
        </div>
        <?php if ( $about['story']['image'] ): ?>
          <img src="<?php echo esc_url( $about['story']['image'] ); ?>" alt="<?php echo esc_attr( $about['story']['imageAlt'] ?? 'About image' ); ?>" class="mt-8 w-full max-w-md rounded-lg"/>
        <?php endif; ?>
      <?php endif; ?>
    </div>
  </section>

  <!-- Mission & Vision -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <h2 class="text-2xl font-medium text-gray-900 mb-4">Mission</h2>
        <p class="text-gray-600">
          <?php echo esc_html( $about['mission']['description'] ?? '' ); ?>
        </p>
      </div>
      <div>
        <h2 class="text-2xl font-medium text-gray-900 mb-4">Vision</h2>
        <p class="text-gray-600">
          <?php echo esc_html( $about['vision']['description'] ?? '' ); ?>
        </p>
      </div>
    </div>
  </section>

  <!-- Values -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-6">Our Values</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <?php 
        $values = $about['values'] ?? [];
        foreach ( $values as $value ) :
        ?>
          <div class="p-4 border rounded-lg hover:border-primary transition-colors">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mb-3">
              <?php echo isset( $value['iconName'] ) ? '--' : ''; ?>
            </div>
            <h3 class="font-medium text-gray-900 mb-2">
              <?php echo esc_html( $value['title'] ?? '' ); ?>
            </h3>
            <p class="text-gray-600 text-sm">
              <?php echo esc_html( $value['description'] ?? '' ); ?>
            </p>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">How It Works</h2>
      <ol class="list-decimal list-inside space-y-4">
        <?php 
        $steps = $about['howItWorks']['steps'] ?? [];
        foreach ( $steps as $index => $step ) :
        ?>
          <li class="flex items-start space-x-3">
            <span class="text-gray-400"><?php echo str_pad( $index + 1, 2, '0', STR_PAD_LEFT ); ?></span>
            <div>
              <h3 class="font-medium text-gray-900">
                <?php echo esc_html( $step['title'] ?? '' ); ?>
              </h3>
              <p class="text-gray-600 text-sm">
                <?php echo esc_html( $step['description'] ?? '' ); ?>
              </p>
            </div>
          </li>
        <?php endforeach; ?>
      </ol>
    </div>
  </section>

  <!-- Who It's For -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Who It's For</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <?php 
        $groups = $about['whoFor']['groups'] ?? [];
        foreach ( $groups as $group ) :
        ?>
          <div class="p-4 border rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">
              <?php echo esc_html( $group['title'] ?? '' ); ?>
            </h3>
            <p class="text-gray-600">
              <?php echo esc_html( $group['description'] ?? '' ); ?>
            </p>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- Team -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Our Team</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <?php 
        $team = $about['team'] ?? [];
        foreach ( $team as $member ) :
        ?>
          <div class="p-4 border rounded-lg">
            <img src="<?php echo esc_url( $member['image'] ?? '' ); ?>" alt="<?php echo esc_attr( $member['name'] ?? 'Team member' ); ?>" class="w-20 h-20 rounded-full object-cover mb-3"/>
            <h3 class="font-medium text-gray-900">
              <?php echo esc_html( $member['name'] ?? '' ); ?>
            </h3>
            <p class="text-gray-500 text-sm">
              <?php echo esc_html( $member['role'] ?? '' ); ?>
            </p>
          </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>