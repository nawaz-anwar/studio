import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, Menu, CalendarCheck, FilePieChart, ReceiptText, ListTodo, Shield, LogOut } from 'lucide-react';
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
import NavLink from './_components/nav-link';
import UserMenu from './_components/user-menu';

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
                <NavLink href="/expenses">
                    <ReceiptText />
                    <span>Expenses</span>
                </NavLink>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <NavLink href="/tasks">
                    <ListTodo />
                    <span>Tasks</span>
                </NavLink>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <NavLink href="/reports">
                    <FilePieChart />
                    <span>Reports</span>
                </NavLink>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <NavLink href="/admins">
                <Shield />
                <span>Admins</span>
              </NavLink>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
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
                 <NavLink href="/expenses" isMobile>
                    <ReceiptText className="h-5 w-5" />
                    Expenses
                </NavLink>
                 <NavLink href="/tasks" isMobile>
                    <ListTodo className="h-5 w-5" />
                    Tasks
                </NavLink>
                <NavLink href="/reports" isMobile>
                    <FilePieChart className="h-5 w-5" />
                    Reports
                </NavLink>
                 <NavLink href="/admins" isMobile>
                    <Shield className="h-5 w-5" />
                    Admins
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
