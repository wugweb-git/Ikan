<?php
/**
 * Template Name: Burnout Cost Calculator
 * Template Post Type: page
 */

get_header(); ?>

<main class="ikan2-theme">

  <?php
  // Get CMS content for burnout cost calculator
  $cms_content = get_post_meta( get_the_ID(), 'burnout-cost-calculator', true );
  $calculator = [];
  if ( $cms_content ) {
    try { $calculator = json_decode( $cms_content, true ); } catch ( $e ) {}
  }
  ?>
  
  <!-- Hero Section -->
  <section class="py-16 bg-gradient-to-b from-emerald-50 to-green-100">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Burnout Cost Calculator
        </h1>
        <p class="text-lg text-gray-600">
          Calculate the true cost of burnout for your organization.
        </p>
      </div>
    </div>
  </section>

  <!-- Calculation Form -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Calculate Your Burnout Cost</h2>
        
        <form class="space-y-6">
          <div>
            <label class="block text-gray-700 mb-2">Number of Employees</label>
            <input type="number" name="employees" required 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              min="1" value=""/>
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Average Burnout Rate (%)</label>
            <input type="number" name="burnout_rate" required 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              min="0" max="100" value=""/>
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Average Salary per Employee</label>
            <input type="number" name="salary" required 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              min="0" value=""/>
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Average Days Lost per Year</label>
            <input type="number" name="days_lost" required 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              min="0" value=""/>
          </div>
          <button type="submit"
            class="w-full py-3 px-6 bg-primary text-white font-medium">
            Calculate Cost
          </button>
        </form>
      </div>
    </div>
  </section>

  <!-- Cost Impact -->
  <section class="py-12 bg-gray-50">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Estimated Impact</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p class="text-3xl font-bold text-primary">$0</p>
          <p class="text-gray-500">Annual Cost</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-primary">0</p>
          <p class="text-gray-500">Employees Affected</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-primary">0</p>
          <p class="text-gray-500">Days Lost</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ROI Section -->
  <section class="py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <h2 class="text-2xl font-medium text-gray-900 mb-4">Invest in Prevention</h2>
      <p class="text-gray-600 mb-4">Prevention programs typically return 3-5x ROI through reduced healthcare costs, improved productivity, and lower turnover.</p>
      <ul class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <li class="p-4 border rounded-lg">
          <p class="font-medium">Healthcare Costs</p>
          <p class="text-sm text-gray-500">Reduced by up to 30%</p>
        </li>
        <li class="p-4 border rounded-lg">
          <p class="font-medium">Productivity</p>
          <p class="text-sm text-gray-500">Increased by 20-25%</p>
        </li>
        <li class="p-4 border rounded-lg">
          <p class="font-medium">Retention</p>
          <p class="text-sm text-gray-500">Turnover reduced by 15%</p>
        </li>
      </ul>
    </div>
  </section>

</main>

<?php get_footer(); ?>