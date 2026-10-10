import ChromeObject from '@/components/ChromeObject';
import '@/styles/community-poster.css';

/** A static typographic poster: no pinned track or animation loop. */
export default function CommunityPoster() {
  return <section className="community-poster" id="ideas" data-nav-tone="dark" aria-labelledby="poster-title">
    <div className="poster-caption"><span>E-CELL RCPIT</span><span>IDEAS / PEOPLE / POSSIBILITIES</span></div>
    <div className="poster-content"><h2 id="poster-title">STAY<br /><span>HUNGRY.</span><br />STAY<br /><span>FOOLISH.</span></h2><ChromeObject /></div>
    <div className="poster-bottom"><p>— Steve Jobs<br />Stanford commencement, 2005</p><a href="/members.html">Meet the people ↗</a></div>
  </section>;
}
