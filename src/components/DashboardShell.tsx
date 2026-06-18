"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Upload,
  History,
  Volume2,
  User,
  Settings,
  Menu,
  X,
  Activity,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    fullName?: string | null;
    email: string;
  };
};

type NavGroup = {
  label: string;
  links: { href: string; label: string; icon: typeof LayoutDashboard }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    links: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/upload", label: "Upload Result", icon: Upload },
      { href: "/history", label: "Report History", icon: History },
      { href: "/audio-reader", label: "Audio Reader", icon: Volume2 },
    ],
  },
  {
    label: "Account",
    links: [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function SidebarContent({
  pathname,
  onNavigate,
  user,
}: {
  pathname: string;
  onNavigate?: () => void;
  user: { fullName?: string | null; email: string };
}) {
  const displayName = user.fullName || user.email.split("@")[0];

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="h-16 px-5 border-b border-border flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Activity className="h-[18px] w-[18px]" />
        </span>
        <div className="flex flex-col">
          <span
            className="text-sm font-bold tracking-tight text-foreground leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Wasobi<span className="text-accent">Care</span>
          </span>
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
            Medical Lab AI
          </span>
        </div>
      </div>

      {/* User card */}
      <div className="mx-4 mt-5 mb-2 p-3.5 rounded-xl border border-border bg-background/50 flex items-center gap-3">
        <UserButton
          appearance={{
            elements: {
              avatarBox:
                "w-9 h-9 border-2 border-border",
            },
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate text-foreground leading-tight">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {user.email}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <span className="eyebrow px-3 block mb-2">{group.label}</span>
            <div className="space-y-0.5">
              {group.links.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/dashboard" && pathname.startsWith(href));

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/8 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-accent" />
                    )}
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] transition-colors",
                        isActive ? "text-accent" : "",
                      )}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-start gap-2 px-1">
          <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            For educational purposes only. Always consult a clinical provider.
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Theme
          </span>
          <ThemeToggle size="sm" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/80 backdrop-blur-md sticky top-0 h-screen shrink-0 z-30">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      {/* ─── Mobile Header ─── */}
      <header className="md:hidden sticky top-0 z-40 h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </span>
          <span
            className="text-sm font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Lab<span className="text-accent">Explain</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: { avatarBox: "w-8 h-8 border-2 border-border" },
            }}
          />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ─── Mobile Drawer ─── */}
      {mobileOpen && (
        <>
          {/* Scrim */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          {/* Drawer panel */}
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl slide-in-left">
            <SidebarContent
              pathname={pathname}
              user={user}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
