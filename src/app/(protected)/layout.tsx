'use client';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from '@/components/app-sidebar';
import { Loading } from '@/components/ui/Loading';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, loading } = useAuthGuard();
  const { logout, user } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [minLoadingFinished, setMinLoadingFinished] = useState(false);

  useEffect(() => {
    setHydrated(true);
    // Ensure a more deliberate loading time for a premium "full refresh" feel
    const timer = setTimeout(() => {
      setMinLoadingFinished(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  if (loading || !hydrated || !minLoadingFinished) {
    return <Loading />;
  }

  if (!accessToken) {
    return null;
  }

  const pathSegments = pathname.split('/').filter((segment) => segment !== '');
  const currentPageTitle =
    pathSegments.length > 0
      ? pathSegments[pathSegments.length - 1].charAt(0).toUpperCase() +
        pathSegments[pathSegments.length - 1].slice(1)
      : 'Dashboard';

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">App</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
