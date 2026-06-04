'use client';

import { MapPin, Phone, Clock, ExternalLink } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import { SITE_CONFIG, DEFAULT_BUSINESS_HOURS } from '@/lib/constants';

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function ContactPreview() {
  return (
    <section className="py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Find Us" subtitle="We'd love to welcome you" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hours */}
          <AnimatedSection delay={0}>
            <div className="bg-white rounded-2xl p-6 shadow-md h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-gold-400/10">
                  <Clock className="w-5 h-5 text-gold-500" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-coffee-800">Business Hours</h3>
              </div>
              <ul className="space-y-2.5">
                {DEFAULT_BUSINESS_HOURS.map((h) => (
                  <li key={h.day} className="flex justify-between text-sm">
                    <span className="text-coffee-600 font-medium">{h.day}</span>
                    <span className="text-warm-gray">
                      {h.is_closed ? 'Closed' : `${formatTime(h.open)} – ${formatTime(h.close)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Map */}
          <AnimatedSection delay={0.15}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md h-full min-h-[280px]">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5!2d77.6769!3d13.0068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11f3e1e7f8f9%3A0x0!2zMTPCsDAwJzI0LjUiTiA3N8KwNDAnMzYuOCJF!5e0!3m2!1sen!2sin`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 280 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Prinsa Café Location"
              />
            </div>
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection delay={0.3}>
            <div className="bg-white rounded-2xl p-6 shadow-md h-full flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-burgundy-800/10">
                  <MapPin className="w-5 h-5 text-burgundy-800" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-coffee-800">Visit Us</h3>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <p className="text-coffee-700 font-medium text-sm mb-1">Address</p>
                  <p className="text-warm-gray text-sm">{SITE_CONFIG.address.full}</p>
                </div>
                <div>
                  <p className="text-coffee-700 font-medium text-sm mb-1">Phone</p>
                  <a href={`tel:${SITE_CONFIG.phone}`} className="text-burgundy-800 hover:text-burgundy-600 text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {SITE_CONFIG.phoneDisplay}
                  </a>
                </div>
              </div>

              <a href={SITE_CONFIG.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-6">
                <Button variant="primary" size="md" className="w-full" icon={<ExternalLink className="w-4 h-4" />}>
                  Get Directions
                </Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
