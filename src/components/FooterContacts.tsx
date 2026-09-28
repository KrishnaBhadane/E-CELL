const contacts = [
  { heading: 'For Website Queries', email: 'ecell.website.demo@gmail.com' },
  { heading: 'For Other Updates', email: 'ecell.updates.demo@gmail.com' },
  { heading: 'For Sponsorship Queries', email: 'ecell.sponsor.demo@gmail.com' },
];

export default function FooterContacts() {
  return <section className="footer-contacts" aria-label="Contact details">
    {contacts.map(contact => <div className="footer-contact-card" key={contact.heading}>
      <h2>{contact.heading}</h2>
      {['Krushna Bhadane', 'Aryan Patil'].map(name => <p className="footer-contact-row" key={name}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3" /></svg>{name}
      </p>)}
      <p className="footer-contact-row contact-email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 5 10 8L22 5" /></svg><span>{contact.email}</span></p>
    </div>)}
  </section>;
}
