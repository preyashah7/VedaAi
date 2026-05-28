'use client';

import Link from 'next/link';
import { BookOpen, ChevronRight, Home, Layers3, Library, LogOut, Settings, Sparkles, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

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
  { label: 'My Groups', href: '/groups', icon: <Users size={18} /> },
  { label: 'Assignments', href: '/assignments', icon: <Layers3 size={18} /> },
  { label: 'AI Teacher\'s Toolkit', href: '/toolkit', icon: <Sparkles size={18} /> },
  { label: 'My Library', href: '/library', icon: <Library size={18} /> },
];

export const Sidebar = ({ pathname, mobile = false, onNavigate }: SidebarProps): JSX.Element => {
  const router = useRouter();
  const assignmentCount = useAppStore((state) => state.assignments.length);
  const currentUser = useAuthStore((state) => state.currentUser);
  const signOut = useAuthStore((state) => state.signOut);

  const userInitials = currentUser
    ? currentUser.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : 'JD';

  const handleSignOut = (): void => {
    signOut();
    router.push('/login');
    onNavigate?.();
  };

  return (
    <aside
      className={[
        'flex h-full w-[252px] flex-col rounded-[26px] bg-white text-veda-dark shadow-[0_24px_55px_rgba(48,48,48,0.10)]',
        mobile ? 'shadow-2xl' : 'border border-[#E9E2DA]',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[linear-gradient(135deg,#FF7A52_0%,#C53A0E_100%)] text-lg font-bold text-white shadow-lg shadow-[#C0350A]/20">
          V
        </div>
        <div>
          <div className="text-[19px] font-semibold tracking-[-0.02em] text-veda-dark">VedaAI</div>
          <div className="text-[12px] text-veda-label">AI Assessment Creator</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <Link
          href="/assignments/create"
          onClick={onNavigate}
          className="group flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#FF7A52] bg-[linear-gradient(180deg,#3A3A3A_0%,#252525_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,122,82,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(255,122,82,0.28)]"
        >
          <Sparkles size={16} className="transition-transform group-hover:rotate-12" />
          Create Assignment
        </Link>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-4 pb-2">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive =
              (item.href === '/' && pathname === '/') ||
              (item.href === '/assignments' && pathname.startsWith('/assignments')) ||
              (item.href !== '/' && item.href !== '/assignments' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={[
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                  isActive ? 'bg-[#F2F2F0] text-veda-dark shadow-sm' : 'text-veda-label hover:bg-[#F7F5F1] hover:text-veda-dark',
                ].join(' ')}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.label === 'Assignments' && assignmentCount > 0 ? (
                  <span className="rounded-full bg-[#C94717] px-2 py-0.5 text-[11px] font-semibold text-white">
                    {assignmentCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="my-5 border-t border-[#E8E3DD]" />

        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-veda-label transition-all hover:bg-[#F7F5F1] hover:text-veda-dark"
        >
          <Settings size={18} />
          Settings
        </Link>
      </nav>

      <div className="mt-auto px-4 py-4">
        <div className="rounded-3xl bg-[#F3F0EB] p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[linear-gradient(135deg,#FF7A52_0%,#C53A0E_100%)] text-sm font-semibold text-white">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-veda-dark">{currentUser?.schoolName ?? 'Delhi Public School'}</div>
              <div className="truncate text-xs text-veda-label">{currentUser?.name ?? 'Bokaro Steel City'}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#E2DDD6] bg-white px-4 py-2.5 text-sm font-semibold text-veda-dark transition hover:bg-[#FAF8F5]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};
