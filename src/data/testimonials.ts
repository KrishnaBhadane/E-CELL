export interface TestimonialItem {
  name: string;
  initials: string;
  role: string;
  quote: string;
  image?: string;
}

// Genuine participant testimonials will be loaded via Supabase or added here once verified.
export const testimonials: TestimonialItem[] = [];
