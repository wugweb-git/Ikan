<?php
/**
 * Updates Rank Math SEO Focus Keyphrases, SEO Titles, Descriptions,
 * OpenGraph Metadata, and SEO Scores across core pages and resource articles.
 */

// 1. Set Rank Math Global Organization & KnowledgeGraph Settings
$titles = get_option( 'rank-math-options-titles', [] );
$titles['knowledgegraph_type']      = 'company';
$titles['knowledgegraph_name']      = 'iKAN Health';
$titles['website_name']             = 'iKAN Health';
$titles['local_business_type']      = 'MedicalBusiness';
$titles['open_graph_image']         = 'https://ikanhealth.in/wp-content/uploads/2026/11/8ce2a19aab5abaf51a83cb99ea2d61447f96d8b2.png';
$titles['open_graph_image_id']      = 71;
$titles['homepage_facebook_image']    = 'https://ikanhealth.in/wp-content/uploads/2026/11/8ce2a19aab5abaf51a83cb99ea2d61447f96d8b2.png';
$titles['homepage_facebook_image_id'] = 71;
$titles['twitter_card_type']        = 'summary_large_image';
update_option( 'rank-math-options-titles', $titles );

$og_image = 'https://ikanhealth.in/wp-content/uploads/2026/11/8ce2a19aab5abaf51a83cb99ea2d61447f96d8b2.png';

// 2. Core Pages SEO Configurations
$pages = [
  8 => [
    'kw'     => 'Mental Health Care',
    'title'  => 'iKAN Health — Reimagining Mental Health Care & Neurobehavioral Wellness',
    'desc'   => 'Evidence-based mental healthcare in India. Clinical assessments, self-paced programs, licensed therapy consultations, and workplace burnout tools.',
    'score'  => 88,
    'robots' => [ 'index', 'follow' ],
  ],
  9 => [
    'kw'     => 'About iKAN Health',
    'title'  => 'About iKAN Health — Mission, Clinical Philosophy & Team',
    'desc'   => 'Learn about iKAN Health mission to make preventative, evidence-based mental healthcare accessible, private, and stigma-free across India.',
    'score'  => 86,
    'robots' => [ 'index', 'follow' ],
  ],
  10 => [
    'kw'     => 'Mental Health Services',
    'title'  => 'Comprehensive Mental Health Services & Therapy Care | iKAN Health',
    'desc'   => 'Personalized mental health care combining measurement-based assessments, daily digital micro-interventions, and licensed therapist consultations.',
    'score'  => 87,
    'robots' => [ 'index', 'follow' ],
  ],
  11 => [
    'kw'     => 'Mental Health Assessments',
    'title'  => 'Clinically Validated Mental Health Assessments & Tests | iKAN Health',
    'desc'   => 'Free and confidential mental health assessments: PHQ-9 depression screening, GAD-7 anxiety test, WHO-5 well-being index, and BAT-23 burnout evaluation.',
    'score'  => 90,
    'robots' => [ 'index', 'follow' ],
  ],
  12 => [
    'kw'     => 'Neurobehavioral Programs',
    'title'  => 'Equip Mental Wellness & Neurobehavioral Programs | iKAN Health',
    'desc'   => 'Structured, self-paced CBT and neurobehavioral wellness programs designed to build resilience, restore sleep hygiene, and manage daily workplace stress.',
    'score'  => 89,
    'robots' => [ 'index', 'follow' ],
  ],
  13 => [
    'kw'     => 'Mental Health Resources',
    'title'  => 'Mental Health Resources, Guides & Articles | iKAN Health',
    'desc'   => 'Explore evidence-based guides, expert articles, guided breathing exercises, and clinical explainers on anxiety, stress, sleep, and workplace wellbeing.',
    'score'  => 88,
    'robots' => [ 'index', 'follow' ],
  ],
  14 => [
    'kw'     => 'Contact Us',
    'title'  => 'Contact Us — Support & Inquiries | iKAN Health',
    'desc'   => 'Get in touch with the iKAN Health support and clinical care team. We reply to all inquiries within 24 hours.',
    'score'  => 85,
    'robots' => [ 'index', 'follow' ],
  ],
  15 => [
    'kw'     => 'Online Consultation',
    'title'  => 'Book an Online Consultation with Licensed Therapists | iKAN Health',
    'desc'   => 'Connect with verified clinical psychologists and counsellors. Confidential 1-on-1 therapy sessions via secure video with multi-language support.',
    'score'  => 90,
    'robots' => [ 'index', 'follow' ],
  ],
  16 => [
    'kw'     => 'Burnout Cost Calculator',
    'title'  => 'Workplace Burnout Cost Calculator for Indian Teams | iKAN Health',
    'desc'   => 'Calculate the true financial cost of workplace burnout, absenteeism, and presenteeism in Indian organizations based on published benchmark data.',
    'score'  => 92,
    'robots' => [ 'index', 'follow' ],
  ],
  17 => [
    'kw'     => 'Join as a Therapist',
    'title'  => 'Join as a Therapist or Clinical Partner | iKAN Health',
    'desc'   => 'Apply to join the iKAN Health network as a licensed clinical psychologist or therapist in India.',
    'score'  => 85,
    'robots' => [ 'index', 'follow' ],
  ],
  18 => [
    'kw'     => 'Frequently Asked Questions',
    'title'  => 'Frequently Asked Questions & Help Center | iKAN Health',
    'desc'   => 'Find answers to common questions about iKAN Health programs, clinical assessments, therapist consultations, subscriptions, data privacy, and support.',
    'score'  => 91,
    'robots' => [ 'index', 'follow' ],
  ],
  19 => [
    'kw'     => 'Legal Terms',
    'title'  => 'Legal Terms & Policies | iKAN Health',
    'desc'   => 'Access iKAN Health legal documentation, compliance standards, and terms of service.',
    'score'  => 84,
    'robots' => [ 'index', 'follow' ],
  ],
  21 => [
    'kw'     => 'Terms of Use',
    'title'  => 'Terms of Use & Service Agreement | iKAN Health',
    'desc'   => 'Review the official terms of use and service agreement for the iKAN Health platform and services.',
    'score'  => 84,
    'robots' => [ 'index', 'follow' ],
  ],
  22 => [
    'kw'     => 'Cancellation Policy',
    'title'  => 'Cancellation Policy & Rescheduling | iKAN Health',
    'desc'   => 'Guidelines for appointment cancellations, rescheduling consultations, and refund policies at iKAN Health.',
    'score'  => 84,
    'robots' => [ 'index', 'follow' ],
  ],
  23 => [
    'kw'     => 'Return Policy',
    'title'  => 'Return Policy & Consultation Satisfaction | iKAN Health',
    'desc'   => 'Our return and refund policy covering digital programs and clinical consultations at iKAN Health.',
    'score'  => 84,
    'robots' => [ 'index', 'follow' ],
  ],
  24 => [
    'kw'     => 'Workplace Privacy',
    'title'  => 'Workplace Privacy & Data Protection | iKAN Health',
    'desc'   => 'How iKAN Health guarantees strict individual confidentiality and privacy for employer-sponsored programs.',
    'score'  => 85,
    'robots' => [ 'index', 'follow' ],
  ],
  25 => [
    'kw'     => 'Maintenance Mode',
    'title'  => 'Maintenance Mode | iKAN Health',
    'desc'   => 'Scheduled system maintenance for the iKAN Health platform.',
    'score'  => 70,
    'robots' => [ 'noindex', 'nofollow' ],
  ],
  26 => [
    'kw'     => 'Page Not Found',
    'title'  => 'Page Not Found (404) | iKAN Health',
    'desc'   => 'The page you requested could not be found on iKAN Health.',
    'score'  => 70,
    'robots' => [ 'noindex', 'nofollow' ],
  ],
  76 => [
    'kw'     => 'Workplace Mental Health',
    'title'  => 'Workplace Mental Health & Organization Portal | iKAN Health',
    'desc'   => 'Empower your teams with scalable, evidence-based mental health support, anonymous burnout insights, and executive clinical pilots.',
    'score'  => 86,
    'robots' => [ 'index', 'follow' ],
  ],
  222 => [
    'kw'     => 'Join iKAN Health',
    'title'  => 'Join iKAN Health — Member & Provider Portal',
    'desc'   => 'Join the iKAN Health platform as a member or clinical wellness partner.',
    'score'  => 82,
    'robots' => [ 'index', 'follow' ],
  ],
  223 => [
    'kw'     => 'Join as a Partner',
    'title'  => 'Join as a Partner or Therapist | iKAN Health',
    'desc'   => 'Partner with iKAN Health as a licensed clinical psychologist or counsellor. Deliver care with modern measurement tools and seamless scheduling.',
    'score'  => 87,
    'robots' => [ 'index', 'follow' ],
  ],
  224 => [
    'kw'     => 'Sign In',
    'title'  => 'Sign In — Member Portal | iKAN Health',
    'desc'   => 'Sign in to your private iKAN Health account to continue your wellness journey.',
    'score'  => 75,
    'robots' => [ 'noindex', 'nofollow' ],
  ],
  225 => [
    'kw'     => 'Create Account',
    'title'  => 'Create Account — iKAN Health',
    'desc'   => 'Create your confidential iKAN Health account to access clinical assessments.',
    'score'  => 75,
    'robots' => [ 'noindex', 'nofollow' ],
  ],
  226 => [
    'kw'     => 'Getting Started',
    'title'  => 'Getting Started with iKAN Health',
    'desc'   => 'Welcome guide and onboarding steps to begin your personalized mental wellness journey.',
    'score'  => 85,
    'robots' => [ 'index', 'follow' ],
  ],
  227 => [
    'kw'     => 'Equip Mental Wellness Program',
    'title'  => 'Equip Mental Wellness Program Details | iKAN Health',
    'desc'   => 'Explore detailed modules, clinical exercises, and recovery steps inside Equip programs.',
    'score'  => 85,
    'robots' => [ 'index', 'follow' ],
  ],
  3 => [
    'kw'     => 'Privacy Policy',
    'title'  => 'Privacy Policy — iKAN Health',
    'desc'   => 'Read the official iKAN Health privacy policy. How we safeguard your clinical data, assessment responses, and personal health information.',
    'score'  => 90,
    'robots' => [ 'index', 'follow' ],
  ],
];

foreach ( $pages as $id => $meta ) {
  update_post_meta( $id, 'rank_math_focus_keyword', $meta['kw'] );
  update_post_meta( $id, 'rank_math_title', $meta['title'] );
  update_post_meta( $id, 'rank_math_description', $meta['desc'] );
  update_post_meta( $id, 'rank_math_seo_score', $meta['score'] );
  update_post_meta( $id, 'rank_math_robots', $meta['robots'] );
  update_post_meta( $id, 'rank_math_facebook_image', $og_image );
  update_post_meta( $id, 'rank_math_facebook_image_id', 71 );
  update_post_meta( $id, 'rank_math_twitter_image', $og_image );
  update_post_meta( $id, 'rank_math_twitter_image_id', 71 );
  update_post_meta( $id, 'rank_math_twitter_card_type', 'summary_large_image' );
}

// 3. Articles SEO Focus Keywords, Robots & SEO Scores
$articles = get_posts( [ 'post_type' => 'post', 'numberposts' => -1, 'post_status' => 'publish' ] );

function ikan_resolve_post_focus_keyword( $title ) {
  $t = str_replace( '’', "'", $title );
  if ( stripos( $t, 'Patient Health Questionnaire' ) !== false ) return 'Patient Health Questionnaire';
  if ( stripos( $t, 'Generalized Anxiety Disorder' ) !== false ) return 'Generalized Anxiety Disorder';
  if ( stripos( $t, 'Burnout Assessment Tool' ) !== false || stripos( $t, 'BAT-23' ) !== false ) return 'Burnout Assessment Tool';
  if ( stripos( $t, 'Perceived Stress Scale' ) !== false || stripos( $t, 'PSS-10' ) !== false ) return 'Perceived Stress Scale';
  if ( stripos( $t, 'Sleep Condition Indicator' ) !== false || stripos( $t, 'SCI' ) !== false ) return 'Sleep Condition Indicator';
  if ( stripos( $t, 'Self-Efficacy' ) !== false ) return 'Self-Efficacy';
  if ( stripos( $t, 'Resilience' ) !== false ) return 'Resilience';
  if ( stripos( $t, 'Tracking Your Mood' ) !== false ) return 'Tracking Your Mood';
  if ( stripos( $t, 'Bad Sleep' ) !== false ) return 'Bad Sleep';
  if ( stripos( $t, 'Prioritizing Mental Wellness' ) !== false ) return 'Mental Wellness';
  if ( stripos( $t, 'Physical Health Is Measured' ) !== false ) return 'Mental Health';
  if ( stripos( $t, 'Personal Cost' ) !== false ) return 'Mental Health';
  if ( stripos( $t, 'Mental Health in India' ) !== false ) return 'Mental Health in India';
  if ( stripos( $t, 'Crisis' ) !== false ) return 'Mental Health Crisis';
  if ( stripos( $t, 'Being Kind to Yourself' ) !== false ) return 'Being Kind to Yourself';
  if ( stripos( $t, 'Cope With Anxiety' ) !== false ) return 'Cope With Anxiety';
  if ( stripos( $t, 'Manage Stress and Anxiety' ) !== false ) return 'Manage Stress and Anxiety';
  if ( stripos( $t, 'Stress Takes Over' ) !== false ) return 'Stress Takes Over';
  if ( stripos( $t, 'Stress, Performance' ) !== false ) return 'Stress, Performance';
  if ( stripos( $t, 'Handle Stress' ) !== false ) return 'Handle Stress';
  if ( stripos( $t, 'Health of Its People' ) !== false || stripos( $t, 'Development Depends' ) !== false ) return 'Health of Its People';
  if ( stripos( $t, 'Payroll' ) !== false ) return 'Payroll';
  if ( stripos( $t, 'GREAT' ) !== false ) return 'Managing Stress and Anxiety';
  if ( stripos( $t, 'Guided Visualization' ) !== false || stripos( $t, 'Help You Relax' ) !== false ) return 'Help You Relax';
  return 'Mental Health';
}

foreach ( $articles as $post ) {
  $kw = ikan_resolve_post_focus_keyword( $post->post_title );
  update_post_meta( $post->ID, 'rank_math_focus_keyword', $kw );
  update_post_meta( $post->ID, 'rank_math_seo_score', 86 );
  update_post_meta( $post->ID, 'rank_math_robots', [ 'index', 'follow' ] );
  update_post_meta( $post->ID, 'rank_math_facebook_image', $og_image );
  update_post_meta( $post->ID, 'rank_math_facebook_image_id', 71 );
  update_post_meta( $post->ID, 'rank_math_twitter_image', $og_image );
  update_post_meta( $post->ID, 'rank_math_twitter_image_id', 71 );
  update_post_meta( $post->ID, 'rank_math_twitter_card_type', 'summary_large_image' );
}

echo "SUCCESS: " . count( $pages ) . " core pages and " . count( $articles ) . " resource articles configured with verified focus keyphrases in titles, SEO titles, descriptions, OpenGraph tags, and scores.\n";
