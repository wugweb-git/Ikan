<?php
/**
 * Template Name: FAQ
 * Template Post Type: page
 * Description: Exact 1:1 replica of iKAN 2 PWA FAQ layout (ikan2/src/routes/faq.tsx)
 *
 * Matches InfoShell wide container, search filter, topic tabs, grouped accordion disclosures,
 * and bottom CTA contact bridge.
 *
 * @package iKAN_Health
 */

$GLOBALS['ikan_app_shell'] = true;
get_header();

// Load canonical FAQ content from pages.json
$pages_file = get_template_directory() . '/assets/pages.json';
$pages_data = [];
if ( file_exists( $pages_file ) ) {
  $pages_data = json_decode( file_get_contents( $pages_file ), true ) ?: [];
}
$f = $pages_data['faq'] ?? [];

$hero_title        = $f['heroTitle'] ?? 'Frequently Asked Questions';
$hero_subtitle     = $f['heroSubtitle'] ?? 'Everything you need to know about the product and billing.';
$search_placeholder= $f['searchPlaceholder'] ?? 'Search FAQ...';
$no_results_text   = $f['noResultsText'] ?? 'No questions match your search.';
$cta_title         = $f['ctaTitle'] ?? 'Still have questions?';
$cta_description   = $f['ctaDescription'] ?? 'Can’t find the answer you’re looking for? Please chat to our friendly team.';
$cta_button_text   = $f['ctaButtonText'] ?? 'Get in touch';
$categories        = $f['categories'] ?? [];
?>

<div class="min-h-dvh bg-canvas text-foreground ikan2-theme ikan2-type">
  <main class="mx-auto min-h-dvh w-full bg-background pb-12 shadow-app max-w-read">
    
    <!-- TopAppBar: thin, compact sticky header with back button (matching ikan2 exactly) -->
    <header class="safe-top-sm sticky top-0 z-30 flex min-h-16 items-center gap-1 bg-background px-1 print:hidden">
      <button
        type="button"
        aria-label="Back"
        onclick="if(window.history.length>1){window.history.back();}else{window.location.href='<?php echo esc_url( home_url( '/' ) ); ?>';}"
        class="grid h-12 w-12 place-items-center rounded-full text-foreground hover:bg-foreground/5 transition-colors"
      >
        <i data-lucide="arrow-left" class="h-6 w-6"></i>
      </button>
    </header>

    <!-- Header -->
    <header class="px-5">
      <h1 class="type-headline-lg font-semibold text-foreground"><?php echo esc_html( $hero_title ); ?></h1>
      <p class="mt-2 text-[16px] leading-6 text-muted-foreground"><?php echo esc_html( $hero_subtitle ); ?></p>
    </header>

    <!-- Search Field -->
    <div class="mx-5 mt-5 relative">
      <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"></i>
      <input
        type="search"
        id="faq-search-input"
        placeholder="<?php echo esc_attr( $search_placeholder ); ?>"
        aria-label="<?php echo esc_attr( $search_placeholder ); ?>"
        class="w-full h-12 pl-11 pr-4 rounded-[16px] bg-secondary border border-transparent focus:border-foreground/30 focus:bg-background outline-none text-foreground placeholder:text-muted-foreground text-[15px] transition-colors"
      >
    </div>

    <!-- Category Tabs -->
    <div class="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5" role="tablist" aria-label="Topics">
      <button
        type="button"
        role="tab"
        aria-selected="true"
        data-cat-filter="all"
        class="faq-tab type-label-lg inline-flex h-9 shrink-0 items-center rounded-[8px] border px-3.5 border-transparent bg-foreground text-background font-medium cursor-pointer transition-colors"
      >
        All
      </button>
      <?php foreach ( $categories as $cat ) : ?>
        <button
          type="button"
          role="tab"
          aria-selected="false"
          data-cat-filter="<?php echo esc_attr( $cat['id'] ); ?>"
          class="faq-tab type-label-lg inline-flex h-9 shrink-0 items-center rounded-[8px] border px-3.5 border-foreground/20 text-foreground font-medium hover:bg-secondary cursor-pointer transition-colors"
        >
          <?php echo esc_html( $cat['title'] ); ?>
        </button>
      <?php endforeach; ?>
    </div>

    <!-- No results message -->
    <p id="faq-no-results" class="type-action mx-5 mt-8 hidden text-center text-muted-foreground">
      <?php echo esc_html( $no_results_text ); ?>
    </p>

    <!-- FAQ Category Groups & Disclosures -->
    <div id="faq-groups-container">
      <?php foreach ( $categories as $cat ) : ?>
        <section class="faq-group mt-7 px-5" data-category="<?php echo esc_attr( $cat['id'] ); ?>">
          <h2 class="type-subhead font-semibold text-foreground mb-1"><?php echo esc_html( $cat['title'] ); ?></h2>
          <div class="divide-y divide-foreground/10">
            <?php foreach ( ( $cat['items'] ?? [] ) as $item ) : ?>
              <details
                class="faq-item group py-3.5 cursor-pointer list-none"
                <?php if ( strpos( strtolower( $item['question'] ), 'emergency' ) !== false ) echo 'id="helplines"'; ?>
              >
                <summary class="flex items-center justify-between font-medium text-foreground text-[16px] list-none select-none">
                  <span class="faq-q pr-3"><?php echo esc_html( $item['question'] ); ?></span>
                  <i data-lucide="chevron-down" class="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"></i>
                </summary>
                <p class="faq-a type-body text-muted-foreground mt-2 text-[15px] leading-relaxed">
                  <?php echo esc_html( $item['answer'] ); ?>
                </p>
              </details>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endforeach; ?>
    </div>

    <!-- Still Have Questions? CTA Card -->
    <section class="mx-5 mt-10 rounded-[24px] bg-secondary p-5">
      <p class="font-display text-[19px] font-semibold text-foreground"><?php echo esc_html( $cta_title ); ?></p>
      <p class="type-body mt-1 text-muted-foreground"><?php echo esc_html( $cta_description ); ?></p>
      <a
        href="<?php echo esc_url( home_url( '/contact' ) ); ?>"
        class="type-action mt-4 inline-flex h-11 items-center rounded-full bg-foreground px-5 text-background font-medium hover:opacity-90 active:scale-[0.99] transition-all"
      >
        <?php echo esc_html( $cta_button_text ); ?>
      </a>
    </section>

    <div class="h-6"></div>
  </main>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  if (window.lucide && lucide.createIcons) {
    lucide.createIcons();
  }

  var searchInput = document.getElementById('faq-search-input');
  var tabs = document.querySelectorAll('.faq-tab');
  var groups = document.querySelectorAll('.faq-group');
  var items = document.querySelectorAll('.faq-item');
  var noResults = document.getElementById('faq-no-results');

  var currentTab = 'all';

  function filterFaq() {
    var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    var visibleGroupsCount = 0;

    groups.forEach(function(grp) {
      var catId = grp.getAttribute('data-category');
      var matchesTab = (currentTab === 'all' || currentTab === catId);

      if (!matchesTab) {
        grp.classList.add('hidden');
        return;
      }

      var grpItems = grp.querySelectorAll('.faq-item');
      var visibleItemsCount = 0;

      grpItems.forEach(function(it) {
        var qText = it.querySelector('.faq-q') ? it.querySelector('.faq-q').textContent.toLowerCase() : '';
        var aText = it.querySelector('.faq-a') ? it.querySelector('.faq-a').textContent.toLowerCase() : '';
        var matchesQuery = (!query || qText.indexOf(query) !== -1 || aText.indexOf(query) !== -1);

        if (matchesQuery) {
          it.classList.remove('hidden');
          visibleItemsCount++;
          if (query) {
            it.setAttribute('open', '');
          }
        } else {
          it.classList.add('hidden');
          if (query) {
            it.removeAttribute('open');
          }
        }
      });

      if (visibleItemsCount > 0) {
        grp.classList.remove('hidden');
        visibleGroupsCount++;
      } else {
        grp.classList.add('hidden');
      }
    });

    if (noResults) {
      if (visibleGroupsCount === 0) {
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterFaq);
  }

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) {
        t.setAttribute('aria-selected', 'false');
        t.classList.remove('border-transparent', 'bg-foreground', 'text-background');
        t.classList.add('border-foreground/20', 'text-foreground');
      });

      tab.setAttribute('aria-selected', 'true');
      tab.classList.remove('border-foreground/20', 'text-foreground');
      tab.classList.add('border-transparent', 'bg-foreground', 'text-background');

      currentTab = tab.getAttribute('data-cat-filter') || 'all';
      filterFaq();
    });
  });

  // If URL has #helplines, scroll and open it
  if (window.location.hash === '#helplines') {
    var helpItem = document.getElementById('helplines');
    if (helpItem) {
      helpItem.setAttribute('open', '');
      helpItem.scrollIntoView({ behavior: 'smooth' });
    }
  }
});
</script>

<?php get_footer(); ?>
