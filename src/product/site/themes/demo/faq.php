<?php
/**
 * Template Name: FAQ
 * Template Post Type: page
 * Description: Exact replica of iKAN mobile & responsive FAQ page
 */

get_header();

// Fetch FAQ data from pages.json
$faq_json_path = get_template_directory() . '/assets/pages.json';
$faq_data = [];
if ( file_exists( $faq_json_path ) ) {
  $raw = file_get_contents( $faq_json_path );
  $decoded = json_decode( $raw, true );
  $faq_data = $decoded['faq'] ?? [];
}

$hero_title = $faq_data['heroTitle'] ?? 'Frequently Asked Questions';
$hero_subtitle = $faq_data['heroSubtitle'] ?? 'Everything you need to know about iKAN, our clinical assessments, and how we keep your privacy secure.';
$categories = $faq_data['categories'] ?? [];
?>

<main class="ikan2-theme bg-canvas text-foreground pb-24 md:pb-16 min-h-screen">

  <!-- Header -->
  <header class="max-w-[760px] mx-auto px-5 pt-8 md:pt-14">
    <h1 class="font-display text-3xl md:text-5xl font-semibold leading-[1.15] tracking-tight text-gray-900">
      <?php echo esc_html( $hero_title ); ?>
    </h1>
    <p class="text-base md:text-lg mt-3 text-gray-600 leading-relaxed">
      <?php echo esc_html( $hero_subtitle ); ?>
    </p>
  </header>

  <div class="max-w-[760px] mx-auto">

    <!-- Search Input -->
    <div class="px-5 mt-6">
      <div class="relative">
        <i data-lucide="search" class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input type="text" id="faq-search" placeholder="Search questions about privacy, programs, or tests..." class="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm focus:border-blue-600 focus:outline-none shadow-xs" />
      </div>
    </div>

    <!-- Category Pills Tabs -->
    <div class="mt-4 flex gap-2 overflow-x-auto px-5 no-scrollbar" role="tablist" id="faq-tabs">
      <button type="button" class="faq-tab active px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white whitespace-nowrap transition-colors" data-cat="all">
        All
      </button>
      <?php foreach ( $categories as $cat ) : ?>
        <button type="button" class="faq-tab px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap transition-colors" data-cat="<?php echo esc_attr( $cat['id'] ); ?>">
          <?php echo esc_html( $cat['title'] ); ?>
        </button>
      <?php endforeach; ?>
    </div>

    <!-- FAQ Accordion List -->
    <div class="px-5 mt-8 space-y-6" id="faq-content">
      <?php foreach ( $categories as $cat ) : ?>
        <section class="faq-group" data-cat="<?php echo esc_attr( $cat['id'] ); ?>">
          <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-1"><?php echo esc_html( $cat['title'] ); ?></h2>
          <div class="space-y-2.5">
            <?php foreach ( $cat['items'] as $item ) : ?>
              <details class="faq-item group rounded-2xl bg-white border border-gray-200/90 overflow-hidden shadow-xs">
                <summary class="flex items-center justify-between p-4 md:p-5 cursor-pointer font-bold text-sm md:text-base text-gray-900 list-none select-none group-open:bg-gray-50/50 transition-colors">
                  <span class="faq-q"><?php echo esc_html( $item['question'] ); ?></span>
                  <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-3"></i>
                </summary>
                <div class="px-4 pb-4 md:px-5 md:pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100/60 faq-a">
                  <?php echo wp_kses_post( $item['answer'] ); ?>
                </div>
              </details>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endforeach; ?>
      <p id="faq-no-results" class="hidden text-center py-10 text-gray-500 text-sm">No matching questions found. Try searching with different keywords.</p>
    </div>

    <!-- Bottom CTA Card -->
    <section class="px-5 mt-10">
      <div class="rounded-[24px] bg-gray-100 p-6 md:p-8">
        <h3 class="text-xl font-bold text-gray-900">Still have questions?</h3>
        <p class="text-sm text-gray-600 mt-1">Our care team is always here to help you navigate your mental wellness journey.</p>
        <a href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 hover:bg-gray-800 px-6 py-3 text-xs font-bold text-white transition-colors">
          <span>Contact our team</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </a>
      </div>
    </section>

  </div>

</main>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('faq-search');
    const tabs = document.querySelectorAll('.faq-tab');
    const groups = document.querySelectorAll('.faq-group');
    const items = document.querySelectorAll('.faq-item');
    const noResults = document.getElementById('faq-no-results');
    let activeCat = 'all';

    function filterFAQ() {
      const q = searchInput.value.trim().toLowerCase();
      let visibleCount = 0;

      groups.forEach(group => {
        const cat = group.getAttribute('data-cat');
        const matchCat = (activeCat === 'all' || activeCat === cat);
        let groupVisibleCount = 0;

        const groupItems = group.querySelectorAll('.faq-item');
        groupItems.forEach(item => {
          const question = item.querySelector('.faq-q').textContent.toLowerCase();
          const answer = item.querySelector('.faq-a').textContent.toLowerCase();
          const matchQuery = !q || question.includes(q) || answer.includes(q);

          if (matchCat && matchQuery) {
            item.style.display = '';
            groupVisibleCount++;
            visibleCount++;
            if (q) item.open = true;
          } else {
            item.style.display = 'none';
          }
        });

        group.style.display = (groupVisibleCount > 0) ? '' : 'none';
      });

      noResults.classList.toggle('hidden', visibleCount > 0);
    }

    searchInput.addEventListener('input', filterFAQ);

    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => {
          t.classList.remove('bg-gray-900', 'text-white', 'active');
          t.classList.add('bg-gray-100', 'text-gray-700');
        });
        tab.classList.remove('bg-gray-100', 'text-gray-700');
        tab.classList.add('bg-gray-900', 'text-white', 'active');
        activeCat = tab.getAttribute('data-cat');
        filterFAQ();
      });
    });
  });
</script>

<?php get_footer(); ?>
