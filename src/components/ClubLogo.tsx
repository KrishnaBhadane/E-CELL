/** Original club artwork, retaining its green, yellow and turquoise colors. */
export default function ClubLogo() {
  return (
    <picture>
      <source srcSet="/assets/brand/club-logo.webp" type="image/webp" />
      <img className="club-logo" src="/assets/brand/club-logo.png" alt="E-Cell RCPIT logo" width="54" height="54" decoding="async" />
    </picture>
  );
}
