export const DEFAULT_CMS_CONTENT: { [key: string]: any } = {
  'about': {
    title: 'About iKan',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">🌟 Our Mission</h2>
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
    subtitle: 'Your privacy and data security are fundamental to our mission.',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">🔒 Your Privacy Matters</h2>
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
            <a href="mailto:privacy@ikanhealth.in" class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors text-center">
              Email: privacy@ikanhealth.in
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
    subtitle: "Important legal terms governing your use of iKan's mental health platform and services.",
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">📋 Terms of Service</h2>
          <p class="text-gray-700 leading-relaxed">By accessing and using iKan's mental health platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. Last updated: ${new Date().toLocaleDateString()}</p>
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
  'faq': {
    title: 'Frequently Asked Questions',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">❓ Frequently Asked Questions</h2>
          <p class="text-gray-700 leading-relaxed">Find answers to common questions about iKan's mental health platform. Can't find what you're looking for? <a href="mailto:support@ikanhealth.in" class="text-green-600 font-medium hover:underline">Contact our support team</a>.</p>
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
                    <p class="text-gray-700 text-sm">Email us at <a href="mailto:support@ikanhealth.in" class="text-orange-600 font-medium hover:underline">support@ikanhealth.in</a> or use our in-app contact form.</p>
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
      <p><span style="font-weight: 500;">Note:</span> If you are in immediate danger, please call emergency services.</p>
    `,
    lastUpdated: new Date().toISOString()
  },
  'return-policy': {
    title: 'Return Policy',
    subtitle: 'Understanding our refund and return policy for iKan services.',
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">💚 Our Satisfaction Guarantee</h2>
          <p class="text-gray-700 leading-relaxed">At iKan, we're committed to your satisfaction. If you're not completely satisfied with your purchase, we offer a comprehensive and fair return policy.</p>
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
  'lets-talk': {
    title: "Let's Talk",
    content: `
      <div class="space-y-8">
        <div class="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border border-teal-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">💬 Let's Talk</h2>
          <p class="text-gray-700 leading-relaxed">Taking the first step is often the hardest part. Whether you have questions, need guidance, or are ready to start your mental health journey — we're here to listen.</p>
        </div>

        <div class="grid gap-6">
          <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span class="mr-2">🤝</span> How Can We Help?
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <h4 class="font-medium text-gray-900 mb-2">General Inquiries</h4>
                <p class="text-sm text-gray-700">Questions about our platform, services, or how to get started.</p>
                <a href="mailto:hello@ikanhealth.in" class="text-teal-600 font-medium text-sm hover:underline mt-2 inline-block">hello@ikanhealth.in</a>
              </div>
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 class="font-medium text-gray-900 mb-2">Book a Consultation</h4>
                <p class="text-sm text-gray-700">Ready to speak with a professional? Schedule a consultation today.</p>
                <a href="/consultation" class="text-blue-600 font-medium text-sm hover:underline mt-2 inline-block">Book Now →</a>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 class="font-medium text-gray-900 mb-2">Partnerships</h4>
                <p class="text-sm text-gray-700">Interested in partnering with iKan for corporate wellness or research?</p>
                <a href="mailto:partners@ikanhealth.in" class="text-purple-600 font-medium text-sm hover:underline mt-2 inline-block">partners@ikanhealth.in</a>
              </div>
              <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 class="font-medium text-gray-900 mb-2">Technical Support</h4>
                <p class="text-sm text-gray-700">Having trouble with the app? Our support team can help.</p>
                <a href="mailto:support@ikanhealth.in" class="text-orange-600 font-medium text-sm hover:underline mt-2 inline-block">support@ikanhealth.in</a>
              </div>
            </div>
          </section>

          <section class="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 class="text-lg font-medium text-red-900 mb-4 flex items-center">
              <span class="mr-2">🚨</span> Crisis Support
            </h3>
            <div class="bg-white p-4 rounded-lg border border-red-200">
              <p class="text-red-800 font-medium mb-2">If you or someone you know is in immediate danger, please reach out now:</p>
              <div class="grid sm:grid-cols-2 gap-2 text-sm text-red-700">
                <p>• KIRAN Mental Health Helpline: 1800-599-0019 (24x7)</p>
                <p>• iCALL Psychosocial Helpline: 9152987821</p>
                <p>• Emergency: 112</p>
                <p>• International: befrienders.org</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    `,
    lastUpdated: new Date().toISOString()
  },
  'not-found': {
    title: 'Page Not Found',
    content: `
      <div class="space-y-8 text-center py-8">
        <div class="text-6xl mb-4">🔍</div>
        <h2 class="text-2xl font-medium text-gray-900">Oops! Page Not Found</h2>
        <p class="text-gray-600 max-w-md mx-auto leading-relaxed">The page you're looking for doesn't exist or may have been moved. Don't worry — let's get you back on track.</p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <a href="/" class="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">Go to Homepage</a>
          <a href="/contact" class="inline-block bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">Contact Support</a>
        </div>

        <div class="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-100 max-w-lg mx-auto text-left">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Looking for something specific?</h3>
          <ul class="space-y-2 text-sm text-gray-700">
            <li>• <a href="/assessments" class="text-blue-600 hover:underline">Take an Assessment</a></li>
            <li>• <a href="/resources" class="text-blue-600 hover:underline">Browse Resources</a></li>
            <li>• <a href="/consultation" class="text-blue-600 hover:underline">Book a Consultation</a></li>
            <li>• <a href="/faq" class="text-blue-600 hover:underline">Frequently Asked Questions</a></li>
          </ul>
        </div>
      </div>
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
      testimonial: {
        name: "Sarah J.",
        quote: "This platform has transformed how I manage my mental health. The tools are easy to use and the professionals are incredibly supportive.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop",
        imageAlt: "Sarah J. testimonial",
        course: "Anxiety Management",
        videoCaption: "Watch Sarah's Story",
        stats: {
          value: "94%",
          label: "Satisfaction Rate"
        }
      }
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
      description: 'We believe everyone deserves support on their mental health journey. iKan combines clinical expertise with thoughtful technology to meet you where you are.',
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
      ctaRoute: '/assessments',
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
        { value: '2M+', label: 'iKan members', icon: 'assessments' },
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
          question: 'What is iKan and how does it support mental health?',
          answer: 'iKan is a mental health PWA that provides access to professional consultants, self-guided programs, mood journaling, and mental health assessments — all in one place. Our goal is to make mental wellness accessible, private, and stigma-free.',
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
          question: 'Is my data private and secure on iKan?',
          answer: 'Absolutely. All user data is encrypted and treated as highly sensitive. We follow strict privacy guidelines, and our designs are intentionally subtle so you can use the app comfortably in any setting.',
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
          quote: 'iKan helped me understand my emotions better. I used to bottle everything up, but now I have tools to process what I feel. The assessments gave me clarity I never expected.',
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
          quote: "Finding affordable mental health support felt impossible until I found iKan. The resources are thoughtful and the consultations are judgment-free. It's changed how I take care of myself.",
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

  'page-about-us': {
    title: 'About Us Page',
    content: JSON.stringify({
      hero: {
        title: 'To us, mental health matters.',
        subtitle: 'At iKan, we believe mental health is for everyone.',
      },
      story: {
        label: 'Our Story',
        heading: 'Born from <personal> experience',
        headingHighlightColor: 'var(--ikan-brand-teal)',
        paragraphs: [
          'At some point everyone has struggled. Decades old friends Sachin, Vedanshu and Kartik have also faced their share of struggles, each one of us embarking on a personal journey to understand what we were going through. All of us witnessed first hand the barriers and gaps in mental healthcare in India and realised that the system is broken.',
          'Conversations with people who had struggled and therapists who had learned mental healthcare is inaccessible, costly, episodic, fragmented and needs to be fixed. We realised mental healthcare needs to stop being treated as a blackbox. The only way forward is by bringing people and technology together while being open and transparent. So we created <iKan>.',
        ],
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        imageAlt: 'Founders collaborating on iKan',
      },
      mission: {
        label: 'Mission',
        title: 'Making mental health care accessible, affordable, and stigma-free for every individual in India.',
        description: 'We are on a mission to bridge the gap between people and quality mental health support — through technology, compassion, and transparency.',
      },
      vision: {
        label: 'Vision',
        title: 'A world where seeking mental health support is as natural as visiting a doctor.',
        description: 'We envision a future where mental wellness is normalised, people have the tools they need at their fingertips, and no one suffers in silence.',
      },
      values: [
        {
          iconName: 'heart',
          title: 'People Centric',
          description: 'At iKan we keep you at the heart of everything, our sole focus is to empower you and make mental health care accessible for all.',
          color: 'var(--ikan-brand-teal)',
        },
        {
          iconName: 'shield',
          title: 'Secure',
          description: 'We value your privacy very highly, we are committed to ensuring your data is always safe and secure.',
          color: 'var(--ikan-brand-amber)',
        },
        {
          iconName: 'flask-conical',
          title: 'Science Backed',
          description: 'Everything we do is backed by research and validated by practising psychologists.',
          color: 'var(--ikan-brand-coral)',
        },
        {
          iconName: 'handshake',
          title: 'Our Promise',
          description: 'We believe mental health care is for everyone and we are eager to make it a reality.',
          color: 'var(--ikan-brand-slate)',
        },
      ],
      valuesHeading: "Why you'll love iKan",
      teamHeading: 'Our Team',
      teamDescription: 'The people behind iKan, driven by personal experience and a shared belief that mental health care should be better.',
      founders: [
        {
          name: 'Kartik Chandra',
          role: 'Co-Founder and CEO',
          bio: 'Kartik has a decade long experience in general and health insurance and health tech across various functions. He brings his experience and learnings from his personal journey to positioning iKan for growth and long term success.',
          image: '/team/kartik.jpg',
        },
        {
          name: 'Vedanshu Srivastava',
          role: 'Co-Founder and Product Head',
          bio: 'Vedanshu has a decade long experience in general and health insurance and health tech across various functions. He brings his experience and learnings from his personal journey to positioning iKan for growth and long term success.',
          image: '/team/vedanshu.jpg',
        },
        {
          name: 'Sachin Vaishampayan',
          role: 'Co-Founder and CTO',
          bio: 'Sachin has worked in research and education for over a decade, leading and managing internationally funded projects across diverse landscapes. He has extensive experience in content creation and designing engaging learning modules, which he blends with his personal interest in developing mental health aids for growth and innovation at iKan.',
          image: '/team/sachin.jpg',
        },
      ],
      team: [
        {
          name: 'Vaibhav Shukla',
          role: 'System Architect',
          image: '/team/vaibhav.jpg',
        },
        {
          name: 'Amitabh Bhatnagar',
          role: 'Dev Engineer',
          image: '/team/amitabh.jpg',
        },
        {
          name: 'Divyanshu Pundir',
          role: 'UX Designer',
          image: '/team/divyanshu.jpg',
        },
      ],
    }),
    lastUpdated: new Date().toISOString()
  },

  // ═══════════════════════════════════════════════════════════════
  // FULL PAGE CMS DEFAULTS (structured JSON for page components)
  // ═══════════════════════════════════════════════════════════════

  'page-faq': {
    title: 'FAQs & Help Center',
    content: JSON.stringify({
      heroTitle: 'FAQs & Help Center',
      heroSubtitle: 'Find answers to common questions about iKan, your account, programs, and more.',
      searchPlaceholder: 'Search for answers...',
      noResultsText: 'No results found. Try a different search term.',
      ctaTitle: 'Still have questions?',
      ctaDescription: 'We are here to help you on your mental health journey. Submit a ticket and our team will get back to you.',
      ctaButtonText: 'Contact Support',
      ctaButtonRoute: '/contact',
      categories: [
        { id: 'about', title: 'About iKan', items: [
          { question: 'What is iKan and how does it support mental health?', answer: 'iKan is a mental health progressive web app (PWA) that provides access to professional consultants, self-guided programs, mood journaling, and clinically validated assessments — all in one place. Our goal is to make mental wellness accessible, private, and stigma-free.' },
          { question: 'Is iKan a replacement for therapy?', answer: 'No. iKan is a complement to professional care, not a replacement. Our Equip programs, mood tracking, and resources are designed to support your wellbeing between sessions or as a first step.' },
          { question: 'How is iKan different from other mental health apps?', answer: 'iKan combines self-paced CBT-based programs, professional consultations, mood journaling, and a resource library into a single platform. We follow "Calm Tech" design principles.' },
        ]},
        { id: 'getting-started', title: 'Signing Up & Getting Started', items: [
          { question: 'How do I create an account?', answer: 'Tap "Get Started" on the homepage, enter your name, email, and a secure password. Your account will be confirmed automatically.' },
          { question: 'Is iKan free to use?', answer: 'Browsing resources, assessments, and our library is free. Individual Equip programs and professional consultations are paid services.' },
          { question: 'Can I use iKan without signing in?', answer: 'Yes. Public pages like Resources, Assessments, Equip listings, and informational content are accessible without an account.' },
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
          { question: 'What mental health assessments are available?', answer: 'We offer clinically validated assessments for anxiety (GAD-7), depression (PHQ-9), stress, well-being, and more.' },
          { question: 'How does mood journaling work?', answer: 'The Mood Journal lets you log your mood daily with a rating, emotions, energy level, and free-text reflections.' },
        ]},
        { id: 'trust-safety', title: 'Trust, Safety & Privacy', items: [
          { question: 'Is my data private and secure?', answer: 'Absolutely. All user data is encrypted and treated as highly sensitive. We never share your data with third parties.' },
          { question: 'What should I do in a mental health emergency?', answer: 'Call your local emergency services (911) or the iCALL Suicide Prevention Helpline at 9152987821.' },
          { question: 'How are consultants verified?', answer: 'All consultants on iKan are licensed professionals. We verify their credentials and experience before they join.' },
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
    content: JSON.stringify({
      heroTitle: 'Site Navigation',
      heroSubtitle: 'Explore all pages and resources available on iKan.',
      groups: [
        { title: 'Main Pages', links: [
          { label: 'Home', route: '/', icon: 'house', description: 'Landing page with resources, assessments, and programs' },
          { label: 'About Us', route: '/about', icon: 'info', description: 'Our mission, values, and what iKan offers' },
          { label: 'Contact Us', route: '/contact', icon: 'mail', description: 'Get in touch with the iKan team' },
        ]},
        { title: 'Mental Health Services', links: [
          { label: 'Assessments', route: '/assessment', icon: 'clipboard-check', description: 'Clinically validated mental health screenings' },
          { label: 'Equip Programs', route: '/equip', icon: 'book-open', description: 'Self-paced CBT-based wellness programs' },
          { label: 'Consultation', route: '/consultation', icon: 'stethoscope', description: 'Book sessions with licensed professionals' },
          { label: 'Resources', route: '/resource', icon: 'users', description: 'Articles, guides, and mental health tools' },
        ]},
        { title: 'Your Account', links: [
          { label: 'My Account', route: '/account', icon: 'user-circle', description: 'Profile, settings, and payment history' },
          { label: 'Mood Journal', route: '/mood-journal', icon: 'heart', description: 'Track your daily mood and emotions' },
        ]},
        { title: 'Legal & Help', links: [
          { label: 'FAQ', route: '/faq', icon: 'circle-help', description: 'Frequently asked questions and help center' },
          { label: 'Privacy Policy', route: '/privacy-policy', icon: 'shield', description: 'How we handle and protect your data' },
          { label: 'Terms of Service', route: '/terms', icon: 'file-text', description: 'Legal terms governing use of iKan' },
          { label: 'Cancellation Policy', route: '/cancellation-policy', icon: 'ban', description: 'How to cancel subscriptions and services' },
          { label: 'Return Policy', route: '/return-policy', icon: 'rotate-ccw', description: 'Our refund and return policy' },
        ]},
      ],
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