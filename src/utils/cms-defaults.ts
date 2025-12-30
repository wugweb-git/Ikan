export const DEFAULT_CMS_CONTENT: { [key: string]: any } = {
  'about': {
    title: 'About iKan',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">🌟 Our Mission</h2>
          <p class="text-gray-700 leading-relaxed">At iKan, we believe that everyone deserves access to quality mental health support. We're on a mission to make mental wellness accessible, affordable, and stigma-free.</p>
        </div>

        <div class="grid gap-6">
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">💙</span> What We Do
            </h3>
            <p class="text-gray-700 leading-relaxed mb-4">
              iKan is a comprehensive mental health platform that connects you with licensed professionals, evidence-based self-help programs, and a supportive community. Whether you're dealing with stress, anxiety, depression, or just looking to improve your overall well-being, we're here to help.
            </p>
            <ul class="space-y-2 text-gray-700 ml-4">
              <li>• One-on-one consultations with qualified therapists and counselors</li>
              <li>• Self-paced programs based on cognitive behavioral therapy (CBT)</li>
              <li>• Mood tracking and personalized insights</li>
              <li>• Resource library with articles, guides, and tools</li>
              <li>• 24/7 crisis support and emergency resources</li>
            </ul>
          </section>

          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">🎯</span> Our Values
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="font-medium text-gray-900 mb-2">Accessibility</h4>
                <p class="text-sm text-gray-700">Mental health support should be available to everyone, regardless of location or financial situation.</p>
              </div>
              <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 class="font-medium text-gray-900 mb-2">Privacy</h4>
                <p class="text-sm text-gray-700">Your data and conversations are completely confidential and protected with industry-leading security.</p>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 class="font-medium text-gray-900 mb-2">Evidence-Based</h4>
                <p class="text-sm text-gray-700">All our programs and approaches are grounded in scientific research and proven therapeutic methods.</p>
              </div>
              <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 class="font-medium text-gray-900 mb-2">Stigma-Free</h4>
                <p class="text-sm text-gray-700">We're working to normalize conversations about mental health and create a judgment-free space for healing.</p>
              </div>
            </div>
          </section>

          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">👥</span> Our Team
            </h3>
            <p class="text-gray-700 leading-relaxed">
              iKan is built by a diverse team of mental health professionals, technologists, and individuals with lived experience. Our licensed therapists, psychiatrists, and counselors bring decades of combined expertise in various therapeutic modalities and specializations.
            </p>
          </section>
        </div>

        <div class="bg-indigo-900 text-white p-6 rounded-lg">
          <h3 class="text-lg font-medium mb-3">Ready to Start Your Journey?</h3>
          <p class="mb-4">Take the first step towards better mental health today. Our team is here to support you every step of the way.</p>
          <a href="/consultation" class="inline-block bg-white text-indigo-900 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
            Book a Consultation
          </a>
        </div>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'privacy': {
    title: 'Privacy Policy',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">🔒 Your Privacy Matters</h2>
          <p class="text-gray-700 leading-relaxed">At iKan, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data when you use our mental health services.</p>
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
                <span><strong>We never sell your personal data to third parties</strong></span>
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
                <p class="text-sm">End-to-end encryption for all sensitive data transmission and storage.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Access Control</h4>
                <p class="text-sm">Strict access controls with multi-factor authentication for all team members.</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Regular Audits</h4>
                <p class="text-sm">Third-party security audits and compliance with healthcare data standards.</p>
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
            <a href="mailto:privacy@ikan.health" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">
              Email: privacy@ikan.health
            </a>
            <span class="text-gray-400 text-sm self-center">Response within 24 hours</span>
          </div>
        </div>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'terms': {
    title: 'Terms of Service',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">📋 Terms of Service</h2>
          <p class="text-gray-700 leading-relaxed">By accessing and using iKan's mental health platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. Last updated: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="grid gap-6">
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">🎯</span> Scope of Services
            </h3>
            <div class="space-y-4 text-gray-700">
              <p class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                Our platform is designed to <strong>support your mental health journey</strong> through evidence-based assessments, personalized programs, and curated resources.
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
                  <li>• Seek immediate help if you're experiencing thoughts of self-harm</li>
                </ul>
              </div>
              <div class="bg-gray-900 text-white p-4 rounded-lg">
                <p class="font-medium mb-2">🚨 Crisis Resources:</p>
                <div class="grid sm:grid-cols-2 gap-2 text-sm">
                  <p>• National: 988 Suicide & Crisis Lifeline</p>
                  <p>• Text: HOME to 741741</p>
                  <p>• Emergency: 911</p>
                  <p>• International: befrienders.org</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="bg-gray-900 text-white p-6 rounded-lg">
          <h3 class="text-lg font-medium mb-3">Questions About These Terms?</h3>
          <p class="text-gray-300 mb-4">Our legal team is available to clarify any aspect of our Terms of Service.</p>
          <a href="mailto:legal@ikan.health" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-block">
            Contact Legal Team
          </a>
        </div>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'faq': {
    title: 'Frequently Asked Questions',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-100">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">❓ Frequently Asked Questions</h2>
          <p class="text-gray-700 leading-relaxed">Find answers to common questions about iKan's mental health platform. Can't find what you're looking for? <a href="mailto:support@ikan.health" class="text-green-600 font-medium hover:underline">Contact our support team</a>.</p>
        </div>

        <div class="space-y-6">
          <section class="bg-white rounded-lg shadow-sm border border-gray-100">
            <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h3 class="text-lg font-medium text-gray-900 flex items-center">
                <span class="mr-2">🌟</span> Getting Started
              </h3>
            </div>
            <div class="p-6 space-y-6">
              <div class="border-l-4 border-blue-400 pl-4">
                <h4 class="font-medium text-gray-900 mb-2">What is iKan?</h4>
                <p class="text-gray-700 text-sm">iKan is a comprehensive mental health platform that provides evidence-based assessments, personalized equip programs, and a curated resource library to support your mental wellness journey.</p>
              </div>
              <div class="border-l-4 border-green-400 pl-4">
                <h4 class="font-medium text-gray-900 mb-2">How do I get started?</h4>
                <p class="text-gray-700 text-sm mb-3">Getting started is simple:</p>
                <ol class="text-gray-700 text-sm space-y-1 ml-4">
                  <li>1. Create your free account</li>
                  <li>2. Complete our initial assessment (10-15 minutes)</li>
                  <li>3. Receive personalized recommendations</li>
                  <li>4. Start your mental wellness journey</li>
                </ol>
              </div>
            </div>
          </section>

          <section class="bg-white rounded-lg shadow-sm border border-gray-100">
            <div class="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h3 class="text-lg font-medium text-gray-900 flex items-center">
                <span class="mr-2">📊</span> Assessments
              </h3>
            </div>
            <div class="p-6 space-y-6">
              <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                    <span class="text-blue-500 mr-2">⏱️</span> Duration
                  </h4>
                  <p class="text-gray-700 text-sm">Most assessments take 10-15 minutes to complete. You can save your progress and return anytime.</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                    <span class="text-green-500 mr-2">🔄</span> Frequency
                  </h4>
                  <p class="text-gray-700 text-sm">We recommend monthly assessments to track your progress and adjust recommendations.</p>
                </div>
              </div>
            </div>
          </section>

          <section class="bg-white rounded-lg shadow-sm border border-gray-100">
            <div class="bg-orange-50 px-6 py-4 border-b border-orange-100">
              <h3 class="text-lg font-medium text-gray-900 flex items-center">
                <span class="mr-2">🤝</span> Support & Help
              </h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="border-l-4 border-orange-400 pl-4">
                    <h4 class="font-medium text-gray-900 mb-2">Contact Support</h4>
                    <p class="text-gray-700 text-sm">Email us at <a href="mailto:support@ikan.health" class="text-orange-600 font-medium hover:underline">support@ikan.health</a> or use our in-app contact form.</p>
                  </div>
                  <div class="border-l-4 border-red-400 pl-4">
                    <h4 class="font-medium text-gray-900 mb-2">Crisis Support</h4>
                    <p class="text-gray-700 text-sm">For mental health emergencies, contact your local emergency services or call 988.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'contact': {
    title: "We're Here to Help",
    content: `
      <p>Your mental health journey matters to us. Reach out for support, questions, or just to connect.</p>
      <p><strong>Note:</strong> If you are in immediate danger, please call emergency services.</p>
    `,
    lastUpdated: new Date().toISOString()
  },
  'return-policy': {
    title: 'Return Policy',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-100">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">💚 Our Satisfaction Guarantee</h2>
          <p class="text-gray-700 leading-relaxed">At iKan, we're committed to your satisfaction. If you're not completely satisfied with your purchase, we offer a comprehensive and fair return policy.</p>
        </div>
        <p>Please contact billing@ikan.health for all refund requests.</p>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'cancellation-policy': {
    title: 'Cancellation Policy',
    content: `
      <h2>Account Cancellation</h2>
      <p>You may cancel your iKan account at any time.</p>
      <h2>Subscription Cancellation</h2>
      <p>For subscription services, cancel anytime before your next billing date.</p>
    `,
    lastUpdated: new Date().toISOString()
  },
  'sitemap': {
    title: 'Sitemap',
    content: `
      <h2>Site Navigation</h2>
      <p>Find all the pages and resources available on the iKan platform.</p>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About Us</a></li>
        <li><a href="/login">Sign In</a></li>
        <li><a href="/faq">FAQ</a></li>
      </ul>
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
      title: "iKan is the mental health platform for the modern era.",
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
  'homepage-mission': {
    title: 'Homepage Mission',
    content: JSON.stringify({
      title: "Our Mission",
      content: "We believe mental health is for everyone. Our mission is to fix the broken system and democratize mental healthcare by creating an accessible, secure, and people-centric and science-backed platform empowering every individual to achieve lasting well-being.",
      videoCaption: "Watch the full\\ninterview",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop",
      imageAlt: "Mission interview"
    }),
    lastUpdated: new Date().toISOString()
  },
  'homepage-testimonial': {
    title: 'Homepage Testimonial',
    content: JSON.stringify({
      quote: "This platform has transformed how I manage my mental health. The tools are easy to use and the professionals are incredibly supportive.",
      author: "Sarah J.",
      role: "Member since 2023",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
    }),
    lastUpdated: new Date().toISOString()
  },
  'homepage-benefits': {
    title: 'Homepage Benefits',
    content: JSON.stringify({
      title: "Who is it for?",
      benefits: [
        {
          targetType: 'individuals',
          title: 'For Individuals',
          subtitle: 'Find Balance',
          description: 'Personalized mental health support tailored to your unique journey. Access therapy, tools, and a supportive community.',
          color: '#E0F2FE',
          iconColor: '#0284C7'
        },
        {
          targetType: 'employers',
          title: 'For Employers',
          subtitle: 'Support Your Team',
          description: 'Empower your workforce with comprehensive mental wellness programs. Boost productivity and improve team morale.',
          color: '#F0FDF4',
          iconColor: '#16A34A'
        },
        {
          targetType: 'professionals',
          title: 'For Professionals',
          subtitle: 'Expand Your Reach',
          description: 'Join our network of certified mental health professionals. Connect with clients and manage your practice efficiently.',
          color: '#FAF5FF',
          iconColor: '#9333EA'
        }
      ]
    }),
    lastUpdated: new Date().toISOString()
  },
  'homepage-faq': {
    title: 'Homepage FAQ',
    content: JSON.stringify({
      eyebrow: "Your Course",
      headline: "Psychological Help for Stress.\\nWhat this course offers you:",
      description: "Change takes time. Similar to sports or meditation, you won't feel immediate improvement - a clear plan and persistence are the keys to success. That's why our courses are designed for sustainability.",
      courseTitle: "6 Month Group Course",
      modules: [
        "MODULE 1: Start your journey!",
        "MODULE 2: My symptoms and goals",
        "MODULE 3: Psychological stress model",
        "MODULE 4: Resources and resilience",
        "MODULE 5: Self-worth and personal beliefs",
        "MODULE 6: Open discussion session",
        "MODULE 7: Reflection and review"
      ],
      cardTitle: "Begin your journey",
      features: [
        "1 month risk-free trial",
        "Self-paced learning modules",
        "Community support included"
      ],
      ctaText: "Get Started"
    }),
    lastUpdated: new Date().toISOString()
  },
  'homepage-newsletter': {
    title: 'Homepage Newsletter',
    content: JSON.stringify({
      title: "Newsletter Signup",
      benefits: [
        "Get weekly mental health tips and insights",
        "Early access to new features and programs",
        "Exclusive resources and guided exercises"
      ],
      imageUrl: "https://images.unsplash.com/photo-1758273240360-76b908e7582a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjB3ZWxsbmVzcyUyMHN1cHBvcnR8ZW58MXx8fHwxNzY0OTUxMDY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      imageAlt: "Mental health and wellness support",
      privacyText: "Privacy: We store and process your personal data based on our privacy policy. You can unsubscribe at any time.",
      ctaText: "Sign up now!"
    }),
    lastUpdated: new Date().toISOString()
  },
  'homepage-equip-intro': {
    title: 'Homepage Equip Intro',
    content: JSON.stringify({
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
    }),
    lastUpdated: new Date().toISOString()
  }
};
