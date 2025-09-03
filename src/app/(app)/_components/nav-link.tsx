'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export default function NavLink({ href, children, isMobile }: { href: string; children: React.ReactNode; isMobile?: boolean; }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  if (isMobile) {
    return (
        <Link href={href} className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", isActive && "text-foreground")}>
            {children}
        </Link>
    )
  }

  return (
    <SidebarMenuButton asChild isActive={isActive}>
      <Link href={href}>
        {children}
      </Link>
    </SidebarMenuButton>
  );
}
