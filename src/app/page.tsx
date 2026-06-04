import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import FeaturedDishes from '@/components/home/FeaturedDishes';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactPreview from '@/components/home/ContactPreview';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FeaturedDishes />
      <div className="section-divider" />
      <TestimonialsSection />
      <ContactPreview />
    </>
  );
}
