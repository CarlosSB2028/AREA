import { HeroBanner } from '@/components/ui/infoDisplay/HeroBanner';
import { LogoCarousel } from '@/components/ui/infoDisplay/LogoCarousel';
import { FeaturesCards } from '@/components/ui/infoDisplay/FeatureCard';
export default function Home() {
  return (
    <>
      <HeroBanner />
      <div style={{ height: '40px' }}></div>

      <LogoCarousel />
      <div style={{ height: '80px' }}></div>
      <FeaturesCards />
    </>
  );
}
