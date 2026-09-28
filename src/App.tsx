import Header from './components/Header';
import ClubLogo from './components/ClubLogo';
import Hero from './sections/Hero';
import Events from './sections/Events';
import About from './sections/About';
import Members from './sections/Members';
import WelcomeScreen from './components/WelcomeScreen';
import ScrollReveal from './components/ScrollReveal';
import FooterContacts from './components/FooterContacts';
import Gallery from './sections/Gallery';
import Testimonials from './sections/Testimonials';

export default function App() {
  return (
    <>
      <WelcomeScreen />
      <a className="skip-link" href="#about">Skip to content</a>
      <div id="top" />
      <Header />
      <main>
        <Hero />
        <ScrollReveal>
        <About />
        <Events />
        <Gallery />
        <Testimonials />
        <Members />
        </ScrollReveal>
      </main>
      <footer className="footer">
        <FooterContacts />
        <a className="brand-link" href="#top" aria-label="E-Cell RCPIT home"><ClubLogo /><span>E-CELL <small>RCPIT</small></span></a>
        <p>© {new Date().getFullYear()} E-Cell RCPIT</p>
        <div className="footer-links"><a href="#about">About</a><a href="#events">Our Initiatives</a><a href="/members.html">Team</a></div>
        <a className="glass-control glass-button" href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  );
}
