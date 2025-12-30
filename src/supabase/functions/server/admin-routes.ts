
import { Hono } from "npm:hono";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

export function registerAdminRoutes(app: Hono, requireAdmin: any) {
  
  // ==========================================
  // CATEGORIES
  // ==========================================
  
  app.get("/admin/categories", requireAdmin, async (c) => {
    try {
      const categories = await kv.getByPrefix("category:");
      return c.json({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return c.json({ error: "Failed to fetch categories" }, 500);
    }
  });

  app.post("/admin/categories", requireAdmin, async (c) => {
    try {
      const data = await c.req.json();
      if (!data.name) {
        return c.json({ error: "Name is required" }, 400);
      }

      const id = data.id || `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const category = {
        ...data,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await kv.set(`category:${id}`, category);
      return c.json({ category });
    } catch (error) {
      console.error("Error creating category:", error);
      return c.json({ error: "Failed to create category" }, 500);
    }
  });

  app.put("/admin/categories/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      
      const current = await kv.get(`category:${id}`);
      if (!current) {
        return c.json({ error: "Category not found" }, 404);
      }

      const category = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString()
      };

      await kv.set(`category:${id}`, category);
      return c.json({ category });
    } catch (error) {
      console.error("Error updating category:", error);
      return c.json({ error: "Failed to update category" }, 500);
    }
  });

  app.delete("/admin/categories/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      
      // 1. Try standard delete by key
      await kv.del(`category:${id}`);
      
      // 2. Robust delete: match by ID in JSON content
      // This handles cases where key and internal ID are desynchronized
      const { error } = await supabase
        .from('kv_store_cc205da9')
        .delete()
        .eq('value->>id', id)
        .like('key', 'category:%');
        
      if (error) console.warn("Robust category delete error:", error);

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      return c.json({ error: "Failed to delete category" }, 500);
    }
  });

  // ==========================================
  // PAGES (CMS)
  // ==========================================

  app.get("/admin/pages", requireAdmin, async (c) => {
    try {
      const pages = await kv.getByPrefix("page:");
      return c.json({ pages });
    } catch (error) {
      console.error("Error fetching pages:", error);
      return c.json({ error: "Failed to fetch pages" }, 500);
    }
  });

  app.get("/admin/pages/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const page = await kv.get(`page:${id}`);
      
      if (!page) {
        return c.json({ error: "Page not found" }, 404);
      }
      
      return c.json({ page });
    } catch (error) {
      console.error("Error fetching page:", error);
      return c.json({ error: "Failed to fetch page" }, 500);
    }
  });

  app.post("/admin/pages", requireAdmin, async (c) => {
    try {
      const data = await c.req.json();
      if (!data.title) {
        return c.json({ error: "Title is required" }, 400);
      }

      const id = data.id || `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const page = {
        ...data,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await kv.set(`page:${id}`, page);
      
      // Index by slug for faster lookups
      if (page.slug) {
        await kv.set(`page_slug:${page.slug}`, id);
      }
      
      return c.json({ page });
    } catch (error) {
      console.error("Error creating page:", error);
      return c.json({ error: "Failed to create page" }, 500);
    }
  });

  app.put("/admin/pages/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      
      const current = await kv.get(`page:${id}`);
      if (!current) {
        return c.json({ error: "Page not found" }, 404);
      }
      
      // If slug changes, remove old index
      if (updates.slug && updates.slug !== current.slug) {
        await kv.del(`page_slug:${current.slug}`);
      }

      const page = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString()
      };

      await kv.set(`page:${id}`, page);
      
      // Index by slug
      if (page.slug) {
        await kv.set(`page_slug:${page.slug}`, id);
      }

      return c.json({ page });
    } catch (error) {
      console.error("Error updating page:", error);
      return c.json({ error: "Failed to update page" }, 500);
    }
  });

  app.delete("/admin/pages/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      
      // 1. Try to get page to clean up slug
      let page = await kv.get(`page:${id}`);
      
      // If not found by key, try finding by value ID (robust lookup)
      if (!page) {
         const { data } = await supabase
            .from('kv_store_cc205da9')
            .select('value')
            .eq('value->>id', id)
            .like('key', 'page:%')
            .maybeSingle();
         if (data) page = data.value;
      }
      
      if (page && page.slug) {
        await kv.del(`page_slug:${page.slug}`);
      }
      
      // 2. Try standard delete
      await kv.del(`page:${id}`);
      
      // 3. Robust delete for the page record itself
      const { error } = await supabase
        .from('kv_store_cc205da9')
        .delete()
        .eq('value->>id', id)
        .like('key', 'page:%');
        
      if (error) console.warn("Robust page delete error:", error);

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting page:", error);
      return c.json({ error: "Failed to delete page" }, 500);
    }
  });

  // ==========================================
  // RESOURCES
  // ==========================================

  app.get("/admin/resources", requireAdmin, async (c) => {
    try {
      const resources = await kv.getByPrefix("resource:");
      return c.json({ resources });
    } catch (error) {
      console.error("Error fetching resources:", error);
      return c.json({ error: "Failed to fetch resources" }, 500);
    }
  });

  app.post("/admin/resources", requireAdmin, async (c) => {
    try {
      const data = await c.req.json();
      
      const id = data.id || `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const resource = {
        ...data,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await kv.set(`resource:${id}`, resource);
      return c.json({ resource });
    } catch (error) {
      console.error("Error creating resource:", error);
      return c.json({ error: "Failed to create resource" }, 500);
    }
  });

  app.put("/admin/resources/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      
      const current = await kv.get(`resource:${id}`);
      if (!current) {
        return c.json({ error: "Resource not found" }, 404);
      }

      const resource = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString()
      };

      await kv.set(`resource:${id}`, resource);
      return c.json({ resource });
    } catch (error) {
      console.error("Error updating resource:", error);
      return c.json({ error: "Failed to update resource" }, 500);
    }
  });

  app.delete("/admin/resources/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      
      // 1. Try standard delete by key
      await kv.del(`resource:${id}`);
      
      // 2. Robust delete: match by ID in JSON content
      const { error } = await supabase
        .from('kv_store_cc205da9')
        .delete()
        .eq('value->>id', id)
        .like('key', 'resource:%');
        
      if (error) console.warn("Robust resource delete error:", error);

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting resource:", error);
      return c.json({ error: "Failed to delete resource" }, 500);
    }
  });

  // ==========================================
  // MEDIA
  // ==========================================

  app.get("/admin/media/files", requireAdmin, async (c) => {
    try {
      // List all files in the bucket
      const bucketName = 'make-cc205da9-media';
      
      // Check if bucket exists, create if not
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, {
          public: true, // Make public for easier access
          fileSizeLimit: 52428800, // 50MB
        });
      }

      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list();

      if (error) {
        throw error;
      }

      // Transform to match UI expectations
      const files = await Promise.all(data.map(async (file) => {
        const { data: { publicUrl } } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(file.name);

        return {
          id: file.id,
          fileName: file.name,
          fileSize: file.metadata?.size || 0,
          fileType: file.metadata?.mimetype || 'application/octet-stream',
          filePath: file.name,
          bucket: bucketName,
          url: publicUrl,
          uploadedAt: file.created_at
        };
      }));

      return c.json({ files });
    } catch (error: any) {
      console.error("Error fetching media files:", error);
      return c.json({ error: error.message || "Failed to fetch media files" }, 500);
    }
  });

  app.delete("/admin/media/files/:id", requireAdmin, async (c) => {
    try {
      // The ID passed here might be the file name or the ID.
      // Since delete requires path (name), we need to find the file first or assume the ID is the name?
      // The UI passes file.id. But Storage remove takes paths.
      // Let's check how we constructed the list.
      // file.id is a UUID. file.name is the path.
      
      // We need to look up the file by ID to get the name? 
      // Or we can ask the UI to pass the name/path instead of ID in the delete call?
      // But typically REST API uses ID.
      
      // Let's first try to treat ID as a path/name, if that fails, we might need a lookup.
      // However, usually we can just rely on the UI passing the correct identifier.
      // In AdminMediaManager, we passed `selectedFile.id` to `deleteMediaFile`.
      
      // OPTION: We'll list files and find the one with the ID.
      const bucketName = 'make-cc205da9-media';
      const { data: files } = await supabase.storage.from(bucketName).list();
      
      const fileToDelete = files?.find(f => f.id === c.req.param("id"));
      const fileName = fileToDelete ? fileToDelete.name : c.req.param("id"); // Fallback to using ID as name if not found (maybe it was passed as name)

      const { error } = await supabase
        .storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        throw error;
      }

      return c.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting media file:", error);
      return c.json({ error: error.message || "Failed to delete media file" }, 500);
    }
  });

  // Media Upload Endpoint
  app.post("/admin/media/upload", requireAdmin, async (c) => {
    try {
      const body = await c.req.parseBody();
      const file = body['file'];
      
      if (!(file instanceof File)) {
        return c.json({ error: 'File required' }, 400);
      }

      const bucketName = 'make-cc205da9-media';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileName = `${timestamp}-${randomString}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return c.json({
        success: true,
        url: publicUrl,
        fileName: fileName,
        path: data.path
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      return c.json({ error: error.message || "Upload failed" }, 500);
    }
  });

  // ==========================================
  // ASSESSMENTS
  // ==========================================

  app.get("/admin/assessments", requireAdmin, async (c) => {
    try {
      const assessments = await kv.getByPrefix("assessment_def:");
      return c.json({ assessments });
    } catch (error) {
      console.error("Error fetching assessments:", error);
      return c.json({ error: "Failed to fetch assessments" }, 500);
    }
  });

  app.post("/admin/assessments", requireAdmin, async (c) => {
    try {
      const data = await c.req.json();
      if (!data.title) {
        return c.json({ error: "Title is required" }, 400);
      }

      const id = data.id || `asm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const assessment = {
        ...data,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await kv.set(`assessment_def:${id}`, assessment);
      return c.json({ assessment });
    } catch (error) {
      console.error("Error creating assessment:", error);
      return c.json({ error: "Failed to create assessment" }, 500);
    }
  });

  app.put("/admin/assessments/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      const updates = await c.req.json();
      
      const current = await kv.get(`assessment_def:${id}`);
      if (!current) {
        return c.json({ error: "Assessment not found" }, 404);
      }

      const assessment = {
        ...current,
        ...updates,
        updated_at: new Date().toISOString()
      };

      await kv.set(`assessment_def:${id}`, assessment);
      return c.json({ assessment });
    } catch (error) {
      console.error("Error updating assessment:", error);
      return c.json({ error: "Failed to update assessment" }, 500);
    }
  });

  app.delete("/admin/assessments/:id", requireAdmin, async (c) => {
    try {
      const id = c.req.param("id");
      await kv.del(`assessment_def:${id}`);
      
      const { error } = await supabase
        .from('kv_store_cc205da9')
        .delete()
        .eq('value->>id', id)
        .like('key', 'assessment_def:%');
        
      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      return c.json({ error: "Failed to delete assessment" }, 500);
    }
  });

}
