
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusSquare, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "My Requests", icon: Home },
  { href: "/submit-request", label: "Submit Request", icon: PlusSquare },
  { href: "/calendar", label: "Calendar View", icon: CalendarDays },
];

export function NavMenu({ orientation = "vertical" }: { orientation?: "vertical" | "horizontal" }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-2", orientation === "vertical" ? "flex-col" : "flex-row")}>
      {navItems.map((item) => (
        <Button
          key={item.href}
          asChild
          variant={pathname === item.href ? "secondary" : "ghost"}
          className="justify-start"
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
