'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import StarRating from '@/components/reviews/StarRating';
import type { Review } from '@/lib/types';

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl p-6 shadow-md card-hover relative"
    >
      <Quote className="absolute top-4 right-4 w-8 h-8 text-gold-300/20" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-burgundy-800 flex items-center justify-center text-cream font-bold text-lg">
          {review.customer_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-heading font-semibold text-coffee-800">{review.customer_name}</h4>
          <p className="text-warm-gray text-xs">
            {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
      <StarRating rating={review.rating} size="sm" className="mb-3" />
      <p className="text-coffee-600 text-sm leading-relaxed">{review.review_text}</p>
      {review.dish && (
        <p className="mt-3 text-xs text-warm-gray italic">Reviewed: {review.dish.name}</p>
      )}
    </motion.div>
  );
}
