'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

interface BusinessHour {
  id: string;
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export default function AdminSettingsPage() {
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((res) => { if (res.data) setHours(res.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });
      if (res.ok) {
        setMessage('Settings saved successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const updateHour = (index: number, updates: Partial<BusinessHour>) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], ...updates };
    setHours(newHours);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-cream">Settings</h1>
        <p className="text-warm-gray mt-1">Manage global site settings</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-3xl">
          <form onSubmit={handleSave} className="bg-dark-card rounded-2xl p-6 border border-white/5">
            <h2 className="font-heading text-xl font-bold text-cream mb-6">Business Hours</h2>
            
            <div className="space-y-4 mb-8">
              {hours.map((hour, idx) => (
                <div key={hour.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-dark p-4 rounded-xl border border-white/5">
                  <div className="sm:col-span-3">
                    <span className="font-medium text-cream">{hour.day}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hour.is_closed}
                        onChange={(e) => updateHour(idx, { is_closed: e.target.checked })}
                        className="rounded bg-dark border-white/10 text-gold-400 focus:ring-gold-400"
                      />
                      <span className="text-sm text-warm-gray">Closed</span>
                    </label>
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="time"
                      value={hour.open_time}
                      onChange={(e) => updateHour(idx, { open_time: e.target.value })}
                      disabled={hour.is_closed}
                      className="w-full px-3 py-2 rounded-lg bg-dark-lighter border border-white/10 text-cream disabled:opacity-50 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="time"
                      value={hour.close_time}
                      onChange={(e) => updateHour(idx, { close_time: e.target.value })}
                      disabled={hour.is_closed}
                      className="w-full px-3 py-2 rounded-lg bg-dark-lighter border border-white/10 text-cream disabled:opacity-50 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {message && <p className="text-green-400 text-sm mb-4">{message}</p>}

            <Button type="submit" variant="gold" loading={saving} icon={<Save className="w-4 h-4" />}>
              Save Settings
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
