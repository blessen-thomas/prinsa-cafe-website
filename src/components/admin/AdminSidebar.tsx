'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Star, ImageIcon, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      localStorage.removeItem('local_admin_session');
      router.push('/admin/login');
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <Image src="/images/logo.png" alt="Prinsa Café" width={32} height={32} className="rounded-full" />
        <div>
          <p className="text-[#F8F4E9] font-heading font-semibold text-sm">Prinsa Café</p>
          <span className="text-xs text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(link.href)
                ? 'bg-[#8B0029] text-[#F8F4E9] border-l-2 border-[#D4AF37]'
                : 'text-[#C8B9A6] hover:bg-[#2B1D1A] hover:text-[#F8F4E9]'
            }`}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#C8B9A6] hover:bg-[#8B0029]/20 hover:text-[#F8F4E9] transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#140B09] p-4 flex items-center justify-between border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="" width={28} height={28} className="rounded-full" />
          <span className="text-[#F8F4E9] font-heading text-sm font-semibold">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-[#F8F4E9] p-1">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed top-0 left-0 bottom-0 w-64 bg-[#140B09] z-40 md:hidden flex flex-col transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col admin-sidebar bg-[#140B09] border-r border-[rgba(255,255,255,0.08)] shrink-0">
        {sidebarContent}
      </div>
    </>
  );
}
