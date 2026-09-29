export const blogCategories = ['All', 'Startup Basics', 'Skills', 'Campus Stories', 'Updates'] as const;
export type BlogCategory = Exclude<typeof blogCategories[number], 'All'>;
export interface BlogPost {
  slug: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  image?: string;
  imageAlt?: string;
  paragraphs: string[];
}

// Sample editorial content. Replace with approved articles before publishing.
export const blogPosts: BlogPost[] = [
  {
    slug: 'finding-your-first-team', title: 'Find your people. Build something together.', category: 'Campus Stories',
    excerpt: 'A sample story about turning a campus conversation into a small project.',
    paragraphs: ['This is a fictional campus story for the blog preview. Three students meet after a workshop and realise they have been exploring the same problem from different angles.', 'Instead of assigning titles, they agree on one small task each and a time to compare what they learn. A shared experiment gives them a clearer sense of how they work together.'],
  },
  {
    slug: 'asking-better-questions', title: 'Good questions come before good answers.', category: 'Skills',
    excerpt: 'Listen carefully, leave space, and learn what people actually need.',
    paragraphs: ['Start a discovery conversation with a recent experience, rather than asking whether someone likes your idea. Ask what happened, what they tried, and what was frustrating.', 'This sample article is a starting point for a future practical guide. Keep your notes anonymous, ask permission before recording, and avoid treating a handful of conversations as a final verdict.'],
  },
  {
    slug: 'start-with-a-problem', title: 'Start with a problem. Then build the idea.', category: 'Startup Basics',
    excerpt: 'A simple way to move from “what if?” to a problem worth exploring.',
    paragraphs: [
      'An idea becomes easier to explore when you can name the person it helps. Start with something you have noticed around you: a repeated frustration, a task that takes too long, or a workaround people have accepted as normal.',
      'Before designing a solution, ask a few people to describe the last time they faced that problem. Listen for what happened, what they tried, and what made it difficult. These conversations are a starting point, not proof that everyone needs your idea.',
      'Write a small next step you can try this week. It might be a sketch, a simple sign-up page, or a manual version of the service. Keep a note of what you learn and decide what to change before building more.',
    ],
  },
  {
    slug: 'pitch-your-idea', title: 'Your first pitch, without the jargon.', category: 'Skills',
    excerpt: 'Explain the problem, your approach, and the next step in plain language.',
    paragraphs: [
      'A first pitch is an invitation to a conversation. Begin with who you are helping and a specific situation they recognise. One clear example is often more useful than a long list of features.',
      'Describe how your idea would help, then explain what you have actually tried. Separate what you know from what you still need to test. You do not need to have every answer to present an idea honestly.',
      'Finish with a clear request: feedback, a teammate, an introduction, or someone willing to try a prototype. Practise with a friend and ask them to explain the idea back to you. The gaps in their explanation show you what to simplify.',
    ],
  },
  {
    slug: 'people-behind-the-ideas', title: 'The people behind the ideas.', category: 'Campus Stories',
    excerpt: 'A space for the conversations, teamwork, and small moments that shape our cell.',
    image: '/assets/events/gallery-02.jpg', imageAlt: 'E-Cell RCPIT students together at Eureka',
    paragraphs: [
      'E-Cell RCPIT is a community of 40 students in Shirpur. This space is for stories from the people who bring its events and ideas to life.',
      'A future member story could follow an event from the first planning conversation to the final reflection: what the team wanted to achieve, what surprised them, and what they would do differently.',
      'This is a sample article. We will replace it with member contributions and event reflections approved by the team.',
    ],
  },
  {
    slug: 'illuminate-coming-soon', title: 'On the horizon: illuminate 2026.', category: 'Updates',
    excerpt: 'Our upcoming One Piece themed event. More details will be shared here.',
    paragraphs: [
      'illuminate 2026 is coming to E-Cell RCPIT with a One Piece theme. This page will be a place to find the event announcement when the details are ready.',
      'The date, venue, programme, and registration information have not been added yet. Check back for the confirmed announcement from the team.',
    ],
  },
  {
    slug: 'first-prototype', title: 'Make the first version small.', category: 'Startup Basics',
    excerpt: 'Choose one question your prototype should help you answer.',
    paragraphs: [
      'A prototype does not have to look like a finished product. It can be a paper sketch, a clickable screen, or a service you deliver manually. Its purpose is to help you learn something specific.',
      'Choose one question before you start: can someone understand the flow, complete the task, or explain why they would use it? Let that question determine what you build and what you leave out.',
      'Watch a few people try it without guiding every step. Note where they hesitate and ask what they expected. Use those observations to decide on the next version.',
    ],
  },
];
