'use client';

import { useEffect, useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MasonryGrid from '@/components/gallery/MasonryGrid';
import type { GalleryImage } from '@/lib/types';
import { GALLERY_CATEGORIES } from '@/lib/constants';

const localFallback: GalleryImage[] = [
  { id: '1', image_url: '/images/interior-1.jpg', alt_text: 'Prinsa Café counter and bar area', caption: 'Our welcoming bar counter', category: 'interior', sort_order: 0, is_visible: true, created_at: '', updated_at: '' },
  { id: '2', image_url: '/images/interior-2.jpg', alt_text: 'Prinsa Café dining ambience', caption: 'Elegant bar seating', category: 'interior', sort_order: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: '3', image_url: '/images/interior-3.jpg', alt_text: 'Prinsa Café dining hall', caption: 'Spacious dining area', category: 'interior', sort_order: 2, is_visible: true, created_at: '', updated_at: '' },
];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((res) => setImages(res.data?.length ? res.data : localFallback))
      .catch(() => setImages(localFallback))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'all' ? images : images.filter((i) => i.category === activeCategory);

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Our Gallery" subtitle="A glimpse into our world" />

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 justify-center">
          {GALLERY_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.value
                  ? 'bg-burgundy-800 text-white'
                  : 'bg-cream-dark text-coffee-700 hover:bg-coffee-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : <MasonryGrid images={filtered} />}
      </div>
    </div>
  );
}
