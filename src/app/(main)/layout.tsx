
'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Briefcase, FileText, Sparkles, Bot, LogOut } from 'lucide-react';
import { useAuth } from './auth-provider';
import { useEffect } from 'react';

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
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If finished loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

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

  // While checking auth, show a loading skeleton for the layout
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen">
        <Skeleton className="hidden h-full w-64 md:block" />
        <div className="flex-1">
           <Skeleton className="h-14 w-full" />
           <Skeleton className="h-[calc(100vh-3.5rem)] w-full p-4" />
        </div>
      </div>
    );
  }

  // If authenticated, render the full app layout
  return isAuthenticated ? (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/dashboard">
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
              {menuItems.find(item => pathname.startsWith(item.href))?.label}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  ) : null; // or return a loading indicator, though the redirect should be fast
}
