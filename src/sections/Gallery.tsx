import { useEffect, useState, type KeyboardEvent } from 'react';
import { galleryEvents, type GalleryEvent } from '@/data/gallery';
import { fetchGalleryEvents } from '@/lib/supabase';

export default function Gallery() {
  const [eventsList, setEventsList] = useState<GalleryEvent[]>(galleryEvents);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    fetchGalleryEvents().then(dbEvents => {
      if (dbEvents.length > 0) {
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

  const event = eventsList[selected] || eventsList[0] || galleryEvents[0];

  function navigate(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % eventsList.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + eventsList.length) % eventsList.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = eventsList.length - 1;
    else return;
    e.preventDefault();
    setSelected(next);
    document.getElementById(`gallery-tab-${next}`)?.focus();
  }

  function resolvePhotoUrl(imagePath: string) {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
      return imagePath;
    }
    return `/assets/events/${imagePath}`;
  }

  return (
    <section id="gallery" className="space-gallery" data-nav-tone="dark" aria-labelledby="gallery-title">
      <h2 id="gallery-title">
        Our <span>Gallery</span>
      </h2>
      <div className="gallery-tabs" role="tablist" aria-label="Gallery events">
        {eventsList.map((item, index) => (
          <button
            key={item.name}
            id={`gallery-tab-${index}`}
            role="tab"
            aria-selected={selected === index}
            aria-controls="gallery-panel"
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={e => navigate(e, index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div id="gallery-panel" role="tabpanel" aria-labelledby={`gallery-tab-${selected}`} tabIndex={0}>
        {event?.upcoming ? (
          <div className="gallery-upcoming">
            <h3>{event.name}</h3>
            <p>Coming soon</p>
          </div>
        ) : (
          <div className="gallery-photos">
            {event?.photos.map(photo => (
              <figure key={photo.image}>
                <img
                  src={resolvePhotoUrl(photo.image)}
                  alt={photo.caption}
                  loading="lazy"
                  decoding="async"
                  width={photo.width ?? 1200}
                  height={photo.height ?? 675}
                />
                <figcaption>{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
