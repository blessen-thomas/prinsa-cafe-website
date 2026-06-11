'use client';

import { MapPin, Phone, Clock } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedSection from '@/components/ui/AnimatedSection';
import ContactForm from '@/components/contact/ContactForm';
import { SITE_CONFIG, DEFAULT_BUSINESS_HOURS } from '@/lib/constants';

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Get In Touch" subtitle="We'd love to hear from you" />

        <div className="grid lg:grid-cols-2 gap-10 mb-16">
          {/* Contact Info */}
          <AnimatedSection direction="left">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-burgundy-800/10 shrink-0">
                    <MapPin className="w-6 h-6 text-burgundy-800" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-coffee-800 mb-1">Our Location</h4>
                    <p className="text-warm-gray text-sm leading-relaxed">{SITE_CONFIG.address.full}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gold-400/10 shrink-0">
                    <Phone className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-coffee-800 mb-1">Phone</h4>
                    <a href={`tel:${SITE_CONFIG.phone}`} className="text-burgundy-800 hover:text-burgundy-600 font-medium">
                      {SITE_CONFIG.phoneDisplay}
                    </a>
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gold-400/10 shrink-0">
                    <Clock className="w-6 h-6 text-gold-500" />
                  </div>
                  <h4 className="font-heading font-semibold text-coffee-800">Business Hours</h4>
                </div>
                <ul className="space-y-2 ml-[52px]">
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
            </div>
          </AnimatedSection>

          {/* Form */}
          <AnimatedSection direction="right" delay={0.2}>
            <ContactForm />
          </AnimatedSection>
        </div>

        {/* Google Maps */}
        <AnimatedSection>
          <div className="rounded-2xl overflow-hidden shadow-md h-[400px]">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.5!2d77.6769!3d13.0068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11f3e1e7f8f9%3A0x0!2zMTPCsDAwJzI0LjUiTiA3N8KwNDAnMzYuOCJF!5e0!3m2!1sen!2sin`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Prinsa Café Location"
            />
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
