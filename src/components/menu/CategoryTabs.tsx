'use client';

import { motion } from 'framer-motion';
import type { Category } from '@/lib/types';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  const tabs = [{ slug: 'all', name: 'All' }, ...categories.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.slug}
          onClick={() => onCategoryChange(tab.slug)}
          className={`relative px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === tab.slug
              ? 'text-white'
              : 'text-coffee-700 bg-cream-dark hover:bg-coffee-100'
          }`}
        >
          {activeCategory === tab.slug && (
            <motion.div
              layoutId="active-category"
              className="absolute inset-0 bg-burgundy-800 rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.name}</span>
        </button>
      ))}
    </div>
  );
}
