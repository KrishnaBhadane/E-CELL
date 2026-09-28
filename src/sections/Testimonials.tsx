export default function Testimonials() {
  return <section className="testimonials" id="testimonials" aria-labelledby="testimonial-title" data-nav-tone="light">
    <h2 id="testimonial-title">TESTIMONIALS</h2>
    <div className="testimonial-frame">
      <figure className="testimonial-story">
        <div className="testimonial-copy">
          <span className="testimonial-demo">DEMO TESTIMONIAL</span>
          <blockquote>“Being part of E-Cell has made college more exciting. From attending events to working together on NEC activities, I’ve enjoyed meeting new people and turning ideas into action. Learning how a team plans an event, manages a budget, and makes things happen has been a great experience. I’m happy to be part of this community!”</blockquote>
        </div>
        <figcaption className="testimonial-person">
          <div className="testimonial-avatar" aria-label="Placeholder portrait">KB</div>
          <strong>Krushna Bhadane</strong>
          <span>E-Cell participant · Demo profile</span>
        </figcaption>
      </figure>
    </div>
  </section>;
}
