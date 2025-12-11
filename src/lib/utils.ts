// utils.ts - small helpers and db mock for local dev
import { apiClient } from './api-client';

// Database mock for local development
export const dbMock = {
  async query(sql: string, params?: any[]): Promise<any[]> {
    // Very tiny mock - replace with real DB calls in production
    console.log('DB QUERY', sql, params || []);
    
    // For demo purposes, return empty array
    // In a real implementation, this would connect to your database
    return [];
  },

  // Mock user operations
  async getUser(userId: string): Promise<any> {
    console.log('DB MOCK: Getting user', userId);
    try {
      const response = await apiClient.getUserProfile();
      return response.profile;
    } catch (error) {
      console.warn('DB MOCK: User not found, returning demo user');
      return {
        id: userId,
        email: 'demo@ikan.app',
        name: 'Demo User',
        created_at: new Date().toISOString()
      };
    }
  },

  // Mock assessment operations
  async getAssessments(): Promise<any[]> {
    console.log('DB MOCK: Getting assessments');
    try {
      const response = await apiClient.getAssessments();
      return response.assessments || [];
    } catch (error) {
      console.warn('DB MOCK: Failed to fetch assessments, returning empty array');
      return [];
    }
  },

  // Mock journal operations
  async getJournalEntries(userId: string, limit = 30): Promise<any[]> {
    console.log('DB MOCK: Getting journal entries for user', userId);
    try {
      const response = await apiClient.getJournalEntries({ limit });
      return response.entries || [];
    } catch (error) {
      console.warn('DB MOCK: Failed to fetch journal entries, returning empty array');
      return [];
    }
  },

  // Mock equip program operations
  async getEquipPrograms(): Promise<any[]> {
    console.log('DB MOCK: Getting equip programs');
    try {
      const response = await apiClient.getEquipPrograms();
      return response.programs || [];
    } catch (error) {
      console.warn('DB MOCK: Failed to fetch equip programs, returning empty array');
      return [];
    }
  }
};

// Assessment scoring utilities
export function calcAssessmentScore(
  answers: Array<{ questionId: string; value: number | string; question?: any }>, 
  scoringConfig?: {
    type: 'sum' | 'average' | 'weighted' | 'custom';
    range?: [number, number];
    weights?: Record<string, number>;
    customFn?: (answers: any[]) => number;
  }
): number {
  if (!answers || answers.length === 0) {
    return 0;
  }

  const { type = 'sum', weights = {} } = scoringConfig || {};

  switch (type) {
    case 'sum': {
      // Simple sum scorer for scale items
      let score = 0;
      for (const answer of answers) {
        if (typeof answer.value === 'number') {
          const weight = weights[answer.questionId] || 1;
          score += answer.value * weight;
        }
      }
      return score;
    }

    case 'average': {
      let total = 0;
      let count = 0;
      for (const answer of answers) {
        if (typeof answer.value === 'number') {
          const weight = weights[answer.questionId] || 1;
          total += answer.value * weight;
          count += weight;
        }
      }
      return count > 0 ? total / count : 0;
    }

    case 'weighted': {
      let weightedSum = 0;
      let totalWeight = 0;
      for (const answer of answers) {
        if (typeof answer.value === 'number') {
          const weight = weights[answer.questionId] || 1;
          weightedSum += answer.value * weight;
          totalWeight += weight;
        }
      }
      return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    case 'custom': {
      if (scoringConfig?.customFn) {
        return scoringConfig.customFn(answers);
      }
      // Fallback to sum if no custom function provided
      return calcAssessmentScore(answers, { type: 'sum' });
    }

    default: {
      // Default to sum scoring
      return calcAssessmentScore(answers, { type: 'sum' });
    }
  }
}

// Assessment result interpretation helper
export function interpretAssessmentScore(
  score: number, 
  interpretation: Record<string, string>,
  range?: [number, number]
): {
  level: string;
  description: string;
  category: 'minimal' | 'mild' | 'moderate' | 'severe' | 'unknown';
} {
  // Find the appropriate interpretation based on score ranges
  for (const [rangeKey, description] of Object.entries(interpretation)) {
    const rangeParts = rangeKey.split('-');
    if (rangeParts.length === 2) {
      const min = parseInt(rangeParts[0]);
      const max = parseInt(rangeParts[1]);
      if (score >= min && score <= max) {
        const category = description.toLowerCase().includes('minimal') ? 'minimal' :
                        description.toLowerCase().includes('mild') ? 'mild' :
                        description.toLowerCase().includes('moderate') ? 'moderate' :
                        description.toLowerCase().includes('severe') ? 'severe' : 'unknown';
        
        return {
          level: rangeKey,
          description,
          category
        };
      }
    }
  }

  // Fallback for scores that don't match any range
  return {
    level: 'unknown',
    description: 'Score outside defined ranges',
    category: 'unknown'
  };
}

// Mood scoring utility for journal entries
export function calculateMoodTrend(
  entries: Array<{ mood_score?: number; entry_date: string }>,
  days = 7
): {
  current: number;
  previous: number;
  trend: 'improving' | 'stable' | 'declining';
  change: number;
} {
  if (!entries || entries.length === 0) {
    return {
      current: 0,
      previous: 0,
      trend: 'stable',
      change: 0
    };
  }

  // Sort entries by date (most recent first)
  const sortedEntries = entries
    .filter(entry => entry.mood_score != null)
    .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());

  if (sortedEntries.length === 0) {
    return {
      current: 0,
      previous: 0,
      trend: 'stable',
      change: 0
    };
  }

  // Calculate current period average (recent days)
  const recentEntries = sortedEntries.slice(0, Math.min(days, sortedEntries.length));
  const currentAvg = recentEntries.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) / recentEntries.length;

  // Calculate previous period average (previous days)
  const previousEntries = sortedEntries.slice(days, Math.min(days * 2, sortedEntries.length));
  const previousAvg = previousEntries.length > 0 
    ? previousEntries.reduce((sum, entry) => sum + (entry.mood_score || 0), 0) / previousEntries.length
    : currentAvg;

  const change = currentAvg - previousAvg;
  const trend = Math.abs(change) < 0.5 ? 'stable' : 
                change > 0 ? 'improving' : 'declining';

  return {
    current: Math.round(currentAvg * 10) / 10,
    previous: Math.round(previousAvg * 10) / 10,
    trend,
    change: Math.round(change * 10) / 10
  };
}

// Format utilities for the mental health context
export const formatters = {
  // Format assessment scores with context
  assessmentScore: (score: number, maxScore: number): string => {
    const percentage = Math.round((score / maxScore) * 100);
    return `${score}/${maxScore} (${percentage}%)`;
  },

  // Format mood scores for display
  moodScore: (score: number): string => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Okay';
    if (score >= 2) return 'Difficult';
    return 'Struggling';
  },

  // Format time durations for programs
  programDuration: (days: number): string => {
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    let result = `${weeks} week${weeks !== 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      result += ` ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
    return result;
  },

  // Format progress percentages
  progress: (completed: number, total: number): string => {
    const percentage = Math.round((completed / total) * 100);
    return `${completed}/${total} (${percentage}%)`;
  }
};

// Validation utilities
export const validators = {
  // Validate mood score (typically 1-10 scale)
  moodScore: (score: any): boolean => {
    return typeof score === 'number' && score >= 1 && score <= 10;
  },

  // Validate assessment answer
  assessmentAnswer: (answer: any): boolean => {
    return answer && 
           typeof answer === 'object' && 
           'questionId' in answer && 
           'value' in answer &&
           answer.questionId && 
           (answer.value !== null && answer.value !== undefined);
  },

  // Validate email format
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength (basic)
  password: (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Za-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: 'Password is valid' };
  }
};

// Date utilities specific to mental health tracking
export const dateUtils = {
  // Get dates for mood tracking (last N days)
  getTrackingDates: (days = 7): string[] => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates.reverse(); // Return in chronological order
  },

  // Check if date is today
  isToday: (dateString: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  },

  // Check if date is within the last week
  isWithinLastWeek: (dateString: string): boolean => {
    const date = new Date(dateString);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  },

  // Format date for display in mental health context
  formatRelativeDate: (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
};

// Error handling utilities
export const errorHandlers = {
  // Handle API errors gracefully
  apiError: (error: any, context: string): string => {
    console.error(`${context}:`, error);
    
    if (error.message?.includes('timed out')) {
      return 'Request timed out. Please try again.';
    }
    
    if (error.message?.includes('network')) {
      return 'Network error. Please check your connection.';
    }
    
    if (error.status === 401) {
      return 'Authentication required. Please sign in.';
    }
    
    if (error.status === 403) {
      return 'Access denied. You may not have permission.';
    }
    
    if (error.status === 404) {
      return 'Resource not found.';
    }
    
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    return error.message || 'An unexpected error occurred.';
  },

  // Handle form validation errors
  formError: (field: string, value: any, rules: any): string | null => {
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${field} is required`;
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      return `${field} must be at least ${rules.minLength} characters`;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return `${field} must be no more than ${rules.maxLength} characters`;
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${field} format is invalid`;
    }
    
    return null;
  }
};

export default {
  dbMock,
  calcAssessmentScore,
  interpretAssessmentScore,
  calculateMoodTrend,
  formatters,
  validators,
  dateUtils,
  errorHandlers
};