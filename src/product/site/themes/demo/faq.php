<?php
/**
 * Template Name: FAQ
 * Template Post Type: page
 * Description: Authentic iKAN Health FAQ page matching FAQ.tsx and index-C1zkq2-P.css
 *
 * @package iKAN_Health
 */

get_header();

// Load canonical FAQ data from assets/pages.json
$pages_file = get_template_directory() . '/assets/pages.json';
$pages_data = [];
if ( file_exists( $pages_file ) ) {
  $pages_data = json_decode( file_get_contents( $pages_file ), true ) ?: [];
}

$faq_data = $pages_data['faq'] ?? [];
$hero_title = $faq_data['heroTitle'] ?? 'FAQs & Help Center';
$hero_subtitle = $faq_data['heroSubtitle'] ?? 'Find answers to common questions about iKan, your account, programs, and more.';
$search_placeholder = $faq_data['searchPlaceholder'] ?? 'Search for answers...';
$categories = $faq_data['categories'] ?? [];
$faq_cta = $faq_data['faqCard'] ?? [
  'title' => 'Still have questions?',
  'description' => "Can't find the answer you're looking for? Our support team is here to help.",
  'buttonText' => 'Contact Support',
  'buttonRoute' => '/contact',
];
?>

<main id="main-content" tabindex="-1" class="flex-1 w-full relative outline-none p-[0px]" role="main" aria-label="Page content">
  <div class="ikan2-theme info-page site-page-below-nav">
    <section class="info-band">
      <div class="info-band__inner">
        
        <p class="info-eyebrow">Help</p>
        <h1 class="info-title"><?php echo esc_html( $hero_title ); ?></h1>
        <?php if ( ! empty( $hero_subtitle ) ) : ?>
          <p class="info-subtitle"><?php echo esc_html( $hero_subtitle ); ?></p>
        <?php endif; ?>

        <!-- Search Bar -->
        <div class="faq-search">
          <svg class="faq-search__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <input
            id="faq-search-input"
            type="search"
            placeholder="<?php echo esc_attr( $search_placeholder ); ?>"
            aria-label="<?php echo esc_attr( $search_placeholder ); ?>"
          />
        </div>

        <!-- Topics Switcher Tabs -->
        <div class="info-tabs faq-topics" role="tablist" aria-label="Topics">
          <button
            type="button"
            role="tab"
            class="info-tab"
            data-cat="all"
            aria-selected="true"
            aria-current="page"
          >
            All
          </button>
          <?php foreach ( $categories as $cat ) : ?>
            <button
              type="button"
              role="tab"
              class="info-tab"
              data-cat="<?php echo esc_attr( $cat['id'] ); ?>"
              aria-selected="false"
            >
              <?php echo esc_html( $cat['title'] ); ?>
            </button>
          <?php endforeach; ?>
        </div>

        <!-- FAQ Accordion Groups -->
        <div id="faq-groups-container">
          <?php foreach ( $categories as $cat ) : ?>
            <div class="faq-group" data-category="<?php echo esc_attr( $cat['id'] ); ?>">
              <h2 class="faq-group__title"><?php echo esc_html( $cat['title'] ); ?></h2>
              <div class="faq-list">
                <?php foreach ( $cat['items'] as $item ) : ?>
                  <details class="faq-item" data-question="<?php echo esc_attr( strtolower( $item['question'] ) ); ?>" data-answer="<?php echo esc_attr( strtolower( $item['answer'] ) ); ?>">
                    <summary><?php echo esc_html( $item['question'] ); ?></summary>
                    <p><?php echo esc_html( $item['answer'] ); ?></p>
                  </details>
                <?php endforeach; ?>
              </div>
            </div>
          <?php endforeach; ?>
        </div>

        <!-- Empty Search State -->
        <div id="faq-no-results" class="faq-empty" style="display: none;">
          <p>No questions match your search.</p>
        </div>

        <!-- Bottom Contact CTA -->
        <?php if ( ! empty( $faq_cta ) ) : ?>
          <div class="faq-cta">
            <p class="faq-cta__title"><?php echo esc_html( $faq_cta['title'] ); ?></p>
            <p class="faq-cta__body"><?php echo esc_html( $faq_cta['description'] ); ?></p>
            <a href="<?php echo esc_url( home_url( '/contact' ) ); ?>" class="info-button">
              <?php echo esc_html( $faq_cta['buttonText'] ); ?>
            </a>
          </div>
        <?php endif; ?>

      </div>
    </section>
  </div>
</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var searchInput = document.getElementById('faq-search-input');
  var tabButtons = document.querySelectorAll('.faq-topics .info-tab');
  var groups = document.querySelectorAll('.faq-group');
  var noResults = document.getElementById('faq-no-results');
  var currentCat = 'all';

  function filterFAQs() {
    var query = (searchInput.value || '').trim().toLowerCase();
    var totalVisible = 0;

    groups.forEach(function(group) {
      var groupCat = group.getAttribute('data-category');
      var matchesCat = (currentCat === 'all' || groupCat === currentCat);

      if (!matchesCat) {
        group.style.display = 'none';
        return;
      }

      var items = group.querySelectorAll('.faq-item');
      var groupVisibleCount = 0;

      items.forEach(function(item) {
        var qText = item.getAttribute('data-question') || '';
        var aText = item.getAttribute('data-answer') || '';
        var matchesQuery = !query || qText.indexOf(query) !== -1 || aText.indexOf(query) !== -1;

        if (matchesQuery) {
          item.style.display = '';
          groupVisibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      if (groupVisibleCount > 0) {
        group.style.display = '';
        totalVisible += groupVisibleCount;
      } else {
        group.style.display = 'none';
      }
    });

    if (totalVisible === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterFAQs);
  }

  tabButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      tabButtons.forEach(function(b) {
        b.removeAttribute('aria-current');
        b.setAttribute('aria-selected', 'false');
      });
      btn.setAttribute('aria-current', 'page');
      btn.setAttribute('aria-selected', 'true');
      currentCat = btn.getAttribute('data-cat') || 'all';
      filterFAQs();
    });
  });
});
</script>

<?php get_footer(); ?>
