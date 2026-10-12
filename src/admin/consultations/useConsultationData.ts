import { useCallback, useState } from 'react';
import { apiClient, apiErrorBody } from '../../shared/api/api';
import { useNotifications } from '../../shared/state/NotificationContext';
import { useAdminResource } from '../ui/hooks/useAdminResource';
import type { Consultant } from './consultant-form';

export interface ApplicationSummary {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  credentials: string;
  category?: string;
  location?: string;
  yearsExperience?: number;
  expertises?: string[];
  languages?: string[];
  status: 'pending_review' | 'approved' | 'rejected';
  submitted_at: string;
  rejection_reason?: string;
}

export interface ApplicationDetail {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  credentials: string;
  category: string;
  bio: string;
  location: string;
  yearsExperience: number;
  photo?: string;
  languages: string[];
  expertises: string[];
  therapeuticApproaches: string[];
  qualifications: string[];
  demographicSpecialties: string[];
  therapeuticPhilosophy?: string;
  sessionModes: string[];
  clientFAQs?: { question: string; answer: string }[];
  testimonials?: { text: string; clientName: string }[];
  videoIntroUrl?: string;
  certificates?: string[];
  willingToShareArticles?: boolean;
  availabilityPreferences?: {
    workingHours: string;
    daysAvailable: string[];
    weekendAvailability: boolean;
  };
  submitted_at: string;
  status: string;
  rejection_reason?: string;
  /** Admin-only, from the application tracker (never on the published record). */
  verification?: PartnerVerification;
  /** The partner application's answers beyond the directory's own fields. */
  details?: PartnerDetails;
  pricing?: { individual?: number | null; couple?: number | null; family?: number | null; video?: number; call?: number; chat?: number };
  [key: string]: unknown;
}

export interface UploadedFileRef { path: string; url: string; name: string; kind?: string }

export interface PartnerVerification {
  highestQualification?: string;
  degrees?: { degree: string; institution: string; year: string }[];
  registration?: string;
  registrationNumber?: string;
  certifications?: { certification: string; issuer: string; year: string }[];
  documents?: UploadedFileRef[];
  hasMastersDegree?: boolean | null;
  supervisedHours?: number | null;
  underSupervision?: boolean | null;
}

export interface PartnerDetails {
  professionalTitle?: string;
  pincode?: string;
  practiceSettings?: string[];
  clientsTreated?: string;
  sessionDurationMinutes?: number | null;
  weekendConsultations?: boolean | null;
  emergencyConsultations?: boolean | null;
  expertiseMatrix?: { area: string; level: string }[];
  conditionsNotTreated?: string[];
  outsideScope?: string;
  ageGroups?: string[];
  clientTypes?: string[];
  therapyFormats?: string[];
  caseComplexity?: string;
  communicationStyle?: Record<string, number>;
  homeworkFrequency?: string;
  homeworkTypes?: string[];
  culturalExperience?: string[];
  availability?: Record<string, string[]>;
  slidingScale?: boolean | null;
  contributions?: { type: string; title: string; year: string; link: string }[];
  workspacePhotos?: UploadedFileRef[];
  mapsLink?: string;
  profileAnswers?: Record<string, string>;
}

type RawProfessional = Record<string, unknown> & Partial<Consultant> & {
  professional_id?: string;
  specialties?: string[];
  title?: string;
};

function toConsultant(item: RawProfessional): Consultant {
  return {
    ...item,
    id: item.professional_id || item.id,
    expertises: item.specialties || item.expertises || [],
    category: item.category || '',
    available: item.available !== undefined ? item.available : false,
    rating: item.rating,
    credentials: item.title || item.credentials || '',
  } as Consultant;
}

/**
 * Professionals + applications for the Consultation Manager: loads, the
 * application detail fetch, and approve / reject.
 */
export function useConsultationData({ listVisible, applicationsTab }: { listVisible: boolean; applicationsTab: boolean }) {
  const { showToast } = useNotifications();

  // Reloads every time the list comes back into view (after an edit/create).
  const professionalsRes = useAdminResource(
    async () => {
      const result = await apiClient.getProfessionals();
      const data: RawProfessional[] = Array.isArray(result) ? result : result.professionals || [];
      return data.map(toConsultant);
    },
    {
      initialData: [] as Consultant[],
      deps: [listVisible],
      enabled: listVisible,
      errorTitle: 'API Error',
      errorMessage: 'Failed to load professionals',
    },
  );

  // Reloads every time the Applications tab is opened.
  const applicationsRes = useAdminResource(
    async () => {
      const data = await apiClient.getProfessionalApplications();
      return (data.applications || []) as ApplicationSummary[];
    },
    {
      initialData: [] as ApplicationSummary[],
      deps: [applicationsTab],
      enabled: applicationsTab,
      errorTitle: 'API Error',
      errorMessage: 'Failed to load applications',
    },
  );

  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetail | null>(null);
  const [showAppPreview, setShowAppPreview] = useState(false);
  const [processingApp, setProcessingApp] = useState<string | null>(null);

  const { reload: reloadProfessionals } = professionalsRes;
  const { reload: reloadApplications } = applicationsRes;

  const openApplication = useCallback(async (appId: string) => {
    try {
      const data = await apiClient.getProfessionalApplication(appId);
      if (data.application) {
        setSelectedApplication(data.application);
        setShowAppPreview(true);
      } else {
        showToast('error', 'Not Found', 'Application data not found');
      }
    } catch (error) {
      console.error('Failed to load application detail:', error);
      // A JSON error body means the server answered without an application.
      if (apiErrorBody(error)) showToast('error', 'Not Found', 'Application data not found');
      else showToast('error', 'Error', 'Failed to load application details');
    }
  }, [showToast]);

  const approveApplication = useCallback(async (appId: string) => {
    setProcessingApp(appId);
    try {
      const data = await apiClient.approveProfessionalApplication(appId);
      if (data.success) {
        showToast('success', 'Approved', 'Application approved and professional profile is now live.');
        void reloadApplications();
        void reloadProfessionals();
        setShowAppPreview(false);
      } else {
        showToast('error', 'Error', data.error || 'Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      const body = apiErrorBody(error);
      showToast('error', 'Error', body ? body.error || 'Failed to approve' : 'Failed to approve application');
    } finally {
      setProcessingApp(null);
    }
  }, [showToast, reloadApplications, reloadProfessionals]);

  /** Resolves true when the application was rejected. */
  const rejectApplication = useCallback(async (appId: string, reason: string): Promise<boolean> => {
    setProcessingApp(appId);
    try {
      const data = await apiClient.rejectProfessionalApplication(appId, reason);
      if (data.success) {
        showToast('success', 'Rejected', 'Application has been rejected.');
        void reloadApplications();
        setShowAppPreview(false);
        return true;
      }
      showToast('error', 'Error', data.error || 'Failed to reject');
      return false;
    } catch (error) {
      console.error('Reject error:', error);
      const body = apiErrorBody(error);
      showToast('error', 'Error', body ? body.error || 'Failed to reject' : 'Failed to reject application');
      return false;
    } finally {
      setProcessingApp(null);
    }
  }, [showToast, reloadApplications]);

  return {
    professionals: professionalsRes.data,
    loadingProfessionals: professionalsRes.loading,
    applications: applicationsRes.data,
    loadingApplications: applicationsRes.loading,
    reloadApplications,
    selectedApplication,
    showAppPreview,
    setShowAppPreview,
    processingApp,
    openApplication,
    approveApplication,
    rejectApplication,
  };
}
