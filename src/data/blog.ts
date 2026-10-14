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
 * Curated publication dates for existing blogs:
 * - Illuminate workshop: 7 Oct 2026 (mandated)
 * - Each blog separated by approximately a week on random days of that week
 * - All dates are on or before 14 Oct 2026 (no future dates)
 */
export const BLOG_PUBLISHED_DATES: Record<string, string> = {
  // 14 Oct 2026 (Pitch Your Startup Idea in 60 Seconds)
  'pitch-your-startup-idea-in-60-seconds-a-guide-for-student-entrepreneurs': '2026-10-14T10:00:00Z',
  // 7 Oct 2026 (Illuminate Campus Outreach)
  'ecell-rcpit-illuminate-campus-outreach-2026': '2026-10-07T10:00:00Z',
  // 28 Sept 2026 (The 7-Day Campus Startup Sprint)
  'the-7-day-campus-startup-sprint-validate-your-idea-before-building-it': '2026-09-28T10:00:00Z',
  // 21 Sept 2026 (From Prototype to Product)
  'from-prototype-to-product-building-solutions-people-actually-use': '2026-09-21T10:00:00Z',
  // 14 Sept 2026 (Why Networking and Mentorship Matter)
  'why-networking-and-mentorship-matter-for-young-entrepreneurs-summary': '2026-09-14T10:00:00Z',
  // 7 Sept 2026 (How to Start a Business With Almost Zero Capital)
  'how-to-start-a-business-with-almost-zero-capital': '2026-09-07T10:00:00Z',
  // 24 Aug 2026 (How to Validate a Startup Idea Before Spending Money)
  'validate-startup-idea-before-spending': '2026-08-24T10:00:00Z',
  // 17 Aug 2026 (5 Mistakes Every First-Time Entrepreneur Should Avoid)
  'five-mistakes-first-time-entrepreneurs': '2026-08-17T10:00:00Z',
  // 10 Aug 2026 (From Idea to Startup: A Student Founder's First Steps)
  'from-idea-to-startup-student-founder': '2026-08-10T10:00:00Z',
};

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
