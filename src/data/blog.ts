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
}
