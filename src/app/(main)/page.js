import HeroSection from '@/components/home/HeroSection';
import TrustIndicators from '@/components/home/TrustIndicators';
import ProductCategories from '@/components/home/ProductCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import HowItWorks from '@/components/home/HowItWorks';
import PriceEstimator from '@/components/home/PriceEstimator';
import CustomerReviews from '@/components/home/CustomerReviews';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <ProductCategories />
      <FeaturedProducts />
      <HowItWorks />
      <PriceEstimator />
      <CustomerReviews />
    </>
  );
}
