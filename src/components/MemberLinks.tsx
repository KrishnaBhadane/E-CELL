import type { Member } from '@/data/members';

const icons = {
  linkedin: 'M4 9v12M4 3v.01M10 21V9m0 5a5 5 0 0 1 10 0v7',
  github: 'M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .2-2-.5-3 3-.3 6-1.5 6-6a5 5 0 0 0-1.4-3.5 5 5 0 0 0-.1-3.5s-1.2-.4-3.8 1.4a13 13 0 0 0-6.4 0C6.2 1.6 5 2 5 2a5 5 0 0 0-.1 3.5A5 5 0 0 0 3.5 9c0 4.5 3 5.7 6 6-.7 1-.5 2-.5 3v4',
};
export default function MemberLinks({ member }: { member: Member }) {
  return <div className="member-links">{(['linkedin', 'github'] as const).map(platform => {
    const label = platform === 'linkedin' ? 'LinkedIn' : 'GitHub';
    const icon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icons[platform]} /></svg>;
    return member[platform] ? <a key={platform} href={member[platform]} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on ${label}`}>{icon}</a>
      : <span key={platform} role="img" aria-label={`${member.name}: ${label} not provided`} title={`${label} link coming soon`}>{icon}</span>;
  })}</div>;
}
