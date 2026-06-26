export const metadata = {
  title: 'Terms of Service | ScrinHouse',
};

export default function TermsPage() {
  return (
    <div style={{ padding: '6rem 1.5rem', backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid #E5E5E5' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.02em' }}>Terms of Service</h1>
        <div style={{ color: '#525252', lineHeight: '1.7', fontSize: '1.0625rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>Welcome to ScrinHouse. By accessing our website or using our services, you agree to comply with and be bound by the following terms.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>Service Agreement</h2>
          <p>When you book a repair with ScrinHouse, you authorize our technicians to perform necessary diagnostics and repairs on your device.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>Payment Terms</h2>
          <p>Payment is due upon completion of the repair or at checkout for parts. We accept major credit cards and mobile money.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>Liability</h2>
          <p>While we take the utmost care with every device, ScrinHouse is not liable for data loss. We strongly recommend backing up your device before handing it over for repair.</p>
        </div>
      </div>
    </div>
  );
}
