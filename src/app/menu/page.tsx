'use client';

import { useEffect, useState } from 'react';
import { Search, Leaf } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import DishCard from '@/components/menu/DishCard';
import CategoryTabs from '@/components/menu/CategoryTabs';
import type { Dish, Category } from '@/lib/types';
import type { Metadata } from 'next';
export default function MenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/menu').then((r) => r.json()),
      fetch('/api/menu/categories').then((r) => r.json()),
    ])
      .then(([menuRes, catRes]) => {
        if (menuRes.data) {
          // Normalize: Supabase joins return 'categories' (plural); local fallback returns 'category' (singular).
          // Ensure d.category is always set so the filter works regardless of source.
          const normalized = menuRes.data.map((d: any) => ({
            ...d,
            category: d.category ?? d.categories ?? undefined,
          }));
          setDishes(normalized);
        }
        if (catRes.data) setCategories(catRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = dishes.filter((d) => {
    if (activeCategory !== 'all' && d.category?.slug !== activeCategory) return false;
    if (vegOnly && !d.is_veg) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Our Menu" subtitle="Curated with love, crafted with passion" />

        {loading ? (
          <LoadingSpinner />
        ) : dishes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="font-heading text-2xl text-coffee-800 mb-2">Menu Coming Soon</h3>
            <p className="text-warm-gray max-w-md mx-auto">
              We&apos;re preparing something special. Check back soon to explore our curated selection of dishes!
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-gray" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-coffee-200 bg-white focus:border-burgundy-800 focus:ring-1 focus:ring-burgundy-800 outline-none transition-colors text-sm"
                />
              </div>
              <button
                onClick={() => setVegOnly(!vegOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  vegOnly ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-cream-dark text-coffee-700 border border-transparent hover:bg-coffee-100'
                }`}
              >
                <Leaf className="w-4 h-4" />
                Veg Only
              </button>
            </div>

            <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-warm-gray py-12">No dishes found matching your criteria.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
