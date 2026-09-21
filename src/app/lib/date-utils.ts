// Simple date utility functions to replace date-fns
export function format(date: Date, formatString: string): string {
  const d = new Date(date);
  
  // Handle different format patterns
  if (formatString === 'yyyy-MM-dd') {
    return d.toISOString().split('T')[0];
  }
  
  if (formatString === 'MMM d, yyyy' || formatString === 'MMM dd, yyyy') {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  if (formatString === 'MMMM d, yyyy') {
    return d.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  if (formatString === 'MMM d') {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  if (formatString === 'h:mm a') {
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  }
  
  // Default to ISO string
  return d.toISOString();
}

export function isToday(date: Date): boolean {
  const today = new Date();
  const d = new Date(date);
  
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

export function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = now.getTime() - target.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  let result = '';
  
  if (diffInMinutes < 1) {
    result = 'just now';
  } else if (diffInMinutes < 60) {
    result = `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`;
  } else if (diffInHours < 24) {
    result = `${diffInHours} hour${diffInHours === 1 ? '' : 's'}`;
  } else if (diffInDays < 30) {
    result = `${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
  } else {
    const diffInMonths = Math.floor(diffInDays / 30);
    result = `${diffInMonths} month${diffInMonths === 1 ? '' : 's'}`;
  }
  
  if (options?.addSuffix && result !== 'just now') {
    result += ' ago';
  }
  
  return result;
}