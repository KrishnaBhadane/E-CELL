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
    ],
  },
  { name: 'illuminate 2026', upcoming: true, photos: [] },
];

