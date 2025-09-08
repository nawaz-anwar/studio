

import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, Menu, CalendarCheck, FilePieChart, ReceiptText, ListTodo, Shield } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import NavLink from './_components/nav-link';
import UserMenu from './_components/user-menu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Image src="https://storage.googleapis.com/aai-web-samples/logo-1722271285375.png" alt="Master Crete Logo" width={40} height={40} data-ai-hint="logo" />
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
            <SheetContent side="left" className="sm:max-w-xs flex flex-col p-0">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <SidebarHeader>
                    <div className="flex items-center gap-2">
                        <Image src="https://storage.googleapis.com/aai-web-samples/logo-1722271285375.png" alt="Master Crete Logo" width={40} height={40} data-ai-hint="logo" />
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
                            <NavLink href="/dashboard" isMobile>
                                <LayoutDashboard className="h-5 w-5" />
                                Dashboard
                            </NavLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <NavLink href="/employees" isMobile>
                                <Users className="h-5 w-5" />
                                Employees
                            </NavLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <NavLink href="/attendance" isMobile>
                                <CalendarCheck className="h-5 w-5" />
                                Attendance
                            </NavLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <NavLink href="/expenses" isMobile>
                                <ReceiptText className="h-5 w-5" />
                                Expenses
                            </NavLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <NavLink href="/tasks" isMobile>
                                <ListTodo className="h-5 w-5" />
                                Tasks
                            </NavLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <NavLink href="/reports" isMobile>
                                <FilePieChart className="h-5 w-5" />
                                Reports
                            </NavLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <NavLink href="/admins" isMobile>
                                <Shield className="h-5 w-5" />
                                Admins
                            </NavLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                 <SidebarFooter>
                    <UserMenu />
                </SidebarFooter>
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">
             {/* Can add search here later */}
          </div>
          <SidebarTrigger className="hidden lg:flex"/>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
