import * as kv from './kv_store.tsx';
import { 
  Equip, 
  EquipDay, 
  EquipBlock, 
  EquipBlockDataset, 
  EquipWithDays, 
  EquipDayWithBlocks 
} from './shared-types.ts';

// ------------------------------------------------------------------
// UTILS
// ------------------------------------------------------------------

const generateId = () => crypto.randomUUID();

// ------------------------------------------------------------------
// EQUIP SERVICE
// ------------------------------------------------------------------

export const EquipService = {
  async createEquip(data: Omit<Equip, 'id' | 'created_at' | 'updated_at'>): Promise<Equip> {
    // Check slug uniqueness
    const existingId = await kv.get(`equip_slug:${data.slug}`);
    if (existingId) {
      throw new Error(`Equip with slug "${data.slug}" already exists.`);
    }

    const id = generateId();
    const now = new Date().toISOString();
    
    const equip: Equip = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };

    await kv.set(`equip:${id}`, equip);
    await kv.set(`equip_slug:${data.slug}`, id);
    // Initialize days index
    await kv.set(`idx_equip_days:${id}`, []);

    return equip;
  },

  async getEquip(id: string): Promise<Equip | null> {
    return await kv.get(`equip:${id}`);
  },

  async getEquipBySlug(slug: string): Promise<Equip | null> {
    const id = await kv.get(`equip_slug:${slug}`);
    if (!id) return null;
    return await kv.get(`equip:${id}`);
  },

  async updateEquip(id: string, updates: Partial<Omit<Equip, 'id' | 'created_at'>>): Promise<Equip> {
    const existing = await kv.get(`equip:${id}`);
    if (!existing) throw new Error(`Equip ${id} not found`);

    // Handle slug change
    if (updates.slug && updates.slug !== existing.slug) {
      const slugExists = await kv.get(`equip_slug:${updates.slug}`);
      if (slugExists) throw new Error(`Slug ${updates.slug} is taken`);
      
      await kv.del(`equip_slug:${existing.slug}`);
      await kv.set(`equip_slug:${updates.slug}`, id);
    }

    const updated: Equip = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`equip:${id}`, updated);
    return updated;
  },

  async listEquips(): Promise<Equip[]> {
    const all = await kv.getByPrefix('equip:');
    return all.filter((item: any) => item && item.id && item.slug && item.category); 
  },

  async deleteEquip(id: string): Promise<void> {
    const equip = await kv.get(`equip:${id}`);
    if (!equip) return;

    // 1. Delete Slug Index
    await kv.del(`equip_slug:${equip.slug}`);
    
    // 2. Delete Days (and their blocks)
    const dayIds = await kv.get(`idx_equip_days:${id}`) || [];
    for (const dayId of dayIds) {
      await EquipDayService.deleteDay(dayId); // This handles blocks
    }
    
    // 3. Delete Index
    await kv.del(`idx_equip_days:${id}`);
    
    // 4. Delete Equip
    await kv.del(`equip:${id}`);
  },
  
  async getFullEquip(id: string): Promise<EquipWithDays | null> {
    const equip = await this.getEquip(id);
    if (!equip) return null;
    
    const days = await EquipDayService.listDaysForEquip(id);
    const daysWithBlocks: EquipDayWithBlocks[] = [];
    
    for (const day of days) {
      const rawBlocks = await EquipBlockService.listBlocksForDay(day.id);
      
      const blocks = await Promise.all(rawBlocks.map(async (b: any) => {
        let hydrated = { ...b };
        
        // Hydrate Content
        if (b.content_ref_id) {
            const contentObj = await kv.get(`content:${b.content_ref_id}`) 
                            || await kv.get(`content_item:${b.content_ref_id}`); 
            if (contentObj) {
                hydrated.content = contentObj.body || contentObj.content || '';
                // hydrated.title = contentObj.title || hydrated.title; // Keep block title if exists?
            }
        }
        
        // Hydrate Dataset (Exercise Config)
        if (b.dataset_id) {
            const dataset = await DatasetService.getDataset(b.dataset_id);
            if (dataset) {
                hydrated.exercise_config = dataset.schema;
            }
        }
        
        return hydrated;
      }));
      
      daysWithBlocks.push({ ...day, blocks });
    }
    
    return { ...equip, days: daysWithBlocks };
  },

  async ensureDefaults(): Promise<void> {
    const all = await this.listEquips();
    if (all.length > 0) return;

    // Create default program
    const program = await this.createEquip({
        title: "Anxiety Basics",
        slug: "anxiety-basics",
        description: "A 7-day journey to understand and manage anxiety.",
        category: "anxiety",
        image_url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2500&auto=format&fit=crop",
        duration_days: 7,
        published: true,
        tags: ["anxiety", "beginner", "foundations"]
    });

    // Day 1
    const day1 = await EquipDayService.createDay({
        equip_id: program.id,
        day_number: 1,
        title: "Understanding Anxiety",
        description: "Learn what anxiety is and why we experience it.",
        image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2500&auto=format&fit=crop"
    });

    // Day 1 Blocks
    await EquipBlockService.createBlock({
        equip_day_id: day1.id,
        order_index: 0,
        block_type: "text",
        title: "Welcome",
        content: "Welcome to Anxiety Basics. Over the next 7 days, we will explore the roots of anxiety and learn practical tools to manage it. You are not alone in this journey.",
        estimated_time_minutes: 2,
        is_required: true
    });
    
    await EquipBlockService.createBlock({
        equip_day_id: day1.id,
        order_index: 1,
        block_type: "quiz",
        title: "Reflection",
        content: "How are you feeling right now about starting this program?",
        estimated_time_minutes: 3,
        is_required: true,
        exercise_config: {
          questions: [
            { id: "q1", text: "How anxious do you feel today?", type: "scale", min: 1, max: 10, minLabel: "Calm", maxLabel: "Very Anxious" }
          ]
        }
    });

    console.log("Seeded default Equip program: Anxiety Basics");
  }
};

// ------------------------------------------------------------------
// DAY SERVICE
// ------------------------------------------------------------------

export const EquipDayService = {
  async createDay(data: Omit<EquipDay, 'id' | 'created_at'>): Promise<EquipDay> {
    const equipExists = await kv.get(`equip:${data.equip_id}`);
    if (!equipExists) throw new Error(`Equip ${data.equip_id} not found`);

    const id = generateId();
    const day: EquipDay = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };

    await kv.set(`day:${id}`, day);
    
    // Update Index
    const dayIds = await kv.get(`idx_equip_days:${data.equip_id}`) || [];
    dayIds.push(id);
    await kv.set(`idx_equip_days:${data.equip_id}`, dayIds);
    
    // Init blocks index
    await kv.set(`idx_day_blocks:${id}`, []);

    return day;
  },

  async getDay(id: string): Promise<EquipDay | null> {
    return await kv.get(`day:${id}`);
  },

  async updateDay(id: string, updates: Partial<Omit<EquipDay, 'id' | 'equip_id' | 'created_at'>>): Promise<EquipDay> {
    const existing = await kv.get(`day:${id}`);
    if (!existing) throw new Error(`Day ${id} not found`);

    const updated = { ...existing, ...updates };
    await kv.set(`day:${id}`, updated);
    return updated;
  },

  async deleteDay(id: string): Promise<void> {
    const day = await kv.get(`day:${id}`);
    if (!day) return;

    // 1. Delete Blocks
    const blockIds = await kv.get(`idx_day_blocks:${id}`) || [];
    for (const blockId of blockIds) {
      await EquipBlockService.deleteBlock(blockId);
    }
    await kv.del(`idx_day_blocks:${id}`);

    // 2. Remove from Parent Index
    const parentIndexKey = `idx_equip_days:${day.equip_id}`;
    const dayIds = await kv.get(parentIndexKey) || [];
    const newDayIds = dayIds.filter((d: string) => d !== id);
    await kv.set(parentIndexKey, newDayIds);

    // 3. Delete Day
    await kv.del(`day:${id}`);
  },

  async listDaysForEquip(equipId: string): Promise<EquipDay[]> {
    const dayIds = await kv.get(`idx_equip_days:${equipId}`);
    if (!dayIds || dayIds.length === 0) return [];
    
    const days = await kv.mget(dayIds.map((id: string) => `day:${id}`));
    // Sort by day_number
    return days.sort((a: EquipDay, b: EquipDay) => a.day_number - b.day_number);
  }
};

// ------------------------------------------------------------------
// BLOCK SERVICE
// ------------------------------------------------------------------

export const EquipBlockService = {
  async createBlock(data: Omit<EquipBlock, 'id' | 'created_at'>): Promise<EquipBlock> {
    const dayExists = await kv.get(`day:${data.equip_day_id}`);
    if (!dayExists) throw new Error(`Day ${data.equip_day_id} not found`);

    const id = generateId();
    const block: EquipBlock = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };

    await kv.set(`block:${id}`, block);
    
    // Update Index
    const blockIds = await kv.get(`idx_day_blocks:${data.equip_day_id}`) || [];
    blockIds.push(id);
    await kv.set(`idx_day_blocks:${data.equip_day_id}`, blockIds);

    return block;
  },

  async getBlock(id: string): Promise<EquipBlock | null> {
    return await kv.get(`block:${id}`);
  },

  async updateBlock(id: string, updates: Partial<Omit<EquipBlock, 'id' | 'equip_day_id' | 'created_at'>>): Promise<EquipBlock> {
    const existing = await kv.get(`block:${id}`);
    if (!existing) throw new Error(`Block ${id} not found`);

    const updated = { ...existing, ...updates };
    await kv.set(`block:${id}`, updated);
    return updated;
  },

  async deleteBlock(id: string): Promise<void> {
    const block = await kv.get(`block:${id}`);
    if (!block) return;

    // Remove from Parent Index
    const parentIndexKey = `idx_day_blocks:${block.equip_day_id}`;
    const blockIds = await kv.get(parentIndexKey) || [];
    const newBlockIds = blockIds.filter((b: string) => b !== id);
    await kv.set(parentIndexKey, newBlockIds);

    // Delete Block
    await kv.del(`block:${id}`);
  },

  async listBlocksForDay(dayId: string): Promise<EquipBlock[]> {
    const blockIds = await kv.get(`idx_day_blocks:${dayId}`);
    if (!blockIds || blockIds.length === 0) return [];
    
    const blocks = await kv.mget(blockIds.map((id: string) => `block:${id}`));
    // Sort by order_index
    return blocks.sort((a: EquipBlock, b: EquipBlock) => a.order_index - b.order_index);
  }
};

// ------------------------------------------------------------------
// DATASET SERVICE
// ------------------------------------------------------------------

export const DatasetService = {
  async createDataset(data: Omit<EquipBlockDataset, 'id' | 'created_at'>): Promise<EquipBlockDataset> {
    // Check key uniqueness
    const existingId = await kv.get(`dataset_key:${data.dataset_key}`);
    if (existingId) {
      throw new Error(`Dataset with key "${data.dataset_key}" already exists.`);
    }

    const id = generateId();
    const dataset: EquipBlockDataset = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    };

    await kv.set(`dataset:${id}`, dataset);
    await kv.set(`dataset_key:${data.dataset_key}`, id);

    return dataset;
  },

  async getDataset(id: string): Promise<EquipBlockDataset | null> {
    return await kv.get(`dataset:${id}`);
  },

  async getDatasetByKey(key: string): Promise<EquipBlockDataset | null> {
    const id = await kv.get(`dataset_key:${key}`);
    if (!id) return null;
    return await kv.get(`dataset:${id}`);
  },

  async listDatasets(): Promise<EquipBlockDataset[]> {
    const all = await kv.getByPrefix('dataset:');
    return all.filter((item: any) => item && item.dataset_key && item.dataset_type);
  }
};
