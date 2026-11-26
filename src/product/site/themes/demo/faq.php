<?php
/**
 * Template Name: FAQ
 * Template Post Type: page
 * Description: Authentic iKAN Health FAQ page
 * 1:1 parity with src/product/site/pages/FAQ.tsx
 *
 * @package iKAN_Health
 */

get_header();

// Fetch FAQ categories and items
$raw_json = file_exists( get_template_directory() . '/assets/pages.json' )
  ? file_get_contents( get_template_directory() . '/assets/pages.json' )
  : '';
$pages_data = $raw_json ? json_decode( $raw_json, true ) : [];
$faq_data = $pages_data['faq'] ?? [];

$categories = $faq_data['categories'] ?? [];
$hero_title = $faq_data['heroTitle'] ?? 'FAQs & Help Center';
$hero_subtitle = $faq_data['heroSubtitle'] ?? 'Find answers to common questions about iKan, your account, programs, and more.';
$search_placeholder = $faq_data['searchPlaceholder'] ?? 'Search for answers...';
$cta_title = $faq_data['ctaTitle'] ?? 'Still have questions?';
$cta_description = $faq_data['ctaDescription'] ?? "Can't find the answer you're looking for? Reach out to our support team.";
$cta_button_text = $faq_data['ctaButtonText'] ?? 'Contact Support';
?>

<div class="ikan2-theme info-page site-page-below-nav">
  <section class="info-band">
    <div class="info-band__inner">
      <p class="info-eyebrow">Help</p>
      <h1 class="info-title"><?php echo esc_html( $hero_title ); ?></h1>
      <p class="info-subtitle"><?php echo esc_html( $hero_subtitle ); ?></p>

      <!-- Live Search Box -->
      <div class="faq-search">
        <svg class="faq-search__icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
        <input
          type="search"
          id="faq-search-input"
          placeholder="<?php echo esc_attr( $search_placeholder ); ?>"
          aria-label="<?php echo esc_attr( $search_placeholder ); ?>"
        />
      </div>

      <!-- Category Filter Tabs -->
      <div class="info-tabs faq-topics" role="tablist" aria-label="Topics">
        <button
          type="button"
          class="info-tab"
          aria-current="page"
          data-category="all"
        >
          All
        </button>
        <?php foreach ( $categories as $cat ) : ?>
          <button
            type="button"
            class="info-tab"
            data-category="<?php echo esc_attr( $cat['id'] ); ?>"
          >
            <?php echo esc_html( $cat['title'] ); ?>
          </button>
        <?php endforeach; ?>
      </div>

      <!-- No results message -->
      <p id="faq-empty" class="faq-empty" style="display: none;">No results found.</p>

      <!-- FAQ Groups -->
      <div id="faq-groups-container">
        <?php foreach ( $categories as $cat ) : ?>
          <section class="faq-group mt-8" data-group-id="<?php echo esc_attr( $cat['id'] ); ?>">
            <h2 class="faq-group__title font-display text-xl font-semibold text-foreground mb-3">
              <?php echo esc_html( $cat['title'] ); ?>
            </h2>
            <div class="faq-list">
              <?php foreach ( ( $cat['items'] ?? [] ) as $item ) : ?>
                <details
                  class="faq-item"
                  data-q="<?php echo esc_attr( strtolower( $item['question'] ) ); ?>"
                  data-a="<?php echo esc_attr( strtolower( $item['answer'] ) ); ?>"
                  <?php if ( strpos( strtolower( $item['question'] ), 'emergency' ) !== false ) echo 'id="helplines"'; ?>
                >
                  <summary><?php echo esc_html( $item['question'] ); ?></summary>
                  <p><?php echo esc_html( $item['answer'] ); ?></p>
                </details>
              <?php endforeach; ?>
            </div>
          </section>
        <?php endforeach; ?>
      </div>

      <!-- CTA Card -->
      <section class="faq-cta mt-12 rounded-[24px] bg-secondary p-8 text-center sm:text-left">
        <p class="faq-cta__title font-display text-xl font-semibold text-foreground"><?php echo esc_html( $cta_title ); ?></p>
        <p class="faq-cta__body text-sm text-muted-foreground mt-1 mb-4"><?php echo esc_html( $cta_description ); ?></p>
        <a
          href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>"
          class="info-button inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-background text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
        >
          <?php echo esc_html( $cta_button_text ); ?>
        </a>
      </section>

    </div>
  </section>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  var searchInput = document.getElementById('faq-search-input');
  var tabs        = document.querySelectorAll('.faq-topics .info-tab');
  var groups      = document.querySelectorAll('.faq-group');
  var items       = document.querySelectorAll('.faq-item');
  var emptyEl     = document.getElementById('faq-empty');

  var currentCat   = 'all';
  var currentQuery = '';

  function filterFaq() {
    var totalVisible = 0;

    groups.forEach(function(group) {
      var groupId = group.getAttribute('data-group-id') || '';
      var groupItems = group.querySelectorAll('.faq-item');
      var groupMatchesCat = (currentCat === 'all') || (groupId === currentCat);
      var visibleInGroup = 0;

      groupItems.forEach(function(item) {
        var q = item.getAttribute('data-q') || '';
        var a = item.getAttribute('data-a') || '';
        var matchesQuery = !currentQuery || (q.indexOf(currentQuery) !== -1) || (a.indexOf(currentQuery) !== -1);

        if (groupMatchesCat && matchesQuery) {
          item.style.display = '';
          if (currentQuery) {
            item.setAttribute('open', '');
          } else {
            item.removeAttribute('open');
          }
          visibleInGroup++;
          totalVisible++;
        } else {
          item.style.display = 'none';
        }
      });

      group.style.display = (visibleInGroup > 0) ? '' : 'none';
    });

    if (emptyEl) {
      emptyEl.style.display = (totalVisible === 0) ? 'block' : 'none';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      currentQuery = this.value.trim().toLowerCase();
      filterFaq();
    });
  }

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) {
        t.removeAttribute('aria-current');
      });
      this.setAttribute('aria-current', 'page');
      currentCat = this.getAttribute('data-category') || 'all';
      filterFaq();
    });
  });
});
</script>

<?php get_footer(); ?>
