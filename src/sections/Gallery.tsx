import { useEffect, useState, type KeyboardEvent, useCallback } from 'react';
import { galleryEvents, type GalleryEvent } from '@/data/gallery';
import { fetchGalleryEvents } from '@/lib/supabase';
import PolaroidLineCarousel, { type Slide } from '@/components/ui/polaroid-line-carousel';

export default function Gallery() {
  const [eventsList, setEventsList] = useState<GalleryEvent[]>(galleryEvents);
  // selected: -1 means "All Memories", >=0 means specific event in eventsList
  const [selected, setSelected] = useState<number>(-1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchGalleryEvents().then(dbEvents => {
      if (dbEvents && dbEvents.length > 0) {
        setEventsList(
          dbEvents.map(ev => ({
            name: ev.name,
            upcoming: ev.upcoming,
            photos: Array.isArray(ev.photos) ? ev.photos : [],
          }))
        );
      }
    });
  }, []);

  function resolvePhotoUrl(imagePath: string) {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
      return imagePath;
    }
    return `/assets/events/${imagePath}`;
  }

  // Derive photos to show based on selected filter
  let currentPhotos: { image: string; caption: string }[] = [];
  let isUpcoming = false;
  let eventName = 'All Memories';

  if (selected === -1) {
    // Aggregate from all non-upcoming events
    eventName = 'All Memories';
    currentPhotos = eventsList.flatMap(ev => (!ev.upcoming && ev.photos ? ev.photos : []));
  } else {
    const currentEvent = eventsList[selected];
    if (currentEvent) {
      eventName = currentEvent.name;
      isUpcoming = Boolean(currentEvent.upcoming);
      currentPhotos = currentEvent.photos || [];
    }
  }

  // Filter out any non-photo flyer documents if present in raw records
  const filteredPhotos = currentPhotos.filter(
    photo => Boolean(photo.image) && !photo.image.includes('gallery-01.jpg')
  );

  const slides: Slide[] = filteredPhotos.map(photo => {
    const titleParts = photo.caption.split(/[:—–-]/);
    const shortTitle = titleParts.length > 1
      ? titleParts[0].trim()
      : (photo.caption && photo.caption.length <= 32 ? photo.caption : '');
    return {
      image: resolvePhotoUrl(photo.image),
      title: shortTitle,
      caption: photo.caption,
      alt: photo.caption,
    };
  });

  function navigateTab(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const totalTabs = eventsList.length + 1; // including 'All'
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % totalTabs;
    else if (e.key === 'ArrowLeft') next = (index - 1 + totalTabs) % totalTabs;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = totalTabs - 1;
    else return;
    e.preventDefault();
    const resolvedSelected = next === 0 ? -1 : next - 1;
    setSelected(resolvedSelected);
    document.getElementById(`memories-tab-${next}`)?.focus();
  }

  // Lightbox handlers
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevLightbox = useCallback(() => {
    setLightboxIndex(curr => (curr === null ? null : (curr - 1 + slides.length) % slides.length));
  }, [slides.length]);
  const nextLightbox = useCallback(() => {
    setLightboxIndex(curr => (curr === null ? null : (curr + 1) % slides.length));
  }, [slides.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
    }
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, prevLightbox, nextLightbox]);

  const activeLightboxPhoto = lightboxIndex !== null ? slides[lightboxIndex] : null;

  return (
    <section id="gallery" className="space-gallery" data-nav-tone="dark" aria-labelledby="gallery-title">
      <div id="memories" className="memories-anchor" aria-hidden="true" />
      
      <div className="memories-header-container">
        <h2 id="gallery-title" className="gallery-outline">
          MEMORIES
        </h2>
      </div>

      {/* Tabs */}
      <div className="gallery-tabs" role="tablist" aria-label="Memories collections">
        <button
          id="memories-tab-0"
          role="tab"
          aria-selected={selected === -1}
          aria-controls="gallery-panel"
          tabIndex={selected === -1 ? 0 : -1}
          onClick={() => setSelected(-1)}
          onKeyDown={e => navigateTab(e, 0)}
        >
          All Memories
        </button>
        {eventsList.map((item, index) => (
          <button
            key={item.name}
            id={`memories-tab-${index + 1}`}
            role="tab"
            aria-selected={selected === index}
            aria-controls="gallery-panel"
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={e => navigateTab(e, index + 1)}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Main Showcase Panel */}
      <div id="gallery-panel" role="tabpanel" aria-labelledby={selected === -1 ? 'memories-tab-0' : `memories-tab-${selected + 1}`} tabIndex={0}>
        {isUpcoming ? (
          <div className="gallery-upcoming">
            <h3>{eventName}</h3>
            <p>Edition in progress — stay tuned for snapshots from this upcoming summit!</p>
          </div>
        ) : slides.length === 0 ? (
          <div className="gallery-empty-state" role="status">
            <span className="gallery-empty-badge">ARCHIVAL COLLECTION</span>
            <h3 className="gallery-empty-title">{eventName}</h3>
            <p className="gallery-empty-desc">
              Photographs from this collection are currently being curated. Check back soon for official event memories.
            </p>
          </div>
        ) : (
          <div className="memories-carousel-container">
            <PolaroidLineCarousel
              key={`${selected}-${slides.length}`}
              slides={slides}
              height="min(650px, 78svh)"
              cardWidth={310}
              sag={52}
              swing={1.05}
              autoplay={4200}
              string="rgba(255, 255, 255, 0.45)"
              background="transparent"
              ink="#ffffff"
              onCardClick={(_slide, idx) => {
                setLightboxIndex(idx);
              }}
              ariaLabel={`Photo gallery of ${eventName}`}
            />
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && activeLightboxPhoto && (
        <div
          className="memories-lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={closeLightbox}
        >
          <div className="memories-lightbox-content" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="memories-lightbox-close"
              onClick={closeLightbox}
              aria-label="Close image modal"
            >
              ✕
            </button>

            <button
              type="button"
              className="memories-lightbox-nav memories-lightbox-prev"
              onClick={prevLightbox}
              aria-label="Previous photo"
            >
              ‹
            </button>

            <button
              type="button"
              className="memories-lightbox-nav memories-lightbox-next"
              onClick={nextLightbox}
              aria-label="Next photo"
            >
              ›
            </button>

            <div className="memories-lightbox-media-wrap">
              {activeLightboxPhoto.image && (
                <img
                  src={activeLightboxPhoto.image}
                  alt={activeLightboxPhoto.alt || activeLightboxPhoto.title || 'Memory photo'}
                  className="memories-lightbox-img"
                  loading="eager"
                  decoding="async"
                />
              )}
            </div>

            <div className="memories-lightbox-footer">
              <div className="memories-lightbox-meta">
                {activeLightboxPhoto.title && (
                  <span className="memories-lightbox-title">{activeLightboxPhoto.title}</span>
                )}
                {activeLightboxPhoto.caption && (
                  <p className="memories-lightbox-caption">{activeLightboxPhoto.caption}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
