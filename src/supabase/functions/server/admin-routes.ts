import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { EquipService } from './program-service.ts';

export function registerAdminRoutes(app: Hono, requireAuth: any) {

// ========================================
// ADMIN - ADD DEFAULT ONBOARDING TO PROGRAMS
// ========================================

app.post("/admin/equip/add-default-onboarding", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile?.is_admin) return c.json({ error: 'Admin access required' }, 403);

    // Get all programs
    const programs = await EquipService.listEquips();
    let updatedCount = 0;

    // Default onboarding questions
    const defaultOnboarding = {
      title: 'Program Setup',
      description: 'Please answer a few questions to personalize your experience.',
      is_required_before_start: true,
      version: '1.0.0',
      sections: [],
      questions: [
        {
          id: 'q-experience',
          text: 'How would you describe your current experience with this topic?',
          type: 'single-choice',
          required: true,
          options: [
            { id: 'opt-1', text: 'New to this', value: 'beginner' },
            { id: 'opt-2', text: 'Some experience', value: 'intermediate' },
            { id: 'opt-3', text: 'Experienced', value: 'advanced' }
          ]
        },
        {
          id: 'q-goals',
          text: 'What do you hope to achieve with this program?',
          type: 'long_text',
          required: false
        },
        {
          id: 'q-commitment',
          text: 'How committed are you to completing this program?',
          type: 'scale',
          required: true,
          scaleMin: 1,
          scaleMax: 10,
          scaleLabels: { min: 'Not very committed', max: 'Very committed' }
        }
      ]
    };

    for (const program of programs) {
      // Only add if onboarding doesn't exist
      if (!program.onboarding || !program.onboarding.questions || program.onboarding.questions.length === 0) {
        await EquipService.updateEquip(program.id, { onboarding: defaultOnboarding });
        updatedCount++;
      }
    }

    return c.json({ 
      success: true, 
      message: `Added default onboarding to ${updatedCount} programs`,
      updatedCount 
    });
  } catch (error) {
    console.error('Add default onboarding error:', error);
    return c.json({ error: 'Failed to add default onboarding' }, 500);
  }
});

// ... existing code ...
}