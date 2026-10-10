import { useVisibleAnimation } from '@/hooks/useVisibleAnimation';
import { members, type Member } from '@/data/members';
import MemberLinks from '@/components/MemberLinks';

const leaders = members.filter(member => member.leadership);

function LeaderCard({ member }: { member: Member }) {
  const card = useVisibleAnimation<HTMLElement>();
  return <article ref={card} id={member.id} className="leader-card">
    <img src={member.image} alt={`Portrait placeholder for ${member.name}`} loading="lazy" width="400" height="440" />
    <div><h3>{member.name}</h3><p>{member.domain}</p></div>
    <MemberLinks member={member} />
  </article>;
}

export default function Members() {
  return <section id="members" className="members" aria-label="Head and Co-head">
    <div className="members-leads">
      {leaders.map(member => <LeaderCard key={member.id} member={member} />)}
    </div>
    <a className="glass-control glass-button team-page-link" href="/members.html">Meet all members <span aria-hidden="true">↗</span></a>
  </section>;
}
