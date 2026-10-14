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
  // Tuesday, 13 Oct 2026 (week after Illuminate, before 14 Oct limit)
  'pitch-your-startup-idea-in-60-seconds-a-guide-for-student-entrepreneurs': '2026-10-13T10:00:00Z',
  // Wednesday, 07 Oct 2026 (Illuminate workshop mandated date)
  'ecell-rcpit-illuminate-campus-outreach-2026': '2026-10-07T10:00:00Z',
  // Wednesday, 30 Sep 2026 (~1 week gap from Oct 7: 7 days)
  'the-7-day-campus-startup-sprint-validate-your-idea-before-building-it': '2026-09-30T14:30:00Z',
  // Thursday, 24 Sep 2026 (~1 week gap from Sep 30: 6 days)
  'from-prototype-to-product-building-solutions-people-actually-use': '2026-09-24T11:15:00Z',
  // Friday, 18 Sep 2026 (~1 week gap from Sep 24: 6 days)
  'why-networking-and-mentorship-matter-for-young-entrepreneurs-summary': '2026-09-18T09:45:00Z',
  // Tuesday, 08 Sep 2026 (~1.5 week gap from Sep 18: 10 days)
  'how-to-start-a-business-with-almost-zero-capital': '2026-09-08T16:20:00Z',
  // Wednesday, 02 Sep 2026 (~1 week gap from Sep 8: 6 days)
  'people-behind-the-ideas': '2026-09-02T13:00:00Z',
  // Thursday, 27 Aug 2026 (~1 week gap from Sep 2: 6 days)
  'validate-startup-idea-before-spending': '2026-08-27T10:30:00Z',
  // Tuesday, 18 Aug 2026 (~1 week+ gap from Aug 27: 9 days)
  'five-mistakes-first-time-entrepreneurs': '2026-08-18T15:00:00Z',
  // Monday, 10 Aug 2026 (~1 week gap from Aug 18: 8 days)
  'from-idea-to-startup-student-founder': '2026-08-10T11:00:00Z',
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
