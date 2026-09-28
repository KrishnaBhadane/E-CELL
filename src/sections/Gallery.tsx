import { ShaderBackground } from '@/components/ui/red-in-black';
import { galleryEvents } from '@/data/gallery';
import { useState, type KeyboardEvent } from 'react';

export default function Gallery() {
  const [selected, setSelected] = useState(0);
  const event = galleryEvents[selected];
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % galleryEvents.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + galleryEvents.length) % galleryEvents.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = galleryEvents.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(`gallery-tab-${next}`)?.focus();
  }
  return <section id="gallery" className="space-gallery" data-nav-tone="violet" aria-labelledby="gallery-title">
    <ShaderBackground className="gallery-shader" />
    <h2 id="gallery-title">GALLERY</h2>
    <div className="gallery-tabs" role="tablist" aria-label="Gallery events">
      {galleryEvents.map((item, index) => <button key={item.name} id={`gallery-tab-${index}`} role="tab"
        aria-selected={selected === index} aria-controls="gallery-panel" tabIndex={selected === index ? 0 : -1}
        onClick={() => setSelected(index)} onKeyDown={event => navigate(event, index)}>{item.name}</button>)}
    </div>
    <div id="gallery-panel" role="tabpanel" aria-labelledby={`gallery-tab-${selected}`} tabIndex={0}>
    {event.upcoming ? <div className="gallery-upcoming"><h3>{event.name}</h3><p>Coming soon</p></div> : <div className="gallery-photos">{event.photos.map(photo => <figure key={photo.image}>
      <img src={`/assets/events/${photo.image}`} alt={photo.caption} loading="lazy" decoding="async" width={photo.width ?? 1200} height={photo.height ?? 675} />
      <figcaption>{photo.caption}</figcaption>
    </figure>)}</div>}
    </div>
  </section>;
}
