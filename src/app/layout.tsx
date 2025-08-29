'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, FileText, Sparkles, Bot, LogOut } from 'lucide-react';
import { useAuth } from './auth-provider';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    {
      href: '/dashboard',
      label: 'Job Tracker',
      icon: Briefcase,
    },
    {
      href: '/job-finder',
      label: 'AI Job Finder',
      icon: Sparkles,
    },
    {
      href: '/resume-tailor',
      label: 'Resume Tailor',
      icon: FileText,
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/">
                <Bot className="h-5 w-5 text-primary" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">CareerAI</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  className="justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
           <Button variant="ghost" onClick={logout} className="justify-start">
             <LogOut className="mr-2 h-4 w-4" />
             <span>Logout</span>
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {menuItems.find(item => item.href === pathname)?.label}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
