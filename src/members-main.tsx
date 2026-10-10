import '@/styles/directory-hero.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import MemberLinks from './components/MemberLinks';
import { team } from './data/team';
import './styles/global.css';
import './styles/blog.css';
import './styles/team-page.css';

function MembersPage() {
  return <>
    <a className="skip-link" href="#team-roster">Skip to members</a>
    <Header />
    <main className="team-page blog-page" data-nav-tone="dark">
      <header className="directory-heading"><span>E-CELL RCPIT / OUR PEOPLE</span><h1 id="members-title">MEMBERS</h1></header>
      <section id="team-roster" className="team-directory" aria-label="E-Cell members">
        <div className="blog-results-heading"><h2>Our people</h2><span>38 members</span></div>
        <div className="team-grid">
        {team.filter(member => !member.leadership).map(member => <article className="team-card" key={member.id}>
          <img src={member.image} alt={`Portrait placeholder for ${member.name}`} width="400" height="440" loading="lazy" decoding="async" />
          <h2>{member.name}</h2><p>{member.domain}</p>
          <MemberLinks member={member} />
        </article>)}
        </div>
      </section>
      <p className="team-preview-note">Preview roster · Names and portraits are placeholders.</p>
    </main>
    <Footer membersPage />
  </>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><MembersPage /></React.StrictMode>);
