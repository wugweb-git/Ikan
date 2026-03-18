import * as kv from "./kv_dual_write.ts";

interface HeroBanner {
  page_key: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  updated_at: string;
}

// ── Default hero banners per page ────────────────────────────────
const DEFAULTS: Record<string, HeroBanner> = {
  assessments: {
    page_key: 'assessments',
    title: 'Health Assessments',
    subtitle: 'Quick, evidence-based screenings to help you understand your mental well-being.',
    image_url: 'https://images.unsplash.com/photo-1650046825506-8901c4b837b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW50YWwlMjBoZWFsdGglMjBhc3Nlc3NtZW50JTIwcXVlc3Rpb25uYWlyZSUyMHRoZXJhcHl8ZW58MXx8fHwxNzczMzIxNTcyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    cta_text: '',
    cta_link: '',
    updated_at: new Date().toISOString(),
  },
  equip: {
    page_key: 'equip',
    title: 'Equip Programs',
    subtitle: 'Evidence-based programs designed to support your mental health journey.',
    image_url: 'https://images.unsplash.com/photo-1736494354382-de52c7248278?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMHByb2dyYW0lMjBzZWxmJTIwY2FyZSUyMG1pbmRmdWxuZXNzJTIwam91cm5leXxlbnwxfHx8fDE3NzMzMjE1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    cta_text: 'Explore Programs',
    cta_link: '',
    updated_at: new Date().toISOString(),
  },
  consultation: {
    page_key: 'consultation',
    title: 'Find Your Consultant',
    subtitle: 'Connect with experienced mental health professionals who understand your needs.',
    image_url: 'https://images.unsplash.com/photo-1758273240631-59d44c8f5b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVyYXBpc3QlMjBjb3Vuc2VsaW5nJTIwc2Vzc2lvbiUyMHN1cHBvcnRpdmUlMjBjb252ZXJzYXRpb258ZW58MXx8fHwxNzczMzIxNTczfDA&ixlib=rb-4.1.0&q=80&w=1080',
    cta_text: 'Book a Session',
    cta_link: '',
    updated_at: new Date().toISOString(),
  },
  resources: {
    page_key: 'resources',
    title: 'Resource Library',
    subtitle: 'Articles, guides, and tools curated by mental health professionals to support your journey.',
    image_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaWJyYXJ5JTIwYm9va3MlMjByZWFkaW5nJTIwa25vd2xlZGdlfGVufDF8fHx8MTc3MzMyMTU3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    cta_text: '',
    cta_link: '',
    updated_at: new Date().toISOString(),
  },
};

const KV_PREFIX = 'hero_banner:';

export function registerHeroBannerRoutes(app: Hono, middleware: any) {
  // GET /hero-banners — list all hero banners (PUBLIC — no auth required)
  app.get("/hero-banners", async (c) => {
    try {
      const stored = await kv.getByPrefix(KV_PREFIX);
      const bannerMap: Record<string, HeroBanner> = { ...DEFAULTS };
      if (stored && Array.isArray(stored)) {
        for (const item of stored) {
          const b = item as HeroBanner;
          if (b.page_key) bannerMap[b.page_key] = { ...DEFAULTS[b.page_key], ...b };
        }
      }
      return c.json({ banners: Object.values(bannerMap) });
    } catch (error) {
      console.log("Error listing hero banners:", error);
      return c.json({ error: `Failed to list hero banners: ${error}` }, 500);
    }
  });

  // GET /hero-banners/:pageKey — get a single page's hero banner (PUBLIC)
  app.get("/hero-banners/:pageKey", async (c) => {
    try {
      const pageKey = c.req.param("pageKey");
      const stored = await kv.get(`${KV_PREFIX}${pageKey}`);
      if (stored) {
        // Merge with defaults to ensure new fields are present
        const banner = { ...DEFAULTS[pageKey], ...(stored as HeroBanner) };
        return c.json({ banner });
      }
      const fallback = DEFAULTS[pageKey];
      if (fallback) {
        return c.json({ banner: fallback });
      }
      return c.json({ banner: null });
    } catch (error) {
      console.log(`Error getting hero banner for ${c.req.param("pageKey")}:`, error);
      return c.json({ error: `Failed to get hero banner: ${error}` }, 500);
    }
  });

  // PUT /hero-banners/:pageKey — update a page's hero banner
  app.put("/hero-banners/:pageKey", middleware, async (c) => {
    try {
      const pageKey = c.req.param("pageKey");
      const body = await c.req.json();
      const banner: HeroBanner = {
        page_key: pageKey,
        title: body.title ?? '',
        subtitle: body.subtitle ?? '',
        image_url: body.image_url ?? '',
        cta_text: body.cta_text ?? '',
        cta_link: body.cta_link ?? '',
        updated_at: new Date().toISOString(),
      };
      await kv.set(`${KV_PREFIX}${pageKey}`, banner);
      return c.json({ banner });
    } catch (error) {
      console.log(`Error updating hero banner for ${c.req.param("pageKey")}:`, error);
      return c.json({ error: `Failed to update hero banner: ${error}` }, 500);
    }
  });

  // POST /hero-banners/reset/:pageKey — reset to defaults
  app.post("/hero-banners/reset/:pageKey", middleware, async (c) => {
    try {
      const pageKey = c.req.param("pageKey");
      const fallback = DEFAULTS[pageKey];
      if (!fallback) {
        return c.json({ error: `No default banner found for page "${pageKey}"` }, 404);
      }
      const banner = { ...fallback, updated_at: new Date().toISOString() };
      await kv.set(`${KV_PREFIX}${pageKey}`, banner);
      return c.json({ banner });
    } catch (error) {
      console.log(`Error resetting hero banner for ${c.req.param("pageKey")}:`, error);
      return c.json({ error: `Failed to reset hero banner: ${error}` }, 500);
    }
  });
}