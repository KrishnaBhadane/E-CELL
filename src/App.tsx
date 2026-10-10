import Header from './components/Header';
import Hero from './sections/Hero';
import CommunityPoster from './sections/CommunityPoster';
import About from './sections/About';
import Members from './sections/Members';
import WelcomeScreen from './components/WelcomeScreen';
import ScrollReveal from './components/ScrollReveal';
import Footer from './components/Footer';
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
        <CommunityPoster />
        <Gallery />
        <Testimonials />
        <Members />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
