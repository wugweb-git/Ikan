<?php
/**
 * Template Name: About Us
 * Template Post Type: page
 * Description: Exact replica of iKAN mobile & responsive About page
 */

get_header();

$team_uri = get_template_directory_uri() . '/assets/team/';
?>

<main class="ikan2-theme bg-canvas text-foreground pb-24 md:pb-16 min-h-screen">

  <!-- Header -->
  <header class="max-w-[760px] mx-auto px-5 pt-8 md:pt-14">
    <h1 class="font-display text-3xl md:text-5xl font-semibold leading-[1.15] tracking-tight text-gray-900">
      To us, mental health matters.
    </h1>
    <p class="text-lg md:text-xl mt-3 text-gray-600 leading-relaxed">
      At iKAN, we believe mental health is for everyone.
    </p>
  </header>

  <!-- Hero Art Illustration -->
  <div class="max-w-[760px] mx-auto px-5 mt-6">
    <div class="h-44 md:h-64 overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-100 via-teal-50 to-blue-100 flex items-center justify-center relative shadow-sm">
      <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Mental Wellness" class="w-full h-full object-cover opacity-85" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
    </div>
  </div>

  <div class="max-w-[760px] mx-auto space-y-10 mt-8">

    <!-- Story Section -->
    <section class="px-5">
      <p class="text-xs font-bold uppercase tracking-wider text-[#2B634D] mb-1">Our Story</p>
      <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 leading-tight">
        Born from personal experience
      </h2>
      <div class="mt-4 space-y-4 text-base leading-relaxed text-gray-700">
        <p>
          At some point everyone has struggled. Decades-old friends Sachin, Vedanshu, and Kartik have also faced their share of struggles, each one of us embarking on a personal journey to understand what we were going through. All of us witnessed firsthand the barriers and gaps in mental healthcare in India and realised that the system is broken.
        </p>
        <p>
          Conversations with people who had struggled and therapists who had learned mental healthcare is inaccessible, costly, episodic, fragmented and needs to be fixed. We realised mental healthcare needs to stop being treated as a black box. The only way forward is by bringing people and technology together while being open and transparent. So we created iKAN.
        </p>
      </div>
    </section>

    <!-- Mission & Vision Cards -->
    <section class="px-5 space-y-3.5">
      <div class="rounded-[24px] bg-gray-900 p-6 md:p-8 text-white shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-emerald-400">Mission</p>
        <h3 class="text-xl md:text-2xl font-bold mt-1 mb-2">Making mental health care accessible, affordable, and stigma-free for every individual in India.</h3>
        <p class="text-sm md:text-base text-gray-300 leading-relaxed">We are on a mission to bridge the gap between people and quality mental health support — through technology, compassion, and transparency.</p>
      </div>

      <div class="rounded-[24px] bg-[#DFF0E8] p-6 md:p-8 text-[#173D2F] shadow-sm">
        <p class="text-xs font-bold uppercase tracking-wider text-[#2B634D]">Vision</p>
        <h3 class="text-xl md:text-2xl font-bold mt-1 mb-2">A world where seeking mental health support is as natural as visiting a doctor.</h3>
        <p class="text-sm md:text-base text-[#285743] leading-relaxed">We envision a future where mental wellness is normalised, people have the tools they need at their fingertips, and no one suffers in silence.</p>
      </div>
    </section>

    <!-- Values Grid -->
    <section class="px-5">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 mb-4">Values that guide us</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div class="rounded-[20px] bg-gray-100 p-5">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-700 shadow-xs mb-3">
            <i data-lucide="heart" class="w-5 h-5"></i>
          </div>
          <h3 class="text-base font-bold text-gray-900">People Centric</h3>
          <p class="text-xs md:text-sm text-gray-600 mt-1.5 leading-relaxed">At iKAN we keep you at the heart of everything, our sole focus is to empower you and make mental health care accessible for all.</p>
        </div>

        <div class="rounded-[20px] bg-gray-100 p-5">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-xs mb-3">
            <i data-lucide="shield" class="w-5 h-5"></i>
          </div>
          <h3 class="text-base font-bold text-gray-900">Secure & Confidential</h3>
          <p class="text-xs md:text-sm text-gray-600 mt-1.5 leading-relaxed">We value your privacy very highly, we are committed to ensuring your data is always safe, encrypted, and secure.</p>
        </div>

        <div class="rounded-[20px] bg-gray-100 p-5">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-600 shadow-xs mb-3">
            <i data-lucide="flask-conical" class="w-5 h-5"></i>
          </div>
          <h3 class="text-base font-bold text-gray-900">Science Backed</h3>
          <p class="text-xs md:text-sm text-gray-600 mt-1.5 leading-relaxed">Everything we do is backed by clinical research and validated by practicing psychologists.</p>
        </div>

        <div class="rounded-[20px] bg-gray-100 p-5">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-xs mb-3">
            <i data-lucide="handshake" class="w-5 h-5"></i>
          </div>
          <h3 class="text-base font-bold text-gray-900">Our Promise</h3>
          <p class="text-xs md:text-sm text-gray-600 mt-1.5 leading-relaxed">We believe mental health care is for everyone and we are eager to make it a lived reality.</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="px-5">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 mb-4">How iKAN Works</h2>
      <div class="space-y-3.5">
        <div class="p-5 rounded-[20px] bg-white border border-gray-200/90 shadow-sm flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <i data-lucide="clipboard-list" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">1. Take a Validated Assessment</h3>
            <p class="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">Standard clinical screeners (PHQ-9, GAD-7, GHQ-12) assess anxiety, stress, or burnout in under 4 minutes with complete confidentiality.</p>
          </div>
        </div>

        <div class="p-5 rounded-[20px] bg-white border border-gray-200/90 shadow-sm flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">2. Equip Daily Programs & Tools</h3>
            <p class="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">Follow structured CBT, mindfulness, and resilience exercises designed to build psychological fitness day by day.</p>
          </div>
        </div>

        <div class="p-5 rounded-[20px] bg-white border border-gray-200/90 shadow-sm flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <i data-lucide="user-check" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">3. Connect with Licensed Psychologists</h3>
            <p class="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">Book confidential 1-on-1 virtual consultations with experienced mental health counselors when you need professional care.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Founders & Team Section -->
    <section class="px-5">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900 mb-1">Founders & Leadership</h2>
      <p class="text-sm text-gray-500 mb-6">Built by clinicians, engineers, and product builders dedicated to transforming mental health in India.</p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Founder 1: Kartik -->
        <div class="rounded-[24px] bg-white border border-gray-200 p-5 text-center shadow-sm">
          <div class="w-20 h-20 rounded-full mx-auto overflow-hidden bg-gray-100 mb-3 border-2 border-emerald-600/30">
            <img src="<?php echo esc_url( $team_uri . 'kartik.jpg' ); ?>" alt="Kartik Chandra" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';" />
          </div>
          <h3 class="text-base font-bold text-gray-900">Kartik Chandra</h3>
          <p class="text-xs font-semibold text-emerald-700 mt-0.5">Co-Founder & CEO</p>
          <p class="text-xs text-gray-500 mt-2 leading-relaxed">Leading iKAN’s mission to make preventative mental healthcare a standard across India.</p>
        </div>

        <!-- Founder 2: Vedanshu -->
        <div class="rounded-[24px] bg-white border border-gray-200 p-5 text-center shadow-sm">
          <div class="w-20 h-20 rounded-full mx-auto overflow-hidden bg-gray-100 mb-3 border-2 border-emerald-600/30">
            <img src="<?php echo esc_url( $team_uri . 'vedanshu.jpg' ); ?>" alt="Vedanshu Srivastava" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200';" />
          </div>
          <h3 class="text-base font-bold text-gray-900">Vedanshu Srivastava</h3>
          <p class="text-xs font-semibold text-emerald-700 mt-0.5">Co-Founder & Product Head</p>
          <p class="text-xs text-gray-500 mt-2 leading-relaxed">Directing evidence-based product design, assessment tools, and user experience.</p>
        </div>

        <!-- Founder 3: Sachin -->
        <div class="rounded-[24px] bg-white border border-gray-200 p-5 text-center shadow-sm">
          <div class="w-20 h-20 rounded-full mx-auto overflow-hidden bg-gray-100 mb-3 border-2 border-emerald-600/30">
            <img src="<?php echo esc_url( $team_uri . 'sachin.jpg' ); ?>" alt="Sachin Vaishampayan" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200';" />
          </div>
          <h3 class="text-base font-bold text-gray-900">Sachin Vaishampayan</h3>
          <p class="text-xs font-semibold text-emerald-700 mt-0.5">Co-Founder & CTO</p>
          <p class="text-xs text-gray-500 mt-2 leading-relaxed">Architecting secure, privacy-first infrastructure that powers the iKAN ecosystem.</p>
        </div>
      </div>

      <!-- Core Team Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
        <!-- Team 1: Vaibhav -->
        <div class="rounded-[20px] bg-gray-50 border border-gray-200/80 p-4 flex items-center gap-3">
          <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
            <img src="<?php echo esc_url( $team_uri . 'vaibhav.jpg' ); ?>" alt="Vaibhav Shukla" class="w-full h-full object-cover" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-gray-900">Vaibhav Shukla</h4>
            <p class="text-xs text-gray-500">System Architect</p>
          </div>
        </div>

        <!-- Team 2: Amitabh -->
        <div class="rounded-[20px] bg-gray-50 border border-gray-200/80 p-4 flex items-center gap-3">
          <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
            <img src="<?php echo esc_url( $team_uri . 'amitabh.jpg' ); ?>" alt="Amitabh Bhatnagar" class="w-full h-full object-cover" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-gray-900">Amitabh Bhatnagar</h4>
            <p class="text-xs text-gray-500">Dev Engineer</p>
          </div>
        </div>

        <!-- Team 3: Divyanshu -->
        <div class="rounded-[20px] bg-gray-50 border border-gray-200/80 p-4 flex items-center gap-3">
          <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
            <img src="<?php echo esc_url( $team_uri . 'divyanshu.jpg' ); ?>" alt="Divyanshu Pundir" class="w-full h-full object-cover" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-gray-900">Divyanshu Pundir</h4>
            <p class="text-xs text-gray-500">UX Designer</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Contact CTA -->
    <section class="px-5">
      <div class="rounded-[24px] bg-gray-900 text-white p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold">Have questions or want to partner?</h3>
          <p class="text-xs text-gray-400 mt-1">Connect with our team to bring iKAN to your clinic, college, or workplace.</p>
        </div>
        <a href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap transition-colors">
          Get in Touch &rarr;
        </a>
      </div>
    </section>

  </div>

</main>

<?php get_footer(); ?>
