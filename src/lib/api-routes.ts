// api-routes.ts - TypeScript API route handlers for iKan mental health PWA
import { apiClient } from './api-client';
import { calcAssessmentScore, interpretAssessmentScore } from './utils';

// Type definitions for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AssessmentListResponse {
  assessments: Assessment[];
}

export interface AssessmentResponse {
  assessment: Assessment;
}

export interface AssessmentSubmissionResponse {
  response: AssessmentResponseData;
  score: number;
  interpretation: {
    level: string;
    description: string;
    category: 'minimal' | 'mild' | 'moderate' | 'severe' | 'unknown';
  };
}

export interface Assessment {
  id: string;
  slug: string;
  title: string;
  description: string;
  metadata: {
    estimated_minutes: number;
    category: string;
    scoring?: {
      type: 'sum' | 'average' | 'weighted' | 'custom';
      range: [number, number];
      interpretation: Record<string, string>;
    };
  };
  questions: AssessmentQuestion[];
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  order: number;
  type: 'scale' | 'multiple_choice' | 'text' | 'boolean';
  prompt: string;
  options: Array<{
    label: string;
    value: number | string;
  }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export interface AssessmentResponseData {
  id: string;
  user_id: string;
  assessment_id: string;
  answers: Record<string, any>;
  score: number;
  result_metadata: any;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
  completed_at?: string;
}

// API Route Handlers
export class ApiRouteHandlers {
  // GET /assessments - list all available assessments
  static async getAssessments(): Promise<ApiResponse<AssessmentListResponse>> {
    try {
      const response = await apiClient.getAssessments();
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assessments'
      };
    }
  }

  // GET /assessments/:slug - get full assessment details
  static async getAssessmentBySlug(slug: string): Promise<ApiResponse<AssessmentResponse>> {
    try {
      const response = await apiClient.getAssessment(slug);
      
      if (!response.assessment) {
        return {
          success: false,
          error: 'Assessment not found'
        };
      }

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`Failed to fetch assessment ${slug}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assessment not found'
      };
    }
  }

  // GET /assessments/:id - get assessment by ID
  static async getAssessmentById(assessmentId: string): Promise<ApiResponse<AssessmentResponse>> {
    try {
      const response = await apiClient.getAssessment(assessmentId);
      
      if (!response.assessment) {
        return {
          success: false,
          error: 'Assessment not found'
        };
      }

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`Failed to fetch assessment ${assessmentId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Assessment not found'
      };
    }
  }

  // POST /assessments/:id/responses - submit assessment response
  static async submitAssessmentResponse(
    assessmentId: string,
    answers: Record<string, any>,
    userId?: string
  ): Promise<ApiResponse<AssessmentSubmissionResponse>> {
    try {
      // Get assessment details for scoring
      const assessmentResponse = await apiClient.getAssessment(assessmentId);
      const assessment = assessmentResponse.assessment;

      if (!assessment) {
        return {
          success: false,
          error: 'Assessment not found'
        };
      }

      // Convert answers to array format for scoring
      const answersArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
        question: assessment.questions.find(q => q.id === questionId)
      }));

      // Calculate score using the utils function
      const scoringConfig = assessment.metadata.scoring;
      const score = calcAssessmentScore(answersArray, scoringConfig);

      // Get interpretation
      const interpretation = scoringConfig?.interpretation 
        ? interpretAssessmentScore(score, scoringConfig.interpretation, scoringConfig.range)
        : {
            level: 'unknown',
            description: 'No interpretation available',
            category: 'unknown' as const
          };

      // Submit to backend
      const response = await apiClient.saveAssessmentResponse(
        assessmentId,
        answers,
        'completed',
        score
      );

      return {
        success: true,
        data: {
          response: response.response,
          score,
          interpretation
        }
      };
    } catch (error) {
      console.error('Failed to submit assessment response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit assessment response'
      };
    }
  }

  // GET /assessments/responses/user - get user's assessment history
  static async getUserAssessmentResponses(): Promise<ApiResponse<{ responses: AssessmentResponseData[] }>> {
    try {
      const response = await apiClient.getUserAssessmentResponses();
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to fetch user assessment responses:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assessment history'
      };
    }
  }

  // GET /equip/programs - get available programs
  static async getEquipPrograms(): Promise<ApiResponse<{ programs: any[] }>> {
    try {
      const response = await apiClient.getEquipPrograms();
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to fetch equip programs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch programs'
      };
    }
  }

  // GET /equip/programs/:id - get specific program
  static async getEquipProgram(programId: string): Promise<ApiResponse<{ program: any }>> {
    try {
      const response = await apiClient.getEquipProgram(programId);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`Failed to fetch program ${programId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Program not found'
      };
    }
  }

  // POST /journal/entries - create journal entry
  static async createJournalEntry(
    date: string,
    moodRating?: number,
    content?: string
  ): Promise<ApiResponse<{ entry: any }>> {
    try {
      const response = await apiClient.createJournalEntry(date, moodRating, content);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to create journal entry:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create journal entry'
      };
    }
  }

  // GET /journal/entries - get journal entries
  static async getJournalEntries(
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Promise<ApiResponse<{ entries: any[] }>> {
    try {
      const response = await apiClient.getJournalEntries(startDate, endDate, limit);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to fetch journal entries:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch journal entries'
      };
    }
  }

  // GET /library/resources - get resources
  static async getResources(
    category?: string,
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<{ resources: any[] }>> {
    try {
      const response = await apiClient.getResources(category, limit, offset);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch resources'
      };
    }
  }

  // GET /consultation/professionals - get mental health professionals
  static async getProfessionals(
    specialty?: string,
    location?: string,
    limit?: number
  ): Promise<ApiResponse<{ professionals: any[] }>> {
    try {
      const response = await apiClient.getProfessionals(specialty, location, limit);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Failed to fetch professionals:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch professionals'
      };
    }
  }

  // Health check endpoint
  static async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await apiClient.healthCheck();
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

// Export default instance for convenience
export const apiRoutes = ApiRouteHandlers;

// Helper function to handle API responses in components
export function handleApiResponse<T>(
  response: ApiResponse<T>,
  onSuccess: (data: T) => void,
  onError?: (error: string) => void
): void {
  if (response.success && response.data) {
    onSuccess(response.data);
  } else if (onError && response.error) {
    onError(response.error);
  }
}

// Example usage in React components:
/*
import { apiRoutes, handleApiResponse } from '../lib/api-routes';

const MyComponent = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssessments = async () => {
      const response = await apiRoutes.getAssessments();
      
      handleApiResponse(
        response,
        (data) => {
          setAssessments(data.assessments);
          setLoading(false);
        },
        (error) => {
          setError(error);
          setLoading(false);
        }
      );
    };

    loadAssessments();
  }, []);

  // Component JSX...
};
*/