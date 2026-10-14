import { createClient } from '@supabase/supabase-js';
import { BLOG_PUBLISHED_DATES } from '@/data/blog';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

// ============================================================================
// TYPES
// ============================================================================

export interface DbBlog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  paragraphs: string[];
  cover_image?: string;
  image_alt?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbMember {
  id: string;
  name: string;
  domain: string;
  image: string;
  github?: string;
  linkedin?: string;
  sort_order: number;
  created_at: string;
}

export interface DbLeadership {
  slot: 'head' | 'co_head';
  name: string;
  role: string;
  image: string;
  github?: string;
  linkedin?: string;
  updated_at: string;
}

export interface GalleryPhoto {
  image: string;
  caption: string;
  width?: number;
  height?: number;
}

export interface DbGalleryEvent {
  id: string;
  name: string;
  upcoming: boolean;
  photos: GalleryPhoto[];
  sort_order: number;
  created_at: string;
}

export interface DbTestimonial {
  id: string;
  name: string;
  role: string;
  initials: string;
  quote: string;
  image?: string;
  sort_order: number;
  created_at: string;
}

export interface DbSiteSettings {
  id: string;
  instagram: string;
  linkedin: string;
  x: string;
  updated_at: string;
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export async function loginWithEmail(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  });
}

export async function logoutUser() {
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}

// ============================================================================
// STORAGE HELPERS (Image Upload with previews)
// ============================================================================

export async function uploadMedia(file: File, folder = 'uploads'): Promise<string> {
  const rawExt = (file.name.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];
  const fileExt = allowed.includes(rawExt) ? rawExt : 'jpg';
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'uploads';
  const cleanName = `${safeFolder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('ecell-media')
    .upload(cleanName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('ecell-media')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// ============================================================================
// DATA API: BLOGS
// ============================================================================

async function loadBlogs(includeDrafts = false): Promise<DbBlog[]> {
  try {
    let query = supabase
      .from('blogs')
      .select('*');

    if (!includeDrafts) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetchBlogs warning:', error.message);
      return [];
    }
    const list = ((data || []) as DbBlog[]).map(b => {
      const canonicalDate = BLOG_PUBLISHED_DATES[b.slug];
      if (canonicalDate) {
        return {
          ...b,
          published_at: canonicalDate,
        };
      }
      return b;
    });

    // Sort published articles by publication date, newest first (stable secondary sort on created_at)
    list.sort((a, b) => {
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });

    return list;
  } catch (err) {
    console.warn('Supabase fetchBlogs error:', err);
    return [];
  }
}

export async function saveBlog(blog: Partial<DbBlog> & { title: string; excerpt: string }): Promise<DbBlog> {
  const slug = blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const payload: Record<string, unknown> = {
    ...blog,
    slug,
    updated_at: new Date().toISOString(),
  };

  const executeSave = async (dataPayload: Record<string, unknown>) => {
    if (blog.id) {
      const { data, error } = await supabase
        .from('blogs')
        .update(dataPayload)
        .eq('id', blog.id)
        .select()
        .single();
      if (error) throw error;
      return data as DbBlog;
    } else {
      const { data, error } = await supabase
        .from('blogs')
        .insert(dataPayload)
        .select()
        .single();
      if (error) throw error;
      return data as DbBlog;
    }
  };

  try {
    return await executeSave(payload);
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    // Graceful fallback if published_at column does not exist on PostgreSQL table yet
    if (errorObj?.message?.includes('published_at')) {
      console.warn('Notice: published_at column does not exist in Supabase table yet. Saving without published_at until SQL migration is executed.');
      const fallbackPayload = { ...payload };
      delete fallbackPayload.published_at;
      return await executeSave(fallbackPayload);
    }
    throw err;
  }
}

export async function deleteBlog(id: string): Promise<void> {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// DATA API: MEMBERS
// ============================================================================

async function loadMembers(): Promise<DbMember[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchMembers warning:', error.message);
      return [];
    }
    return (data || []) as DbMember[];
  } catch (err) {
    console.warn('Supabase fetchMembers error:', err);
    return [];
  }
}

export async function saveMember(member: Partial<DbMember> & { name: string; domain: string }): Promise<DbMember> {
  if (member.id) {
    const { data, error } = await supabase
      .from('members')
      .update(member)
      .eq('id', member.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('members')
      .insert(member)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// DATA API: LEADERSHIP (Two fixed slots: Head & Co-head)
// ============================================================================

async function loadLeadership(): Promise<Record<'head' | 'co_head', DbLeadership | null>> {
  try {
    const { data, error } = await supabase.from('leadership').select('*');
    if (error) {
      console.warn('Supabase fetchLeadership warning:', error.message);
      return { head: null, co_head: null };
    }
    const map: Record<'head' | 'co_head', DbLeadership | null> = { head: null, co_head: null };
    (data || []).forEach((row: DbLeadership) => {
      if (row.slot === 'head' || row.slot === 'co_head') {
        map[row.slot] = row;
      }
    });
    return map;
  } catch (err) {
    console.warn('Supabase fetchLeadership error:', err);
    return { head: null, co_head: null };
  }
}

export async function saveLeadershipSlot(
  slot: 'head' | 'co_head',
  data: { name: string; role: string; image: string; github?: string; linkedin?: string }
): Promise<DbLeadership> {
  const payload = {
    slot,
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from('leadership')
    .upsert(payload, { onConflict: 'slot' })
    .select()
    .single();

  if (error) throw error;
  return result;
}

// ============================================================================
// DATA API: GALLERY EVENTS
// ============================================================================

async function loadGalleryEvents(): Promise<DbGalleryEvent[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_events')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchGalleryEvents warning:', error.message);
      return [];
    }
    return (data || []) as DbGalleryEvent[];
  } catch (err) {
    console.warn('Supabase fetchGalleryEvents error:', err);
    return [];
  }
}

export async function saveGalleryEvent(
  event: Partial<DbGalleryEvent> & { name: string; photos: GalleryPhoto[] }
): Promise<DbGalleryEvent> {
  if (event.id) {
    const { data, error } = await supabase
      .from('gallery_events')
      .update(event)
      .eq('id', event.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('gallery_events')
      .insert(event)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteGalleryEvent(id: string): Promise<void> {
  const { error } = await supabase.from('gallery_events').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// DATA API: TESTIMONIALS
// ============================================================================

async function loadTestimonials(): Promise<DbTestimonial[]> {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchTestimonials warning:', error.message);
      return [];
    }
    return (data || []) as DbTestimonial[];
  } catch (err) {
    console.warn('Supabase fetchTestimonials error:', err);
    return [];
  }
}

export async function saveTestimonial(
  testimonial: Partial<DbTestimonial> & { name: string; quote: string }
): Promise<DbTestimonial> {
  const initials = testimonial.initials || testimonial.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const payload = {
    ...testimonial,
    initials,
  };

  if (testimonial.id) {
    const { data, error } = await supabase
      .from('testimonials')
      .update(payload)
      .eq('id', testimonial.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('testimonials')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// DATA API: SITE SETTINGS (Social Links)
// ============================================================================

async function loadSiteSettings(): Promise<DbSiteSettings | null> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetchSiteSettings warning:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('Supabase fetchSiteSettings error:', err);
    return null;
  }
}

export async function saveSiteSettings(
  settings: Partial<DbSiteSettings>
): Promise<DbSiteSettings> {
  const payload = {
    id: 'global',
    ...settings,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Share simultaneous reads only; settled results are never cached.
function deduplicateRead<Args extends unknown[], Result>(read: (...args: Args) => Promise<Result>) {
  const pending = new Map<string, Promise<Result>>();
  return (...args: Args): Promise<Result> => {
    const key = JSON.stringify(args);
    const existing = pending.get(key);
    if (existing) return existing;
    const request = read(...args).finally(() => pending.delete(key));
    pending.set(key, request);
    return request;
  };
}

export const fetchBlogs = deduplicateRead(loadBlogs);
export const fetchMembers = deduplicateRead(loadMembers);
export const fetchLeadership = deduplicateRead(loadLeadership);
export const fetchGalleryEvents = deduplicateRead(loadGalleryEvents);
export const fetchTestimonials = deduplicateRead(loadTestimonials);
export const fetchSiteSettings = deduplicateRead(loadSiteSettings);
