'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  Store,
  Receipt,
  User,
  Wallet,
  ShoppingCart,
  GalleryVerticalEnd,
  LifeBuoy,
  Send,
  AudioWaveform,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/store-switcher';
import { NavSecondary } from '@/components/nav-secondary';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { UserProfile } from '@/types/user';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: Partial<UserProfile> | null;
  onLogout: () => void;
}

export function AppSidebar({ user, onLogout, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  const data = {
    user: {
      name: user ? `${user.firstName} ${user.lastName}` : 'Usuário',
      email: user?.email || '',
      avatar: '',
    },
    teams: [
      {
        name: 'Acme Inc',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup',
      },
      {
        name: 'Evil Corp.',
        logo: ShoppingCart,
        plan: 'Free',
      },
    ],
    navMain: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        isActive: pathname === '/dashboard',
      },
      {
        title: 'Produtos',
        url: '/produtos',
        icon: Store,
        isActive: pathname.startsWith('/produtos'),
      },
      {
        title: 'Vendas',
        url: '/vendas',
        icon: Receipt,
        isActive: pathname.startsWith('/vendas'),
      },
      {
        title: 'Perfil',
        url: '/profile',
        icon: User,
        isActive: pathname.startsWith('/profile'),
      },
      {
        title: 'Carteira Stellar',
        url: '/settings/wallet',
        icon: Wallet,
        isActive: pathname.startsWith('/settings/wallet'),
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[state=collapsed]:!p-0 group-data-[state=collapsed]:justify-center"
            >
              <Link href="/dashboard" className="flex items-center justify-center">
                <Logo className="size-8 shadow-sm shrink-0 group-data-[state=collapsed]:size-7" />
                <div className="flex flex-1 flex-col text-left text-sm leading-tight group-data-[state=collapsed]:hidden ml-1">
                  <span className="truncate font-bold text-base text-foreground tracking-tight">
                    ChatCheckout
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
