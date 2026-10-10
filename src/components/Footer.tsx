import ClubLogo from './ClubLogo';
import FooterContacts from './FooterContacts';
import SocialLinks from './SocialLinks';

export default function Footer({ membersPage = false }: { membersPage?: boolean }) {
  const home = ['/', '/index.html'].includes(window.location.pathname) ? '' : '/';
  return <footer className="footer" data-nav-tone="dark">
    <div className="footer-top">
      <div className="footer-brand"><a href="/" aria-label="E-Cell RCPIT home"><ClubLogo /><span>E-CELL RCPIT</span></a><p>Entrepreneurship Cell<br />R. C. Patel Institute of Technology<br />Shirpur, Maharashtra</p></div>
      <div className="footer-link-column"><h2>Explore</h2><a href={`${home}#about`}>About us</a><a href={`${home}#impact`}>Our impact</a><a href="/members.html">Our team</a></div>
      <div className="footer-link-column"><h2>Discover</h2><a href={`${home}#gallery`}>Gallery</a><a href="/blog.html">Blog</a><a href={`${home}#testimonials`}>Testimonials</a></div>
      <div className="footer-link-column"><h2>Community</h2><a href="/blog.html">Blog</a><a href="/members.html">Members</a></div>
    </div>
    <FooterContacts />
    <p className="footer-demo-note">Sample contact details — names and Gmail addresses are placeholders.</p>
    <div className="footer-bottom"><SocialLinks /><p>Built with purpose by E-Cell RCPIT.</p><a href={membersPage ? '#members-title' : '#top'}>Back to top ↑</a></div>
    <p className="footer-copyright">© {new Date().getFullYear()} E-Cell RCPIT. All rights reserved.</p>
  </footer>;
}
