import PathDrawingPortfolioHero from './ui/path-drawing-portfolio-hero';
import { upcomingEvent } from '@/data/upcoming-event';

/** Everything revealed behind the paper lives here; the tear is independent. */
export default function UpcomingEvent() {
  return <div className="upcoming-event">
    <img className="event-character" src="/assets/events/luffy.jpg" alt="Monkey D. Luffy wearing his straw hat" width="1200" height="675" decoding="async" />
    <div className="event-announcement">
      <PathDrawingPortfolioHero brand={upcomingEvent.name} colors={upcomingEvent.colors} label={upcomingEvent.label} status={upcomingEvent.status} />
      <span className="event-edition">{upcomingEvent.theme}</span>
    </div>
    <img className="event-ship" src="/assets/events/one-piece-ship.svg" alt="Pirate ship with a straw-hat sail" />
  </div>;
}
