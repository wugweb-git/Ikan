// Offline fallback data for when the backend is not available

const offlineDemoUser = {
  user_id: 'offline-demo-user',
  email: 'offline@ikan.health',
  name: 'Offline User',
  phone: '+1234567890',
  avatar_url: '',
  corporate_user: false,
  created_at: new Date().toISOString()
};

const offlineProfessionals = [
  {
    professional_id: 'prof-1',
    name: 'Dr. Sarah Smith',
    title: 'Clinical Psychologist',
    specialties: ['Anxiety', 'Depression'],
    location: 'New York, NY',
    phone: '555-0123',
    email: 'sarah.smith@example.com',
    available: true
  },
  {
    professional_id: 'prof-2',
    name: 'Dr. Michael Chen',
    title: 'Psychiatrist',
    specialties: ['ADHD', 'Mood Disorders'],
    location: 'San Francisco, CA',
    phone: '555-0124',
    email: 'michael.chen@example.com',
    available: true
  }
];

export { offlineDemoUser, offlineProfessionals };

// Offline resources fallback (empty for clean slate)
export const offlineResources: any[] = [];

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
    case 'professionals':
      if (id) {
        const professional = offlineProfessionals.find(p => p.professional_id === id);
        return professional ? { professional } : { professional: null };
      }
      return { professionals: offlineProfessionals };
    case 'resources':
      if (id) {
        return { resource: null };
      }
      return { resources: [] };
    case 'programs':
      if (id) {
        return { program: null };
      }
      return { programs: [] };
    case 'enrollments':
      // Return empty array for equip enrollments when offline
      return { enrollments: [] };
    case 'assessments':
      // Return empty array for assessments when offline
      return { assessments: [] };
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
    case 'journalEntries':
      return { entries: [] };
    case 'journalEntry':
      return { entry: null };
    case 'categories':
      return {
        categories: [
          { id: '1', name: 'Article', slug: 'article', icon: 'book', color: '#3B82F6', type: 'resource' },
          { id: '2', name: 'Audio', slug: 'audio', icon: 'headphones', color: '#10B981', type: 'resource' },
          { id: '3', name: 'Video', slug: 'video', icon: 'video', color: '#EF4444', type: 'resource' },
          { id: '4', name: 'Podcast', slug: 'podcast', icon: 'mic', color: '#8B5CF6', type: 'resource' },
          { id: '5', name: 'Workbook', slug: 'workbook', icon: 'file-text', color: '#F59E0B', type: 'resource' },
          { id: '6', name: 'Guide', slug: 'guide', icon: 'map', color: '#6B7280', type: 'resource' }
        ]
      };
    case 'health':
      return { health: [] };
    case 'goals':
      return { goals: [] };
    case 'history':
      return { history: [] };
    default:
      console.warn(`Unknown offline data type: ${type}`);
      // Return empty array structure to prevent .filter errors
      return { [type]: [] };
  }
};
