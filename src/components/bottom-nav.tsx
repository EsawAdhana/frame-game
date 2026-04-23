"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Home, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/compose", label: "Post", icon: Plus, primary: true },
  { href: "/settings", label: "You", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="sticky bottom-0 z-10 mt-auto grid grid-cols-4 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm"
      aria-label="Primary"
    >
      {items.map(({ href, label, icon: Icon, primary }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full",
                primary && "bg-primary text-primary-foreground",
                !primary && active && "bg-muted",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
