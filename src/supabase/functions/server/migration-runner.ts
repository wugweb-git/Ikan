import { 
  SEED_CONTENT_ITEMS, 
  SEED_EQUIPS, 
  SEED_DATASETS, 
  DAY_TEMPLATES,
  SEED_RECOMMENDATION_RULES
} from "./migration-seeds.ts";
import { ContentService } from "./content-service.ts";
import { EquipService, EquipDayService, EquipBlockService, DatasetService } from "./program-service.ts";
import { RecommendationRuleService } from "./recommendation-service.ts";
import { SeverityLevel } from "./shared-types.ts";

export const MigrationRunner = {
  async run() {
    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(`[MIGRATION] ${msg}`);
      logs.push(msg);
    };

    log("Starting Phase 4/5 Migration...");

    try {
      // 1. MIGRATE CONTENT ITEMS
      log("--- Migrating Content Items ---");
      for (const item of SEED_CONTENT_ITEMS) {
        const existing = await ContentService.getContentBySlug(item.slug);
        if (!existing) {
          await ContentService.createContent(item);
          log(`Created Content: ${item.title}`);
        } else {
          log(`Skipped Content (Exists): ${item.title}`);
        }
      }

      // 2. MIGRATE DATASETS
      log("--- Migrating Datasets ---");
      const datasetMap = new Map<string, string>(); // key -> id
      for (const ds of SEED_DATASETS) {
        let dataset = await DatasetService.getDatasetByKey(ds.dataset_key);
        if (!dataset) {
          dataset = await DatasetService.createDataset(ds);
          log(`Created Dataset: ${ds.dataset_key}`);
        } else {
          log(`Skipped Dataset (Exists): ${ds.dataset_key}`);
        }
        datasetMap.set(ds.dataset_key, dataset.id);
      }

      // 3. MIGRATE EQUIPS & STRUCTURE
      log("--- Migrating Equips & Structure ---");
      for (const seedEquip of SEED_EQUIPS) {
        let equip = await EquipService.getEquipBySlug(seedEquip.slug);
        
        // Resolve Intro Content ID
        const introContent = await ContentService.getContentBySlug(seedEquip.intro_content_slug);
        const introContentId = introContent ? introContent.id : undefined;

        if (!equip) {
          equip = await EquipService.createEquip({
            slug: seedEquip.slug,
            name: seedEquip.name,
            category: seedEquip.category,
            duration_days: seedEquip.duration_days,
            price_cents: seedEquip.price_cents,
            status: seedEquip.status as any,
            intro_content_id: introContentId
          });
          log(`Created Equip: ${equip.name}`);
        } else {
          log(`Found Equip: ${equip.name}`);
        }

        // Check if days exist (simple check: if days list is empty)
        const existingDays = await EquipDayService.listDaysForEquip(equip.id);
        if (existingDays.length > 0) {
          log(`Skipping structure generation for ${equip.name} (Days already exist)`);
        } else {
          log(`Generating Days for ${equip.name} (${seedEquip.duration_days} days)...`);

          // GENERATE DAYS
          // Day 1
          await createDayFromTemplate(equip.id, 1, DAY_TEMPLATES.welcome, datasetMap);

          // Days 2-9
          for (let i = 2; i <= 9; i++) {
            const template = i % 3 === 0 ? DAY_TEMPLATES.deep_dive : DAY_TEMPLATES.standard;
            await createDayFromTemplate(equip.id, i, template, datasetMap);
          }

          // Days 10-17 (Repeating)
          const repeatingDay = await EquipDayService.createDay({
            equip_id: equip.id,
            day_number: 10,
            title: "Practice Week",
            estimated_time_minutes: 15,
            is_repeatable: true,
            repeat_start_day: 10,
            repeat_end_day: 17
          });
          await addBlocksToDay(repeatingDay.id, DAY_TEMPLATES.standard.blocks, datasetMap);
          log(`Created Repeating Day 10-17`);

          // Days 18 to (Duration - 1)
          for (let i = 18; i < seedEquip.duration_days; i++) {
             await createDayFromTemplate(equip.id, i, DAY_TEMPLATES.standard, datasetMap);
          }

          // Last Day
          await createDayFromTemplate(equip.id, seedEquip.duration_days, DAY_TEMPLATES.review, datasetMap);
        }
      }

      // 4. MIGRATE RECOMMENDATION RULES
      log("--- Migrating Recommendation Rules ---");
      const existingRules = await RecommendationRuleService.listRules();
      
      for (const seedRule of SEED_RECOMMENDATION_RULES) {
          // Resolve Equip Slug to ID
          const equip = await EquipService.getEquipBySlug(seedRule.equip_slug);
          if (!equip) {
              log(`Skipping Rule: Equip slug '${seedRule.equip_slug}' not found`);
              continue;
          }

          // Check if equivalent rule exists
          const exists = existingRules.some(r => 
              r.assessment_category === seedRule.assessment_category &&
              r.min_severity === seedRule.min_severity &&
              r.equip_id === equip.id
          );

          if (!exists) {
              await RecommendationRuleService.createRule({
                  assessment_category: seedRule.assessment_category,
                  min_severity: seedRule.min_severity as SeverityLevel,
                  equip_id: equip.id,
                  priority: seedRule.priority,
                  rationale: seedRule.rationale
              });
              log(`Created Rule: ${seedRule.assessment_category} >= ${seedRule.min_severity} -> ${equip.name}`);
          } else {
              log(`Skipped Rule (Exists): ${seedRule.assessment_category} >= ${seedRule.min_severity}`);
          }
      }

      log("Migration Complete!");
      return { success: true, logs };

    } catch (error: any) {
      console.error("Migration Failed:", error);
      log(`ERROR: ${error.message}`);
      return { success: false, logs, error: error.message };
    }
  }
};

// Helper: Create Day + Blocks
async function createDayFromTemplate(
  equipId: string, 
  dayNum: number, 
  template: any, 
  datasetMap: Map<string, string>
) {
  const day = await EquipDayService.createDay({
    equip_id: equipId,
    day_number: dayNum,
    title: template.title,
    estimated_time_minutes: template.minutes,
    is_repeatable: false
  });

  await addBlocksToDay(day.id, template.blocks, datasetMap);
}

// Helper: Add Blocks
async function addBlocksToDay(
  dayId: string, 
  blocks: any[], 
  datasetMap: Map<string, string>
) {
  let order = 1;
  for (const b of blocks) {
    let contentId = undefined;
    
    // We must create a content item for every lesson text.
    if (b.content) {
      const slug = `block-content-${dayId}-${order}-${Date.now()}`; 
      const content = await ContentService.createContent({
        slug,
        title: 'Block Content',
        summary: '',
        body: b.content,
        content_type: 'article',
        category: 'general',
        status: 'published'
      });
      contentId = content.id;
    }

    let datasetId = undefined;
    if (b.dataset_key) {
      datasetId = datasetMap.get(b.dataset_key);
    }

    await EquipBlockService.createBlock({
      equip_day_id: dayId,
      block_type: b.type,
      order_index: order++,
      content_ref_id: contentId,
      dataset_id: datasetId,
      is_required: true
    });
  }
}
