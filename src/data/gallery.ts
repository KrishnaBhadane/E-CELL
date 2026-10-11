export interface GalleryEvent {
  name: string;
  upcoming?: boolean;
  photos: { image: string; caption: string; width?: number; height?: number }[];
}

// Add future events here; the gallery renders each collection automatically.
export const galleryEvents: GalleryEvent[] = [
  {
    name: 'Eureka 2026',
    photos: [
      { image: 'gallery-02.jpg', caption: 'The Eureka Core Organizing Team' },
      { image: 'gallery-09.jpg', caption: 'Minds Behind The Breakthrough Ideas' },
      { image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop', caption: 'Pitch Arena: Founders presenting to industry mentors' },
      { image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=900&auto=format&fit=crop', caption: 'Keynote Session: Scaling disruptive ventures in tech' },
      { image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=900&auto=format&fit=crop', caption: 'Collaborative Sprint: Rapid prototyping & ideation' },
      { image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=900&auto=format&fit=crop', caption: 'Grand Finale: Recognizing champion student founders' },
    ],
  },
  {
    name: 'E-Summit RCPIT',
    photos: [
      { image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=900&auto=format&fit=crop', caption: 'Auditorium Spotlight: Over 500+ attendees united for innovation' },
      { image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=900&auto=format&fit=crop', caption: 'Mentorship Circle: Direct feedback from angel investors' },
      { image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop', caption: 'Networking Mixer: Connecting engineering, design, and business' },
    ],
  },
  { name: 'illuminate 2026', upcoming: true, photos: [] },
];
