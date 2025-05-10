
import { ReactNode } from "react";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/50">
      <Header />
      <main className="flex-grow container py-8">
        {children}
      </main>
      <Toaster />
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} DayOff Tracker. All rights reserved.
      </footer>
    </div>
  );
}
