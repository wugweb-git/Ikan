import { apiClient } from '../../lib/api-client';
import { 
  stressAssessmentData, 
  sleepAssessmentData, 
  burnoutAssessmentData,
  balanceAssessmentData,
  generalAssessmentData,
  anxietyAssessmentData,
  depressionAssessmentData
} from './assessments/data';

export const cmsUtils = {
  // --- ASSESSMENTS ---
  verifyAssessments: async () => {
    const logs: string[] = [];
    const results: any[] = [];
    
    try {
      logs.push('Verifying assessments against source data...');
      const programs = await apiClient.getEquipPrograms();
      const sources = [
        stressAssessmentData,
        sleepAssessmentData,
        burnoutAssessmentData,
        balanceAssessmentData,
        generalAssessmentData,
        anxietyAssessmentData,
        depressionAssessmentData
      ];

      for (const source of sources) {
        // Find match by Title
        const matchSummary = programs.find((p: any) => p.title === source.title);
        
        if (!matchSummary) {
          results.push({ name: source.title, status: 'Missing', details: 'Not found in database' });
          continue;
        }

        // Fetch full details to check content
        let match;
        try {
           match = await apiClient.getEquipProgram(matchSummary.slug || matchSummary.id);
        } catch (e: any) {
           results.push({ name: source.title, status: 'Error', details: `Fetch error: ${e.message}` });
           continue;
        }

        if (!match) {
           results.push({ name: source.title, status: 'Error', details: 'Program details not returned' });
           continue;
        }

        const issues = [];
        
        // 1. Check Days Count
        if ((match.daily_content?.length || 0) !== source.days.length) {
          issues.push(`Day count mismatch: Expected ${source.days.length}, got ${match.daily_content?.length}`);
        } else {
           // 2. Check Blocks per Day
           source.days.forEach((day: any, i: number) => {
             const matchDay = match.daily_content[i];
             if (!matchDay) return;

             if (day.blocks.length !== matchDay.activities.length) {
               issues.push(`Day ${i+1} block count mismatch: Expected ${day.blocks.length}, got ${matchDay.activities.length}`);
             } else {
               // 3. Deep Check Blocks
               day.blocks.forEach((block: any, bI: number) => {
                  const matchBlock = matchDay.activities[bI];
                  if (block.title !== matchBlock.title) {
                    issues.push(`Day ${i+1} Block ${bI+1} title mismatch: "${matchBlock.title}" vs "${block.title}"`);
                  }
                  if (block.block_type !== matchBlock.type && block.block_type !== matchBlock.block_type) {
                      // Relaxed check for block_type vs type
                     issues.push(`Day ${i+1} Block ${bI+1} type mismatch: ${matchBlock.type} vs ${block.block_type}`);
                  }
               });
             }
           });
        }

        if (issues.length > 0) {
          results.push({ name: source.title, status: 'Mismatch', details: issues.join('; ') });
        } else {
          results.push({ name: source.title, status: 'Perfect', details: 'All details match source.' });
        }
      }
      logs.push('Verification complete.');
    } catch (e: any) {
      console.error(e);
      logs.push(`Verification error: ${e.message}`);
    }

    return { logs, results };
  },

  enrichAssessments: async () => {
    const logs: string[] = [];
    let modifiedCount = 0;

    try {
        logs.push('--- Processing Assessments Logic ---');
        const programs = await apiClient.getEquipPrograms();

        for (const prog of programs) {
            // Filter for assessments only
            if (!prog.tags?.includes('assessment') && !prog.category?.toLowerCase().includes('assessment')) continue;

            const fullProg = await apiClient.getEquipProgram(prog.id);
            const days = fullProg.daily_content || [];
            let programModified = false;
            
            let questionCounter = 0;
            const QUESTIONS_PER_STEP = 4;

            for (const day of days) {
                if (!day.activities) continue;
                
                for (const act of day.activities) {
                    if (act.type === 'exercise' || act.type === 'quiz' || act.block_type === 'exercise') {
                        let config = act.exerciseConfig || act.exercise_config;
                        if (!config) {
                             config = {};
                             if (act.exerciseConfig) act.exerciseConfig = config;
                             else act.exercise_config = config;
                        }

                        // 1. Assign Step Group ID
                        const stepNum = Math.floor(questionCounter / QUESTIONS_PER_STEP) + 1;
                        if (!config.stepGroupId) {
                            config.stepGroupId = `step-${stepNum}`;
                            programModified = true;
                        }
                        if (config.autoAdvance === undefined) {
                            config.autoAdvance = true;
                            programModified = true;
                        }
                        
                        // 2. Handle Options (if missing)
                        if (!act.options || act.options.length === 0) {
                            const text = (act.content || act.title || "").toLowerCase();
                            if (text.includes("sleep") || text.includes("quality")) {
                                act.options = ["Very Poor", "Poor", "Fair", "Good", "Very Good"];
                            } else if (text.includes("often") || text.includes("frequency")) {
                                act.options = ["Never", "Rarely", "Sometimes", "Often", "Always"];
                            } else if (text.includes("agree")) {
                                act.options = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
                            } else {
                                act.options = ["Never", "Rarely", "Sometimes", "Often", "Always"];
                            }
                            programModified = true;
                        }

                        // 3. Handle Scoring (if disabled/missing)
                        if (!config.enableScoring) {
                            config.enableScoring = true;
                            config.optionWeights = act.options.map((_: any, i: number) => i);
                            config.maxScore = act.options.length - 1;
                            programModified = true;
                        }

                        questionCounter++;
                    }
                }
            }
            
            if (programModified) {
                await apiClient.updateEquipProgram(prog.id, { ...fullProg, daily_content: days });
                modifiedCount++;
            }
        }
        logs.push(`Assessments: Updated ${modifiedCount} programs.`);
    } catch (e: any) {
        console.error(e);
        logs.push(`Logic Error: ${e.message}`);
    }
    return { logs, modifiedCount };
  },

  // --- RESOURCES ---
  enrichResources: async () => {
    const logs: string[] = [];
    let resourceCount = 0;
    
    try {
        logs.push('--- Processing Resources ---');
        const resources = await apiClient.getResources();
        for (const res of resources) {
            let modified = false;
            const updates: any = {};

            // Read Time (computed from content — not hardcoded)
            if (!res.read_time) {
                const wordCount = (res.content || "").split(/\s+/).length;
                updates.read_time = Math.ceil(wordCount / 200) || 1;
                modified = true;
            }
            
            // Category — only flag, don't inject
            if (!res.category) {
                logs.push(`Resource "${res.title || res.id}": Missing category — please set manually.`);
            }

            if (modified) {
                await apiClient.updateResource(res.id, { ...res, ...updates });
                resourceCount++;
            }
        }
        logs.push(`Resources: Updated ${resourceCount} items.`);
    } catch (e: any) {
        logs.push(`Resource Error: ${e.message}`);
    }
    return { logs, resourceCount };
  },

  // --- CONSULTANTS ---
  enrichConsultants: async () => {
    const logs: string[] = [];
    let consultantCount = 0;
    
    try {
         logs.push('--- Processing Consultants ---');
         const profData = await apiClient.getProfessionals();
         const consultants = profData.professionals || [];
         
         let issueCount = 0;
         for (const prof of consultants) {
              const missing: string[] = [];
              if (!prof.rating) missing.push('rating');
              if (!prof.pricing) missing.push('pricing');
              if (!prof.sessionModes || prof.sessionModes.length === 0) missing.push('sessionModes');
              if (prof.yearsExperience === undefined || prof.yearsExperience === null) missing.push('yearsExperience');
              
              if (missing.length > 0) {
                  issueCount++;
                  logs.push(`Consultant "${prof.name || prof.id}": Missing ${missing.join(', ')} — edit their profile to set these values.`);
              }
         }
         
         if (issueCount === 0) {
             logs.push('All consultant profiles are complete.');
         } else {
             logs.push(`Found ${issueCount} consultant(s) with incomplete profiles. Edit them in the Consultation Manager.`);
         }
    } catch (e: any) {
        logs.push(`Consultant Error: ${e.message}`);
    }
    return { logs, consultantCount };
  }
};