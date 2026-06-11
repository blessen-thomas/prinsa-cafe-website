'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Star, ImageIcon, MessageSquare, Clock, TrendingUp } from 'lucide-react';

interface Stats {
  dishes: number;
  categories: number;
  reviews_total: number;
  reviews_pending: number;
  gallery_images: number;
  unread_messages: number;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  sub?: string;
  color: string;
  href: string;
}

const StatCard = ({ icon: Icon, label, value, sub, color, href }: StatCardProps) => (
  <Link
    href={href}
    id={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    className={[
      'group block bg-dark-card rounded-2xl p-6 border border-white/5',
      'transition-all duration-200',
      'hover:border-white/15 hover:bg-dark-card/80 hover:shadow-lg hover:-translate-y-0.5',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
      'active:scale-[0.98] active:shadow-none',
    ].join(' ')}
    aria-label={`Navigate to ${label}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color} transition-transform duration-200 group-hover:scale-110`}>
        <Icon className="w-6 h-6" />
      </div>
      <TrendingUp className="w-4 h-4 text-warm-gray/40 transition-colors duration-200 group-hover:text-warm-gray/70" />
    </div>
    <p className="text-3xl font-bold text-cream font-heading">{value}</p>
    <p className="text-warm-gray text-sm mt-1">{label}</p>
    {sub && <p className="text-xs text-gold-400 mt-1">{sub}</p>}
  </Link>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((res) => { if (res.data) setStats(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = stats || { dishes: 0, categories: 0, reviews_total: 0, reviews_pending: 0, gallery_images: 0, unread_messages: 0 };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-cream">Dashboard</h1>
        <p className="text-warm-gray mt-1">Welcome back to Prinsa Café Admin</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-dark-card rounded-2xl skeleton" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={UtensilsCrossed} label="Total Dishes" value={s.dishes} sub={`${s.categories} categories`} color="bg-gold-400/10 text-gold-400" href="/admin/menu" />
          <StatCard icon={Star} label="Reviews" value={s.reviews_total} sub={s.reviews_pending > 0 ? `${s.reviews_pending} pending approval` : 'All approved'} color="bg-burgundy-800/20 text-burgundy-400" href="/admin/reviews" />
          <StatCard icon={ImageIcon} label="Gallery Images" value={s.gallery_images} color="bg-coffee-500/10 text-coffee-300" href="/admin/gallery" />
          <StatCard icon={MessageSquare} label="Messages" value={s.unread_messages} sub="unread" color="bg-green-500/10 text-green-400" href="/admin/messages" />
        </div>
      )}

      <div className="bg-dark-card rounded-2xl p-6 border border-white/5">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-gold-400" />
          <h3 className="font-heading text-lg font-semibold text-cream">Quick Links</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/admin/menu', label: '+ Add Dish' },
            { href: '/admin/gallery', label: '+ Upload Photo' },
            { href: '/admin/reviews', label: 'Approve Reviews' },
            { href: '/admin/messages', label: 'View Messages' },
            { href: '/admin/settings', label: 'Edit Hours' },
            { href: '/', label: 'View Website ↗', external: true },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="px-4 py-3 rounded-xl bg-dark text-cream/70 hover:text-cream hover:bg-dark-lighter text-sm transition-colors border border-white/5 text-center break-words min-w-0"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
