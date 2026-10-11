export type Member = {
  id: string;
  name: string;
  domain: string;
  image: string;
  leadership: boolean;
  linkedin?: string;
  github?: string;
};

export const members: Member[] = [
  {
    id: 'leader-1',
    name: 'Krushna Bhadane',
    domain: 'Head',
    image: '/assets/members/portrait-placeholder.svg',
    leadership: true,
    linkedin: 'https://www.linkedin.com/in/krushna-bhadane-015963386/',
    github: 'https://github.com/KrishnaBhadane',
  },
  {
    id: 'leader-2',
    name: 'Mukesh Nehete',
    domain: 'Co-Head',
    image: '/assets/members/portrait-placeholder.svg',
    leadership: true,
    linkedin: 'https://www.linkedin.com/in/mukeshnehete/',
    github: 'https://github.com/mukeshnehete17',
  },
  {
    id: 'member-3',
    name: 'Hardik Vispute',
    domain: 'Technical Lead',
    image: '/assets/members/portrait-placeholder.svg',
    leadership: false,
    linkedin: 'https://www.linkedin.com/in/hardik-vispute-a083a2283/',
  },
  {
    id: 'member-4',
    name: 'Vaishnav Patil',
    domain: 'Operations Lead',
    image: '/assets/members/portrait-placeholder.svg',
    leadership: false,
    linkedin: 'https://www.linkedin.com/in/vaishnav-patil-3534b8290/',
  },
  {
    id: 'member-5',
    name: 'Daksh Rajput',
    domain: 'Design & Media Lead',
    image: '/assets/members/portrait-placeholder.svg',
    leadership: false,
    linkedin: 'https://www.linkedin.com/in/daksh-rajput-70a25628b/',
  },
  {
    id: 'member-6',
    name: 'Ankit Patil',
    domain: 'Corporate Relations',
    image: '/assets/members/portrait-placeholder.svg',
    leadership: false,
    linkedin: 'https://www.linkedin.com/in/ankit-patil-60144933a/',
  },
];
