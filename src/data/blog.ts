export const blogCategories = ['All', 'Startup Basics', 'Skills', 'Campus Stories', 'Updates'] as const;
export type BlogCategory = Exclude<typeof blogCategories[number], 'All'>;

export interface BlogPost {
  slug: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  image?: string;
  imageAlt?: string;
  paragraphs: string[];
  publishedAt?: string;
  readingTime?: string;
}

/**
 * Format publication date consistently for Indian readers (e.g. "14 Oct 2026").
 */
export function formatBlogDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

/**
 * Calculate estimated reading time based on standard 200 words-per-minute.
 */
export function calculateReadingTime(paragraphs?: string[] | string): string {
  const text = Array.isArray(paragraphs) ? paragraphs.join(' ') : (paragraphs || '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
