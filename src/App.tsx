import Header from './components/Header';
import ClubLogo from './components/ClubLogo';
import Hero from './sections/Hero';
import Events from './sections/Events';
import About from './sections/About';
import Members from './sections/Members';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#about">Skip to content</a>
      <div id="top" />
      <Header />
      <main>
        <Hero />
        <Events />
        <About />
        <Members />
      </main>
      <footer className="footer">
        <a className="brand-link" href="#top" aria-label="E-Cell RCPIT home"><ClubLogo /><span>E-CELL <small>RCPIT</small></span></a>
        <p>© {new Date().getFullYear()} E-Cell RCPIT</p>
        <a className="glass-control glass-button" href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </>
  );
}
