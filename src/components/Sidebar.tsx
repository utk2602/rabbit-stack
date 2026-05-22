"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FolderGit2,
  GitPullRequestDraft,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { AnimatedWordmark } from "@/components/brand/animated-wordmark";
import { StatusPulse } from "@/components/ui/status-badge";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SidebarProps {
  profile?: {
    login: string;
    avatarUrl: string;
    name?: string | null;
  } | null;
}

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Review command center",
    icon: LayoutDashboard,
  },
  {
    href: "/repositories",
    label: "Repositories",
    description: "Connect and index repos",
    icon: FolderGit2,
  },
  {
    href: "/dashboard/reviews",
    label: "Reviews",
    description: "AI review history",
    icon: GitPullRequestDraft,
  },
  {
    href: "/dashboard/security",
    label: "Security",
    description: "Posture and events",
    icon: ShieldCheck,
  },
];

export function Sidebar({ profile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsCollapsed((current) => !current);

  return (
    <>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground backdrop-blur-xl transition-all duration-300 md:flex",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <div className="relative flex h-20 items-center border-b border-sidebar-border px-4">
          <Link
            href="/dashboard"
            className={cn(
              "flex min-w-0 items-center",
              isCollapsed ? "w-full justify-center" : "justify-start"
            )}
          >
            {isCollapsed ? (
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-primary/25 bg-primary text-primary-foreground shadow-[0_0_28px_rgba(124,247,200,0.18)]">
                <span className="font-brand text-lg font-black">R</span>
              </div>
            ) : (
              <AnimatedWordmark />
            )}
          </Link>

          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-7 z-50 hidden h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground md:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <div className={cn("px-3 py-4", isCollapsed && "px-2")}>
          <div
            className={cn(
              "mb-4 rounded-lg border border-primary/15 bg-primary/5 p-3",
              isCollapsed && "flex justify-center p-2"
            )}
          >
            {isCollapsed ? (
              <StatusPulse />
            ) : (
              <div className="flex items-center gap-3">
                <StatusPulse />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-primary">Reviewer online</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Watching connected PRs
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className={cn("flex-1 space-y-1 px-3", isCollapsed && "px-2")}>
          {links.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              label={link.label}
              description={link.description}
              icon={link.icon}
              pathname={pathname}
              collapsed={isCollapsed}
            />
          ))}
        </nav>

        <div className={cn("border-t border-sidebar-border p-4", isCollapsed && "px-2")}>
          {profile ? (
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <img
                src={profile.avatarUrl}
                alt={profile.login}
                className="h-9 w-9 rounded-lg border border-border"
              />
              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {profile.name || profile.login}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">@{profile.login}</p>
                  </div>
                  <SignOutButton />
                </>
              )}
            </div>
          ) : (
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-secondary">
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-medium">GitHub pending</p>
                  <p className="text-xs text-muted-foreground">Connect to unlock stats</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/90 px-4 backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard">
            <AnimatedWordmark compact />
          </Link>
          {profile && (
            <img
              src={profile.avatarUrl}
              alt={profile.login}
              className="h-8 w-8 rounded-lg border border-border"
            />
          )}
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-2xl backdrop-blur-xl md:hidden">
        {links.map((link) => (
          <MobileLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            pathname={pathname}
          />
        ))}
      </nav>
    </>
  );
}

function SidebarLink({
  href,
  label,
  description,
  icon: Icon,
  pathname,
  collapsed,
}: {
  href: string;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  pathname: string;
  collapsed: boolean;
}) {
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-all",
        isActive
          ? "border-primary/25 bg-primary/10 text-primary glow-ring"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-sidebar-accent hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && (
        <span className="min-w-0">
          <span className="block font-medium leading-none">{label}</span>
          <span className="mt-1 block truncate text-xs text-muted-foreground">
            {description}
          </span>
        </span>
      )}
    </Link>
  );
}

function MobileLink({
  href,
  label,
  icon: Icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  pathname: string;
}) {
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex h-12 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

function SignOutButton() {
  return (
    <button
      onClick={() => {
        toast.success("Signed out successfully");
        signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/";
            },
          },
        });
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-400/10 hover:text-rose-300"
      title="Sign out"
      aria-label="Sign out"
    >
      <LogOut size={16} />
    </button>
  );
}
