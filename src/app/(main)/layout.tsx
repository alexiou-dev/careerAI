'use client';

/**
 * Main Application Layout Component
 * 
 * Provides the primary navigation structure for authenticated users.
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  Bot, 
  Settings, 
  PenSquare, 
  MessagesSquare, 
  Lightbulb, 
  Building2, 
  TrendingUp  
} from 'lucide-react';
import { useAuth } from './auth-provider';

// Import Radix UI sidebar components
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

/**
 * AppLayout Component
 * 
 * Wraps pages with consistent navigation structure.
 * Implements:
 * - Responsive sidebar (collapsible on mobile)
 * - Organized navigation grouping
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  // Hooks
  const pathname = usePathname(); // Current route for active state

  /**
   * Primary Navigation Items
   * 
   * Main feature routes for the CareerAI platform.  
   */
  const menuItems = [
    {
      href: '/dashboard', // Route path for navigation
      label: 'Job Tracker', // Display label
      icon: Briefcase, // Lucide icon for visual representation
    },
    {
      href: '/job-finder',
      label: 'AI Job Finder',
      icon: Sparkles,
    },
    {
      href: '/resume-generator',
      label: 'Resume Generator',
      icon: FileText,
    },
    {
      href: '/cover-letter',
      label: 'AI Writer',
      icon: PenSquare,
    },
    {
      href: '/skill-analyzer',
      label: 'Skill Analyzer',
      icon: Lightbulb,
    },
    {
      href: '/interview-prep',
      label: 'Interview Prep',
      icon: MessagesSquare,
    },
    {
      href: '/company-fit',
      label: 'Company Fit',
      icon: Building2,
    },
  ];
  
  /**
   * Bottom Navigation Items
   * 
   * Secondary utility routes placed at the bottom of the sidebar.
   * Includes settings
   */
  const bottomMenuItems = [
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
    }
  ];

  return (
    /**
     * SidebarProvider
     * 
     * Provides context for the collapsible sidebar system.
     * Manages:
     * - Mobile responsive behavior
     * - Collapsed/expanded state
     * - Keyboard navigation
     */
    <SidebarProvider>
      {/* 
        ============================================
        SIDEBAR NAVIGATION
        ============================================
        Persistent sidebar visible on desktop,
        collapsible drawer on mobile
      */}
      <Sidebar>
        {/* Sidebar Header - Branding and logo */}
        <SidebarHeader>
          <div className="flex items-center gap-2">
            {/* Home/Brand button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0" 
              asChild
              aria-label="Go to CareerAI homepage"
            >
              <Link href="/">
                <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
              </Link>
            </Button>
            {/* Brand name */}
            <h1 className="text-lg font-semibold tracking-tight">CareerAI</h1>
          </div>
        </SidebarHeader>

        {/* 
          Sidebar Content - Primary Navigation
          Scrollable area containing main navigation items
        */}
        <SidebarContent>
          <SidebarMenu role="navigation" aria-label="Main navigation">
            {menuItems.map((item) => {
              // Determine if current route matches this navigation item
              const isActive = pathname === item.href;
              // Extract icon component for rendering
              const IconComponent = item.icon;
              
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="justify-start"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Link 
                      href={item.href}
                      className="flex items-center gap-3"
                      aria-label={`Navigate to ${item.label}`}
                    >
                      <IconComponent 
                        className="h-4 w-4" 
                        aria-hidden="true" 
                      />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        {/* 
          Sidebar Footer - Secondary Navigation
          Fixed position at bottom
        */}
        <SidebarFooter className="p-2 space-y-1">
          <SidebarMenu role="navigation" aria-label="Secondary navigation">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="justify-start"
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Link 
                      href={item.href}
                      className="flex items-center gap-3"
                      aria-label={`Navigate to ${item.label}`}
                    >
                      <IconComponent 
                        className="h-4 w-4" 
                        aria-hidden="true" 
                      />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* 
        ============================================
        MAIN CONTENT AREA
        ============================================
        Dynamic content area that adjusts based on
        sidebar collapsed/expanded state.
      */}
      <SidebarInset>
        {/* 
          Sticky Header
          - Shows current page title
          - Provides mobile sidebar toggle
          - Remains visible during scroll
        */}
        <header 
          className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6"
          role="banner"
        >
          {/* Mobile sidebar toggle (hidden on desktop) */}
          <SidebarTrigger 
            className="md:hidden" 
            aria-label="Toggle navigation menu"
          />
          
          {/* Page title - dynamically derived from current route */}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {[...menuItems, ...bottomMenuItems].find(item => item.href === pathname)?.label}
            </h1>
          </div>
        </header>

        {/* 
          Main Content Container
          - Primary content area for page components
          - Responsive padding for different screen sizes
        */}
        <main 
          className="flex-1 p-4 md:p-6"
          role="main"
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
