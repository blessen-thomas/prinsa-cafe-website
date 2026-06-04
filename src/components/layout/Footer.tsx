import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Link as LinkIcon, Map } from 'lucide-react';
import { SITE_CONFIG, NAV_LINKS, DEFAULT_BUSINESS_HOURS } from '@/lib/constants';

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function Footer() {
  return (
    <footer className="bg-dark text-cream">
      <div className="section-divider" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/images/logo.png" alt="Prinsa Café" width={40} height={40} className="rounded-full" />
              <span className="font-heading text-xl font-bold">{SITE_CONFIG.name}</span>
            </div>
            <p className="text-warm-gray text-sm leading-relaxed mb-4">{SITE_CONFIG.tagline}</p>
            <p className="text-warm-gray/70 text-sm leading-relaxed">
              Where every cup tells a story and every dish is crafted with passion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-gold-400 text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-warm-gray hover:text-gold-400 transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-heading text-gold-400 text-lg font-semibold mb-4">Business Hours</h4>
            <ul className="space-y-2">
              {DEFAULT_BUSINESS_HOURS.map((h) => (
                <li key={h.day} className="flex justify-between text-sm">
                  <span className="text-warm-gray">{h.day.slice(0, 3)}</span>
                  <span className="text-cream/90">
                    {h.is_closed ? 'Closed' : `${formatTime(h.open)} – ${formatTime(h.close)}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-gold-400 text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 shrink-0" />
                <span className="text-warm-gray">{SITE_CONFIG.address.full}</span>
              </li>
              <li>
                <a href={`tel:${SITE_CONFIG.phone}`} className="flex gap-3 text-sm text-warm-gray hover:text-gold-400 transition-colors">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                  {SITE_CONFIG.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE_CONFIG.email}`} className="flex gap-3 text-sm text-warm-gray hover:text-gold-400 transition-colors">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                  {SITE_CONFIG.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social + Copyright */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-warm-gray/60 text-sm">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href={SITE_CONFIG.social.instagram} target="_blank" rel="noopener noreferrer" className="text-warm-gray hover:text-gold-400 transition-colors" aria-label="Instagram">
              <LinkIcon className="w-5 h-5" />
            </a>
            <a href={SITE_CONFIG.social.facebook} target="_blank" rel="noopener noreferrer" className="text-warm-gray hover:text-gold-400 transition-colors" aria-label="Facebook">
              <LinkIcon className="w-5 h-5" />
            </a>
            <a href={SITE_CONFIG.social.google} target="_blank" rel="noopener noreferrer" className="text-warm-gray hover:text-gold-400 transition-colors" aria-label="Google Maps">
              <Map className="w-5 h-5" />
            </a>
          </div>
          <p className="text-warm-gray/40 text-xs">Made with ❤️ in Bengaluru</p>
        </div>
      </div>
    </footer>
  );
}
