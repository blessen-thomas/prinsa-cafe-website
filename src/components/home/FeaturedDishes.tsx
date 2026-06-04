'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Button from '@/components/ui/Button';
import DishCard from '@/components/menu/DishCard';
import type { Dish } from '@/lib/types';

const placeholders: Dish[] = [
  { id: 'ph1', name: 'Signature Coffee', description: 'Our house-blend perfection', price: 149, is_veg: true, is_featured: true, is_available: true, category_id: 'default', sort_order: 1, created_at: '', updated_at: '' },
  { id: 'ph2', name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled to perfection', price: 249, is_veg: true, is_featured: true, is_available: true, category_id: 'default', sort_order: 2, created_at: '', updated_at: '' },
  { id: 'ph3', name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', price: 299, is_veg: false, is_featured: true, is_available: true, category_id: 'default', sort_order: 3, created_at: '', updated_at: '' },
  { id: 'ph4', name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 129, is_veg: true, is_featured: true, is_available: true, category_id: 'default', sort_order: 4, created_at: '', updated_at: '' },
];

export default function FeaturedDishes() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/menu?featured=true')
      .then((r) => r.json())
      .then((res) => { if (res.data?.length) setDishes(res.data); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const hasDishes = dishes.length > 0;
  const displayDishes = hasDishes ? dishes : placeholders;

  return (
    <section className="py-20 lg:py-28 bg-cream-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Our Specialties" subtitle="Handpicked favorites from our kitchen" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayDishes.map((dish, i) => (
            <AnimatedSection key={dish.id} delay={i * 0.1}>
              <DishCard dish={dish} />
            </AnimatedSection>
          ))}
        </div>

        {!hasDishes && loaded && (
          <p className="text-center text-warm-gray mt-6 italic text-sm">Full menu coming soon!</p>
        )}

        <div className="text-center mt-10">
          <Link href="/menu">
            <Button variant="primary" size="md">View Full Menu</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

