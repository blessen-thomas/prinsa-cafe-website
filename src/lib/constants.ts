// ============================================================
// Prinsa Café — Constants & Business Info
// ============================================================

import { type NavLink, type BusinessHours } from './types';

export const SITE_CONFIG = {
  name: 'Prinsa Café',
  tagline: 'Curated Flavors, Elevated Moments',
  description: 'Prinsa Café — a modern café in Bengaluru offering curated flavors, premium multi-cuisine dishes, and an elevated dining experience in a warm, welcoming atmosphere.',
  url: 'https://prinsacafe.com',
  phone: '+917483368648',
  phoneDisplay: '+91 74833 68648',
  whatsapp: '917483368648',
  address: {
    street: 'Sacred Hearts Road, TC Palya',
    area: 'Krishnarajapuram',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560036',
    country: 'India',
    full: 'Sacred Hearts Road, TC Palya, Krishnarajapuram, Bengaluru, Karnataka 560036',
  },
  coordinates: {
    lat: 13.0068,
    lng: 77.6769,
  },
  googleMapsUrl: 'https://maps.google.com/?q=Prinsa+Cafe+TC+Palya+Krishnarajapuram+Bengaluru',
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.7!2d77.6769!3d13.0068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPrinsa+Cafe!5e0!3m2!1sen!2sin!4v1700000000000',
  social: {
    instagram: 'https://instagram.com/prinsacafe',
    facebook: 'https://facebook.com/prinsacafe',
    google: 'https://g.page/prinsacafe',
  },
} as const;

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Contact', href: '/contact' },
];

export const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: 'Monday', open: '08:00', close: '22:00', is_closed: false },
  { day: 'Tuesday', open: '08:00', close: '22:00', is_closed: false },
  { day: 'Wednesday', open: '08:00', close: '22:00', is_closed: false },
  { day: 'Thursday', open: '08:00', close: '22:00', is_closed: false },
  { day: 'Friday', open: '08:00', close: '22:00', is_closed: false },
  { day: 'Saturday', open: '08:00', close: '22:00', is_closed: false },
  { day: 'Sunday', open: '09:00', close: '22:00', is_closed: false },
];

export const GALLERY_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'interior', label: 'Interior' },
  { value: 'exterior', label: 'Exterior' },
  { value: 'food', label: 'Food' },
  { value: 'events', label: 'Events' },
] as const;

export const ABOUT_TEXT = {
  short: 'Welcome to Prinsa Café — where every cup tells a story and every dish is crafted with passion.',
  long: `Nestled in the heart of Krishnarajapuram, Bengaluru, Prinsa Café is more than just a place to eat — it's an experience. We bring together the finest multi-cuisine flavors with a warm, modern atmosphere that makes every visit special.

Our carefully curated menu features a blend of South Indian classics, Continental favorites, and signature coffee creations, all prepared with the freshest ingredients and a touch of love. Whether you're stopping by for a morning coffee, a leisurely lunch, or an evening with friends, Prinsa Café offers the perfect setting for every occasion.

Step inside, take a seat at our elegant bar counter or cozy dining area, and let us elevate your everyday moments into extraordinary memories.`,
};

export const SUPABASE_STORAGE_BUCKETS = {
  gallery: 'gallery-images',
  dishes: 'dish-images',
  logo: 'logo-assets',
} as const;
