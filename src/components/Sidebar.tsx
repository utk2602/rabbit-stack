"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  GitPullRequestDraft
} from "lucide-react";
import { signOut } from "@/lib/auth-client";

interface SidebarProps {
  profile?: {
    login: string;
    avatarUrl: string;
    name?: string | null;
  } | null;
}

export function Sidebar({ profile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/repositories", label: "Repositories", icon: FolderGit2 },
    { href: "/dashboard/reviews", label: "Reviews", icon: GitPullRequestDraft },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside 
      className={`relative flex flex-col border-r border-border bg-card/50 backdrop-blur-xl transition-all duration-300 h-screen sticky top-0 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-border">
        {!isCollapsed && (
             <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Rabbit Stack</span>
            </Link>
        )}
        {isCollapsed && (
             <Link href="/dashboard" className="flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
            </Link>
        )}
        
        <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors absolute -right-3 top-6 bg-background border border-border z-50 hidden md:flex"
        >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? link.label : undefined}
            >
              <Icon size={20} />
              {!isCollapsed && <span className="text-sm font-medium">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {profile && (
        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <img 
              src={profile.avatarUrl} 
              alt={profile.login} 
              className="w-8 h-8 rounded-full"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.name || profile.login}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{profile.login}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/"; } } })}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
