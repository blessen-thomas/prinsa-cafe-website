'use client';

import Image from 'next/image';
import AnimatedSection from '@/components/ui/AnimatedSection';
import SectionHeader from '@/components/ui/SectionHeader';
import { ABOUT_TEXT } from '@/lib/constants';

export default function AboutSection() {
  return (
    <section className="py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <AnimatedSection direction="left">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/images/interior-1.jpg"
                  alt="Prinsa Café interior"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold-400/10 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-burgundy-800/10 rounded-2xl -z-10" />
            </div>
          </AnimatedSection>

          {/* Text */}
          <AnimatedSection direction="right" delay={0.2}>
            <SectionHeader title="Welcome to Prinsa Café" align="left" />
            <div className="space-y-4">
              {ABOUT_TEXT.long.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-coffee-600 leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="gold-line" />
              <span className="text-gold-500 font-heading italic text-lg">Since 2024</span>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
