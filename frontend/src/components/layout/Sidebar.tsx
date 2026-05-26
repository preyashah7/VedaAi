'use client';

import Link from 'next/link';
import { BookOpen, Home, Layers3, Library, Settings, Sparkles, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface SidebarProps {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home size={18} /> },
  { label: 'My Groups', href: '#groups', icon: <Users size={18} /> },
  { label: 'Assignments', href: '/assignments', icon: <Layers3 size={18} /> },
  { label: 'AI Teacher\'s Toolkit', href: '#toolkit', icon: <Sparkles size={18} /> },
  { label: 'My Library', href: '#library', icon: <Library size={18} /> },
];

export const Sidebar = ({ pathname, mobile = false, onNavigate }: SidebarProps): JSX.Element => {
  const assignmentCount = useAppStore((state) => state.assignments.length);

  return (
    <aside
      className={[
        'flex h-full w-[260px] flex-col bg-veda-dark text-white',
        mobile ? 'shadow-2xl' : 'border-r border-white/10',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)] text-lg font-bold text-white shadow-lg">
          V
        </div>
        <div>
          <div className="text-xl font-semibold tracking-wide">VedaAI</div>
          <div className="text-xs text-white/60">AI Assessment Creator</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Link
          href="/assignments/create"
          onClick={onNavigate}
          className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#FF7950] px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-transparent hover:bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)]"
        >
          <Sparkles size={16} className="transition-transform group-hover:rotate-12" />
          Create Assignment
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              (item.href === '/' && pathname === '/') ||
              (item.href === '/assignments' && pathname.startsWith('/assignments'));
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={[
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                  isActive ? 'bg-white text-veda-dark' : 'text-white/70 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.label === 'Assignments' && assignmentCount > 0 ? (
                  <span className="rounded-full bg-veda-red px-2 py-0.5 text-[11px] font-semibold text-white">
                    {assignmentCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="my-5 border-t border-white/10" />

        <Link
          href="#settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
        >
          <Settings size={18} />
          Settings
        </Link>
      </nav>

      <div className="mt-auto px-6 py-5">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[linear-gradient(135deg,#FF7950_0%,#C0350A_100%)] text-sm font-semibold text-white">
            JD
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white/90">Delhi Public School</div>
            <div className="truncate text-xs text-white/60">Bokaro Steel City</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
