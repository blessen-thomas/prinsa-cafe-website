import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const playfair = Playfair_Display({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Prinsa Café | Curated Flavors, Elevated Moments',
    template: '%s | Prinsa Café',
  },
  description:
    'Prinsa Café — a modern café in Bengaluru offering curated multi-cuisine flavors, premium coffee, and an elevated dining experience. Visit us at TC Palya, Krishnarajapuram.',
  keywords: ['Prinsa Café', 'café Bengaluru', 'restaurant Krishnarajapuram', 'coffee shop', 'multi-cuisine', 'TC Palya'],
  authors: [{ name: 'Prinsa Café' }],
  openGraph: {
    title: 'Prinsa Café | Curated Flavors, Elevated Moments',
    description: 'Experience curated flavors and elevated moments at Prinsa Café, Bengaluru.',
    siteName: 'Prinsa Café',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prinsa Café | Curated Flavors, Elevated Moments',
    description: 'Experience curated flavors and elevated moments at Prinsa Café, Bengaluru.',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-body bg-cream text-coffee-800 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
