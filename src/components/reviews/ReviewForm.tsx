'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import Combobox from '@/components/ui/Combobox';
import StarRating from '@/components/reviews/StarRating';
import type { Dish, ReviewFormData } from '@/lib/types';

export default function ReviewForm({ onSuccess }: { onSuccess?: () => void }) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [form, setForm] = useState<ReviewFormData>({ customer_name: '', email: '', rating: 0, review_text: '', dish_id: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((res) => { if (res.data) setDishes(res.data); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.customer_name.trim()) { setError('Please enter your name'); return; }
    if (form.rating === 0) { setError('Please select a rating'); return; }
    if (!form.review_text.trim()) { setError('Please write a review'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message || 'Thank you for your review!');
        setForm({ customer_name: '', email: '', rating: 0, review_text: '', dish_id: '' });
        onSuccess?.();
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
      <h3 className="font-heading text-2xl font-bold text-coffee-800 mb-6">Leave a Review</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">Your Name *</label>
          <input
            type="text"
            value={form.customer_name}
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 bg-cream-light focus:border-burgundy-800 focus:ring-1 focus:ring-burgundy-800 outline-none transition-colors text-sm"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 bg-cream-light focus:border-burgundy-800 focus:ring-1 focus:ring-burgundy-800 outline-none transition-colors text-sm"
            placeholder="john@example.com"
          />
        </div>
      </div>

      {dishes.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-coffee-700 mb-1">Which dish did you try? (optional)</label>
          <Combobox
            options={dishes.map((d) => ({ 
              value: d.id, 
              label: d.name, 
              subLabel: (d as any).categories?.name || d.category_id
            }))}
            value={form.dish_id || ''}
            onChange={(val) => setForm({ ...form, dish_id: val })}
            placeholder="Select a dish..."
            emptyText="No dishes found"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-coffee-700 mb-2">Your Rating *</label>
        <StarRating rating={form.rating} interactive size="lg" onChange={(r) => setForm({ ...form, rating: r })} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-coffee-700 mb-1">Your Review *</label>
        <textarea
          value={form.review_text}
          onChange={(e) => setForm({ ...form, review_text: e.target.value })}
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 bg-cream-light focus:border-burgundy-800 focus:ring-1 focus:ring-burgundy-800 outline-none transition-colors text-sm resize-none"
          placeholder="Tell us about your experience..."
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
      {message && <p className="text-green-700 text-sm mb-4 bg-green-50 px-4 py-2 rounded-lg">{message}</p>}

      <Button type="submit" variant="primary" loading={loading} icon={<Send className="w-4 h-4" />}>
        Submit Review
      </Button>
      <p className="text-warm-gray text-xs mt-3">Your review will appear after approval by our team.</p>
    </form>
  );
}
