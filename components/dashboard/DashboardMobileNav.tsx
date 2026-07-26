"use client";

import Link from "next/link";
import { Box, Home, MessageSquareText, Newspaper, Settings } from "lucide-react";

const links = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Feed", href: "/dashboard/feed", icon: Newspaper },
  { label: "Items", href: "/dashboard/items", icon: Box },
  { label: "Chats", href: "/dashboard/messages", icon: MessageSquareText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardMobileNav({ active }: { active: string }) {
  return (
    <nav className="mobile-bottom-nav dashboard-bottom-nav" aria-label="Dashboard shortcuts">
      {links.map(({ label, href, icon: Icon }) => {
        const current = href === "/dashboard"
          ? active === href
          : active === href || active.startsWith(`${href}/`);
        return (
          <Link href={href} className={current ? "active" : ""} aria-current={current ? "page" : undefined} key={href}>
            <Icon size={20} strokeWidth={1.9} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
