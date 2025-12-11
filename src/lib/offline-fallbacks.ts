// Offline fallback data for when the backend is not available

// Import sample data from TypeScript files
import { assessmentsData } from './sample-data/assessments';
import { equipProgramsData } from './sample-data/equip-programs';
import { journalEntriesData } from './sample-data/journal-entries';
import { resourcesData } from './sample-data/resources';
import { professionalsData } from './sample-data/professionals';
import { usersData } from './sample-data/users';

export const offlineDemoUser = usersData.users[0]; // Use the first user as demo user

// Transform assessments to match expected format
export const offlineAssessments = assessmentsData.assessments.map(assessment => ({
  assessment_id: assessment.id,
  title: assessment.title,
  description: assessment.description,
  version: "1.0",
  questions: assessment.questions.map(q => ({
    question_id: q.id,
    text: q.prompt,
    type: q.type,
    options: q.options
  }))
}));

// Transform equip programs to match expected format
export const offlineEquipPrograms = equipProgramsData.equip_programs.map(program => ({
  equip_id: program.id,
  title: program.title,
  description: program.summary,
  price: program.price / 100, // Convert from cents to dollars for display
  currency: program.currency,
  duration_days: program.duration_days,
  expires_in_days_after_payment: program.expires_in_days_after_payment,
  modules: program.modules,
  tags: program.tags
}));

// Use resources directly (already in correct format)
export const offlineResources = resourcesData.resources.map(resource => ({
  resource_id: resource.resource_id,
  title: resource.title,
  description: resource.description,
  category: resource.category,
  content_type: resource.content_type,
  read_time_minutes: resource.read_time_minutes,
  created_at: resource.created_at
}));

// Use professionals directly (already in correct format)
export const offlineProfessionals = professionalsData.professionals.map(professional => ({
  professional_id: professional.professional_id,
  name: professional.name,
  title: professional.title,
  specialties: professional.specialties,
  location: professional.location,
  phone: professional.phone,
  email: professional.email,
  available: professional.available
}));

// Use journal entries directly
export const offlineJournalEntries = journalEntriesData.journal_entries;

// Sample progress data for offline mode
export const offlineEquipProgress = {
  '00000000-0000-0000-0000-000000000010': { // burnout-recovery
    user_id: offlineDemoUser.user_id,
    equip_id: '00000000-0000-0000-0000-000000000010',
    purchase_id: 'offline-purchase-burnout',
    current_day: 12,
    completed_days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    total_days: 42,
    progress_percentage: 26.2,
    started_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString()
  },
  '00000000-0000-0000-0000-000000000011': { // mindfulness-8week
    user_id: offlineDemoUser.user_id,
    equip_id: '00000000-0000-0000-0000-000000000011',
    purchase_id: 'offline-purchase-mindfulness',
    current_day: 8,
    completed_days: [1, 2, 3, 4, 5, 6, 7],
    total_days: 56,
    progress_percentage: 12.5,
    started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  '00000000-0000-0000-0000-000000000012': { // anxiety-management
    user_id: offlineDemoUser.user_id,
    equip_id: '00000000-0000-0000-0000-000000000012',
    purchase_id: 'offline-purchase-anxiety',
    current_day: 5,
    completed_days: [1, 2, 3, 4],
    total_days: 28,
    progress_percentage: 14.3,
    started_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
};

// Helper function to check if we're in offline mode
export const isOfflineMode = () => {
  try {
    return typeof window !== 'undefined' && localStorage.getItem('ikan-offline-mode') === 'true';
  } catch {
    return false;
  }
};

// Helper function to set offline mode
export const setOfflineMode = (offline: boolean) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ikan-offline-mode', offline.toString());
    }
  } catch {
    // Ignore localStorage errors
  }
};

// Helper function to get offline data
export const getOfflineData = (type: string, id?: string) => {
  switch (type) {
    case 'assessments':
      if (id) {
        const assessment = offlineAssessments.find(a => a.assessment_id === id);
        return assessment ? { assessment } : { assessment: null };
      }
      return { assessments: offlineAssessments };
    case 'programs':
      if (id) {
        const program = offlineEquipPrograms.find(p => p.equip_id === id);
        return program ? { program } : { program: null };
      }
      return { programs: offlineEquipPrograms };
    case 'resources':
      if (id) {
        const resource = offlineResources.find(r => r.resource_id === id);
        return resource ? { resource } : { resource: null };
      }
      return { resources: offlineResources };
    case 'professionals':
      if (id) {
        const professional = offlineProfessionals.find(p => p.professional_id === id);
        return professional ? { professional } : { professional: null };
      }
      return { professionals: offlineProfessionals };
    case 'progress':
      return id && offlineEquipProgress[id] ? { progress: offlineEquipProgress[id] } : { progress: null };
    case 'journal':
    case 'journalEntries':
      if (id) {
        // id would be a date in YYYY-MM-DD format
        const entry = offlineJournalEntries.find(j => j.entry_date === id);
        return entry ? { entry } : { entry: null };
      }
      return { entries: offlineJournalEntries };
    case 'journalEntry':
      if (id) {
        // id would be a date in YYYY-MM-DD format
        const entry = offlineJournalEntries.find(j => j.entry_date === id);
        return entry ? { entry } : { entry: null };
      }
      return { entry: null };
    case 'profile':
      return { 
        profile: {
          user_id: offlineDemoUser.user_id,
          email: offlineDemoUser.email,
          name: offlineDemoUser.name,
          phone: offlineDemoUser.phone,
          avatar_url: offlineDemoUser.avatar_url,
          corporate_user: offlineDemoUser.corporate_user || false,
          created_at: offlineDemoUser.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(),
          preferences: {
            notifications: true,
            reminder_time: '09:00',
            theme: 'light'
          }
        }
      };
    default:
      console.warn(`Unknown offline data type: ${type}`);
      return {};
  }
};