import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, FileText, Menu, CalendarCheck, FilePieChart } from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NavLink from './_components/nav-link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Master Crete Logo" width={40} height={40} className="rounded-full" data-ai-hint="logo" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
                Master Crete
              </span>
              <span className="text-xs text-sidebar-foreground/70">
                Master Crete Building Contracting LLC
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <NavLink href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavLink href="/employees">
                <Users />
                <span>Employees</span>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <NavLink href="/attendance">
                    <CalendarCheck />
                    <span>Attendance</span>
                </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <NavLink href="/payroll">
                <FileText />
                <span>Payroll</span>
              </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <NavLink href="/reports">
                    <FilePieChart />
                    <span>Reports</span>
                </NavLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto w-full justify-start gap-3 p-2">
                <Avatar className="size-8">
                  <AvatarImage src="https://picsum.photos/100" alt="Admin" data-ai-hint="person avatar" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-sidebar-foreground">Admin</span>
                  <span className="text-xs text-sidebar-foreground/70">admin@creteflow.com</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@creteflow.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="relative z-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground"
                >
                  <Image src="/logo.png" alt="Master Crete Logo" width={32} height={32} className="rounded-full" data-ai-hint="logo" />
                  <span className="sr-only">Master Crete</span>
                </Link>
                <NavLink href="/dashboard" isMobile>
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                </NavLink>
                <NavLink href="/employees" isMobile>
                    <Users className="h-5 w-5" />
                    Employees
                </NavLink>
                <NavLink href="/attendance" isMobile>
                    <CalendarCheck className="h-5 w-5" />
                    Attendance
                </NavLink>
                <NavLink href="/payroll" isMobile>
                    <FileText className="h-5 w-5" />
                    Payroll
                </NavLink>
                <NavLink href="/reports" isMobile>
                    <FilePieChart className="h-5 w-5" />
                    Reports
                </NavLink>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">
             {/* Can add search here later */}
          </div>
          <SidebarTrigger className="hidden lg:flex"/>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
