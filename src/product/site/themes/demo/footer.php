<?php
/**
 * The footer for iKAN Health WordPress theme
 */
?>
  <!-- Crisis Banner -->
  <aside class="bg-red-50 border-t border-b border-red-100 py-4 text-center text-sm text-red-800">
    <div class="max-w-[1600px] mx-auto px-4">
      <strong>In Crisis?</strong> If you are experiencing thoughts of self-harm, please reach out to <strong>KIRAN Helpline</strong> at <a href="tel:18005990019" class="underline font-semibold">1800-599-0019</a> (toll-free, 24x7) or <strong>iCALL</strong> at <a href="tel:9152987821" class="underline font-semibold">9152987821</a>.
    </div>
  </aside>

  <footer class="ikan2-theme bg-gray-900 text-gray-300 py-12">
    <div class="max-w-[1600px] mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 class="text-xl font-bold text-white mb-3"><?php bloginfo( 'name' ); ?></h3>
          <p class="text-sm text-gray-400 mb-4 leading-relaxed">
            iKAN is your trusted mental wellness platform. Evidence-based tools, professional assessments, and expert care.
          </p>
          <p class="text-sm text-gray-400">
            Email: <a href="mailto:support@ikanhealth.in" class="hover:text-white">support@ikanhealth.in</a>
          </p>
          <p class="text-sm text-gray-400">
            Phone: <a href="tel:+918527545503" class="hover:text-white">+91 85275 45503</a>
          </p>
        </div>
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-4">Quick Links</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="<?php echo esc_url( home_url( '/about-us' ) ); ?>" class="hover:text-white">About Us</a></li>
            <li><a href="<?php echo esc_url( home_url( '/services' ) ); ?>" class="hover:text-white">Services</a></li>
            <li><a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="hover:text-white">Assessments</a></li>
            <li><a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="hover:text-white">Equip Programs</a></li>
            <li><a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="hover:text-white">Resources</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-4">Tools & Programs</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="hover:text-white">Burnout Calculator</a></li>
            <li><a href="<?php echo esc_url( home_url( '/consultation' ) ); ?>" class="hover:text-white">Book Consultation</a></li>
            <li><a href="<?php echo esc_url( home_url( '/professional-application' ) ); ?>" class="hover:text-white">Join as Professional</a></li>
            <li><a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="hover:text-white">FAQs</a></li>
            <li><a href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="hover:text-white">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-4">Legal & Privacy</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="<?php echo esc_url( home_url( '/privacy-policy' ) ); ?>" class="hover:text-white">Privacy Policy</a></li>
            <li><a href="<?php echo esc_url( home_url( '/terms-of-use' ) ); ?>" class="hover:text-white">Terms of Use</a></li>
            <li><a href="<?php echo esc_url( home_url( '/cancellation-policy' ) ); ?>" class="hover:text-white">Cancellation Policy</a></li>
            <li><a href="<?php echo esc_url( home_url( '/return-policy' ) ); ?>" class="hover:text-white">Return Policy</a></li>
            <li><a href="<?php echo esc_url( home_url( '/workplace-privacy' ) ); ?>" class="hover:text-white">Workplace Privacy</a></li>
          </ul>
        </div>
      </div>

      <div class="pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        &copy; <?php echo date( 'Y' ); ?> iKAN Health. All rights reserved.
      </div>
    </div>
  </footer>

  <?php wp_footer(); ?>
</body>
</html>
