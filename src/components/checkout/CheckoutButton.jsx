"use client";
import { usePaystackPayment } from 'react-paystack';
import Button from '@/components/ui/Button';

export default function CheckoutButton({ config, onSuccess, onClose, disabled, text, className }) {
  const initializePayment = usePaystackPayment(config);

  const handleClick = () => {
    if (config.publicKey === 'pk_test_placeholder' || !config.publicKey) {
      // Simulate successful payment for demo purposes
      console.log("Simulating Paystack payment...");
      setTimeout(() => {
        onSuccess({ reference: 'simulated_ref_' + Date.now() });
      }, 1000);
      return;
    }
    initializePayment({ onSuccess, onClose });
  };

  return (
    <Button 
      variant="primary" 
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {text}
    </Button>
  );
}
