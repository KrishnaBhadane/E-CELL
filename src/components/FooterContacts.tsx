import SocialLinks from './SocialLinks';

const contacts = [
  { heading: 'Website Queries', name: 'Krushna Bhadane', email: 'ecell.website.demo@gmail.com' },
  { heading: 'For Sponsorship Queries', name: 'Aryan Patil', email: 'ecell.sponsor.demo@gmail.com' },
];

export default function FooterContacts() {
  return <section className="footer-contacts" aria-label="Contact details">
    {contacts.map(contact => <div key={contact.heading}>
      <h2>{contact.heading}</h2><p>{contact.name}</p><span className="contact-email">{contact.email}</span>
      <small>Dummy contact · replace before use</small>
    </div>)}
    <div><h2>For Other Updates</h2><p>Events, announcements and club news.</p><SocialLinks /></div>
  </section>;
}
