"use client";
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './Contact.module.css';

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>We're here to help. Reach out for support, inquiries, or corporate partnerships.</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.infoCol}>
            <Card className={styles.infoCard}>
              <h3 className={styles.cardTitle}>Get in Touch</h3>
              
              <div className={styles.contactItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div>
                  <h4>Phone</h4>
                  <p>+233 24 123 4567</p>
                </div>
              </div>
              
              <div className={styles.contactItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <div>
                  <h4>Email</h4>
                  <p>support@scrinhouse.com</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <div>
                  <h4>Office</h4>
                  <p>123 Repair Street, East Legon<br/>Accra, Ghana</p>
                </div>
              </div>
            </Card>
          </div>

          <div className={styles.formCol}>
            <Card className={styles.formCard}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>First Name</label>
                    <Input type="text" placeholder="Kwame" required />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Last Name</label>
                    <Input type="text" placeholder="Mensah" required />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <Input type="email" placeholder="kwame@example.com" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Message</label>
                  <textarea 
                    className={styles.textarea} 
                    rows="5" 
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>
                <Button type="submit" variant="primary" className={styles.submitBtn}>Send Message</Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
