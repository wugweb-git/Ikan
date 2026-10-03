export const DEFAULT_CMS_CONTENT: { [key: string]: any } = {
  'privacy': {
    title: 'Privacy Policy',
    subtitle: 'Your privacy and data security are fundamental to our mission.',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">🔒 Your Privacy Matters</h2>
          <p class="text-gray-700 leading-relaxed">At iKAN, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data when you use our mental health services.</p>
        </div>

        <div class="grid gap-6">
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">📝</span> Information We Collect
            </h3>
            <div class="space-y-4 text-gray-700">
              <div class="pl-4 border-l-4 border-blue-200">
                <h4 class="font-medium text-gray-900 mb-2">Personal Information</h4>
                <p>Information you provide directly, including name, email, and assessment responses when you create an account or use our services.</p>
              </div>
              <div class="pl-4 border-l-4 border-green-200">
                <h4 class="font-medium text-gray-900 mb-2">Usage Information</h4>
                <p>Automatically collected data about your platform interactions, session duration, and device information to improve our services.</p>
              </div>
              <div class="pl-4 border-l-4 border-purple-200">
                <h4 class="font-medium text-gray-900 mb-2">Health Data</h4>
                <p>Mental health assessment responses and mood tracking data, which receive the highest level of protection.</p>
              </div>
            </div>
          </section>

          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">🎯</span> How We Use Your Information
            </h3>
            <ul class="space-y-3 text-gray-700">
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                <span>Provide personalized mental health support and recommendations</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                <span>Improve our services and develop new features</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-3 mt-1">✓</span>
                <span>Ensure platform security and prevent fraud</span>
              </li>
              <li class="flex items-start">
                <span class="text-red-500 mr-3 mt-1">✗</span>
                <span><span style="font-weight: 500;">We never sell your personal data to third parties</span></span>
              </li>
            </ul>
          </section>

          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">🛡️</span> Data Security & Protection
            </h3>
            <div class="grid md:grid-cols-2 gap-4 text-gray-700">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Encryption</h4>
                <p class="text-sm">Your data is sent over an encrypted connection and stored in an encrypted, access-controlled database.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Access Control</h4>
                <p class="text-sm">Access to production data is restricted to authorised team members.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Ongoing Review</h4>
                <p class="text-sm">We review our security configuration on an ongoing basis and act on advisories from our infrastructure provider.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Data Minimization</h4>
                <p class="text-sm">We collect only the data necessary to provide our services effectively.</p>
              </div>
            </div>
          </section>

          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">⚖️</span> Your Rights
            </h3>
            <div class="space-y-3 text-gray-700">
              <p class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <strong class="text-blue-900">You have full control over your data.</strong> You can access, update, or delete your personal information at any time through your account settings.
              </p>
              <ul class="space-y-2 ml-4">
                <li>• Request a copy of your data</li>
                <li>• Correct inaccurate information</li>
                <li>• Delete your account and associated data</li>
                <li>• Opt out of non-essential communications</li>
              </ul>
            </div>
          </section>
        </div>

        <div class="bg-gray-900 text-white p-6 rounded-lg">
          <h3 class="text-lg font-medium mb-3 flex items-center">
            <span class="mr-2">📞</span> Questions? We're Here to Help
          </h3>
          <p class="text-gray-300 mb-4">If you have any questions about this Privacy Policy or how we handle your data, our privacy team is ready to assist you.</p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="mailto:privacy@ikanhealth.in" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">
              Email: privacy@ikanhealth.in
            </a>
            <span class="text-gray-400 text-sm self-center">Response within 24 hours</span>
          </div>
        </div>
      
        <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center"><span class="mr-2">📊</span> Analytics</h3>
          <div class="space-y-4 text-gray-700">
            <p class="leading-relaxed">We use Google Analytics to understand which parts of iKAN people use, so we can improve them. It records the type of screen you opened — for example an assessment screen or a programme day — never which assessment, which result, or which programme.</p>
            <p class="leading-relaxed">Your answers, scores, journal entries and anything you write are never sent to Google. You can block analytics with your browser's or phone's tracking controls without affecting how iKAN works.</p>
          </div>
        </section>

        <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center"><span class="mr-2">🗑️</span> Deleting your account</h3>
          <div class="space-y-4 text-gray-700">
            <p class="leading-relaxed">You can delete your iKAN account at any time, from inside the app or on the web at <a class="text-blue-600 underline" href="https://app.ikanhealth.in/delete-account">app.ikanhealth.in/delete-account</a>. Deleting your account permanently removes your journal, assessments, programme progress, any health data read from Health Connect, your profile and settings, your reminder registrations, and the account itself.</p>
            <p class="leading-relaxed">It cannot be undone and nothing can be recovered afterwards. If you can no longer sign in, email <a class="text-blue-600 underline" href="mailto:hello@ikanhealth.in">hello@ikanhealth.in</a> from the address on the account and we will delete it within 30 days.</p>
          </div>
        </section>
</div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'terms': {
    title: 'Terms of Service',
    subtitle: "Important legal terms governing your use of iKAN's mental health platform and services.",
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">📋 Terms of Service</h2>
          <p class="text-gray-700 leading-relaxed">By accessing and using iKAN's mental health platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. Last updated: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="grid gap-6">
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">🎯</span> Scope of Services
            </h3>
            <div class="space-y-4 text-gray-700">
              <p class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                Our platform is designed to <span style="font-weight: 500;">support your mental health journey</span> through evidence-based assessments, personalized programs, and curated resources.
              </p>
              <ul class="space-y-2 ml-4">
                <li>• Mental health assessments and progress tracking</li>
                <li>• Personalized equip programs and interventions</li>
                <li>• Resource library and educational content</li>
                <li>• Professional consultation matching</li>
              </ul>
            </div>
          </section>

          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">👤</span> Your Responsibilities
            </h3>
            <div class="grid gap-4">
              <div class="border-l-4 border-green-400 pl-4">
                <h4 class="font-medium text-gray-900 mb-2">Account Security</h4>
                <p class="text-gray-700 text-sm">Maintain the confidentiality of your account credentials and notify us immediately of any unauthorized access.</p>
              </div>
              <div class="border-l-4 border-blue-400 pl-4">
                <h4 class="font-medium text-gray-900 mb-2">Accurate Information</h4>
                <p class="text-gray-700 text-sm">Provide accurate and honest information in assessments to ensure effective recommendations.</p>
              </div>
              <div class="border-l-4 border-purple-400 pl-4">
                <h4 class="font-medium text-gray-900 mb-2">Appropriate Use</h4>
                <p class="text-gray-700 text-sm">Use our services for their intended purpose and respect other users and mental health professionals.</p>
              </div>
            </div>
          </section>

          <section class="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 class="text-lg font-medium text-red-900 mb-4 flex items-center">
              <span class="mr-2">⚠️</span> Important Medical Disclaimer
            </h3>
            <div class="space-y-4">
              <div class="bg-white p-4 rounded-lg border border-red-200">
                <p class="text-red-800 font-medium mb-2">Our services are NOT a substitute for professional medical care.</p>
                <ul class="space-y-1 text-red-700 text-sm ml-4">
                  <li>• Always consult qualified healthcare providers for medical advice</li>
                  <li>• Do not use our platform for emergency mental health situations</li>
                  <li>Seek immediate help if you're experiencing thoughts of self-harm</li>
                </ul>
              </div>
              <div class="bg-gray-900 text-white p-4 rounded-lg">
                <p class="font-medium mb-2">🚨 Crisis Resources:</p>
                <div class="grid sm:grid-cols-2 gap-2 text-sm">
                  <p>• KIRAN Mental Health Helpline: 1800-599-0019 (24x7)</p>
                  <p>• iCALL Psychosocial Helpline: 9152987821</p>
                  <p>• Emergency: 112</p>
                  <p>• International: befrienders.org</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="bg-gray-900 text-white p-6 rounded-lg">
          <h3 class="text-lg font-medium mb-3">Questions About These Terms?</h3>
          <p class="text-gray-300 mb-4">Our legal team is available to clarify any aspect of our Terms of Service.</p>
          <a href="mailto:legal@ikanhealth.in" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block">
            Contact Legal Team
          </a>
        </div>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'return-policy': {
    title: 'Return Policy',
    subtitle: 'Understanding our refund and return policy for iKAN services.',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">💚 Our Satisfaction Guarantee</h2>
          <p class="text-gray-700 leading-relaxed">At iKAN, we're committed to your satisfaction. If you're not completely satisfied with your purchase, we offer a comprehensive and fair return policy.</p>
        </div>
        <p>Please contact billing@ikanhealth.in for all refund requests.</p>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    subtitle: 'We understand plans change. Cancel anytime with no penalties or hidden fees.',
    content: `
      <h2>Account Cancellation</h2>
      <p>You may cancel your iKAN account at any time.</p>
      <h2>Subscription Cancellation</h2>
      <p>For subscription services, cancel anytime before your next billing date.</p>
    `,
    lastUpdated: new Date().toISOString()
  },
  'homepage-hero': {
    title: 'Homepage Hero',
    content: JSON.stringify({
      title: "Reimagining mental health care.",
      description: "Stay on top of your mental health with real time monitoring and insights, expert therapists, science backed tools and programs.",
      ctaText: "Get Started",
      statistics: [
        {
          type: 'label',
          title: 'Acceptance',
          bgImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=600&fit=crop",
          videoImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=800&fit=crop"
        },
        {
          type: 'stat',
          number: '2500+',
          description: 'People who have gained more wellbeing through our platform',
          bgImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=600&fit=crop",
          videoImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop"
        },
        {
          type: 'label',
          title: 'Understanding',
          bgImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop",
          videoImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop"
        },
        {
          type: 'stat',
          number: '52+',
          description: 'Qualified Psychologists',
          bgImage: "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400&h=400&fit=crop",
          videoImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop"
        },
        {
          type: 'label',
          title: 'Compassion',
          bgImage: "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?w=400&h=400&fit=crop",
          videoImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
        },
        {
          type: 'stat',
          number: '96%',
          description: 'Recommend our courses',
          bgImage: null,
          videoImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop",
          videoImage2: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop"
        }
      ]
    }),
    lastUpdated: new Date().toISOString()
  },
  'homepage-assessment': {
    title: 'Homepage Assessment Intro',
    content: JSON.stringify({
      title: "iKAN is the mental health platform for the modern era.",
      description: "Get actionable and quantified insights about your mental health. Screen for issues prevent them from turning chronic with the help of our experts and evidence backed tools.",
      ctaText: "Get Started",
      image: "https://images.unsplash.com/photo-1724176636904-394580bfedf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB0ZWNobm9sb2d5JTIwYW5hbHl0aWNzJTIwaW5zaWdodHN8ZW58MXx8fHwxNzY1NDQ3NTMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      programsTitle: "Assessment Programs",
      programsSubtitle: "PROGRAM",
      buttonText: "Take Assessment",
      programs: [
        { title: "Adult Therapy", image: "https://images.unsplash.com/photo-1758273240373-370993d0275d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
        { title: "Adult Psychiatry", image: "https://images.unsplash.com/photo-1758273240403-052b3c99f636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" },
        { title: "Hospital Care", image: "https://images.unsplash.com/photo-1711343777918-6d395c16e37f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" }
      ]
    }),
    lastUpdated: new Date().toISOString()
  },
  'homepage-equip-intro': {
    title: 'Homepage Equip Intro',
    // A plain object — it used to be a JSON string the homepage parsed back.
    content: {
      title: "Equip Programs",
      subtitle: "PROGRAM",
      features: [
        "Flexible — whenever and wherever you want",
        "Self-paced learning modules",
        "Expert-designed curriculum",
        "Community support included",
        "Progress tracking tools"
      ],
      ctaText: "LEARN MORE",
      footerText: "Supported by leading healthcare providers"
    },
    lastUpdated: new Date().toISOString()
  },


  // ═══════════════════════════════════════════════════════════════
  // HOMEPAGE SUB-SECTION CMS DEFAULTS (externalized from components)
  // ═══════════════════════════════════════════════════════════════

  'homepage-mission-section': {
    title: 'Homepage Mission Section',
    content: JSON.stringify({
      label: 'Our Mission',
      heading: 'Making mental healthcare <accessible>, <affordable>, and <stigma-free> for everyone.',
      highlightColors: {
        accessible: '#7ED4C8',
        affordable: '#F5A623',
        'stigma-free': '#E84FAF',
      },
      description: 'We believe everyone deserves support on their mental health journey. iKAN combines clinical expertise with thoughtful technology to meet you where you are.',
      trustedByLabel: 'Trusted by leading organizations',
    }),
    lastUpdated: new Date().toISOString()
  },

  'homepage-benefits-section': {
    title: 'Homepage Benefits Section',
    content: JSON.stringify({
      heading: 'Who is it for',
      ctaText: 'Learn more',
      ctaRoute: '/about',
      cards: [
        {
          title: 'For Individuals',
          subtitle: 'Your mental wellness, your pace.',
          description: 'Access self-guided programs, mood journaling, and professional consultations — all in a private, stigma-free space designed around your comfort.',
          image: 'https://images.unsplash.com/photo-1726377240070-19b747fc9f19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBwZWFjZWZ1bCUyMGpvdXJuYWxpbmclMjBzZWxmJTIwY2FyZXxlbnwxfHx8fDE3NzE5MDYwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          imageAlt: 'Person journaling for self care',
        },
        {
          title: 'For Organizations',
          subtitle: 'Invest in your people.',
          description: 'Bring mental wellness into the workplace. Equip your teams with assessments, curated programs, and professional support that scales with your organization.',
          image: 'https://images.unsplash.com/photo-1758691737182-d42aefd6dee8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB3b3JrcGxhY2UlMjB3ZWxsbmVzcyUyMHRlYW0lMjBtZWV0aW5nfGVufDF8fHx8MTc3MTkwNjA3MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          imageAlt: 'Workplace wellness team meeting',
        },
        {
          title: 'For Healthcare Providers',
          subtitle: 'Extend care beyond the clinic.',
          description: 'Use clinically validated assessments, track patient progress, and recommend structured programs — all on a platform built with privacy at its core.',
          image: 'https://images.unsplash.com/photo-1758691463610-3c2ecf5fb3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwcHJvZmVzc2lvbmFsJTIwc3RldGhvc2NvcGUlMjBzbWlsaW5nfGVufDF8fHx8MTc3MTkwNjA3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          imageAlt: 'Healthcare professional smiling',
        },
      ],
    }),
    lastUpdated: new Date().toISOString()
  },

  'homepage-howitworks-section': {
    title: 'Homepage How It Works Section',
    content: JSON.stringify({
      heading: 'How it works',
      ctaText: 'Get Started',
      ctaRoute: '/assessment',
      cards: [
        {
          step: 1,
          title: 'Take an Assessment',
          subtitle: 'Understand where you are.',
          description: 'Answer a few simple, clinically backed questions. Our assessments help you understand your emotional well-being — privately, at your own pace.',
          image: 'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBhc3Nlc3NtZW50JTIwcXVlc3Rpb25uYWlyZSUyMHRhYmxldHxlbnwxfHx8fDE3NzE5MDU3ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          imageAlt: 'Mental health assessment on tablet',
          iconName: 'clipboard-check',
        },
        {
          step: 2,
          title: 'Connect with a Professional',
          subtitle: 'Find the right support for you.',
          description: 'Browse therapists, psychiatrists, and counselors. Pick your preferred language, session mode, and availability — we handle the rest.',
          image: 'https://images.unsplash.com/photo-1758273241078-8eec353836be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVyYXB5JTIwc2Vzc2lvbiUyMGNvdW5zZWxpbmclMjBjb252ZXJzYXRpb258ZW58MXx8fHwxNzcxOTA1NzgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          imageAlt: 'Therapy counseling session',
          iconName: 'users',
        },
        {
          step: 3,
          title: 'Build Daily Habits',
          subtitle: 'Make wellness your ritual.',
          description: 'Join an Equip program with self-paced modules. Track your mood, practice mindfulness, and build lasting habits — one day at a time.',
          image: 'https://images.unsplash.com/photo-1758272422634-e8ed8e252a14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwbWluZGZ1bG5lc3MlMjBkYWlseSUyMHdlbGxuZXNzJTIwcm91dGluZXxlbnwxfHx8fDE3NzE5MDU3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          imageAlt: 'Mindfulness and daily wellness',
          iconName: 'sparkles',
        },
      ],
    }),
    lastUpdated: new Date().toISOString()
  },

  'homepage-stats-section': {
    title: 'Homepage Stats Section',
    content: JSON.stringify({
      stats: [
        { value: '50,000+', label: 'Assessments completed', icon: 'avatars' },
        { value: '2M+', label: 'iKAN members', icon: 'assessments' },
        { value: '500+', label: 'Sessions a day', icon: 'sessions' },
      ],
    }),
    lastUpdated: new Date().toISOString()
  },

  'homepage-faq-section': {
    title: 'Homepage FAQ Section',
    content: JSON.stringify({
      heading: 'Frequently\\nasked questions',
      viewAllText: 'View all FAQs',
      contactCard: {
        title: 'Do you have more questions?',
        description: 'We are here to help you on your mental health journey. Reach out and we will get back to you.',
        buttonText: 'Contact Us',
        buttonLink: '/contact',
      },
      items: [
        {
          question: 'What is iKAN and how does it support mental health?',
          answer: 'iKAN is a mental health PWA that provides access to professional consultants, self-guided programs, mood journaling, and mental health assessments — all in one place. Our goal is to make mental wellness accessible, private, and stigma-free.',
        },
        {
          question: 'How do I book a consultation with a therapist?',
          answer: 'Navigate to the Consultation page, browse our verified professionals by category, and select a time slot that works for you. You can filter by expertise, language, availability, and session mode (video, call, chat, or in-person).',
        },
        {
          question: 'Are the Equip programs self-paced?',
          answer: 'Yes. Equip programs are structured into daily modules you can complete at your own pace. Each program includes exercises, reflections, and progress tracking to help you build lasting habits.',
        },
        {
          question: 'Is my data private and secure on iKAN?',
          answer: 'Your data is treated as highly sensitive. It is sent over an encrypted connection and stored in an access-controlled database, and we follow strict privacy guidelines. Our designs are intentionally subtle so you can use the app comfortably in any setting.',
        },
        {
          question: 'What mental health assessments are available?',
          answer: 'We offer clinically validated assessments for anxiety, depression, stress, well-being, and more. Results are private and can help guide your journey or inform conversations with a professional.',
        },
      ],
    }),
    lastUpdated: new Date().toISOString()
  },

  'homepage-reviews-section': {
    title: 'Homepage Reviews Section',
    content: JSON.stringify({
      heading: 'Reasons to keep showing up',
      heroImage: 'https://images.unsplash.com/photo-1758275557348-23950a3ddeae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGZyaWVuZHMlMjBoYXBweSUyMG91dGRvb3IlMjBnYXRoZXJpbmclMjBkaXZlcnNlfGVufDF8fHx8MTc3MTkwODY4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      reviews: [
        {
          quote: 'iKAN helped me understand my emotions better. I used to bottle everything up, but now I have tools to process what I feel. The assessments gave me clarity I never expected.',
          name: 'Priya M.',
          avatarBg: '#7ED4C8',
          avatarEmoji: '😊',
        },
        {
          quote: 'I was hesitant at first, but the guided programs made it so easy to start. The Equip programs fit right into my schedule, and I genuinely look forward to each session now.',
          name: 'Arjun K.',
          avatarBg: '#F5C842',
          avatarEmoji: '😌',
        },
        {
          quote: "Finding affordable mental health support felt impossible until I found iKAN. The resources are thoughtful and the consultations are judgment-free. It's changed how I take care of myself.",
          name: 'Sneha R.',
          avatarBg: '#E8A0D4',
          avatarEmoji: '🤗',
        },
      ],
    }),
    lastUpdated: new Date().toISOString()
  },

  // ═══════════════════════════════════════════════════════════════
  // ABOUT US PAGE — Full structured content
  // ═══════════════════════════════════════════════════════════════


  // ═══════════════════════════════════════════════════════════════
  // FULL PAGE CMS DEFAULTS (structured JSON for page components)
  // ═══════════════════════════════════════════════════════════════

  'page-faq': {
    title: 'FAQs & Help Center',
    content: JSON.stringify({
      heroTitle: 'FAQs & Help Center',
      heroSubtitle: 'Find answers to common questions about iKAN, your account, programs, and more.',
      searchPlaceholder: 'Search for answers...',
      noResultsText: 'No results found. Try a different search term.',
      ctaTitle: 'Still have questions?',
      ctaDescription: 'We are here to help you on your mental health journey. Submit a ticket and our team will get back to you.',
      ctaButtonText: 'Contact Support',
      ctaButtonRoute: '/contact',
      categories: [
        { id: 'about', title: 'About iKAN', items: [
          { question: 'What is iKAN and how does it support mental health?', answer: 'iKAN is a mental health progressive web app (PWA) that provides access to professional consultants, self-guided programs, mood journaling, and clinically validated assessments — all in one place. Our goal is to make mental wellness accessible, private, and stigma-free.' },
          { question: 'Is iKAN a replacement for therapy?', answer: 'No. iKAN is a complement to professional care, not a replacement. Our Equip programs, mood tracking, and resources are designed to support your wellbeing between sessions or as a first step.' },
          { question: 'How is iKAN different from other mental health apps?', answer: 'iKAN combines self-paced CBT-based programs, professional consultations, mood journaling, and a resource library into a single platform. We follow "Calm Tech" design principles.' },
        ]},
        { id: 'getting-started', title: 'Signing Up & Getting Started', items: [
          { question: 'How do I create an account?', answer: 'Tap "Get Started" on the homepage, enter your name, email, and a secure password. Your account will be confirmed automatically.' },
          { question: 'Is iKAN free to use?', answer: 'Browsing resources, assessments, and our library is free. Individual Equip programs and professional consultations are paid services.' },
          { question: 'Can I use iKAN without signing in?', answer: 'Yes. Public pages like Resources, Assessments, Equip listings, and informational content are accessible without an account.' },
        ]},
        { id: 'account', title: 'Managing Your Account', items: [
          { question: 'How do I update my profile information?', answer: 'Navigate to your Account page. You can update your name, phone number, bio, date of birth, gender, location, and emergency contact details.' },
          { question: 'How do I change my password or email?', answer: 'Go to Account → Security section. You can change your password by entering your current and new password.' },
          { question: 'Can I export or delete my data?', answer: 'Yes. Under Account → Data & Privacy, you can export all your data as a JSON file. You can also permanently delete your account.' },
        ]},
        { id: 'subscriptions', title: 'Subscriptions & Billing', items: [
          { question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards, UPI, and net banking through our secure Razorpay integration.' },
          { question: 'How do I view my payment history?', answer: 'Go to Account → Payment History to see a complete record of your transactions.' },
          { question: 'What is your refund policy?', answer: 'We offer refunds on a case-by-case basis. Contact our support team within 7 days of purchase.' },
        ]},
        { id: 'sessions', title: 'Sessions & Programs', items: [
          { question: 'How do I book a consultation with a therapist?', answer: 'Navigate to the Consultation page, browse our verified professionals by category, and select a time slot.' },
          { question: 'Are the Equip programs self-paced?', answer: 'Yes. Equip programs are structured into daily modules you can complete at your own pace.' },
          { question: 'What mental health assessments are available?', answer: 'We offer assessments for anxiety (GAD-7), depression, stress, well-being, and more.' },
          { question: 'How does mood journaling work?', answer: 'The Mood Journal lets you log your mood daily with a rating, emotions, energy level, and free-text reflections.' },
        ]},
        { id: 'trust-safety', title: 'Trust, Safety & Privacy', items: [
          { question: 'Is my data private and secure?', answer: 'Your data is treated as highly sensitive. It is sent over an encrypted connection and stored in an access-controlled database, and we never share it with third parties.' },
          { question: 'What should I do in a mental health emergency?', answer: 'Call your local emergency services (112) or the iCALL Psychosocial Helpline at 9152987821.' },
          { question: 'How are consultants verified?', answer: 'All consultants on iKAN are licensed professionals. We verify their credentials and experience before they join.' },
        ]},
      ],
    }),
    lastUpdated: new Date().toISOString()
  },

  'page-contact': {
    title: 'Contact Us',
    content: JSON.stringify({
      heroTitle: "We're Here to Help",
      heroSubtitle: 'Your mental health journey matters to us. Reach out for support, questions, or just to connect.',
      heroNote: 'If you are in immediate danger, please call emergency services.',
      supportEmail: 'support@ikanhealth.in',
      crisisPhone: '9152987821',
      crisisLabel: 'iCALL Suicide Prevention Helpline',
      contactMethods: [
        { icon: 'mail', title: 'Email Support', description: 'Get help with your account and services', value: 'support@ikanhealth.in', action: 'mailto:support@ikanhealth.in' },
        { icon: 'phone', title: 'Crisis Support', description: 'iCALL Suicide Prevention Helpline', value: '9152987821', action: 'tel:9152987821' },
      ],
      formTitle: 'Send us a Message',
      formSubtitle: 'We typically respond within 24 hours during business days.',
      crisisCard: { title: 'Need Immediate Help?', description: "If you're having thoughts of self-harm or suicide, please reach out for immediate support.", buttons: [{ label: 'Call iCALL - 9152987821', action: 'tel:9152987821' }] },
      faqCard: { title: 'Looking for Quick Answers?', description: 'Check our FAQ section for instant answers to common questions.', buttonText: 'Visit FAQ Section', buttonRoute: '/faq' },
    }),
    lastUpdated: new Date().toISOString()
  },

  'page-sitemap': {
    title: 'Site Navigation',
    // The link groups live in content/nav.ts (SITEMAP_SECTIONS), shared with the footer and mobile menu.
    content: JSON.stringify({
      heroTitle: 'Site Navigation',
      heroSubtitle: 'Explore all pages and resources available on iKAN.',
    }),
    lastUpdated: new Date().toISOString()
  },


  'page-not-found': {
    title: 'Page Not Found',
    content: JSON.stringify({
      heroTitle: 'Page Not Found',
      heroSubtitle: "We couldn't find the page you're looking for.",
      heading: 'Lost your way?',
      description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
      homeButtonText: 'Return Home',
      backButtonText: 'Go Back',
    }),
    lastUpdated: new Date().toISOString()
  },
};