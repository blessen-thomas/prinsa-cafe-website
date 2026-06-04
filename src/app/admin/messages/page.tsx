'use client';

import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = () => {
    fetch('/api/admin/messages')
      .then((r) => r.json())
      .then((res) => { if (res.data) setMessages(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const toggleRead = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: !current }),
      });
      fetchMessages();
    } catch (e) { console.error(e); }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      fetchMessages();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-cream">Contact Messages</h1>
        <p className="text-warm-gray mt-1">View messages from customers</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-dark-card rounded-2xl p-6 border transition-colors ${msg.is_read ? 'border-white/5 opacity-80' : 'border-gold-400/30'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${msg.is_read ? 'bg-white/5 text-warm-gray' : 'bg-gold-400/10 text-gold-400'}`}>
                    {msg.is_read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-cream">{msg.name}</h3>
                    <p className="text-xs text-warm-gray">
                      {new Date(msg.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleRead(msg.id, msg.is_read)} className="px-3 py-1.5 bg-dark border border-white/10 rounded-lg text-sm text-warm-gray hover:text-cream transition-colors">
                    Mark as {msg.is_read ? 'Unread' : 'Read'}
                  </button>
                  <button onClick={() => deleteMessage(msg.id)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="bg-dark rounded-xl p-4 border border-white/5">
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 text-sm border-b border-white/5 pb-3">
                  <p><span className="text-warm-gray">Email:</span> <a href={`mailto:${msg.email}`} className="text-gold-400 hover:underline">{msg.email}</a></p>
                  {msg.phone && <p><span className="text-warm-gray">Phone:</span> <a href={`tel:${msg.phone}`} className="text-gold-400 hover:underline">{msg.phone}</a></p>}
                  {msg.subject && <p><span className="text-warm-gray">Subject:</span> <span className="text-cream">{msg.subject}</span></p>}
                </div>
                <p className="text-cream/90 text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center py-12 bg-dark-card border border-white/5 rounded-2xl text-warm-gray">
              No messages found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
