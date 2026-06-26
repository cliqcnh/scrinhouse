export const metadata = {
  title: 'Privacy Policy | ScrinHouse',
};

export default function PrivacyPage() {
  return (
    <div style={{ padding: '6rem 1.5rem', backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid #E5E5E5' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
        <div style={{ color: '#525252', lineHeight: '1.7', fontSize: '1.0625rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>At ScrinHouse, we take your privacy seriously. This Privacy Policy outlines how we collect, use, and protect your personal information.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>Data Collection</h2>
          <p>We collect information necessary to fulfill your repair requests and orders, including your name, contact information, and device details.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>Device Security</h2>
          <p>During the repair process, our technicians adhere to strict data privacy protocols. We do not access your personal files, photos, or messages unless explicitly required for the repair (such as testing a camera module) and only with your prior consent.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>Third Parties</h2>
          <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.</p>
        </div>
      </div>
    </div>
  );
}
