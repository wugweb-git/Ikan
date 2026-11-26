<?php
/**
 * iKAN Health — Design System & Compliance Hub.
 *
 * Full type-scale rendering, design token reference, breakpoint behaviour,
 * and cross-repo mapping from ikan2 → ikan (WordPress).
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_Design_Admin {

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_styles' ) );
	}

	public static function enqueue_admin_styles( $hook ) {
		if ( $hook !== 'appearance_page_ikan-design-compliance' ) return;
		// Load Sora + Manrope fonts
		wp_enqueue_style(
			'ikan-design-fonts',
			'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@400;600;700&display=swap',
			[],
			null
		);
	}

	public static function register_admin_menu() {
		add_submenu_page(
			'themes.php',
			'Design System & Type Scale',
			'Design System',
			'manage_options',
			'ikan-design-compliance',
			array( __CLASS__, 'render_page' )
		);
	}

	public static function render_page() {
		// ── Type-scale definitions (source of truth: ikan2/src/styles.css) ──────
		// Each entry: class, h-tag, size/lh/weight/tracking, font-family, usage, breakpoint note
		$type_scale = [
			// Displays
			[ 'class'=>'type-display-lg',  'tag'=>'—',  'size'=>'52px', 'lh'=>'58px', 'fw'=>'600', 'ls'=>'-0.02em', 'family'=>'Sora',   'usage'=>'Hero splash / very large marketing headers',         'mobile_note'=>'Scale to 36–40px on mobile via inline style or component logic' ],
			[ 'class'=>'type-display-md',  'tag'=>'—',  'size'=>'42px', 'lh'=>'48px', 'fw'=>'600', 'ls'=>'-0.015em','family'=>'Sora',   'usage'=>'Section hero titles on marketing pages',             'mobile_note'=>'~30px on mobile' ],
			[ 'class'=>'type-display-sm',  'tag'=>'—',  'size'=>'34px', 'lh'=>'40px', 'fw'=>'600', 'ls'=>'-0.01em', 'family'=>'Sora',   'usage'=>'Resource / article display title',                   'mobile_note'=>'~26px on mobile' ],
			// Headlines
			[ 'class'=>'type-headline-lg', 'tag'=>'h1', 'size'=>'32px', 'lh'=>'40px', 'fw'=>'600', 'ls'=>'-0.01em', 'family'=>'Sora',   'usage'=>'Page H1 on InfoShell pages (About, FAQ, Legal)',     'mobile_note'=>'Same size — works from 390px wide' ],
			[ 'class'=>'type-headline-md', 'tag'=>'h2', 'size'=>'28px', 'lh'=>'36px', 'fw'=>'600', 'ls'=>'-0.01em', 'family'=>'Sora',   'usage'=>'Section headings within long-form pages',            'mobile_note'=>'Same' ],
			[ 'class'=>'type-headline-sm', 'tag'=>'h3', 'size'=>'24px', 'lh'=>'32px', 'fw'=>'600', 'ls'=>'normal',  'family'=>'Sora',   'usage'=>'Card or subsection heading',                         'mobile_note'=>'Same' ],
			// Subhead & Titles
			[ 'class'=>'type-subhead',     'tag'=>'h4', 'size'=>'18px', 'lh'=>'26px', 'fw'=>'600', 'ls'=>'normal',  'family'=>'Sora',   'usage'=>'FAQ category group, card section label',             'mobile_note'=>'Same' ],
			[ 'class'=>'type-title-lg',    'tag'=>'h5', 'size'=>'22px', 'lh'=>'28px', 'fw'=>'600', 'ls'=>'normal',  'family'=>'Sora',   'usage'=>'Programme card title, team member name',             'mobile_note'=>'Same' ],
			[ 'class'=>'type-title-md',    'tag'=>'h6', 'size'=>'16px', 'lh'=>'24px', 'fw'=>'600', 'ls'=>'0.01em',  'family'=>'Sora',   'usage'=>'Small card label, metadata heading',                 'mobile_note'=>'Same' ],
			// Body
			[ 'class'=>'type-body-xl',     'tag'=>'p',  'size'=>'17px', 'lh'=>'28px', 'fw'=>'400', 'ls'=>'normal',  'family'=>'Manrope','usage'=>'Hero subtitle / large intro paragraph',              'mobile_note'=>'Same' ],
			[ 'class'=>'type-body-lg',     'tag'=>'p',  'size'=>'16px', 'lh'=>'26px', 'fw'=>'400', 'ls'=>'normal',  'family'=>'Manrope','usage'=>'General body copy, resource article body',           'mobile_note'=>'Same' ],
			[ 'class'=>'type-body',        'tag'=>'p',  'size'=>'15px', 'lh'=>'24px', 'fw'=>'400', 'ls'=>'normal',  'family'=>'Manrope','usage'=>'Default body text in components (FAQ answer, card)', 'mobile_note'=>'Same' ],
			[ 'class'=>'type-body-md',     'tag'=>'p',  'size'=>'14px', 'lh'=>'21px', 'fw'=>'400', 'ls'=>'normal',  'family'=>'Manrope','usage'=>'Secondary descriptions, form help text',             'mobile_note'=>'Same' ],
			[ 'class'=>'type-body-sm',     'tag'=>'p',  'size'=>'13px', 'lh'=>'20px', 'fw'=>'400', 'ls'=>'normal',  'family'=>'Manrope','usage'=>'Captions, source citations, fine print',             'mobile_note'=>'Same' ],
			// Action & Labels
			[ 'class'=>'type-action',      'tag'=>'—',  'size'=>'15px', 'lh'=>'22px', 'fw'=>'600', 'ls'=>'0.01em',  'family'=>'Manrope','usage'=>'CTA buttons, nav links, interactive text',           'mobile_note'=>'Same — touch target ≥48px via padding' ],
			[ 'class'=>'type-label-lg',    'tag'=>'—',  'size'=>'14px', 'lh'=>'20px', 'fw'=>'500', 'ls'=>'normal',  'family'=>'Manrope','usage'=>'Filter tab chips, badge text, form labels',          'mobile_note'=>'Same' ],
			[ 'class'=>'type-label-md',    'tag'=>'—',  'size'=>'12px', 'lh'=>'16px', 'fw'=>'500', 'ls'=>'0.01em',  'family'=>'Manrope','usage'=>'Metadata dates, secondary tags, micro labels',       'mobile_note'=>'Same' ],
		];

		// ── Breakpoints ───────────────────────────────────────────────────────────
		$breakpoints = [
			[ 'name'=>'Mobile',     'range'=>'< 640px',      'class'=>'bp-mobile',  'color'=>'#7C3AED', 'notes'=>'max-w-app / max-w-read = 100% · Full-width · no canvas margins · InfoShell pages fill screen · input font-size ≥ 16px (no iOS zoom)' ],
			[ 'name'=>'Tablet',     'range'=>'640px–1023px', 'class'=>'bp-tablet',  'color'=>'#2563EB', 'notes'=>'max-w-app = 36rem · max-w-read = 36rem · Centered column · canvas bg visible · Nav switches to capsule form' ],
			[ 'name'=>'Desktop',    'range'=>'≥ 1024px',     'class'=>'bp-desktop', 'color'=>'#059669', 'notes'=>'max-w-app = 30rem (phone-on-canvas) · max-w-read = 38rem · Centered · Full desktop capsule nav visible' ],
			[ 'name'=>'PWA/Native', 'range'=>'standalone / fullscreen display-mode', 'class'=>'bp-pwa', 'color'=>'#D97706', 'notes'=>'display-mode override: max-w-app / max-w-read reset to 100% — fills screen like a native app even on tablet/desktop' ],
		];

		// ── Design Tokens (ikan2/src/styles.css :root) ───────────────────────────
		$semantic_tokens = [
			'Surfaces'   => [
				'--background'   => [ 'value'=>'oklch(0.995 0.002 240)', 'hex'=>'#FAFAFA', 'usage'=>'App card surface / page bg' ],
				'--foreground'   => [ 'value'=>'oklch(0.16 0.012 255)',  'hex'=>'#1A1D2B', 'usage'=>'Primary text' ],
				'--canvas'       => [ 'value'=>'oklch(0.955 0.006 250)', 'hex'=>'#EBEBF2', 'usage'=>'Page canvas / outer bg on desktop' ],
				'--card'         => [ 'value'=>'oklch(1 0 0)',           'hex'=>'#FFFFFF', 'usage'=>'Card background' ],
				'--secondary'    => [ 'value'=>'oklch(0.955 0.006 250)', 'hex'=>'#EBEBF2', 'usage'=>'Secondary surface / chips / inputs' ],
				'--muted'        => [ 'value'=>'oklch(0.96 0.005 250)',  'hex'=>'#EDEDF2', 'usage'=>'Muted surface' ],
				'--muted-foreground'=>['value'=>'oklch(0.5 0.018 255)',  'hex'=>'#737589', 'usage'=>'Subdued text / placeholders' ],
				'--border'       => [ 'value'=>'oklch(0.9 0.009 250)',   'hex'=>'#DDDDE8', 'usage'=>'Dividers / input borders' ],
			],
			'Brand Colors' => [
				'--brand-teal'      => [ 'value'=>'oklch(0.76 0.095 165)', 'hex'=>'#5ABFA0', 'usage'=>'Primary brand / progress rings' ],
				'--brand-teal-ink'  => [ 'value'=>'oklch(0.47 0.095 165)', 'hex'=>'#2B634D', 'usage'=>'Dark teal for text on light bg' ],
				'--brand-amber'     => [ 'value'=>'oklch(0.82 0.12 83)',   'hex'=>'#E8C46A', 'usage'=>'Accent / rest score' ],
				'--brand-amber-ink' => [ 'value'=>'oklch(0.52 0.11 75)',   'hex'=>'#7A5C1E', 'usage'=>'Dark amber text' ],
				'--brand-coral'     => [ 'value'=>'oklch(0.7 0.15 25)',    'hex'=>'#E07560', 'usage'=>'Alert / warning accent' ],
				'--brand-slate'     => [ 'value'=>'oklch(0.5 0.018 255)',  'hex'=>'#737589', 'usage'=>'Neutral slate accent' ],
			],
			'Semantic Scores' => [
				'--calm'      => [ 'value'=>'oklch(0.76 0.095 165)', 'hex'=>'#5ABFA0', 'usage'=>'Calm score / stress & anxiety track' ],
				'--calm-soft' => [ 'value'=>'oklch(0.95 0.035 165)', 'hex'=>'#E5F6F0', 'usage'=>'Calm background chip' ],
				'--mind'      => [ 'value'=>'oklch(0.78 0.08 245)',  'hex'=>'#78A8E0', 'usage'=>'Mind score / cognitive track' ],
				'--mind-soft' => [ 'value'=>'oklch(0.95 0.03 245)',  'hex'=>'#E6EEFA', 'usage'=>'Mind background chip' ],
				'--rest'      => [ 'value'=>'oklch(0.82 0.12 83)',   'hex'=>'#E8C46A', 'usage'=>'Rest score / sleep track' ],
				'--rest-soft' => [ 'value'=>'oklch(0.96 0.045 83)',  'hex'=>'#FBF4E0', 'usage'=>'Rest background chip' ],
				'--alert'     => [ 'value'=>'oklch(0.7 0.15 25)',    'hex'=>'#E07560', 'usage'=>'Alert score / burnout risk' ],
				'--alert-soft'=> [ 'value'=>'oklch(0.96 0.035 25)',  'hex'=>'#FAECE9', 'usage'=>'Alert background chip' ],
			],
			'Error / Crisis' => [
				'--error'            => [ 'value'=>'oklch(0.501 0.178 28.7)', 'hex'=>'#C0392B', 'usage'=>'Destructive / crisis bg' ],
				'--error-container'  => [ 'value'=>'oklch(0.922 0.03 22.8)',  'hex'=>'#FDECEA', 'usage'=>'Crisis card bg (Need Help)' ],
				'--on-error-container'=>['value'=>'oklch(0.42 0.147 28.1)',   'hex'=>'#922B21', 'usage'=>'Text on crisis card' ],
			],
		];

		// ── Radius tokens ─────────────────────────────────────────────────────────
		$radius_tokens = [
			[ 'name'=>'--radius',    'value'=>'0.75rem (12px)', 'usage'=>'Base radius token' ],
			[ 'name'=>'radius-sm',   'value'=>'8px',  'usage'=>'Small chips, micro buttons' ],
			[ 'name'=>'radius-md',   'value'=>'10px', 'usage'=>'Input fields, small cards' ],
			[ 'name'=>'radius-lg',   'value'=>'12px', 'usage'=>'Standard cards' ],
			[ 'name'=>'radius-xl',   'value'=>'16px', 'usage'=>'Search input, filter tabs' ],
			[ 'name'=>'radius-2xl',  'value'=>'20px', 'usage'=>'Contact method cards' ],
			[ 'name'=>'radius-3xl',  'value'=>'24px', 'usage'=>'Hero cards, section cards' ],
			[ 'name'=>'radius-4xl',  'value'=>'28px', 'usage'=>'Full shell cards (about-sheet)' ],
			[ 'name'=>'rounded-full','value'=>'9999px','usage'=>'Nav capsule, avatar, pills' ],
		];

		// ── Storybook mapping ─────────────────────────────────────────────────────
		$storybook_stories = [
			[ 'story'=>'kit/Badge',        'ikan2'=>'src/components/kit/badge.stories.tsx',   'wp_equiv'=>'<span class="type-label-md rounded-full bg-secondary px-2.5 py-1">' ],
			[ 'story'=>'kit/Chip',         'ikan2'=>'src/components/kit/chip.stories.tsx',    'wp_equiv'=>'Filter tab <button> with type-label-lg + rounded-[8px] + border' ],
			[ 'story'=>'kit/Card',         'ikan2'=>'src/components/kit/card.stories.tsx',    'wp_equiv'=>'<div class="rounded-[20px] bg-secondary p-4"> contact method card' ],
			[ 'story'=>'kit/Disclosure',   'ikan2'=>'src/components/kit/disclosure.stories.tsx','wp_equiv'=>'<details class="faq-item"> accordion in faq.php' ],
			[ 'story'=>'App/InfoShell',    'ikan2'=>'src/components/info-shell.stories.tsx',  'wp_equiv'=>'<main bg-canvas> + <div max-w-read bg-background shadow-app mx-auto>' ],
			[ 'story'=>'UI/Button',        'ikan2'=>'src/components/ui/button.stories.tsx',   'wp_equiv'=>'<a class="type-action rounded-full bg-foreground text-background px-5 h-11">' ],
			[ 'story'=>'UI/Input',         'ikan2'=>'src/components/ui/input.stories.tsx',    'wp_equiv'=>'<input class="h-12 rounded-[14px] border bg-secondary px-4 text-[15px]">' ],
			[ 'story'=>'App/AboutPage',    'ikan2'=>'src/components/about.stories.tsx',       'wp_equiv'=>'about-us.php — about-sheet wrapper + about-band__inner' ],
			[ 'story'=>'UI/AuthUI',        'ikan2'=>'src/components/auth-ui.stories.tsx',     'wp_equiv'=>'login.php — same shell structure max-w-app shadow-app' ],
		];
		?>

		<style>
		#wpbody-content { background: #F4F4F7; }
		.ikan-ds-wrap { max-width: 1280px; padding: 24px 24px 64px; font-family: 'Manrope', -apple-system, sans-serif; color: #1A1D2B; }
		.ikan-ds-header { background: #151515; color: #fff; padding: 28px 36px; border-radius: 20px; margin-bottom: 24px; }
		.ikan-ds-header h1 { font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 700; color: #fff; margin: 6px 0 6px; }
		.ikan-ds-header p { font-size: 13px; color: #94A3B8; margin: 0; }
		.ikan-ds-badge { display: inline-block; background: rgba(90,191,160,0.2); border: 1px solid #5ABFA0; color: #5ABFA0; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; }
		.ikan-ds-section { background: #fff; border: 1px solid #DDDDE8; border-radius: 16px; padding: 28px; margin-bottom: 20px; }
		.ikan-ds-section h2 { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; margin: 0 0 4px; color: #1A1D2B; }
		.ikan-ds-section .sub { font-size: 12px; color: #94A3B8; margin: 0 0 20px; }
		/* Type scale table */
		.type-table { width: 100%; border-collapse: collapse; font-size: 13px; }
		.type-table th { background: #F4F4F7; padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #737589; border-bottom: 1px solid #DDDDE8; }
		.type-table td { padding: 14px 12px; border-bottom: 1px solid #F0F0F5; vertical-align: middle; }
		.type-table tr:last-child td { border-bottom: none; }
		.type-table .class-name { font-family: monospace; font-size: 12px; background: #F4F4F7; padding: 3px 7px; border-radius: 6px; white-space: nowrap; color: #2563EB; }
		.type-table .preview-cell { max-width: 300px; }
		.code { font-family: monospace; font-size: 11px; background: #F4F4F7; padding: 2px 6px; border-radius: 4px; color: #7C3AED; white-space: nowrap; }
		/* Token cards */
		.token-group-label { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700; margin: 20px 0 10px; color: #1A1D2B; }
		.token-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 8px; }
		.token-card { border: 1px solid #DDDDE8; border-radius: 12px; overflow: hidden; }
		.token-swatch { height: 44px; }
		.token-info { padding: 10px 12px; }
		.token-name { font-family: monospace; font-size: 11px; color: #2563EB; font-weight: 600; }
		.token-hex { font-family: monospace; font-size: 11px; color: #737589; }
		.token-usage { font-size: 11px; color: #94A3B8; margin-top: 2px; }
		/* Breakpoints */
		.bp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
		.bp-card { border-radius: 14px; border: 2px solid; padding: 18px 20px; }
		.bp-card h3 { margin: 0 0 2px; font-size: 16px; font-weight: 700; font-family: 'Sora', sans-serif; }
		.bp-card .range { font-size: 12px; font-weight: 600; margin: 0 0 10px; opacity: 0.75; }
		.bp-card .notes { font-size: 12.5px; line-height: 1.6; color: #374151; }
		/* Radius */
		.radius-grid { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; }
		.radius-item { text-align: center; }
		.radius-box { background: #EBEBF2; border: 1.5px solid #DDDDE8; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; }
		.radius-label { font-size: 11px; color: #737589; margin-top: 4px; font-family: monospace; }
		/* Storybook */
		.sb-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
		.sb-table th { background: #F4F4F7; padding: 9px 12px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #737589; border-bottom: 1px solid #DDDDE8; }
		.sb-table td { padding: 11px 12px; border-bottom: 1px solid #F0F0F5; vertical-align: top; }
		.sb-table tr:last-child td { border-bottom: none; }
		</style>

		<div class="ikan-ds-wrap">

		<!-- Header -->
		<div class="ikan-ds-header">
			<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
				<div>
					<span class="ikan-ds-badge">Golden Source: ikan2 → ikan (WordPress)</span>
					<h1>Design System &amp; Type Scale</h1>
					<p>All typography roles, design tokens, breakpoint behaviour, and cross-repo mapping. Fonts: <strong style="color:#fff">Sora</strong> (display) · <strong style="color:#fff">Manrope</strong> (sans)</p>
				</div>
				<a href="<?php echo esc_url( home_url('/storybook/') ); ?>" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;padding:10px 20px;border-radius:999px;font-size:13px;font-weight:600;text-decoration:none;">
					📚 Open Live Storybook
				</a>
			</div>
		</div>

		<!-- TYPE SCALE -->
		<div class="ikan-ds-section">
			<h2>Type Scale</h2>
			<p class="sub">All roles are defined in <code>ikan2/src/styles.css</code> as <code>@utility</code> blocks and mirrored as plain CSS classes in <code>ikan/src/product/site/themes/demo/style.css</code> (scoped to <code>.ikan2-theme</code>). Values do NOT change with breakpoints — size is fixed and consistent across all viewports. Layout widths (max-w-read/max-w-app) control line length instead.</p>

			<table class="type-table">
				<thead>
					<tr>
						<th>Class (ikan2 @utility)</th>
						<th>HTML Tag</th>
						<th>Size / LH / Weight</th>
						<th>Tracking</th>
						<th>Font</th>
						<th style="width:260px">Live Preview</th>
						<th>Usage</th>
						<th>Mobile Note</th>
					</tr>
				</thead>
				<tbody>
				<?php
				$groups = [
					'Display'        => array_slice($type_scale, 0, 3),
					'Headline'       => array_slice($type_scale, 3, 3),
					'Subhead & Title'=> array_slice($type_scale, 6, 3),
					'Body'           => array_slice($type_scale, 9, 5),
					'Action & Label' => array_slice($type_scale, 14, 3),
				];
				$group_colors = [
					'Display'         => '#7C3AED',
					'Headline'        => '#2563EB',
					'Subhead & Title' => '#059669',
					'Body'            => '#D97706',
					'Action & Label'  => '#DC2626',
				];
				foreach ( $groups as $group_name => $items ) :
					$gc = $group_colors[$group_name];
				?>
					<tr>
						<td colspan="8" style="background:<?php echo esc_attr($gc); ?>15;padding:8px 12px;border-bottom:1px solid <?php echo esc_attr($gc); ?>30;">
							<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:<?php echo esc_attr($gc); ?>"><?php echo esc_html($group_name); ?></span>
						</td>
					</tr>
				<?php foreach ( $items as $t ) :
					$font_family = $t['family'] === 'Sora'
						? "'Sora', ui-sans-serif, sans-serif"
						: "'Manrope', ui-sans-serif, sans-serif";
					$preview_style = sprintf(
						'font-family:%s;font-size:%s;line-height:%s;font-weight:%s;letter-spacing:%s;color:#1A1D2B;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:260px;display:block;',
						$font_family, $t['size'], $t['lh'], $t['fw'], $t['ls']
					);
				?>
					<tr>
						<td><span class="class-name">.<?php echo esc_html($t['class']); ?></span></td>
						<td style="font-family:monospace;font-size:12px;color:#737589;"><?php echo esc_html($t['tag']); ?></td>
						<td>
							<span class="code"><?php echo esc_html($t['size']); ?></span>
							<span style="color:#94A3B8;font-size:11px;"> / <?php echo esc_html($t['lh']); ?> / <?php echo esc_html($t['fw']); ?></span>
						</td>
						<td><span class="code"><?php echo esc_html($t['ls']); ?></span></td>
						<td style="font-size:12px;color:#737589;"><?php echo esc_html($t['family']); ?></td>
						<td class="preview-cell">
							<span style="<?php echo esc_attr($preview_style); ?>">The quick brown fox</span>
						</td>
						<td style="font-size:12px;color:#374151;max-width:200px;"><?php echo esc_html($t['usage']); ?></td>
						<td style="font-size:11px;color:#737589;max-width:150px;"><?php echo esc_html($t['mobile_note']); ?></td>
					</tr>
				<?php endforeach; ?>
				<?php endforeach; ?>
				</tbody>
			</table>
		</div>

		<!-- BASE HTML TAG MAPPING -->
		<div class="ikan-ds-section">
			<h2>HTML Heading Tag → ikan2 Class Mapping</h2>
			<p class="sub">When rendering raw WordPress post content through <code>the_content()</code>, the <code>.prose-ikan</code> wrapper applies these styles to native HTML tags automatically.</p>
			<table class="type-table">
				<thead>
					<tr>
						<th>HTML Tag</th>
						<th>ikan2 Equivalent Class</th>
						<th>Size / LH / Weight</th>
						<th>Font</th>
						<th>Applied via</th>
						<th>Mobile</th>
					</tr>
				</thead>
				<tbody>
				<?php
				$tag_map = [
					['tag'=>'<h1>','class'=>'type-headline-lg','size'=>'32px','lh'=>'40px','fw'=>'600','font'=>'Sora','via'=>'.prose-ikan h1 { } or type-headline-lg on header','mobile'=>'Full-width, same size'],
					['tag'=>'<h2>','class'=>'type-headline-md','size'=>'28px','lh'=>'36px','fw'=>'600','font'=>'Sora','via'=>'.prose-ikan h2 { }','mobile'=>'Same'],
					['tag'=>'<h3>','class'=>'type-headline-sm','size'=>'24px','lh'=>'32px','fw'=>'600','font'=>'Sora','via'=>'.prose-ikan h3 { }','mobile'=>'Same'],
					['tag'=>'<h4>','class'=>'type-subhead','size'=>'18px','lh'=>'26px','fw'=>'600','font'=>'Sora','via'=>'.prose-ikan h4 { }','mobile'=>'Same'],
					['tag'=>'<h5>','class'=>'type-title-lg','size'=>'22px','lh'=>'28px','fw'=>'600','font'=>'Sora','via'=>'.prose-ikan h5 { }','mobile'=>'Same'],
					['tag'=>'<h6>','class'=>'type-title-md','size'=>'16px','lh'=>'24px','fw'=>'600','font'=>'Sora','via'=>'.prose-ikan h6 { }','mobile'=>'Same'],
					['tag'=>'<p>','class'=>'type-body-lg (default body)','size'=>'16px','lh'=>'26px','fw'=>'400','font'=>'Manrope','via'=>'base layer: p { font-size: 16px }','mobile'=>'Same — min 16px avoids iOS zoom'],
					['tag'=>'<strong>','class'=>'—','size'=>'inherit','lh'=>'inherit','fw'=>'650','font'=>'inherit','via'=>'.prose-ikan strong { font-weight: 650 }','mobile'=>'Same'],
					['tag'=>'<a>','class'=>'—','size'=>'inherit','lh'=>'inherit','fw'=>'500','font'=>'inherit','via'=>'.prose-ikan a { color: brand-teal-ink; underline }','mobile'=>'Touch target via min-height on parent'],
				];
				foreach ( $tag_map as $r ) : ?>
					<tr>
						<td><span class="code"><?php echo esc_html($r['tag']); ?></span></td>
						<td><span class="class-name"><?php echo esc_html($r['class']); ?></span></td>
						<td><span class="code"><?php echo esc_html($r['size']); ?></span> / <?php echo esc_html($r['lh']); ?> / <?php echo esc_html($r['fw']); ?></td>
						<td style="font-size:12px;color:#737589;"><?php echo esc_html($r['font']); ?></td>
						<td style="font-size:11px;color:#737589;font-family:monospace;"><?php echo esc_html($r['via']); ?></td>
						<td style="font-size:11px;color:#737589;"><?php echo esc_html($r['mobile']); ?></td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
		</div>

		<!-- BREAKPOINTS -->
		<div class="ikan-ds-section">
			<h2>Layout Breakpoints</h2>
			<p class="sub">Type sizes are fixed. Only <strong>container widths</strong> and <strong>nav layout</strong> change across breakpoints. The ikan2 mobile PWA and ikanhealth.in must look identical below 640px.</p>
			<div class="bp-grid">
				<?php foreach ( $breakpoints as $bp ) : ?>
				<div class="bp-card" style="border-color:<?php echo esc_attr($bp['color']); ?>;background:<?php echo esc_attr($bp['color']); ?>0D;">
					<h3 style="color:<?php echo esc_attr($bp['color']); ?>"><?php echo esc_html($bp['name']); ?></h3>
					<p class="range" style="color:<?php echo esc_attr($bp['color']); ?>"><?php echo esc_html($bp['range']); ?></p>
					<p class="notes"><?php echo esc_html($bp['notes']); ?></p>
				</div>
				<?php endforeach; ?>
			</div>
			<div style="margin-top:16px;background:#F4F4F7;border-radius:12px;padding:16px 20px;">
				<p style="margin:0 0 8px;font-size:13px;font-weight:600;">Layout class values at each breakpoint:</p>
				<table style="font-size:12px;border-collapse:collapse;width:100%;">
					<tr style="border-bottom:1px solid #DDDDE8;">
						<th style="padding:8px 12px;text-align:left;font-weight:600;color:#737589;font-size:11px;">Class</th>
						<th style="padding:8px 12px;text-align:left;color:#7C3AED;font-size:11px;">< 640px (Mobile)</th>
						<th style="padding:8px 12px;text-align:left;color:#2563EB;font-size:11px;">640–1023px (Tablet)</th>
						<th style="padding:8px 12px;text-align:left;color:#059669;font-size:11px;">≥ 1024px (Desktop)</th>
						<th style="padding:8px 12px;text-align:left;color:#D97706;font-size:11px;">PWA standalone</th>
					</tr>
					<tr style="border-bottom:1px solid #F0F0F5;"><td style="padding:8px 12px;font-family:monospace;">.max-w-app</td><td style="padding:8px 12px;">100%</td><td style="padding:8px 12px;">36rem (576px)</td><td style="padding:8px 12px;">30rem (480px)</td><td style="padding:8px 12px;">100% (override)</td></tr>
					<tr><td style="padding:8px 12px;font-family:monospace;">.max-w-read</td><td style="padding:8px 12px;">100%</td><td style="padding:8px 12px;">36rem (576px)</td><td style="padding:8px 12px;">38rem (608px)</td><td style="padding:8px 12px;">100% (override)</td></tr>
				</table>
			</div>
		</div>

		<!-- DESIGN TOKENS -->
		<div class="ikan-ds-section">
			<h2>Design Tokens (CSS Custom Properties)</h2>
			<p class="sub">All tokens defined in <code>ikan2/src/styles.css :root</code>. Mirrored in <code>ikan/src/product/site/themes/demo/style.css</code> and <code>theme.json</code>. All colors use <strong>oklch</strong> format.</p>
			<?php foreach ( $semantic_tokens as $group_name => $tokens ) : ?>
			<p class="token-group-label"><?php echo esc_html($group_name); ?></p>
			<div class="token-grid">
				<?php foreach ( $tokens as $varname => $t ) : ?>
				<div class="token-card">
					<div class="token-swatch" style="background:<?php echo esc_attr($t['hex']); ?>;"></div>
					<div class="token-info">
						<div class="token-name"><?php echo esc_html($varname); ?></div>
						<div class="token-hex"><?php echo esc_html($t['hex']); ?> · <span style="font-family:monospace;font-size:10px;color:#94A3B8;"><?php echo esc_html($t['value']); ?></span></div>
						<div class="token-usage"><?php echo esc_html($t['usage']); ?></div>
					</div>
				</div>
				<?php endforeach; ?>
			</div>
			<?php endforeach; ?>
		</div>

		<!-- RADIUS TOKENS -->
		<div class="ikan-ds-section">
			<h2>Border Radius Scale</h2>
			<p class="sub">Base: <code>--radius: 0.75rem (12px)</code>. All derived via <code>calc(var(--radius) ± Npx)</code>.</p>
			<div class="radius-grid">
				<?php
				$radii = [
					['name'=>'sm','px'=>'8px'],['name'=>'md','px'=>'10px'],['name'=>'lg','px'=>'12px'],
					['name'=>'xl','px'=>'16px'],['name'=>'2xl','px'=>'20px'],['name'=>'3xl','px'=>'24px'],
					['name'=>'4xl','px'=>'28px'],['name'=>'full','px'=>'9999px'],
				];
				foreach ( $radii as $r ) :
					$border_radius = $r['name'] === 'full' ? '9999px' : $r['px'];
				?>
				<div class="radius-item">
					<div class="radius-box" style="border-radius:<?php echo esc_attr($border_radius); ?>;">
						<span style="font-size:10px;color:#737589;"><?php echo esc_html($r['px']); ?></span>
					</div>
					<div class="radius-label">radius-<?php echo esc_html($r['name']); ?></div>
				</div>
				<?php endforeach; ?>
			</div>
		</div>

		<!-- SHADOW TOKENS -->
		<div class="ikan-ds-section">
			<h2>Shadow & Elevation</h2>
			<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;">
				<div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 0 45px oklch(0.2 0.01 255 / 0.08);">
					<div style="font-family:monospace;font-size:12px;color:#2563EB;margin-bottom:4px;">.shadow-app</div>
					<div style="font-size:11px;color:#737589;margin-bottom:8px;">InfoShell content column</div>
					<div style="font-family:monospace;font-size:10px;color:#94A3B8;">0 0 45px oklch(0.2 0.01 255 / 0.08)</div>
				</div>
				<div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 10px 30px -5px rgba(0,0,0,0.12),0 8px 10px -6px rgba(0,0,0,0.08);">
					<div style="font-family:monospace;font-size:12px;color:#2563EB;margin-bottom:4px;">.shadow-dock</div>
					<div style="font-size:11px;color:#737589;margin-bottom:8px;">Bottom navigation dock</div>
					<div style="font-family:monospace;font-size:10px;color:#94A3B8;">0 10px 30px -5px rgba(0,0,0,0.12)</div>
				</div>
				<div style="background:#fff;border:1px solid #DDDDE8;border-radius:16px;padding:20px;">
					<div style="font-family:monospace;font-size:12px;color:#2563EB;margin-bottom:4px;">.surface</div>
					<div style="font-size:11px;color:#737589;margin-bottom:8px;">Card surface with border</div>
					<div style="font-family:monospace;font-size:10px;color:#94A3B8;">border: 1px solid var(--border) · radius-xl · bg-card · shadow-card</div>
				</div>
			</div>
		</div>

		<!-- STORYBOOK MAPPING -->
		<div class="ikan-ds-section">
			<h2>Storybook → WordPress Component Mapping</h2>
			<p class="sub">Live Storybook at <a href="<?php echo esc_url(home_url('/storybook/')); ?>" target="_blank">ikanhealth.in/storybook/</a> — built from <code>ikan2/.storybook/</code> and deployed alongside the theme assets.</p>
			<table class="sb-table">
				<thead>
					<tr>
						<th>Storybook Story</th>
						<th>ikan2 Source File</th>
						<th>WordPress / PHP Equivalent</th>
					</tr>
				</thead>
				<tbody>
				<?php foreach ( $storybook_stories as $s ) : ?>
					<tr>
						<td><strong><?php echo esc_html($s['story']); ?></strong></td>
						<td><span class="code"><?php echo esc_html($s['ikan2']); ?></span></td>
						<td style="font-size:11.5px;color:#374151;font-family:monospace;"><?php echo esc_html($s['wp_equiv']); ?></td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
		</div>

		<!-- SCHEDULED AUTOMATION STATUS -->
		<div class="ikan-ds-section">
			<h2>Scheduled Governance Workflows</h2>
			<p class="sub">GitHub Actions CI/CD workflows that enforce design parity automatically.</p>
			<table class="type-table">
				<thead><tr><th>Workflow</th><th>Schedule</th><th>What it checks</th></tr></thead>
				<tbody>
					<tr><td><span class="code">scheduled-design-compliance.yml</span></td><td>Daily 02:00 UTC</td><td>Multi-surface compliance: Web, Mobile, PWA, Android · contrast ratchet · raw hex ratchet · a11y ratchet · surface boundary lint</td></tr>
					<tr><td><span class="code">scheduled-sync-worker.yml</span></td><td>Every 6 hours</td><td>Production sync telemetry · verifies ikanhealth.in endpoints · runs <code>scripts/sync-worker.mjs</code></td></tr>
					<tr><td><span class="code">ci.yml</span></td><td>Every push + PR</td><td>Build · typecheck ratchet · lint ratchet · full test suite</td></tr>
				</tbody>
			</table>
		</div>

		</div><!-- /.ikan-ds-wrap -->
		<?php
	}
}

Ikan_Design_Admin::init();
