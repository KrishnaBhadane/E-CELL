import '@/styles/directory-hero.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import MemberLinks from './components/MemberLinks';
import type { Member } from './data/members';
import { fetchMembers } from './lib/supabase';
import './styles/global.css';
import './styles/blog.css';
import './styles/team-page.css';

function MembersPage() {
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers().then(dbMembers => {
      setMemberList(
        dbMembers.map(m => ({
          id: m.id,
          name: m.name,
          domain: m.domain,
          image: m.image,
          leadership: false,
          github: m.github,
          linkedin: m.linkedin,
        }))
      );
      setLoading(false);
    });
  }, []);

  return (
    <>
      <a className="skip-link" href="#team-roster">Skip to members</a>
      <Header />
      <main className="team-page blog-page" data-nav-tone="dark">
        <header className="directory-heading">
          <span>E-CELL RCPIT / OUR PEOPLE</span>
          <h1 id="members-title">MEMBERS</h1>
        </header>
        <section id="team-roster" className="team-directory" aria-label="E-Cell members">
          <div className="blog-results-heading">
            <h2>Our people</h2>
            <span>{memberList.length} {memberList.length === 1 ? 'member' : 'members'}</span>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#8b929e', padding: '40px 0' }}>Loading members...</p>
          ) : memberList.length > 0 ? (
            <div className="team-grid">
              {memberList.map(member => (
                <article className="team-card" key={member.id}>
                  <img
                    src={member.image}
                    alt={`Portrait for ${member.name}`}
                    width="400"
                    height="400"
                    loading="lazy"
                    decoding="async"
                  />
                  <h2>{member.name}</h2>
                  <p>{member.domain}</p>
                  <MemberLinks member={member} />
                </article>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#8b929e', padding: '40px 0' }}>
              No members added yet. Upload members from the Admin Portal.
            </p>
          )}
        </section>
      </main>
      <Footer membersPage />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MembersPage />
  </React.StrictMode>
);
