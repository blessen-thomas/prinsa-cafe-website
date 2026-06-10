'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  console.log('Login Page: NEXT_PUBLIC_SUPABASE_URL=', process.env.NEXT_PUBLIC_SUPABASE_URL);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Fallback login logic
        if (email === 'admin@prinsacafe.com' && password === 'admin123') {
          localStorage.setItem('local_admin_session', 'true');
          router.push('/admin');
          router.refresh();
          return;
        }
        setError('Invalid email or password (Local Fallback)');
        return;
      }

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        setError('Invalid email or password');
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-dark-card rounded-2xl p-8 shadow-2xl border border-white/5">
          <div className="text-center mb-8">
            <Image src="/images/logo.png" alt="Prinsa Café" width={64} height={64} className="mx-auto mb-4 rounded-full" />
            <h1 className="font-heading text-2xl font-bold text-cream">Admin Panel</h1>
            <p className="text-warm-gray text-sm mt-1">Sign in to manage your café</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-cream focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors text-sm"
                placeholder="admin@prinsacafe.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-gray mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-dark border border-white/10 text-cream focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition-colors text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>}

            <Button type="submit" variant="gold" size="lg" className="w-full" loading={loading} icon={<LogIn className="w-5 h-5" />}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
