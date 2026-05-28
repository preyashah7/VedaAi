'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuthStore } from '@/store/useAuthStore';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell = ({ children }: AppShellProps): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const currentUser = useAuthStore((state) => state.currentUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isAuthRoute && currentUser) {
      router.replace('/assignments');
      return;
    }

    if (!isAuthRoute && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, isAuthRoute, isHydrated, router]);

  if (!isHydrated) {
    return <div className="min-h-screen bg-[linear-gradient(180deg,#F8F4EE_0%,#F3F1EA_100%)]" />;
  }

  if (isAuthRoute && !currentUser) {
    return <>{children}</>;
  }

  if (isAuthRoute && currentUser) {
    return <div className="min-h-screen bg-[linear-gradient(180deg,#F8F4EE_0%,#F3F1EA_100%)]" />;
  }

  if (!currentUser) {
    return <div className="min-h-screen bg-[linear-gradient(180deg,#F8F4EE_0%,#F3F1EA_100%)]" />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,121,80,0.12),transparent_24%),linear-gradient(180deg,#F8F4EE_0%,#F3F1EA_100%)] text-veda-dark">
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:block md:p-4">
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

      <div className="min-h-screen md:pl-[292px]">
        <TopBar onMenuClick={() => setIsDrawerOpen(true)} />
        <main className="min-h-[calc(100vh-56px)] px-4 py-5 pb-24 md:px-6 md:py-6">{children}</main>
      </div>

      <MobileBottomNav pathname={pathname} />
    </div>
  );
};
