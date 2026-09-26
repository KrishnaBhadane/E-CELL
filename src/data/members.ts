export type Member = { id: string; name: string; domain: string; image: string; leadership: boolean };

// One Piece dummy roster requested for the preview; replace with approved profiles.
const names = ['Luffy', 'Zoro', 'Nami', 'Usopp', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Jinbe', 'Ace', 'Sabo', 'Shanks', 'Law', 'Vivi', 'Yamato', 'Hancock', 'Mihawk', 'Buggy', 'Crocodile', 'Katakuri', 'Marco', 'Garp', 'Koby', 'Smoker', 'Tashigi', 'Perona', 'Bonney', 'Kuma', 'Ivankov', 'Dragon', 'Rayleigh', 'Shakky', 'Benn Beckman', 'Carrot', 'Kinemon', 'Momonosuke', 'Hiyori', 'Rebecca', 'Bartolomeo'];
const domains = ['Design', 'Events', 'Technology', 'Marketing', 'Operations', 'Outreach'];
export const members: Member[] = names.map((name, index) => ({
  id: `member-${index + 1}`,
  name,
  domain: index === 0 ? 'Head' : index === 1 ? 'Co-head' : domains[(index - 2) % domains.length],
  image: '/assets/members/portrait-placeholder.svg',
  leadership: index < 2,
}));
