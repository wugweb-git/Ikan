<?php
/**
 * iKAN Health — Rank Math SEO & Google Site Kit / GTM Event Mapping.
 *
 * 1. Maps custom ikan rewrite routes (/program, /about, /contact, /resource, /legal/*, /portal)
 *    into Rank Math's title, description, canonical, robots, and JSON-LD @graph filters.
 * 2. Wires Google Site Kit (googlesitekit_gtag_opt) & GTM dataLayer events across iKAN blocks
 *    and forms without sending sensitive health/PII data.
 *
 * @package iKAN_Health
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ikan_SEO_Analytics {

	/**
	 * Boot hooks.
	 */
	public static function init() {
		// Rank Math route metadata & schema
		add_filter( 'rank_math/frontend/title', array( __CLASS__, 'filter_rank_math_title' ), 20 );
		add_filter( 'rank_math/frontend/description', array( __CLASS__, 'filter_rank_math_description' ), 20 );
		add_filter( 'rank_math/frontend/canonical', array( __CLASS__, 'filter_rank_math_canonical' ), 20 );
		add_filter( 'rank_math/frontend/robots', array( __CLASS__, 'filter_rank_math_robots' ), 20 );
		add_filter( 'rank_math/json_ld', array( __CLASS__, 'enrich_rank_math_json_ld' ), 20, 2 );

		// Google Site Kit & GTM dataLayer event tracking
		add_action( 'wp_footer', array( __CLASS__, 'render_datalayer_events' ), 99 );
	}

	/**
	 * SEO metadata map for custom rewrite routes not backed by a WP post/page.
	 *
	 * @return array<string, string>|null
	 */
	private static function get_current_route_meta() {
		if ( get_query_var( 'ikan_portal' ) ) {
			return array(
				'title'       => 'Member & Clinician Portal | iKAN Health',
				'description' => 'Sign in to the iKAN Health portal.',
				'canonical'   => home_url( '/portal/' ),
				'noindex'     => '1',
			);
		}
		if ( get_query_var( 'ikan_program_page' ) ) {
			return array(
				'title'       => 'Equip Programmes — Daily Mental Health & Burnout Recovery | iKAN Health',
				'description' => 'Structured daily Equip programmes for sleep, burnout recovery, stress relief, and focus.',
				'canonical'   => home_url( '/equip-programs/' ),
			);
		}
		if ( get_query_var( 'ikan_about_page' ) ) {
			return array(
				'title'       => 'About iKAN Health — Evidence-Based Mental Health Care',
				'description' => 'Learn how iKAN connects clinically validated assessments, daily programmes, and therapists.',
				'canonical'   => home_url( '/about/' ),
			);
		}
		if ( get_query_var( 'ikan_contact_page' ) ) {
			return array(
				'title'       => 'Contact Us | iKAN Health',
				'description' => 'Reach the iKAN Health team for support, workplace pilots, or general enquiries.',
				'canonical'   => home_url( '/contact/' ),
			);
		}
		if ( get_query_var( 'ikan_resources_page' ) ) {
			return array(
				'title'       => 'Mental Health Resources & Guides | iKAN Health',
				'description' => 'Research-backed articles and practical guides on stress, sleep, anxiety, and workplace wellbeing.',
				'canonical'   => home_url( '/resources/' ),
			);
		}
		$legal_slug = get_query_var( 'ikan_legal_page' );
		if ( $legal_slug ) {
			$titles = array(
				'terms'          => 'Terms of Service | iKAN Health',
				'privacy-policy' => 'Privacy Policy | iKAN Health',
				'return-policy'  => 'Return & Refund Policy | iKAN Health',
			);
			return array(
				'title'       => $titles[ $legal_slug ] ?? 'Legal | iKAN Health',
				'description' => 'iKAN Health legal terms, privacy policy, and user data protections.',
				'canonical'   => home_url( '/' . sanitize_title( $legal_slug ) . '/' ),
			);
		}
		return null;
	}

	public static function filter_rank_math_title( $title ) {
		$meta = self::get_current_route_meta();
		return ! empty( $meta['title'] ) ? $meta['title'] : $title;
	}

	public static function filter_rank_math_description( $description ) {
		$meta = self::get_current_route_meta();
		return ! empty( $meta['description'] ) ? $meta['description'] : $description;
	}

	public static function filter_rank_math_canonical( $canonical ) {
		$meta = self::get_current_route_meta();
		return ! empty( $meta['canonical'] ) ? $meta['canonical'] : $canonical;
	}

	public static function filter_rank_math_robots( $robots ) {
		$meta = self::get_current_route_meta();
		if ( ! empty( $meta['noindex'] ) && is_array( $robots ) ) {
			$robots['index']  = 'noindex';
			$robots['follow'] = 'nofollow';
		}
		return $robots;
	}

	/**
	 * Enrich Rank Math's @graph with iKAN Health Organization details (without duplicating Article/BreadcrumbList).
	 */
	public static function enrich_rank_math_json_ld( $data, $jsonld ) {
		if ( ! is_array( $data ) ) {
			return $data;
		}
		$data['ikanOrganization'] = array(
			'@type' => 'MedicalOrganization',
			'@id'   => home_url( '/#organization' ),
			'name'  => 'iKAN Health',
			'url'   => home_url( '/' ),
			'logo'  => 'https://app.ikanhealth.in/pwa-512x512.png',
			'email' => 'hello@ikanhealth.in',
			'sameAs' => array(
				'https://www.instagram.com/ikanhealth_in/',
				'https://x.com/ikanhealth_in',
				'https://www.facebook.com/ikanhealth_in',
			),
		);
		return $data;
	}

	/**
	 * Emit non-PII GA4 / GTM dataLayer events for iKAN blocks, app handoffs, and form completions.
	 */
	public static function render_datalayer_events() {
		?>
		<script>
		(function() {
			window.dataLayer = window.dataLayer || [];
			function emit(eventName, params) {
				var payload = Object.assign({ event: eventName }, params || {});
				window.dataLayer.push(payload);
				if (typeof window.gtag === 'function') {
					window.gtag('event', eventName, params || {});
				}
			}

			// Track clicks on iKAN block cards & app.ikanhealth.in cross-domain handoffs
			document.addEventListener('click', function(e) {
				var link = e.target && e.target.closest ? e.target.closest('a') : null;
				if (!link || !link.href) return;

				if (link.href.indexOf('https://app.ikanhealth.in') === 0) {
					emit('app_handoff', {
						link_url: link.href.split('?')[0],
						source_path: window.location.pathname
					});
				}

				if (link.classList.contains('resource-card')) {
					emit('resource_open', { source_path: window.location.pathname });
				} else if (link.closest('.ikan2-theme') && link.getAttribute('href')) {
					var href = link.getAttribute('href');
					if (href.indexOf('/assessments') !== -1) {
						emit('assessment_card_click', { source_path: window.location.pathname });
					} else if (href.indexOf('/equip') !== -1 || href.indexOf('/program') !== -1) {
						emit('equip_card_click', { source_path: window.location.pathname });
					} else if (href.indexOf('/consult') !== -1) {
						emit('consult_card_click', { source_path: window.location.pathname });
					} else if (href.indexOf('/journal') !== -1) {
						emit('mood_checkin_click', { source_path: window.location.pathname });
					}
				}
			}, { passive: true });

			// Allow theme/form scripts to dispatch standardized conversion events
			document.addEventListener('ikan:track', function(e) {
				if (e && e.detail && e.detail.name) {
					emit(e.detail.name, e.detail.params || {});
				}
			});
		})();
		</script>
		<?php
	}
}

Ikan_SEO_Analytics::init();
