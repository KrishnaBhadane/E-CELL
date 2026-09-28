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
      { image: 'gallery-01.jpg', caption: 'Eureka 2026 — the journey continues', width: 1200, height: 1600 },
      { image: 'gallery-02.jpg', caption: 'The Eureka team' },
      { image: 'gallery-09.jpg', caption: 'People behind the ideas' },
    ],
  },
  { name: 'illuminate 2026', upcoming: true, photos: [] },
];
