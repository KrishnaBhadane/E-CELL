import { members, type Member } from './members';

const names = ['Nami', 'Usopp', 'Sanji', 'Chopper', 'Robin', 'Franky', 'Brook', 'Jinbe', 'Ace', 'Sabo', 'Shanks', 'Law', 'Vivi', 'Yamato', 'Hancock', 'Mihawk', 'Buggy', 'Crocodile', 'Katakuri', 'Marco', 'Garp', 'Koby', 'Smoker', 'Tashigi', 'Perona', 'Bonney', 'Kuma', 'Ivankov', 'Dragon', 'Rayleigh', 'Shakky', 'Benn Beckman', 'Carrot', 'Kinemon', 'Momonosuke', 'Hiyori', 'Rebecca', 'Bartolomeo'];
const domains = ['Design', 'Events', 'Technology', 'Marketing', 'Operations', 'Outreach'];

// Temporary One Piece roster. Replace names, domains and images when available.
export const team: Member[] = [...members, ...names.map((name, index) => ({
  id: `member-${index + 3}`, name, domain: domains[index % domains.length],
  image: '/assets/members/portrait-placeholder.svg', leadership: false,
}))];
