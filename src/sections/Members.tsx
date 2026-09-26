import { useEffect, useRef, useState } from 'react';
import GlyphPortal from '@/components/ui/glyph-portal';
import { members, type Member } from '@/data/members';

function Profile({ member }: { member: Member }) {
  return (
    <article id={member.id} className={`member-card${member.leadership ? ' member-leader' : ''}`}>
      <img src={member.image} alt={`Portrait placeholder for ${member.name}`} loading="lazy" width="400" height="440" />
      <h3>{member.name}</h3><p>{member.domain}</p>
    </article>
  );
}

export default function Members() {
  const [ready, setReady] = useState(false);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    let active = true;
    document.fonts.load('400 100px Anton').then(() => { if (active) setReady(true); }).catch(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const cards = (
    <div className="members-content">
      <div className="members-grid">{members.map(member => <Profile key={member.id} member={member} />)}</div>
    </div>
  );
  return (
    <section ref={section} id="members" className="members" aria-labelledby="members-title">
      <h2 id="members-title" className="sr-only">Members</h2>
      <div className="members-backdrop" aria-hidden="true" />
      {ready ? <GlyphPortal word="MEMBERS" focusChar="M" fontFamily="Anton" fontWeight={400} interactive={false}
        stageHeight={320} scrollLength={1} enterLabel="Meet the members"
        onProgress={progress => {
          const fade = Math.min(1, Math.max(0, (progress - .65) / .35));
          section.current?.style.setProperty('--members-color-opacity', String(1 - fade * fade * (3 - 2 * fade)));
        }}
        style={{ '--gp-paper': 'transparent', '--gp-field': '#e4d8f2', '--gp-foreground': '#21152f', '--gp-ink': '#513078' }}
        background={<div className="member-color-field" />}>
        {cards}
      </GlyphPortal> : cards}
    </section>
  );
}
