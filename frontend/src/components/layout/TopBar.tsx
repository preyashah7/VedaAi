'use client';

import { Bell, ChevronRight, Menu, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface TopBarProps {
  onMenuClick: () => void;
  leftLabel?: ReactNode;
}

export const TopBar = ({ onMenuClick, leftLabel = 'Assignment' }: TopBarProps): JSX.Element => {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E5E5E5] bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-veda-dark md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2 text-sm font-medium text-veda-dark">
          <ArrowLeft size={16} />
          <span>{leftLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-veda-dark">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-[#E5E5E5] bg-white text-veda-dark"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-[#E5E5E5] px-2 py-1.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#C0350A_0%,#FF7950_100%)] text-xs font-semibold text-white">
            JD
          </div>
          <span className="hidden text-sm font-medium md:inline">John Doe</span>
          <ChevronRight size={15} className="text-veda-label" />
        </div>
      </div>
    </header>
  );
};
