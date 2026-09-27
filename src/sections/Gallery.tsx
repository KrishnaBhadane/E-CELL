const photos = [
  { image: 'gallery-02.jpg', caption: 'The Eureka team' },
  { image: 'gallery-03.jpg', caption: 'DevSpark, together' },
  { image: 'gallery-09.jpg', caption: 'People behind the ideas' },
];

export default function Gallery() {
  return <section id="gallery" className="space-gallery" data-nav-tone="dark" aria-labelledby="gallery-title">
    <div className="gallery-orbit" aria-hidden="true" />
    <h2 id="gallery-title">GALLERY</h2>
    <div className="gallery-photos">{photos.map(photo => <figure key={photo.image}>
      <img src={`/assets/events/${photo.image}`} alt={photo.caption} loading="lazy" decoding="async" width="1200" height="675" />
      <figcaption>{photo.caption}</figcaption>
    </figure>)}</div>
  </section>;
}
