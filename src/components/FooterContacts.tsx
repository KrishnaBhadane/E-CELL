import MemberLinks from './MemberLinks';

interface ContactPerson {
  name: string;
  phone?: string;
  linkedin?: string;
  github?: string;
}

interface ContactCategory {
  heading: string;
  email: string;
  people: ContactPerson[];
}

const contactsData: ContactCategory[] = [
  {
    heading: 'For Website Queries',
    email: 'ecellrcpit@gmail.com',
    people: [
      {
        name: 'Krushna Bhadane',
        phone: '7721809430',
        github: 'https://github.com/KrishnaBhadane',
        linkedin: 'https://www.linkedin.com/in/krushna-bhadane-015963386/',
      },
      {
        name: 'Mukesh Nehete',
        phone: '8421274251',
        github: 'https://github.com/mukeshnehete17',
        linkedin: 'https://www.linkedin.com/in/mukeshnehete/',
      },
    ],
  },
  {
    heading: 'For Other Updates',
    email: 'ecellrcpit@gmail.com',
    people: [
      {
        name: 'Hardik Vispute',
        phone: '9730300714',
        linkedin: 'https://www.linkedin.com/in/hardik-vispute/',
      },
      {
        name: 'Vaishnav Patil',
        phone: '9421636498',
      },
    ],
  },
  {
    heading: 'For Sponsorship Queries',
    email: 'ecellrcpit@gmail.com',
    people: [
      {
        name: 'Daksh Rajput',
        phone: '8788656483',
        linkedin: 'https://www.linkedin.com/in/daksh-rajput-66a723423?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      },
      {
        name: 'Ankit Patil',
        phone: '7821950175',
        linkedin: 'https://www.linkedin.com/in/its-ankit-patil',
      },
    ],
  },
];

export default function FooterContacts() {
  return (
    <section className="footer-contacts" aria-label="Contact details">
      {contactsData.map(contact => (
        <div className="footer-contact-card" key={contact.heading}>
          <h2>{contact.heading}</h2>

          <div className="footer-people-list">
            {contact.people.map(person => (
              <div className="footer-person-block" key={person.name}>
                <div className="footer-person-header">
                  <span className="person-name">{person.name}</span>
                  {(person.linkedin || person.github) && (
                    <MemberLinks member={person} />
                  )}
                </div>

                {person.phone && (
                  <a href={`tel:${person.phone}`} className="person-phone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{person.phone}</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          <a href={`mailto:${contact.email}`} className="footer-contact-row contact-email">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m2 5 10 8L22 5" />
            </svg>
            <span>{contact.email}</span>
          </a>
        </div>
      ))}
    </section>
  );
}
