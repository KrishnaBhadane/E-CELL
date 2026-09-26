import IndiaGlobe from '../components/IndiaGlobe';
import CountUp from '../components/CountUp';

// Participant and event totals are temporary values requested for the preview.
const impactStats = [
  { value: 1200, label: 'Participants' },
  { value: 18, label: 'Events & workshops' },
  { value: 40, label: 'Members' },
];

export default function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="illuminate-layout">
        <h2 id="about-title" className="about-outline">E-CELL RCPIT</h2>
        <div className="mission-grid">
          <article><h3>Entrepreneurship Cell</h3><p>E-Cell RCPIT is a community of 40 students in Shirpur, bringing curious minds together through events, shared ideas, and the courage to begin.</p></article>
          <article><h3>Our vision</h3><p>We want every student to see entrepreneurship as something they can take part in — a space to explore a problem, find their people, and turn an idea into action.</p></article>
        </div>
        <div className="impact-emblem"><IndiaGlobe /></div>
        <div className="impact-panel" id="impact" data-nav-tone="violet">
          <h3>Small beginnings.<br />Shared impact.</h3>
          <div className="impact-facts">
            {impactStats.map(stat => <div key={stat.label}><CountUp value={stat.value} /><span>{stat.label}</span></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
