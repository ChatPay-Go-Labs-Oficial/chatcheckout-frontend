"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Store,
  Receipt,
  User,
  Wallet,
  Command,
  GalleryVerticalEnd,
  LifeBuoy,
  Send,
  AudioWaveform,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/store-switcher"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UserProfile } from "@/types/user"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: Partial<UserProfile> | null;
  onLogout: () => void;
}

export function AppSidebar({ user, onLogout, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const data = {
    user: {
      name: user ? `${user.firstName} ${user.lastName}` : "Usuário",
      email: user?.email || "",
      avatar: "",
    },
    teams: [
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: pathname === "/dashboard",
      },
      {
        title: "Produtos",
        url: "/produtos",
        icon: Store,
        isActive: pathname.startsWith("/produtos"),
      },
      {
        title: "Vendas",
        url: "/vendas",
        icon: Receipt,
        isActive: pathname.startsWith("/vendas"),
      },
      {
        title: "Perfil",
        url: "/profile",
        icon: User,
        isActive: pathname.startsWith("/profile"),
      },
      {
        title: "Carteira",
        url: "/settings/wallet",
        icon: Wallet,
        isActive: pathname.startsWith("/settings/wallet"),
      },
    ],
  }

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ChatCheckout</span>
                  <span className="truncate text-xs">Empresarial</span>
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
  )
}
