'use client';

import { useEffect, useState } from 'react';
import { Check, X, Star, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Review } from '@/lib/types';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const fetchReviews = () => {
    fetch('/api/admin/reviews')
      .then((r) => r.json())
      .then((res) => { if (res.data) setReviews(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) fetchReviews();
    } catch (e) { console.error(e); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchReviews();
    } catch (e) { console.error(e); }
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-cream">Manage Reviews</h1>
          <p className="text-warm-gray mt-1">Approve or reject customer reviews</p>
        </div>
        
        <div className="flex bg-dark-lighter p-1 rounded-lg border border-white/5">
          {['pending', 'approved', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-burgundy-800 text-white' : 'text-warm-gray hover:text-cream'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-dark-card rounded-2xl border border-white/5 overflow-hidden text-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-dark-lighter border-b border-white/5 text-warm-gray">
                <tr>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium min-w-[200px]">Review</th>
                  <th className="p-4 font-medium">Dish</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-cream/90">
                {filtered.map((review) => (
                  <tr key={review.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="font-semibold">{review.customer_name}</p>
                      {review.email && <p className="text-xs text-warm-gray">{review.email}</p>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gold-400">
                        {review.rating} <Star className="w-3 h-3 fill-current" />
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="line-clamp-2" title={review.review_text}>{review.review_text}</p>
                    </td>
                    <td className="p-4 text-warm-gray">{review.dish?.name || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        review.is_approved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!review.is_approved ? (
                          <button onClick={() => updateReview(review.id, { is_approved: true })} className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Approve">
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => updateReview(review.id, { is_featured: !review.is_featured })} className={`p-2 rounded-lg transition-colors ${review.is_featured ? 'bg-gold-400/20 text-gold-400' : 'bg-white/5 text-warm-gray hover:bg-white/10'}`} title={review.is_featured ? 'Unfeature' : 'Feature on Home'}>
                            <Star className={`w-4 h-4 ${review.is_featured ? 'fill-current' : ''}`} />
                          </button>
                        )}
                        <button onClick={() => deleteReview(review.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-warm-gray">No reviews found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
