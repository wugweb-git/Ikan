import { projectId } from '../../../../shared/config/supabase-info';

export const resolveImageUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;

  // If it's a full URL, return it
  if (url.startsWith('http')) {
    return url;
  }

  // If it's a data URI, return it
  if (url.startsWith('data:')) {
    return url;
  }

  // If it's a figma asset (shouldn't happen at runtime for dynamic data, but for static imports)
  if (url.startsWith('figma:asset')) {
    return url; 
  }

  // Handle Supabase Storage paths (relative)
  // e.g. /storage/v1/object/public/...
  if (url.startsWith('/storage/')) {
    return `https://${projectId}.supabase.co${url}`;
  }

  // Handle other relative paths - assume they are public assets or need base URL
  // But generally, we avoid relative paths for dynamic content unless we know the base.
  // For now, return as is if it starts with /, assuming it's a public asset in public/ folder
  if (url.startsWith('/')) {
    return url;
  }

  return url;
};
