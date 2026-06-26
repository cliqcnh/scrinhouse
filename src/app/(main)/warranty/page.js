export const metadata = {
  title: 'Warranty Information | ScrinHouse',
};

export default function WarrantyPage() {
  return (
    <div style={{ padding: '6rem 1.5rem', backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.04)', border: '1px solid #E5E5E5' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.02em' }}>Warranty Information</h1>
        <div style={{ color: '#525252', lineHeight: '1.7', fontSize: '1.0625rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p>At ScrinHouse, we stand by the quality of our premium replacement parts and expert workmanship.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>6-Month Guarantee</h2>
          <p>All parts supplied and installed by ScrinHouse are covered by a standard 6-month warranty against manufacturing defects.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>What's Covered</h2>
          <p>The warranty covers issues directly related to the part replaced, such as unresponsive touch on a new screen or rapid draining on a new battery.</p>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', marginTop: '1rem' }}>Exclusions</h2>
          <p>Our warranty is voided by subsequent accidental damage, physical breakage, liquid damage, or unauthorized third-party repairs.</p>
        </div>
      </div>
    </div>
  );
}
