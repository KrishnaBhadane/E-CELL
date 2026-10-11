import '@/styles/directory-hero.css';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Header from './components/Header';
import Footer from './components/Footer';
import MemberLinks from './components/MemberLinks';
import { members, type Member } from './data/members';
import { fetchMembers, fetchLeadership } from './lib/supabase';
import './styles/global.css';
import './styles/blog.css';
import './styles/members.css';
import './styles/team-page.css';

function MembersPage() {
  const [leadersList, setLeadersList] = useState<Member[]>([]);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchLeadership()])
      .then(([dbMembers, slots]) => {
        if (dbMembers.length > 0) {
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
        } else {
          setMemberList(members.filter(m => !m.leadership));
        }

        const liveLeaders: Member[] = [];
        if (slots.head) {
          liveLeaders.push({
            id: 'leader-head',
            name: slots.head.name,
            domain: slots.head.role,
            image: slots.head.image,
            leadership: true,
            github: slots.head.github,
            linkedin: slots.head.linkedin,
          });
        }
        if (slots.co_head) {
          liveLeaders.push({
            id: 'leader-cohead',
            name: slots.co_head.name,
            domain: slots.co_head.role,
            image: slots.co_head.image,
            leadership: true,
            github: slots.co_head.github,
            linkedin: slots.co_head.linkedin,
          });
        }
        if (liveLeaders.length > 0) {
          setLeadersList(liveLeaders);
        } else {
          setLeadersList(members.filter(m => m.leadership));
        }

        setLoading(false);
      })
      .catch(() => {
        setLeadersList(members.filter(m => m.leadership));
        setMemberList(members.filter(m => !m.leadership));
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
          {/* Head & Co-head cards above other member cards as designed */}
          <div className="leadership-roster">
            <div className="blog-results-heading">
              <h2>Leadership</h2>
              <span>Head & Co-Head</span>
            </div>

            {loading ? (
              <div className="members-leads leadership-loading-container" aria-busy="true" aria-label="Loading leadership">
                <article className="leader-card leader-card-loading" aria-label="Loading head">
                  <div className="leader-skeleton-avatar" />
                  <div className="leader-skeleton-box">
                    <div className="leader-skeleton-line leader-skeleton-name" />
                    <div className="leader-skeleton-line leader-skeleton-role" />
                  </div>
                  <span className="leader-loading-label">Loading Head...</span>
                </article>
                <article className="leader-card leader-card-loading" aria-label="Loading co-head">
                  <div className="leader-skeleton-avatar" />
                  <div className="leader-skeleton-box">
                    <div className="leader-skeleton-line leader-skeleton-name" />
                    <div className="leader-skeleton-line leader-skeleton-role" />
                  </div>
                  <span className="leader-loading-label">Loading Co-Head...</span>
                </article>
              </div>
            ) : leadersList.length > 0 ? (
              <div className="members-leads">
                {leadersList.map(leader => (
                  <article className="leader-card" key={leader.id} id={leader.id}>
                    <img
                      src={leader.image}
                      alt={`Portrait for ${leader.name}`}
                      width="400"
                      height="400"
                      loading="lazy"
                    />
                    <div>
                      <h3>{leader.name}</h3>
                      <p>{leader.domain}</p>
                    </div>
                    <MemberLinks member={leader} />
                  </article>
                ))}
              </div>
            ) : null}
          </div>

          <div className="blog-results-heading">
            <h2>Our team</h2>
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
                  <p className="member-domain">{member.domain}</p>
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
