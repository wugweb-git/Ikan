import * as kv from './kv_store.tsx';
import { ContentItem } from './shared-types.ts';

const generateId = () => crypto.randomUUID();

export const ContentService = {
  async createContent(data: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<ContentItem> {
    const existing = await kv.get(`content_slug:${data.slug}`);
    if (existing) {
      throw new Error(`Content with slug "${data.slug}" already exists.`);
    }

    const id = generateId();
    const now = new Date().toISOString();
    
    const content: ContentItem = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };

    await kv.set(`content:${id}`, content);
    await kv.set(`content_slug:${data.slug}`, id);
    
    return content;
  },

  async getContentBySlug(slug: string): Promise<ContentItem | null> {
    const id = await kv.get(`content_slug:${slug}`);
    if (!id) return null;
    return await kv.get(`content:${id}`);
  },
  
  async listContent(): Promise<ContentItem[]> {
      const all = await kv.getByPrefix('content:');
      return all.filter((c: any) => c && c.id && c.slug);
  }
};
