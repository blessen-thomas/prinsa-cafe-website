'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import StarRating from '@/components/reviews/StarRating';
import type { Review } from '@/lib/types';

const fallback: Review[] = [
  { id: '1', customer_name: 'Rahul S.', rating: 5, review_text: 'Amazing ambience and delicious food! The coffee here is the best in Krishnarajapuram. Highly recommend the signature blend.', is_approved: true, is_featured: true, created_at: '2024-10-15T00:00:00Z', updated_at: '', email: '' },
  { id: '2', customer_name: 'Priya M.', rating: 5, review_text: 'Such a cozy place with wonderful staff. The paneer tikka was out of this world. Perfect spot for a weekend brunch!', is_approved: true, is_featured: true, created_at: '2024-11-02T00:00:00Z', updated_at: '', email: '' },
  { id: '3', customer_name: 'Arun K.', rating: 4, review_text: 'Great food, great vibes. The interior is beautiful and the service is top-notch. Will definitely come back with friends.', is_approved: true, is_featured: true, created_at: '2024-11-20T00:00:00Z', updated_at: '', email: '' },
];

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>(fallback);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/reviews?featured=true')
      .then((r) => r.json())
      .then((res) => { if (res.data?.length) setReviews(res.data); })
      .catch(() => {});
  }, []);

  const prev = useCallback(() => setCurrent((p) => (p - 1 + reviews.length) % reviews.length), [reviews.length]);
  const next = useCallback(() => setCurrent((p) => (p + 1) % reviews.length), [reviews.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const review = reviews[current];

  return (
    <section className="py-20 lg:py-28 bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="What Our Guests Say" subtitle="Real experiences from our valued patrons" light />

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
              className="bg-dark-card rounded-2xl p-8 md:p-12 text-center relative"
            >
              <Quote className="w-10 h-10 text-gold-400/30 mx-auto mb-4" />
              <p className="text-cream/90 text-lg md:text-xl italic leading-relaxed mb-6 font-heading">
                &ldquo;{review.review_text}&rdquo;
              </p>
              <StarRating rating={review.rating} size="md" className="justify-center mb-4" />
              <p className="text-gold-400 font-semibold text-lg">{review.customer_name}</p>
              {review.dish && (
                <p className="text-warm-gray text-sm mt-1">Reviewed: {review.dish.name}</p>
              )}
              <p className="text-warm-gray/50 text-sm mt-1">
                {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          {reviews.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 rounded-full bg-dark-card text-cream/70 hover:text-gold-400 transition-colors" aria-label="Previous review">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 rounded-full bg-dark-card text-cream/70 hover:text-gold-400 transition-colors" aria-label="Next review">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-gold-400 w-6' : 'bg-cream/20'}`}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
