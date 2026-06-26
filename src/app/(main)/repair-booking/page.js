import BookingForm from '@/components/repair/BookingForm';

export const metadata = {
  title: 'Book a Repair | ScrinHouse',
  description: 'Schedule a premium repair for your iPhone or smartphone with our expert technicians.',
};

export default function RepairBookingPage() {
  return (
    <div style={{ padding: '6rem 1.5rem', backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', color: '#111' }}>
            Book Your Repair
          </h1>
          <p style={{ color: '#525252', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            Fill out the details below and we will dispatch a professional rider to pick up your device securely.
          </p>
        </div>
        
        <BookingForm />
      </div>
    </div>
  );
}
