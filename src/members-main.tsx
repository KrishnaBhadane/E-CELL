import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import Skiper39 from './components/ui/skiper39';
import MemberLinks from './components/MemberLinks';
import { team } from './data/team';
import './styles/global.css';

function MembersPage() {
  return <>
    <a className="skip-link" href="#team-roster">Skip to members</a>
    <Header />
    <main className="team-page" data-nav-tone="light">
      <Skiper39 />
      <section id="team-roster" className="team-roster" aria-label="E-Cell members">
        {team.map(member => <article className="team-card" key={member.id}>
          <img src={member.image} alt={`Portrait placeholder for ${member.name}`} width="400" height="440" loading="lazy" decoding="async" />
          <h2>{member.name}</h2><p>{member.domain}</p>
          <MemberLinks member={member} />
        </article>)}
      </section>
      <p className="team-preview-note">Preview roster · Names and portraits are placeholders.</p>
    </main>
    <Footer membersPage />
  </>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><MembersPage /></React.StrictMode>);
