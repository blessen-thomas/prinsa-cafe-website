'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import StarRating from '@/components/reviews/StarRating';
import type { Dish } from '@/lib/types';

export default function DishCard({ dish }: { dish: Dish }) {
  const [imgError, setImgError] = useState(false);
  
  const getPlaceholder = () => {
    const slug = dish.category?.slug || dish.category_id || '';
    switch (slug.toLowerCase()) {
      case 'pizza': return '/images/placeholders/pizza.png';
      case 'burger': return '/images/placeholders/burger.png';
      case 'pasta': return '/images/placeholders/pasta.png';
      case 'breakfast': return '/images/placeholders/breakfast.png';
      case 'noodles': return '/images/placeholders/noodles.png';
      default: return '/images/placeholders/default.png';
    }
  };

  const placeholderImg = getPlaceholder();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-md card-hover"
    >
      <div className="relative h-48 bg-gradient-to-br from-coffee-100 to-burgundy-50">
        {dish.image_url ? (
          <Image 
            src={imgError ? placeholderImg : dish.image_url} 
            alt={dish.name} 
            fill 
            className="object-cover" 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
            onError={() => setImgError(true)}
          />
        ) : (
          <Image 
            src={placeholderImg}
            alt={dish.name} 
            fill 
            className="object-cover" 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
          />
        )}
        <span className={`absolute top-3 left-3 ${dish.is_veg ? 'badge-veg badge-veg--green' : 'badge-veg badge-veg--red'}`}>
          {dish.is_veg ? '● VEG' : '● NON-VEG'}
        </span>
        {dish.is_featured && (
          <span className="absolute top-3 right-3 bg-gold-400 text-dark text-xs font-bold px-2 py-1 rounded">★ FEATURED</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-coffee-800 mb-1">{dish.name}</h3>
        {dish.description && <p className="text-warm-gray text-sm line-clamp-2 mb-3">{dish.description}</p>}
        <div className="flex items-center justify-between">
          <span className="text-gold-500 font-bold text-xl">₹{dish.price}</span>
          {dish.average_rating && dish.average_rating > 0 ? (
            <div className="flex items-center gap-1">
              <StarRating rating={dish.average_rating} size="sm" />
              <span className="text-warm-gray text-xs">({dish.review_count})</span>
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
