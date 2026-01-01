import { 
  WizardConfig, 
  WizardStepConfig, 
  WizardFieldConfig, 
  WizardOption,
  FieldType 
} from './types';

// ============================================================================
// ASSESSMENT MAPPING
// ============================================================================

export function mapAssessmentToWizard(assessment: any): WizardConfig {
  if (!assessment) {
     return { id: 'loading', title: 'Loading...', steps: [] };
  }

  console.log('🗺️ Mapping Assessment to Wizard:', {
    assessmentId: assessment.id,
    title: assessment.title,
    questionsCount: assessment.questions?.length || 0,
    questions: assessment.questions
  });

  const steps: WizardStepConfig[] = [];

  // 1. Intro Step
  steps.push({
    id: 'intro',
    type: 'intro',
    title: assessment.title,
    description: assessment.description,
    nextLabel: 'Start Assessment'
  });

  // 2. Group Questions by stepGroup (consecutive)
  const groupedSteps: { id: string, questions: any[] }[] = [];
  (assessment.questions || []).forEach((q: any) => {
      // If stepGroup is defined, use it. Otherwise use unique ID to prevent merging.
      const groupId = q.stepGroup || `single_${q.id}`;
      const lastGroup = groupedSteps[groupedSteps.length - 1];
      
      // Merge if same group ID and group ID is explicitly defined (not auto-generated)
      if (lastGroup && lastGroup.id === groupId && q.stepGroup) {
          lastGroup.questions.push(q);
      } else {
          groupedSteps.push({ id: groupId, questions: [q] });
      }
  });

  // 3. Create Wizard Steps
  groupedSteps.forEach(group => {
    const isMulti = group.questions.length > 1;
    const firstQ = group.questions[0];
    
    // For single question, title is the question text.
    // For multi-question, use stepGroup as title (if it looks like a title) or generic.
    // Ideally, we'd have a Step Title field, but stepGroup will suffice for now.
    const stepTitle = isMulti ? (firstQ.stepGroup || 'Section') : firstQ.text;
    
    const fields: WizardFieldConfig[] = group.questions.map(q => {
        // Map dependencies
        let dependsOn = undefined;
        if (q.dependsOn) {
          dependsOn = {
            fieldId: q.dependsOn.questionId,
            value: q.dependsOn.value,
            operator: 'equals'
          };
        }
    
        // Determine field type
        let fieldType: FieldType = 'text';
        let options: WizardOption[] | undefined = undefined;
        let uiHints: string[] = [];
    
        if (q.type === 'scale' || q.type === 'single-choice') {
          fieldType = 'single_select';
          uiHints = ['cards'];
          
          if (q.scaleMin !== undefined && q.scaleMax !== undefined) {
              options = [];
              for (let i = q.scaleMin; i <= q.scaleMax; i++) {
                  let label = `${i}`;
                  if (i === q.scaleMin && q.scaleLabels?.min) label = q.scaleLabels.min;
                  if (i === q.scaleMax && q.scaleLabels?.max) label = q.scaleLabels.max;
                  options.push({ id: `opt_${i}`, label, value: i });
              }
          } else if (q.options) {
              // ✅ FIXED: Handle both string[] and object[] formats
              options = q.options.map((opt: any, idx: number) => {
                  // If option is a string, create structured object
                  if (typeof opt === 'string') {
                      return { id: `opt_${idx}`, label: opt, value: opt };
                  }
                  // If option is already an object, map it properly
                  return {
                      id: opt.id || opt.value?.toString() || `opt_${idx}`,
                      label: opt.text || opt.label || opt,
                      value: opt.value !== undefined ? opt.value : opt
                  };
              });
          }
        } else if (q.type === 'multiple-choice') {
           fieldType = 'multi_select';
           uiHints = ['cards'];
           // ✅ FIXED: Handle both string[] and object[] formats
           options = q.options?.map((opt: any, idx: number) => {
               if (typeof opt === 'string') {
                   return { id: `opt_${idx}`, label: opt, value: opt };
               }
               return {
                   id: opt.id || opt.value?.toString() || `opt_${idx}`,
                   label: opt.text || opt.label || opt,
                   value: opt.value !== undefined ? opt.value : opt
               };
           });
        } else if (q.type === 'text') {
           fieldType = 'long_text';
        } else if (q.type === 'dropdown') {
            fieldType = 'single_select'; // Dropdown renders as select/radio
            options = q.options?.map((opt: string) => ({ id: opt, label: opt, value: opt }));
        } else if (q.type === 'mcq-icons') {
            fieldType = 'single_select';
            uiHints = ['cards'];
            options = q.options?.map((opt: string, idx: number) => ({ 
                id: opt, 
                label: opt, 
                value: opt,
                description: q.optionIcons?.[idx] // Hacky but works for now to pass icon info if needed
            }));
        } else if (q.type === 'true-false') {
            fieldType = 'single_select';
            uiHints = ['cards'];
            options = [
                { id: 'true', label: 'True', value: true },
                { id: 'false', label: 'False', value: false }
            ];
        }
    
        return {
          id: q.id,
          type: fieldType,
          label: isMulti ? q.text : undefined, // If multi, show question text as label. If single, title covers it.
          placeholder: q.placeholder,
          options,
          validation: { required: q.required },
          dependsOn: dependsOn as any,
          uiHints: uiHints as any,
          autoAdvance: q.autoAdvance // Pass configured auto-advance preference
        };
    });

    steps.push({
      id: group.id,
      type: 'input',
      title: stepTitle,
      fields
    });
  });

  return {
    id: assessment.id,
    title: assessment.title,
    mode: 'assessment',
    showProgress: true,
    progressType: 'bar',
    steps
  };
}

// ============================================================================
// EQUIP ONBOARDING MAPPING
// ============================================================================

export function mapOnboardingToWizard(questionSet: any): WizardConfig {
  if (!questionSet) return { id: 'loading', title: 'Loading...', steps: [] };

  const steps: WizardStepConfig[] = [];

  // Intro
  steps.push({
    id: 'intro',
    type: 'intro',
    title: 'Program Setup',
    description: "We'd like to know a little about you. This helps us personalize your experience.",
    nextLabel: 'Get Started'
  });

  // Questions
  (questionSet.questions || []).sort((a: any, b: any) => a.order - b.order).forEach((q: any) => {
     let type: FieldType = 'text';
     let options: WizardOption[] | undefined;
     
     if (q.input_type === 'single_select') {
         type = 'single_select';
         options = q.options?.map((o: any) => ({ id: o.id, label: o.label, value: o.value }));
     } else if (q.input_type === 'multi_select') {
         type = 'multi_select';
         options = q.options?.map((o: any) => ({ id: o.id, label: o.label, value: o.value }));
     } else if (q.input_type === 'textarea') {
         type = 'long_text';
     }

     // Map dependencies
     let condition: any = undefined;
     if (q.conditional_logic) {
         condition = {
             fieldId: q.conditional_logic.trigger_question_id,
             value: q.conditional_logic.value,
             operator: q.conditional_logic.condition
         };
     }

     steps.push({
         id: `step_${q.id}`,
         type: 'input',
         title: q.question_text,
         description: q.helper_text,
         condition,
         fields: [{
             id: q.id,
             type,
             validation: { required: q.required },
             options,
             uiHints: ['cards'] // Make it nice
         }]
     });
  });

  return {
    id: questionSet.id,
    title: questionSet.title,
    mode: 'equip_onboarding',
    showProgress: true,
    progressType: 'bar',
    steps
  };
}

// ============================================================================
// EQUIP DAILY FLOW MAPPING
// ============================================================================

export function mapEquipDayToWizard(dayContent: any): WizardConfig {
    if (!dayContent) return { id: 'loading', title: 'Loading...', steps: [] };

    const steps: WizardStepConfig[] = [];

    // Intro (Day Start)
    steps.push({
        id: 'intro',
        type: 'intro',
        title: dayContent.title,
        description: dayContent.description || `Welcome to Day ${dayContent.day}`,
        nextLabel: 'Start Session'
    });

    // 1. Group Activities
    const groupedActivities: { id: string, blocks: any[] }[] = [];
    (dayContent.activities || []).forEach((block: any) => {
        const groupId = block.stepGroup || `block_${block.id}`;
        const lastGroup = groupedActivities[groupedActivities.length - 1];
        
        if (lastGroup && lastGroup.id === groupId && block.stepGroup) {
            lastGroup.blocks.push(block);
        } else {
            groupedActivities.push({ id: groupId, blocks: [block] });
        }
    });

    // 2. Map Groups to Steps
    groupedActivities.forEach(group => {
        const isMulti = group.blocks.length > 1;
        // Use first block's ID as step ID, unless we have a specific group ID
        const stepId = group.blocks[0].id; 
        
        // Determine Step Title
        // If multi, use group ID or first block title.
        const stepTitle = isMulti ? (group.blocks[0].stepGroup || group.blocks[0].title) : group.blocks[0].title;
        
        let stepType: 'input' | 'info' | 'outro' = 'input';
        
        // If single block is lesson/reflection/conclude, maintain original step types for better styling defaults
        // But if grouped, everything becomes 'input' step with fields
        if (!isMulti) {
            const block = group.blocks[0];
            if (block.type === 'lesson') stepType = 'info';
            else if (block.type === 'reflection' || block.type === 'conclude') stepType = 'outro';
        }

        const fields: WizardFieldConfig[] = [];
        
        group.blocks.forEach((block: any) => {
             // Map Block to Field(s)
             if (block.type === 'lesson') {
                 fields.push({
                     id: block.id,
                     type: 'info',
                     label: block.title, // Info field label usually hidden or small header
                     description: block.content,
                     uiHints: ['markdown']
                 });
             } else if (block.type === 'exercise') {
                 const config = block.exerciseConfig || {};
                 
                 if (config.subtype === 'clinical_instrument') {
                     (config.questions || []).forEach((qText: string, idx: number) => {
                         fields.push({
                             id: `${block.id}_q${idx}`,
                             type: 'single_select',
                             label: qText,
                             validation: { required: true },
                             options: config.scale?.map((s: any) => ({ id: s.label, label: s.label, value: s.value })),
                             uiHints: ['inline']
                         });
                     });
                 } else if (config.subtype === 'mcq' || config.subtype === 'single-select') {
                     fields.push({
                         id: `${block.id}_answer`,
                         type: 'single_select',
                         label: block.content || block.title,
                         options: config.options?.map((opt: string) => ({ id: opt, label: opt, value: opt })),
                         uiHints: ['cards'],
                         autoAdvance: block.autoAdvance // Respect autoAdvance config
                     });
                 } else {
                      fields.push({
                         id: `${block.id}_answer`,
                         type: 'long_text',
                         label: block.content || block.title,
                         placeholder: "Type your answer here..."
                     });
                 }
             } else if (block.type === 'sleep_diary') {
                  fields.push(
                      { id: `${block.id}_bedTime`, type: 'time', label: 'Bed Time', validation: { required: true } },
                      { id: `${block.id}_wakeTime`, type: 'time', label: 'Wake Time', validation: { required: true } },
                      { id: `${block.id}_quality`, type: 'number', label: 'Quality (1-5)', validation: { min: 1, max: 5 } }
                  );
             } else if (block.type === 'checklist') {
                  const items = block.exerciseConfig?.listItems || block.exerciseConfig?.options || [];
                  fields.push({
                      id: `${block.id}_checked`,
                      type: 'multi_select',
                      label: block.title,
                      options: items.map((item: string) => ({ id: item, label: item, value: item })),
                      uiHints: ['cards']
                  });
             } else if (block.type === 'reflection' || block.type === 'conclude') {
                  // If mixed in a group, treat as info or long text? 
                  // Usually reflection is an input.
                  if (block.type === 'reflection') {
                      fields.push({
                          id: `${block.id}_reflection`,
                          type: 'long_text',
                          label: block.title,
                          description: block.content,
                          placeholder: "Reflect on this..."
                      });
                  } else {
                      // Conclude is usually just text
                       fields.push({
                          id: block.id,
                          type: 'info',
                          label: block.title,
                          description: block.content
                      });
                  }
             }
        });

        // Add the step
        steps.push({
            id: stepId,
            type: stepType,
            title: stepTitle,
            description: (stepType === 'outro' && !isMulti) ? group.blocks[0].content : undefined,
            fields
        });
    });

    return {
        id: `day_${dayContent.day}`,
        title: `Day ${dayContent.day}: ${dayContent.title}`,
        mode: 'equip_daily',
        showProgress: true,
        progressType: 'bar',
        steps
    };
}