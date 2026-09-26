import { WorksWheel, type WorksWheelItem } from '@/components/ui/works-wheel';

const events: WorksWheelItem[] = [
  { title: 'Eureka 2026', image: '/assets/events/gallery-01.jpg', fit: 'contain' },
  { title: 'The Eureka team', image: '/assets/events/gallery-02.jpg' },
  { title: 'DevSpark', image: '/assets/events/gallery-03.jpg' },
  { title: 'Eureka — together', image: '/assets/events/gallery-09.jpg' },
];

export default function Events() {
  return (
    <section id="events" className="events" aria-labelledby="events-title" data-nav-tone="light">
      <div className="events-heading">
        <h2 id="events-title">EVENTS</h2>
      </div>
      <WorksWheel items={events} label="Our events" action="" className="events-wheel" />
    </section>
  );
}
