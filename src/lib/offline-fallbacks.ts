// Offline fallback data for when the backend is not available

// Import sample data from TypeScript files
import { professionalsData } from './sample-data/professionals';
import { usersData } from './sample-data/users';

export const offlineDemoUser = usersData.users[0]; // Use the first user as demo user

// Transform professionals to match expected format
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

// Offline resources fallback (empty for now - will be populated from API cache)
export const offlineResources = [];

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
        const resource = offlineResources.find(r => r.resource_id === id);
        return resource ? { resource } : { resource: null };
      }
      return { resources: offlineResources };
    case 'programs':
      // Return empty array for equip programs when offline
      // Tests can create programs dynamically
      return { programs: [] };
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
    default:
      console.warn(`Unknown offline data type: ${type}`);
      // Return empty array structure to prevent .filter errors
      return { [type]: [] };
  }
};