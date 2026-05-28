'use client';

import Link from 'next/link';
import { BookOpen, Home, Sparkles, Layers3 } from 'lucide-react';

interface MobileBottomNavProps {
  pathname: string;
}

const items = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Assignments', href: '/assignments', icon: Layers3 },
  { label: 'Library', href: '/library', icon: BookOpen },
  { label: 'AI Toolkit', href: '/toolkit', icon: Sparkles },
];

export const MobileBottomNav = ({ pathname }: MobileBottomNavProps): JSX.Element => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E8E3DD] bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(48,48,48,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-4 gap-2 text-[11px] text-veda-label">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href === '/assignments' && pathname.startsWith('/assignments'));
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={[
                'flex flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-colors',
                isActive ? 'bg-[#F2F2F0] text-veda-dark' : 'text-veda-label',
              ].join(' ')}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
