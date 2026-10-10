import { useEffect, useState } from 'react';
import { useVisibleAnimation } from '@/hooks/useVisibleAnimation';
import { members, type Member } from '@/data/members';
import MemberLinks from '@/components/MemberLinks';
import { fetchLeadership } from '@/lib/supabase';

function LeaderCard({ member }: { member: Member }) {
  const card = useVisibleAnimation<HTMLElement>();
  return (
    <article ref={card} id={member.id} className="leader-card">
      <img src={member.image} alt={`Portrait placeholder for ${member.name}`} loading="lazy" width="400" height="440" />
      <div>
        <h3>{member.name}</h3>
        <p>{member.domain}</p>
      </div>
      <MemberLinks member={member} />
    </article>
  );
}

export default function Members() {
  const [leadersList, setLeadersList] = useState<Member[]>(() => members.filter(m => m.leadership));

  useEffect(() => {
    fetchLeadership().then(slots => {
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
      }
    });
  }, []);

  return (
    <section id="members" className="members" aria-label="Head and Co-head">
      <div className="members-leads">
        {leadersList.map(member => (
          <LeaderCard key={member.id} member={member} />
        ))}
      </div>
      <a className="glass-control glass-button team-page-link" href="/members.html">
        Meet all members <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
