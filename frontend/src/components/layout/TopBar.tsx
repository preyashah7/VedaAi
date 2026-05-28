'use client';

import { Bell, ChevronRight, Menu, ArrowLeft } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

interface TopBarProps {
  onMenuClick: () => void;
  leftLabel?: ReactNode;
}

export const TopBar = ({ onMenuClick, leftLabel = 'Assignment' }: TopBarProps): JSX.Element => {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.currentUser);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <header className="sticky top-3 z-30">
      <div className="mx-auto flex h-[58px] max-w-[1280px] items-center justify-between rounded-[22px] border border-[#E8E3DD] bg-white/95 px-4 shadow-[0_8px_24px_rgba(48,48,48,0.04)] backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E3DD] bg-white text-veda-dark md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
          <div className="flex items-center gap-2 text-sm font-medium text-veda-dark md:gap-3">
            <ArrowLeft size={16} />
            <span>{leftLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-veda-dark">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#E8E3DD] bg-white text-veda-dark"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-[#E8E3DD] bg-white px-2 py-1.5 shadow-sm">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#FF7A52_0%,#C53A0E_100%)] text-xs font-semibold text-white">
              {currentUser?.name
                ? currentUser.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('')
                : 'JD'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-veda-dark">{currentUser?.name ?? 'John Doe'}</p>
              <p className="text-[11px] text-veda-label">{currentUser?.schoolName ?? 'Teacher account'}</p>
            </div>
            <ChevronRight size={15} className="text-veda-label" />
            <button
              type="button"
              onClick={() => {
                signOut();
                router.push('/login');
              }}
              className="hidden items-center gap-1 rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-veda-label transition hover:bg-[#FAF8F5] hover:text-veda-dark md:inline-flex"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
