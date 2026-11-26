<?php
/**
 * Template Name: Organization Portal
 * Template Post Type: page
 * Description: Authentic iKAN for Organisations Portal — 1:1 match with OrgPortal.tsx, Insights.tsx, People.tsx, Settings.tsx
 */

$assets = ikan_get_vite_assets();
$vite_js = $assets['js'];
$vite_css = $assets['css'];
$hero_img = 'https://images.unsplash.com/photo-1759951609703-f03171e6f66e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxtJTIwc3Vuc2V0JTIwbGFrZSUyMG5hdHVyZSUyMG1pbmRmdWxuZXNzJTIwcGVhY2VmdWx8ZW58MXx8fHwxNzczNjY4MjU5fDA&ixlib=rb-4.1.0&q=80&w=1080';
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Overview · iKAN for Organisations</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" type="image/svg+xml" href="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap">
  <link rel="stylesheet" crossorigin href="<?php echo esc_url( $vite_css ); ?>">
  <link rel="stylesheet" href="<?php echo esc_url( get_theme_file_uri( 'assets/css/tailwind.css' ) ); ?>">
  <link rel="stylesheet" href="<?php echo esc_url( get_theme_file_uri( 'assets/css/app.css' ) ); ?>">
  <link rel="stylesheet" href="<?php echo esc_url( get_stylesheet_uri() ); ?>">
  <style>
    /* Critical Org Portal Tokens & Layout from org.css */
    :root, .ikan2-theme {
      --canvas: #f8f9fa;
      --foreground: #151515;
      --background: #ffffff;
      --muted: #f1f3f5;
      --muted-foreground: #717182;
      --border: rgba(0, 0, 0, 0.08);
      --font-display: 'Sora', system-ui, sans-serif;
      --font-sans: 'Manrope', 'Inter', system-ui, sans-serif;
      --page-gutter: 20px;
      --page-max: 1100px;
      --read-max: 680px;
      --radius-lg: 16px;
      --radius-card: 20px;
      --brand-teal-ink: #0d9488;
      --brand-amber-ink: #d97706;
      --brand-coral-ink: #e11d48;
      --brand-slate: #64748b;
    }
    body.ikan2-theme, .ikan2-theme.org-portal, .ikan2-theme .org-portal {
      min-height: 100vh;
      background: var(--canvas);
      color: var(--foreground);
      font-family: var(--font-sans);
      margin: 0;
      padding: 0;
    }
    .org-bar {
      position: sticky;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      min-height: 64px;
      padding-block: 8px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
    }
    .org-bar__inner {
      display: flex;
      align-items: center;
      gap: 16px;
      width: min(100% - (var(--page-gutter) * 2), var(--page-max));
      margin-inline: auto;
    }
    .org-bar__brand {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      text-decoration: none;
      color: var(--foreground);
    }
    .org-bar__brand img { width: 32px; height: 32px; border-radius: 8px; }
    .org-bar__org {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding-left: 16px;
      border-left: 1px solid var(--border);
      font-size: 14px;
      font-weight: 600;
      color: var(--muted-foreground);
    }
    .org-bar__initial {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--foreground);
      color: #ffffff;
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .org-bar__spacer { flex: 1; }
    .org-tabs { display: flex; gap: 4px; }
    .org-tab {
      display: inline-flex;
      align-items: center;
      height: 36px;
      padding: 0 16px;
      border: 0;
      border-radius: 9999px;
      background: none;
      cursor: pointer;
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 500;
      color: var(--muted-foreground);
      transition: all 0.15s ease;
    }
    .org-tab:hover { background: rgba(0, 0, 0, 0.05); color: var(--foreground); }
    .org-tab[aria-current='page'], .org-tab.is-active {
      background: var(--foreground);
      color: #ffffff;
      font-weight: 600;
    }
    .org-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 40px;
      padding: 0 20px;
      border: 1px solid transparent;
      border-radius: 9999px;
      background: var(--foreground);
      color: #ffffff;
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .org-button:hover { opacity: 0.92; }
    .org-button--quiet {
      background: transparent;
      border-color: var(--border);
      color: var(--foreground);
    }
    .org-button--quiet:hover { background: rgba(0, 0, 0, 0.04); }
    .org-page {
      width: min(100% - (var(--page-gutter) * 2), var(--page-max));
      margin-inline: auto;
      padding-block: 36px 64px;
    }
    .org-page__title {
      font-family: var(--font-display);
      font-size: 32px;
      line-height: 40px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .org-page__lede {
      font-size: 16px;
      line-height: 24px;
      color: var(--muted-foreground);
      margin: 8px 0 0;
      max-width: var(--read-max);
    }
    .org-lead {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 16px 32px;
      margin-top: 28px;
      padding: 28px 32px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    .org-lead__value {
      font-family: var(--font-display);
      font-size: 52px;
      line-height: 1;
      font-weight: 700;
      letter-spacing: -0.03em;
    }
    .org-lead__of { font-size: 24px; font-weight: 500; color: var(--muted-foreground); }
    .org-lead__side { display: flex; flex-direction: column; gap: 4px; }
    .org-lead__label { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); }
    .org-lead__delta { font-size: 14px; font-weight: 600; color: var(--brand-teal-ink); }
    .org-facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .org-fact {
      padding: 20px 24px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .org-fact__label { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); margin: 0; }
    .org-fact__value { font-family: var(--font-display); font-size: 28px; font-weight: 700; margin: 8px 0 0; }
    .org-card {
      margin-top: 24px;
      padding: 28px 32px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
    }
    .org-card__title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 16px;
    }
    .org-bands {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    .org-band {
      padding: 16px;
      border-radius: 12px;
      background: var(--muted);
    }
    .org-band__head { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 500; }
    .org-band__dot { width: 10px; height: 10px; border-radius: 9999px; }
    .org-band__range { margin-left: auto; font-size: 12px; color: var(--muted-foreground); }
    .org-band__value { margin: 8px 0 0; font-family: var(--font-display); font-size: 28px; font-weight: 700; }
    .org-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      font-size: 14px;
    }
    .org-table th {
      text-align: left;
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted-foreground);
      border-bottom: 1px solid var(--border);
    }
    .org-table td {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
    }
    .org-suppressed-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      margin-top: 20px;
      border-radius: 12px;
      background: rgba(13, 148, 136, 0.08);
      border-left: 4px solid var(--brand-teal-ink);
      font-size: 13.5px;
      color: #134e4a;
    }
    /* Org Login Screen Split */
    .org-login {
      display: grid;
      grid-template-columns: 1fr;
      min-height: 100vh;
    }
    @media (min-width: 900px) {
      .org-login { grid-template-columns: 1fr 1fr; }
    }
    .org-login__art {
      position: relative;
      display: none;
      overflow: hidden;
      background: #111827;
    }
    @media (min-width: 900px) {
      .org-login__art { display: block; }
    }
    .org-login__art img { width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }
    .org-login__scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
    }
    .org-login__words {
      position: absolute;
      bottom: 48px;
      left: 48px;
      right: 48px;
      color: #ffffff;
    }
    .org-login__words h2 {
      font-family: var(--font-display);
      font-size: 32px;
      line-height: 40px;
      font-weight: 700;
      margin: 0 0 12px;
    }
    .org-login__words p {
      font-size: 16px;
      line-height: 24px;
      opacity: 0.85;
      margin: 0;
    }
    .org-login__form {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 48px 32px;
      background: #ffffff;
    }
    @media (min-width: 600px) {
      .org-login__form { padding: 64px; }
    }
    .org-login__card {
      width: 100%;
      max-width: 400px;
      margin-inline: auto;
    }
    .org-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 18px;
    }
    .org-field span { font-size: 13.5px; font-weight: 600; color: var(--foreground); }
    .org-field input, .org-field select {
      height: 44px;
      padding: 0 14px;
      border: 1px solid var(--border);
      border-radius: 12px;
      font-family: var(--font-sans);
      font-size: 14px;
      color: var(--foreground);
      background: var(--canvas);
      outline: none;
      transition: border-color 0.15s;
    }
    .org-field input:focus, .org-field select:focus {
      border-color: var(--foreground);
      background: #ffffff;
    }
  </style>
  <?php wp_head(); ?>
</head>
<body class="ikan2-theme">

<div id="root">
  <!-- Default view: Full Interactive Portal Dashboard (matching OrgPortal.tsx with DEMO_ORG) -->
  <div id="org-app" class="ikan2-theme org-portal">

    <!-- Sticky Navigation Bar -->
    <header class="org-bar">
      <div class="org-bar__inner">
        <a class="org-bar__brand" href="<?php echo esc_url( home_url( '/org' ) ); ?>">
          <img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>" alt="iKAN" width="32" height="32">
          iKAN
        </a>
        <span class="org-bar__org">
          <span class="org-bar__initial">W</span>
          Wugweb (Demo)
        </span>

        <span class="org-bar__spacer"></span>

        <nav class="org-tabs" aria-label="Sections">
          <button type="button" class="org-tab is-active" aria-current="page" data-target="tab-overview">Overview</button>
          <button type="button" class="org-tab" data-target="tab-people">People</button>
          <button type="button" class="org-tab" data-target="tab-settings">Settings</button>
        </nav>

        <a href="<?php echo esc_url( home_url( '/corporate/join' ) ); ?>" class="org-button" style="height: 36px; padding: 0 14px; font-size: 13px; text-decoration: none;">
          Request Pilot
        </a>

        <button type="button" id="btn-toggle-login-view" class="org-button org-button--quiet" style="height: 36px; padding: 0 14px; font-size: 13px;">
          Sign in
        </button>
      </div>
    </header>

    <!-- TAB 1: OVERVIEW (Insights.tsx) -->
    <section id="tab-overview" class="org-page org-tab-content">
      <div class="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 class="org-page__title">Wugweb Technologies</h1>
          <p class="org-page__lede">Aggregate wellbeing insight across 240 eligible members. Privacy threshold k &ge; 5 strictly enforced.</p>
        </div>
        <a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="org-button org-button--quiet" style="font-size: 13px;">
          Open Calculator &rarr;
        </a>
      </div>

      <!-- Lead Score Card -->
      <div class="org-lead">
        <div>
          <span class="org-lead__value">74</span>
          <span class="org-lead__of">/ 100</span>
        </div>
        <div class="org-lead__side">
          <span class="org-lead__label">Aggregate Wellbeing Score</span>
          <span class="org-lead__delta">&uarr; +3.8 pts vs previous quarter</span>
        </div>
      </div>

      <!-- Core Fact Metrics -->
      <div class="org-facts">
        <div class="org-fact">
          <p class="org-fact__label">Active Participants</p>
          <p class="org-fact__value">182 <span style="font-size: 16px; font-weight: 500; color: var(--muted-foreground);">/ 240 (75.8%)</span></p>
        </div>
        <div class="org-fact">
          <p class="org-fact__label">Equip Cohorts</p>
          <p class="org-fact__value">64 <span style="font-size: 16px; font-weight: 500; color: var(--muted-foreground);">completed</span></p>
        </div>
        <div class="org-fact">
          <p class="org-fact__label">Clinical Consultations</p>
          <p class="org-fact__value">128 <span style="font-size: 16px; font-weight: 500; color: var(--muted-foreground);">hours</span></p>
        </div>
        <div class="org-fact">
          <p class="org-fact__label">Burnout Exposure</p>
          <p class="org-fact__value">-34% <span style="font-size: 16px; font-weight: 500; color: var(--brand-teal-ink);">&darr; post-program</span></p>
        </div>
      </div>

      <!-- Wellbeing Bands (Thriving / Coping / Vulnerable / Distressed) -->
      <div class="org-card">
        <h2 class="org-card__title">Wellbeing Distribution</h2>
        <div class="org-bands">
          <div class="org-band">
            <div class="org-band__head">
              <span class="org-band__dot" style="background: var(--brand-teal-ink);"></span>
              <span>Thriving</span>
              <span class="org-band__range">75–100</span>
            </div>
            <p class="org-band__value" style="color: var(--brand-teal-ink);">54%</p>
          </div>
          <div class="org-band">
            <div class="org-band__head">
              <span class="org-band__dot" style="background: var(--brand-amber-ink);"></span>
              <span>Coping</span>
              <span class="org-band__range">50–74</span>
            </div>
            <p class="org-band__value" style="color: var(--brand-amber-ink);">32%</p>
          </div>
          <div class="org-band">
            <div class="org-band__head">
              <span class="org-band__dot" style="background: var(--brand-coral-ink);"></span>
              <span>Vulnerable</span>
              <span class="org-band__range">25–49</span>
            </div>
            <p class="org-band__value" style="color: var(--brand-coral-ink);">11%</p>
          </div>
          <div class="org-band">
            <div class="org-band__head">
              <span class="org-band__dot" style="background: #991b1b;"></span>
              <span>Distressed</span>
              <span class="org-band__range">0–24</span>
            </div>
            <p class="org-band__value" style="color: #991b1b;">3%</p>
          </div>
        </div>
      </div>

      <!-- Department Distribution Table -->
      <div class="org-card">
        <h2 class="org-card__title">Department Comparison</h2>
        <table class="org-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Eligible Members</th>
              <th>Active Participation</th>
              <th>Mean Score</th>
              <th>Equip Adoption</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Engineering</strong></td>
              <td>68</td>
              <td>82%</td>
              <td><strong style="color: var(--brand-teal-ink);">72</strong> / 100</td>
              <td>42%</td>
            </tr>
            <tr>
              <td><strong>Product &amp; Design</strong></td>
              <td>34</td>
              <td>88%</td>
              <td><strong style="color: var(--brand-teal-ink);">76</strong> / 100</td>
              <td>58%</td>
            </tr>
            <tr>
              <td><strong>Marketing</strong></td>
              <td>28</td>
              <td>79%</td>
              <td><strong style="color: var(--brand-teal-ink);">79</strong> / 100</td>
              <td>61%</td>
            </tr>
            <tr>
              <td><strong>Sales</strong></td>
              <td>45</td>
              <td>71%</td>
              <td><strong style="color: var(--brand-amber-ink);">71</strong> / 100</td>
              <td>38%</td>
            </tr>
            <tr>
              <td><strong>Operations</strong></td>
              <td>22</td>
              <td>77%</td>
              <td><strong style="color: var(--brand-teal-ink);">75</strong> / 100</td>
              <td>45%</td>
            </tr>
            <tr style="opacity: 0.75; background: rgba(0, 0, 0, 0.02);">
              <td><strong>HR &amp; People</strong> <small style="color: var(--muted-foreground);">(4 members)</small></td>
              <td>4</td>
              <td colspan="3">
                <span style="display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--muted-foreground); font-size: 12.5px;">
                  🔒 Suppressed — Below Privacy Threshold (k &lt; 5)
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="org-suppressed-banner">
          <div>
            <strong>Architectural Guarantee:</strong> Teams with fewer than 5 members are automatically suppressed from aggregate score calculations. No individual's health data or assessment scores can ever be inferred by management.
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 2: PEOPLE (People.tsx) -->
    <section id="tab-people" class="org-page org-tab-content" style="display: none;">
      <div class="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h1 class="org-page__title">Team Roster</h1>
          <p class="org-page__lede">Manage eligible employee seats and invitations. Health data and app activity are never visible on individual profiles.</p>
        </div>
        <button type="button" class="org-button" onclick="alert('Demo Mode: Roster management is simulated for Wugweb.');">
          + Invite Member
        </button>
      </div>

      <div class="org-card">
        <table class="org-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Work Email</th>
              <th>Department</th>
              <th>Portal Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Vedanshu</strong></td>
              <td>vedanshu@wugweb.com</td>
              <td>Leadership</td>
              <td>Admin</td>
              <td><span style="color: var(--brand-teal-ink); font-weight: 600;">Active</span></td>
            </tr>
            <tr>
              <td><strong>Priya Patel</strong></td>
              <td>priya@wugweb.com</td>
              <td>Product &amp; Design</td>
              <td>Admin</td>
              <td><span style="color: var(--brand-teal-ink); font-weight: 600;">Active</span></td>
            </tr>
            <tr>
              <td><strong>Rohan Mehta</strong></td>
              <td>rohan@wugweb.com</td>
              <td>Engineering</td>
              <td>Member</td>
              <td><span style="color: var(--brand-teal-ink); font-weight: 600;">Active</span></td>
            </tr>
            <tr>
              <td><strong>Sneha Rao</strong></td>
              <td>sneha@wugweb.com</td>
              <td>Marketing</td>
              <td>Member</td>
              <td><span style="color: var(--muted-foreground);">Pending Invite</span></td>
            </tr>
            <tr>
              <td><strong>Vikram Verma</strong></td>
              <td>vikram@wugweb.com</td>
              <td>Engineering</td>
              <td>Member</td>
              <td><span style="color: var(--brand-teal-ink); font-weight: 600;">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- TAB 3: SETTINGS (Settings.tsx) -->
    <section id="tab-settings" class="org-page org-tab-content" style="display: none;">
      <h1 class="org-page__title">Organisation Settings</h1>
      <p class="org-page__lede">Manage your organization profile, authentication domains, and privacy thresholds.</p>

      <div class="org-card" style="max-width: 600px;">
        <label class="org-field">
          <span>Organisation Legal Name</span>
          <input type="text" value="Wugweb Technologies India Pvt. Ltd." readonly />
        </label>
        <label class="org-field">
          <span>Allowed Work Email Domains</span>
          <input type="text" value="wugweb.com, wugweb.in" readonly />
        </label>
        <label class="org-field">
          <span>Strict k-Anonymity Threshold</span>
          <input type="number" value="5" readonly />
          <small style="color: var(--muted-foreground); margin-top: 4px;">Minimum group size required before aggregate metrics are computed. Cannot be set lower than 5.</small>
        </label>
        <label class="org-field">
          <span>Primary Contact</span>
          <input type="text" value="Vedanshu (Founder &amp; CEO)" readonly />
        </label>
      </div>
    </section>

  </div><!-- /#org-app -->

  <!-- Fallback/Switchable Sign In Screen (.org-login) -->
  <div id="org-login-view" class="ikan2-theme org-portal org-login" style="display: none;">
    <aside class="org-login__art" aria-hidden="true">
      <img src="<?php echo esc_url( $hero_img ); ?>" alt="Calm lake">
      <div class="org-login__scrim"></div>
      <div class="org-login__words">
        <h2>Wellbeing your people can use, and you can measure.</h2>
        <p>Aggregate insight into how your organisation is doing — never a window into any one person.</p>
      </div>
    </aside>

    <div class="org-login__form">
      <a class="org-bar__brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" style="margin-bottom: 24px;">
        <img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>" alt="iKAN Health logo" width="32" height="32">
        iKAN
      </a>

      <div class="org-login__card">
        <h1 class="org-page__title" style="font-size: 24px; line-height: 32px;">
          Organisation sign in
        </h1>
        <p class="org-page__lede" style="font-size: 14px; margin-bottom: 20px;">
          For administrators of an organisation that uses iKAN. Looking for your own member account? That lives in the app.
        </p>

        <form onsubmit="event.preventDefault(); document.getElementById('org-login-view').style.display='none'; document.getElementById('org-app').style.display='block';">
          <label class="org-field">
            <span>Work email</span>
            <input type="email" id="org-login-email" required placeholder="you@yourcompany.com" value="admin@wugweb.com">
          </label>
          <label class="org-field">
            <span>Password</span>
            <input type="password" id="org-login-password" required value="WugWeb123@">
          </label>

          <div style="margin-top: 10px; text-align: center;">
            <button type="button" onclick="document.getElementById('org-login-email').value='admin@wugweb.com'; document.getElementById('org-login-password').value='WugWeb123@';" style="background: none; border: none; font-size: 12px; color: var(--brand-teal-ink); font-weight: 600; cursor: pointer; text-decoration: underline;">
              Fill Demo Credentials: admin@wugweb.com / WugWeb123@
            </button>
          </div>

          <div style="margin-top: 20px;">
            <button type="submit" class="org-button" style="width: 100%; justify-content: center;">
              Sign in
            </button>
          </div>
          <div style="margin-top: 10px;">
            <button type="button" id="btn-back-to-demo" class="org-button org-button--quiet" style="width: 100%; justify-content: center;">
              Explore Interactive Demo
            </button>
          </div>
        </form>

        <p style="margin-top: 24px; font-size: 13px; color: var(--muted-foreground); line-height: 20px;">
          No access yet? Ask whoever set up iKAN at your organisation, or write to <a href="mailto:support@ikanhealth.in" style="color: var(--brand-teal-ink); font-weight: 600;">support@ikanhealth.in</a>.
        </p>

        <p style="margin-top: 12px; font-size: 13px; text-align: center;">
          <a href="<?php echo esc_url( home_url( '/corporate/join' ) ); ?>" style="color: var(--brand-teal-ink); font-weight: 600; text-decoration: underline;">Looking to onboard your organisation? Request a pilot &rarr;</a>
        </p>
      </div>
    </div>
  </div><!-- /#org-login-view -->

</div><!-- /#root -->

<!-- Tab Switcher & Interactive Demo Logic -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('.org-tab');
  const sections = document.querySelectorAll('.org-tab-content');
  const toggleBtn = document.getElementById('btn-toggle-login-view');
  const backDemoBtn = document.getElementById('btn-back-to-demo');
  const orgApp = document.getElementById('org-app');
  const loginView = document.getElementById('org-login-view');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.removeAttribute('aria-current');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-current', 'page');

      sections.forEach(sec => {
        sec.style.display = (sec.id === targetId) ? 'block' : 'none';
      });
    });
  });

  if (toggleBtn && orgApp && loginView) {
    toggleBtn.addEventListener('click', function() {
      orgApp.style.display = 'none';
      loginView.style.display = 'grid';
    });
  }

  if (backDemoBtn && orgApp && loginView) {
    backDemoBtn.addEventListener('click', function() {
      loginView.style.display = 'none';
      orgApp.style.display = 'block';
    });
  }
});
</script>

<!-- Vite React SPA Module Mount -->
<script type="module" crossorigin src="<?php echo esc_url( $vite_js ); ?>"></script>

<?php wp_footer(); ?>
</body>
</html>
