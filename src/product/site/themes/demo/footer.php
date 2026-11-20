<?php
/**
 * The footer for iKAN Health WordPress theme
 * Mapped to iKAN 2 Design System and authentic footer structure
 */
?>

  <!-- Crisis Banner -->
  <aside class="w-full py-3.5 px-4 text-center text-xs md:text-sm border-t border-b border-red-200" style="background-color: #FEF2F2; color: #991B1B;">
    <div class="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-2">
      <span class="inline-flex items-center gap-1.5 font-bold">
        <svg class="w-4 h-4 text-red-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        In Crisis?
      </span>
      <span>If you are experiencing thoughts of self-harm, please reach out to</span>
      <strong>KIRAN Helpline</strong> at <a href="tel:18005990019" class="underline font-bold hover:text-red-950">1800-599-0019</a> (toll-free, 24x7)
      <span>or</span>
      <strong>iCALL</strong> at <a href="tel:9152987821" class="underline font-bold hover:text-red-950">9152987821</a>.
    </div>
  </aside>

  <!-- Main iKAN Footer -->
  <footer class="w-full pt-16 pb-28 lg:pb-16 border-t border-black/5" style="background-color: var(--card); color: var(--foreground); font-family: var(--font-sans);" role="contentinfo">
    <div class="max-w-6xl mx-auto px-6">
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-100">
        
        <!-- Brand & Contact (2 cols on lg) -->
        <div class="lg:col-span-2 space-y-5">
          <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="inline-flex items-center gap-2.5" aria-label="iKAN">
            <img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/favicon.svg' ) ); ?>" alt="iKAN" width="32" height="32" class="w-8 h-8 rounded-[9px]">
            <span class="text-xl font-bold tracking-tight" style="font-family: var(--font-display);">iKAN</span>
          </a>

          <p class="text-sm leading-relaxed max-w-sm" style="color: var(--muted-foreground);">
            Evidence-based mental healthcare. Clinically validated assessments, self-guided CBT programs, licensed consultants, and privacy-first workplace analytics.
          </p>

          <div class="space-y-2 text-sm" style="color: var(--muted-foreground);">
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <a href="mailto:support@ikanhealth.in" class="hover:text-black transition-colors">support@ikanhealth.in</a>
            </div>
            <div class="flex items-center gap-2.5">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              <a href="tel:+918527545503" class="hover:text-black transition-colors">+91 85275 45503</a>
            </div>
          </div>

          <!-- Socials -->
          <div class="flex items-center gap-3 pt-2">
            <!-- WhatsApp -->
            <a href="https://wa.me/918527545503" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-600 text-gray-600 transition-colors" aria-label="WhatsApp">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <!-- LinkedIn -->
            <a href="https://linkedin.com/company/ikanhealth" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-colors" aria-label="LinkedIn">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <!-- X / Twitter -->
            <a href="https://x.com/ikanhealth" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" aria-label="X (formerly Twitter)">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <!-- Instagram -->
            <a href="https://instagram.com/ikanhealth" target="_blank" rel="noopener noreferrer" class="p-2 rounded-full bg-gray-100 hover:bg-pink-50 hover:text-pink-600 text-gray-600 transition-colors" aria-label="Instagram">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4" style="font-family: var(--font-display);">Quick Links</p>
          <ul class="space-y-2.5 text-sm" style="color: var(--muted-foreground);">
            <li><a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hover:text-black transition-colors">Home</a></li>
            <li><a href="<?php echo esc_url( home_url( '/services' ) ); ?>" class="hover:text-black transition-colors">Services Overview</a></li>
            <li><a href="<?php echo esc_url( home_url( '/assessments' ) ); ?>" class="hover:text-black transition-colors">Clinical Assessments</a></li>
            <li><a href="<?php echo esc_url( home_url( '/equip-programs' ) ); ?>" class="hover:text-black transition-colors">Equip Programs</a></li>
            <li><a href="<?php echo esc_url( home_url( '/resources' ) ); ?>" class="hover:text-black transition-colors">Resources & Blog</a></li>
            <li><a href="<?php echo esc_url( home_url( '/burnout-cost-calculator' ) ); ?>" class="hover:text-black transition-colors font-medium text-emerald-700">Burnout Cost Calculator</a></li>
          </ul>
        </div>

        <!-- Support & Teams -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4" style="font-family: var(--font-display);">Support & Teams</p>
          <ul class="space-y-2.5 text-sm" style="color: var(--muted-foreground);">
            <li><a href="<?php echo esc_url( home_url( '/about-us' ) ); ?>" class="hover:text-black transition-colors">About Us & Team</a></li>
            <li><a href="<?php echo esc_url( home_url( '/faq' ) ); ?>" class="hover:text-black transition-colors">Frequently Asked Questions</a></li>
            <li><a href="<?php echo esc_url( home_url( '/contact-us' ) ); ?>" class="hover:text-black transition-colors">Contact Support</a></li>
            <li><a href="<?php echo esc_url( home_url( '/org' ) ); ?>" class="hover:text-black transition-colors font-medium text-emerald-700">For Organizations</a></li>
            <li><a href="<?php echo esc_url( home_url( '/consultation' ) ); ?>" class="hover:text-black transition-colors">Book Consultation</a></li>
            <li><a href="<?php echo esc_url( home_url( '/professional-application' ) ); ?>" class="hover:text-black transition-colors">Join as Professional</a></li>
          </ul>
        </div>

        <!-- Legal & Policies -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-4" style="font-family: var(--font-display);">Legal & Privacy</p>
          <ul class="space-y-2.5 text-sm" style="color: var(--muted-foreground);">
            <li><a href="<?php echo esc_url( home_url( '/privacy-policy' ) ); ?>" class="hover:text-black transition-colors">Privacy Policy</a></li>
            <li><a href="<?php echo esc_url( home_url( '/terms-of-use' ) ); ?>" class="hover:text-black transition-colors">Terms of Use</a></li>
            <li><a href="<?php echo esc_url( home_url( '/workplace-privacy' ) ); ?>" class="hover:text-black transition-colors font-medium text-emerald-700">Workplace Privacy</a></li>
            <li><a href="<?php echo esc_url( home_url( '/cancellation-policy' ) ); ?>" class="hover:text-black transition-colors">Cancellation Policy</a></li>
            <li><a href="<?php echo esc_url( home_url( '/return-policy' ) ); ?>" class="hover:text-black transition-colors">Return Policy</a></li>
          </ul>
        </div>

      </div>

      <!-- Bottom Credits & Wugweb Logo -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style="color: var(--muted-foreground);">
        <p>&copy; <?php echo date( 'Y' ); ?> iKAN Health. All rights reserved. Made for accessible mental wellbeing.</p>
        
        <div class="flex items-center gap-2">
          <span>Crafted with precision by</span>
          <a href="https://wugweb.com" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 font-medium hover:text-black transition-colors">
            <!-- Wugweb Logo -->
            <svg class="w-5 h-5 rounded-[5px]" fill="none" viewBox="0 0 24 24">
              <rect fill="#101010" height="24" rx="5" width="24"/>
              <path d="M5 8h3v8H5z" fill="white"/>
              <path d="M10 8h3v8h-3z" fill="white"/>
              <path d="M15 8h4v4h-4z" fill="#FFBE1A"/>
              <path d="M15 13h4v3h-4z" fill="#FFBE1A"/>
            </svg>
            <span>Wugweb</span>
          </a>
        </div>
      </div>

    </div>
  </footer>

  <?php wp_footer(); ?>
</body>
</html>
