export type Member = { id: string; name: string; domain: string; image: string; leadership: boolean; linkedin?: string; github?: string };

// Preview profiles; replace with the approved Head and Co-head details.
export const members: Member[] = [
  { id: 'member-1', name: 'Luffy', domain: 'Head', image: '/assets/members/portrait-placeholder.svg', leadership: true },
  { id: 'member-2', name: 'Zoro', domain: 'Co-head', image: '/assets/members/portrait-placeholder.svg', leadership: true },
];
