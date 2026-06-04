'use client';

import { useEffect, useState } from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import StarRating from '@/components/reviews/StarRating';
import type { Review } from '@/lib/types';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((res) => { if (res.data) setReviews(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const avgRating = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Customer Reviews" subtitle="Hear what our guests have to say" />

        {/* Stats */}
        {reviews.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-center">
              <p className="text-5xl font-bold text-coffee-800 font-heading">{avgRating}</p>
              <StarRating rating={avgRating} size="md" className="mt-1 justify-center" />
              <p className="text-warm-gray text-sm mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {reviews.length === 0 && (
              <div className="text-center py-12 mb-12">
                <p className="text-4xl mb-3">✨</p>
                <h3 className="font-heading text-xl text-coffee-800 mb-2">Be the First to Review!</h3>
                <p className="text-warm-gray">Share your experience at Prinsa Café</p>
              </div>
            )}
          </>
        )}

        {/* Review Form */}
        <div className="max-w-2xl mx-auto">
          <ReviewForm onSuccess={fetchReviews} />
        </div>
      </div>
    </div>
  );
}
