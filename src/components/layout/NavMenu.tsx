
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, CalendarDays, ClipboardCheck, VenetianMask, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const baseNavItems = [
  { href: "/", label: "My Requests", icon: Home, adminOnly: false },
  { href: "/submit-request", label: "Submit Request", icon: PlusSquare, adminOnly: false },
  { href: "/calendar", label: "Calendar View", icon: CalendarDays, adminOnly: false },
];

const adminNavItems = [
  { href: "/admin/approvals", label: "Manage Approvals", icon: ClipboardCheck, adminOnly: true },
  { href: "/admin/holidays", label: "Manage public holidays", icon: VenetianMask, adminOnly: true },
  { href: "/admin/users", label: "Manage Users", icon: Users, adminOnly: true },
];

export function NavMenu({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const allNavItems = user?.role === 'admin' ? [...baseNavItems, ...adminNavItems] : baseNavItems;
  
  const navItemsToDisplay = allNavItems.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });


  return (
    <nav className={cn("flex gap-2", orientation === "vertical" ? "flex-col" : "flex-row")}>
      {navItemsToDisplay.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn("justify-start", orientation === "vertical" ? "w-full" : "")}
        >
          <Link href={item.href} className="flex items-center gap-2">
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );
}

