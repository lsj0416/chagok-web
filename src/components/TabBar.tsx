"use client";

import { CalendarCheck, Flag, House, NotebookText, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/today", label: "오늘", icon: CalendarCheck },
  { href: "/village", label: "마을", icon: House },
  { href: "/goals", label: "목표", icon: Flag },
  { href: "/records", label: "기록", icon: NotebookText },
];

/** 하단 탭. 하단 탭 화면(S02, S05, S08, S13)에서만 쓴다 */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="주요 화면" className="border-t border-line bg-surface pb-(--safe-bottom)">
      <ul className="grid h-(--tab-bar-height) grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] ${
                  active ? "font-semibold text-ink" : "text-ink-3"
                }`}
              >
                <Icon aria-hidden size={22} strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
