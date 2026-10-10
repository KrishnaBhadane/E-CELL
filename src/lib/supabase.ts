import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
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

export async function getAuthSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
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
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

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

export async function fetchBlogs(includeDrafts = false): Promise<DbBlog[]> {
  try {
    let query = supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeDrafts) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetchBlogs warning:', error.message);
      return [];
    }
    return (data || []) as DbBlog[];
  } catch (err) {
    console.warn('Supabase fetchBlogs error:', err);
    return [];
  }
}

export async function saveBlog(blog: Partial<DbBlog> & { title: string; excerpt: string }): Promise<DbBlog> {
  const slug = blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const payload = {
    ...blog,
    slug,
    updated_at: new Date().toISOString(),
  };

  if (blog.id) {
    const { data, error } = await supabase
      .from('blogs')
      .update(payload)
      .eq('id', blog.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('blogs')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function deleteBlog(id: string): Promise<void> {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// DATA API: MEMBERS
// ============================================================================

export async function fetchMembers(): Promise<DbMember[]> {
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

export async function fetchLeadership(): Promise<Record<'head' | 'co_head', DbLeadership | null>> {
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

export async function fetchGalleryEvents(): Promise<DbGalleryEvent[]> {
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

export async function fetchTestimonials(): Promise<DbTestimonial[]> {
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

export async function fetchSiteSettings(): Promise<DbSiteSettings | null> {
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
