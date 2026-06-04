'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { ContactFormData } from '@/lib/types';

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormData>({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message || 'Message sent successfully!');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-coffee-200 bg-cream-light focus:border-burgundy-800 focus:ring-1 focus:ring-burgundy-800 outline-none transition-colors text-sm';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-md">
      <h3 className="font-heading text-2xl font-bold text-coffee-800 mb-6">Send Us a Message</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">Your Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">Email *</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="john@example.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">Phone (optional)</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="block text-sm font-medium text-coffee-700 mb-1">Subject (optional)</label>
          <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} placeholder="Reservation inquiry" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-coffee-700 mb-1">Message *</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className={`${inputClass} resize-none`} placeholder="Tell us how we can help..." />
      </div>

      {error && <p className="text-red-600 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
      {message && <p className="text-green-700 text-sm mb-4 bg-green-50 px-4 py-2 rounded-lg">{message}</p>}

      <Button type="submit" variant="primary" loading={loading} icon={<Send className="w-4 h-4" />}>
        Send Message
      </Button>
    </form>
  );
}
