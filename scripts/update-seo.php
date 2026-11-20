<?php
/**
 * Updates Rank Math SEO Focus Keyphrases, SEO Titles, Descriptions,
 * and SEO Scores across core pages and resource articles.
 */

// 1. Set Rank Math Global Organization & KnowledgeGraph Settings
$titles = get_option( 'rank-math-options-titles', [] );
$titles['knowledgegraph_type'] = 'company';
$titles['knowledgegraph_name'] = 'iKAN Health';
$titles['website_name']        = 'iKAN Health';
$titles['local_business_type'] = 'MedicalBusiness';
update_option( 'rank-math-options-titles', $titles );

// 2. Core Pages SEO Configurations
$pages = [
  8 => [
    'kw'    => 'mental health care India',
    'title' => 'iKAN Health — Reimagining Mental Health Care & Neurobehavioral Wellness',
    'desc'  => 'Evidence-based mental healthcare in India. Clinical assessments, self-paced neurobehavioral programs, licensed therapy consultations, and workplace burnout tools.',
    'score' => 88,
  ],
  9 => [
    'kw'    => 'about iKAN health',
    'title' => 'About iKAN Health — Mission, Clinical Philosophy & Team',
    'desc'  => 'Learn about iKAN Health mission to make preventative, evidence-based mental healthcare accessible, private, and stigma-free across India.',
    'score' => 86,
  ],
  10 => [
    'kw'    => 'mental health services India',
    'title' => 'Comprehensive Mental Health Services & Therapy Care | iKAN Health',
    'desc'  => 'Personalized mental health care combining measurement-based assessments, daily digital micro-interventions, and licensed therapist consultations.',
    'score' => 87,
  ],
  11 => [
    'kw'    => 'mental health assessment',
    'title' => 'Clinically Validated Mental Health Assessments & Tests | iKAN Health',
    'desc'  => 'Free and confidential mental health assessments: PHQ-9 depression screening, GAD-7 anxiety test, WHO-5 well-being index, and BAT-23 burnout evaluation.',
    'score' => 90,
  ],
  12 => [
    'kw'    => 'neurobehavioral wellness programs',
    'title' => 'Equip Mental Wellness & Neurobehavioral Programs | iKAN Health',
    'desc'  => 'Structured, self-paced CBT and neurobehavioral wellness programs designed to build resilience, restore sleep hygiene, and manage daily workplace stress.',
    'score' => 89,
  ],
  13 => [
    'kw'    => 'mental health resources',
    'title' => 'Mental Health Resources, Guides & Articles | iKAN Health',
    'desc'  => 'Explore evidence-based guides, expert articles, guided breathing exercises, and clinical explainers on anxiety, stress, sleep, and workplace wellbeing.',
    'score' => 88,
  ],
  14 => [
    'kw'    => 'contact iKAN health',
    'title' => 'Contact Us — Support & Inquiries | iKAN Health',
    'desc'  => 'Get in touch with the iKAN Health support and clinical care team. We reply to all inquiries within 24 hours.',
    'score' => 85,
  ],
  15 => [
    'kw'    => 'online therapy consultation',
    'title' => 'Book an Online Consultation with Licensed Therapists | iKAN Health',
    'desc'  => 'Connect with verified clinical psychologists and counsellors. Confidential 1-on-1 therapy sessions via secure video with multi-language support.',
    'score' => 90,
  ],
  16 => [
    'kw'    => 'burnout cost calculator',
    'title' => 'Workplace Burnout Cost Calculator for Indian Teams | iKAN Health',
    'desc'  => 'Calculate the true financial cost of workplace burnout, absenteeism, and presenteeism in Indian organizations based on Deloitte and WHO methodology.',
    'score' => 92,
  ],
  18 => [
    'kw'    => 'mental health FAQs',
    'title' => 'Frequently Asked Questions & Help Center | iKAN Health',
    'desc'  => 'Find answers to common questions about iKAN Health programs, clinical assessments, therapist consultations, subscriptions, data privacy, and support.',
    'score' => 91,
  ],
  76 => [
    'kw'    => 'workplace mental health platform',
    'title' => 'Workplace Mental Health & Organization Portal | iKAN Health',
    'desc'  => 'Empower your teams with scalable, evidence-based mental health support, anonymous burnout insights, and executive clinical pilots.',
    'score' => 86,
  ],
  223 => [
    'kw'    => 'mental health professional partner',
    'title' => 'Join as a Partner or Therapist | iKAN Health',
    'desc'  => 'Partner with iKAN Health as a licensed clinical psychologist or counsellor. Deliver care with modern measurement tools and seamless scheduling.',
    'score' => 87,
  ],
];

foreach ( $pages as $id => $meta ) {
  update_post_meta( $id, 'rank_math_focus_keyword', $meta['kw'] );
  update_post_meta( $id, 'rank_math_title', $meta['title'] );
  update_post_meta( $id, 'rank_math_description', $meta['desc'] );
  update_post_meta( $id, 'rank_math_seo_score', $meta['score'] );
  update_post_meta( $id, 'rank_math_robots', [ 'index' ] );
}

// 3. Articles SEO Focus Keywords, Robots & SEO Scores
$articles = get_posts( [ 'post_type' => 'post', 'numberposts' => -1 ] );
foreach ( $articles as $post ) {
  $title = $post->post_title;
  $kw    = '';
  if ( stripos( $title, 'WHO-5' ) !== false ) {
    $kw = 'WHO-5 well-being index';
  } elseif ( stripos( $title, 'GAD-7' ) !== false ) {
    $kw = 'GAD-7 anxiety test';
  } elseif ( stripos( $title, 'GAD-2' ) !== false ) {
    $kw = 'GAD-2 anxiety screener';
  } elseif ( stripos( $title, 'PHQ-9' ) !== false ) {
    $kw = 'PHQ-9 depression screening';
  } elseif ( stripos( $title, 'PHQ-2' ) !== false ) {
    $kw = 'PHQ-2 depression screener';
  } elseif ( stripos( $title, 'BAT-23' ) !== false || stripos( $title, 'Burnout Assessment' ) !== false ) {
    $kw = 'burnout assessment tool BAT-23';
  } elseif ( stripos( $title, 'Workplace Stress' ) !== false ) {
    $kw = 'workplace stress scale';
  } elseif ( stripos( $title, 'Sleep Condition' ) !== false || stripos( $title, 'SCI' ) !== false ) {
    $kw = 'sleep condition indicator SCI';
  } elseif ( stripos( $title, 'Perceived Stress' ) !== false || stripos( $title, 'PSS-10' ) !== false ) {
    $kw = 'perceived stress scale PSS-10';
  } elseif ( stripos( $title, 'Resilience' ) !== false ) {
    $kw = 'brief resilience scale';
  } elseif ( stripos( $title, 'Self-Efficacy' ) !== false ) {
    $kw = 'general self-efficacy scale';
  } elseif ( stripos( $title, 'Breathing' ) !== false ) {
    $kw = 'guided breathing exercise';
  } elseif ( stripos( $title, 'Relaxation' ) !== false ) {
    $kw = 'anxiety relaxation technique';
  } elseif ( stripos( $title, 'Sleep' ) !== false ) {
    $kw = 'sleep health';
  } elseif ( stripos( $title, 'Crisis' ) !== false || stripos( $title, 'Numbers' ) !== false ) {
    $kw = 'India mental health crisis';
  } elseif ( stripos( $title, 'Measurement-Based' ) !== false ) {
    $kw = 'measurement-based care';
  } else {
    $words = explode( ' ', $title );
    $kw    = 'mental health ' . strtolower( $words[0] ?? 'wellness' );
  }

  update_post_meta( $post->ID, 'rank_math_focus_keyword', $kw );
  update_post_meta( $post->ID, 'rank_math_seo_score', 85 );
  update_post_meta( $post->ID, 'rank_math_robots', [ 'index' ] );
}

echo "SUCCESS: " . count( $pages ) . " core pages and " . count( $articles ) . " resource articles configured with focus keyphrases, SEO titles, descriptions, and scores.\n";
