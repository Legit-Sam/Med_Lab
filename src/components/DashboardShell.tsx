"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { useT } from "@/lib/locale-context";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    fullName?: string | null;
    email: string;
  };
};

function NavGroups({ t }: { t: (key: string) => string }) {
  return [
    {
      label: t("nav.workspace"),
      links: [
        { href: "/dashboard", label: t("nav.overview"), icon: LayoutDashboard },
        { href: "/upload", label: t("nav.uploadResult"), icon: Upload },
        { href: "/history", label: t("nav.reportHistory"), icon: History },
        { href: "/audio-reader", label: t("nav.audioReader"), icon: Volume2 },
      ],
    },
    {
      label: t("nav.account"),
      links: [
        { href: "/profile", label: t("nav.profile"), icon: User },
        { href: "/settings", label: t("nav.settings"), icon: Settings },
      ],
    },
  ];
}

function UserMenu({ user }: { user: { fullName?: string | null; email: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { t } = useT();
  const displayName = user.fullName || user.email.split("@")[0];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border bg-background/50 hover:bg-muted/60 transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold truncate text-foreground leading-tight">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {user.email}
          </p>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-card border border-border rounded-xl shadow-lg p-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("nav.signOut")}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  user,
}: {
  pathname: string;
  onNavigate?: () => void;
  user: { fullName?: string | null; email: string };
}) {
  const { t } = useT();
  const navGroups = NavGroups({ t });

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
            {t("nav.brandFirst")}<span className="text-accent">{t("nav.brandLast")}</span>
          </span>
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
            {t("nav.brandSubtitle")}
          </span>
        </div>
      </div>

      {/* User card with menu */}
      <div className="mx-4 mt-5 mb-2">
        <UserMenu user={user} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
        {navGroups.map((group) => (
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
            {t("nav.footerDisclaimer")}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {t("nav.theme")}
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
  const { t } = useT();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/80 backdrop-blur-md sticky top-0 h-screen shrink-0 z-30">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      <header className="md:hidden sticky top-0 z-40 h-14 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </span>
          <span
            className="text-sm font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t("nav.mobileBrandFirst")}<span className="text-accent">{t("nav.mobileBrandLast")}</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t("nav.signOut")}
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t("nav.openMenu")}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl slide-in-left">
            <SidebarContent
              pathname={pathname}
              user={user}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
