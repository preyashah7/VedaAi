'use client';

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps): JSX.Element => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-veda-bg text-veda-dark">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block">
        <Sidebar pathname={pathname} />
      </div>

      {isDrawerOpen ? (
        <button
          type="button"
          aria-label="Close navigation drawer"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      ) : null}

      <div
        className={[
          'fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 md:hidden',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar pathname={pathname} mobile onNavigate={() => setIsDrawerOpen(false)} />
      </div>

      <div className="min-h-screen md:pl-[260px]">
        <TopBar onMenuClick={() => setIsDrawerOpen(true)} />
        <main className="min-h-[calc(100vh-56px)] px-4 py-5 pb-24 md:px-6">{children}</main>
      </div>

      <MobileBottomNav pathname={pathname} />
    </div>
  );
};
