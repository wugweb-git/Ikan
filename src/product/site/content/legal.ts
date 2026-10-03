/**
 * THE FOUR POLICY PAGES — the one copy of them.
 *
 * Shaped as iKAN 2 shapes them (`{ title, subtitle, html }`, keyed by the slug
 * its /legal/$slug route uses) so the two surfaces can be diffed and kept in
 * step, exactly as `about.ts` does for the About page.
 *
 * THE CONTENT COMES FROM THIS REPO, NOT FROM iKAN 2 — the opposite direction to
 * About, FAQ and Contact. iKAN 2's copies are abridged: privacy 2336 characters
 * against 3005 here, terms 1496 against 1674, return 242 against 374,
 * cancellation 165 against 324. Its Privacy also lacks the "Deleting your
 * account" section entirely, which is the one a reader is most likely to need
 * and which Play requires a route for. So the fuller text wins and iKAN 2 syncs
 * from here.
 *
 * Only `subtitle` is taken from iKAN 2, and only where this repo has none:
 * Terms carries no subtitle on this side.
 *
 * ON THE ANALYTICS PARAGRAPH. It states that Google Analytics records the type
 * of screen and "never which assessment, which result, or which programme".
 * That is TRUE on app.ikanhealth.in: `ikan2/src/lib/analytics.ts` sets
 * `send_page_view: false` and sends the router's matched route PATTERN
 * ("/program/$slug/day/$day") with `page_location` overridden, so no slug ever
 * reaches Google.
 *
 * It is NOT yet true on ikanhealth.in. `index.html` here still loads gtag with
 * automatic page views on, and this site serves public `/assessment/<slug>`
 * pages, so the real URL is sent. Porting iKAN 2's analytics module to this
 * repo makes the sentence true on both surfaces; until then the claim is
 * accurate for the app and not for the site.
 */

export type LegalPageContent = {
  title: string;
  subtitle: string;
  html: string;
};

export const LEGAL_PAGES: Record<string, LegalPageContent> = {
  'privacy-policy': {
    title: "Privacy Policy",
    subtitle: "Your privacy and data security are fundamental to our mission.",
    html: `<div class="space-y-8">
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
</div>`,
  },

  'terms': {
    title: "Terms of Service",
    subtitle: "Important legal terms governing your use of iKAN's mental health platform and services.",
    html: `<div class="space-y-8">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">📋 Terms of Service</h2>
          <p class="text-gray-700 leading-relaxed">By accessing and using iKAN's mental health platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. Last updated: \${new Date().toLocaleDateString()}</p>
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
      </div>`,
  },

  'return-policy': {
    title: "Return Policy",
    subtitle: "Understanding our refund and return policy for iKAN services.",
    html: `<div class="space-y-8">
        <div class="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-lg border border-emerald-100">
          <h2 class="text-xl font-medium text-gray-900 mb-3">💚 Our Satisfaction Guarantee</h2>
          <p class="text-gray-700 leading-relaxed">At iKAN, we're committed to your satisfaction. If you're not completely satisfied with your purchase, we offer a comprehensive and fair return policy.</p>
        </div>
        <p>Please contact billing@ikanhealth.in for all refund requests.</p>
      </div>`,
  },

  'cancellation-policy': {
    title: "Cancellation Policy",
    subtitle: "We understand plans change. Cancel anytime with no penalties or hidden fees.",
    html: `<h2>Account Cancellation</h2>
      <p>You may cancel your iKAN account at any time.</p>
      <h2>Subscription Cancellation</h2>
      <p>For subscription services, cancel anytime before your next billing date.</p>`,
  },
};
