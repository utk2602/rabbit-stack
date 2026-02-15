"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRepositories, useToggleRepositoryConnection, Repository, RepositoriesPage } from "@/hooks/useRepositories";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Star, 
  GitFork, 
  Lock, 
  Globe, 
  Loader2, 
  AlertCircle,
  Check,
  Plus,
  X,
  ChevronDown,
  Trash2
} from "lucide-react";

type FilterType = "all" | "connected" | "not-connected" | "public" | "private";
type LanguageFilter = string | null;

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Java: "bg-orange-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-600",
  Ruby: "bg-red-500",
  PHP: "bg-indigo-500",
  "C#": "bg-purple-500",
  "C++": "bg-pink-500",
  C: "bg-gray-500",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-400",
  Dart: "bg-blue-400",
  HTML: "bg-red-400",
  CSS: "bg-blue-300",
  Shell: "bg-green-400",
  Vue: "bg-emerald-500",
  Svelte: "bg-orange-500",
};

export function RepositoryList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useRepositories();

  const toggleConnection = useToggleRepositoryConnection();

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Flatten all pages into a single array
  const allRepos = useMemo((): Repository[] => {
    return data?.pages.flatMap((page: RepositoriesPage) => page.repos) ?? [];
  }, [data]);

  // Get unique languages for filter
  const languages = useMemo(() => {
    const langs = new Set<string>();
    allRepos.forEach((repo: Repository) => {
      if (repo.language) langs.add(repo.language);
    });
    return Array.from(langs).sort();
  }, [allRepos]);

  // Apply filters
  const filteredRepos = useMemo((): Repository[] => {
    return allRepos.filter((repo: Repository) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      // Status filter
      let matchesFilter = true;
      switch (filter) {
        case "connected":
          matchesFilter = repo.isConnected;
          break;
        case "not-connected":
          matchesFilter = !repo.isConnected;
          break;
        case "public":
          matchesFilter = !repo.isPrivate;
          break;
        case "private":
          matchesFilter = repo.isPrivate;
          break;
      }

      // Language filter
      const matchesLanguage = !languageFilter || repo.language === languageFilter;

      return matchesSearch && matchesFilter && matchesLanguage;
    });
  }, [allRepos, searchQuery, filter, languageFilter]);

  const handleToggleConnection = (repo: Repository) => {
    const { isConnected, ...repoData } = repo;
    const action = isConnected ? "Disconnecting" : "Connecting";
    
    toast.loading(`${action} ${repo.fullName}...`, { id: `toggle-${repo.githubId}` });
    
    toggleConnection.mutate(
      { githubId: repo.githubId, repoData },
      {
        onSuccess: (data) => {
          if (data.isConnected) {
            if (data.webhookCreated) {
              toast.success(`Connected ${repo.fullName}`, {
                id: `toggle-${repo.githubId}`,
                description: "Webhook created successfully. AI code reviews are enabled!",
              });
            } else if (data.error) {
              // In development mode, show info toast
              if (data.error.includes("development mode") || data.error.includes("localhost") || data.error.includes("WEBHOOK_URL")) {
                toast.success(`Connected ${repo.fullName}`, {
                  id: `toggle-${repo.githubId}`,
                  description: "Set WEBHOOK_URL for automatic code reviews.",
                });
              } else {
                // Production webhook failure
                toast.warning(`Connected ${repo.fullName}`, {
                  id: `toggle-${repo.githubId}`,
                  description: `Webhook creation failed: ${data.error}`,
                });
              }
            } else {
              toast.success(`Connected ${repo.fullName}`, {
                id: `toggle-${repo.githubId}`,
              });
            }
          } else {
            toast.success(`Disconnected ${repo.fullName}`, {
              id: `toggle-${repo.githubId}`,
              description: "Webhook removed and AI reviews disabled.",
            });
          }
        },
        onError: (error) => {
          console.error("Failed to toggle connection:", error);
          toast.error(`Failed to ${action.toLowerCase()} ${repo.fullName}`, {
            id: `toggle-${repo.githubId}`,
            description: error instanceof Error ? error.message : "Please try again.",
          });
        }
      }
    );
  };

  // Disconnect all repositories
  const handleDisconnectAll = async () => {
    const connectedRepos = allRepos.filter((r) => r.isConnected);
    if (connectedRepos.length === 0) {
      toast.info("No connected repositories to disconnect.");
      return;
    }

    toast.loading(`Disconnecting ${connectedRepos.length} repositories...`, { id: "disconnect-all" });

    try {
      const response = await fetch("/api/repositories/connected/all", {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("All repositories disconnected", {
          id: "disconnect-all",
          description: `Successfully disconnected ${data.disconnected} repositories.`,
        });
        // Refetch repositories to update the UI
        window.location.reload();
      } else {
        toast.error("Failed to disconnect repositories", {
          id: "disconnect-all",
          description: data.error || "Please try again.",
        });
      }
    } catch (error) {
      toast.error("Failed to disconnect repositories", {
        id: "disconnect-all",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const connectedCount = allRepos.filter((r) => r.isConnected).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-3 text-muted-foreground">Loading repositories...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load repositories</h3>
        <p className="text-muted-foreground text-sm">{error?.message || "Something went wrong"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Repositories</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} total repositories • {connectedCount} connected • {filteredRepos.length} shown
          </p>
        </div>
        {connectedCount > 0 && (
          <button
            onClick={handleDisconnectAll}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:border-red-500/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Disconnect All ({connectedCount})
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary border border-border rounded-lg text-muted-foreground hover:border-accent transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="capitalize">{filter.replace("-", " ")}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showFilterDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowFilterDropdown(false)} 
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-xl z-20 py-1">
                {(["all", "connected", "not-connected", "public", "private"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between ${
                      filter === f ? "text-orange-500" : "text-foreground"
                    }`}
                  >
                    <span className="capitalize">{f.replace("-", " ")}</span>
                    {filter === f && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Language Filter */}
        {languages.length > 0 && (
          <select
            value={languageFilter || ""}
            onChange={(e) => setLanguageFilter(e.target.value || null)}
            className="px-4 py-2.5 bg-secondary border border-border rounded-lg text-muted-foreground focus:outline-none focus:border-orange-500 transition-colors"
          >
            <option value="">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Repository Grid */}
      {filteredRepos.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No repositories found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map((repo: Repository) => (
            <RepositoryCard
              key={repo.githubId}
              repo={repo}
              onToggleConnection={() => handleToggleConnection(repo)}
              isToggling={toggleConnection.isPending}
            />
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-6">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more...</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Scroll for more</span>
          )}
        </div>
      )}
    </div>
  );
}

interface RepositoryCardProps {
  repo: Repository;
  onToggleConnection: () => void;
  isToggling: boolean;
}

function RepositoryCard({ repo, onToggleConnection, isToggling }: RepositoryCardProps) {
  const languageColor = repo.language ? LANGUAGE_COLORS[repo.language] || "bg-zinc-500" : null;

  return (
    <div className="group bg-card/50 border border-border rounded-xl p-5 hover:border-accent hover:bg-card/80 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Repo Name */}
          <div className="flex items-center gap-2 mb-2">
            {repo.isPrivate ? (
              <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-orange-500 transition-colors truncate"
            >
              {repo.fullName}
            </a>
          </div>

          {/* Description */}
          {repo.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {repo.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${languageColor}`} />
                <span>{repo.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              <span>{repo.stars.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5" />
              <span>{repo.forks.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <button
          onClick={onToggleConnection}
          disabled={isToggling}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            repo.isConnected
              ? "bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 hover:bg-orange-500/30"
              : "bg-secondary border border-border hover:border-accent hover:bg-accent"
          }`}
        >
          {repo.isConnected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Connected
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Connect
            </>
          )}
        </button>
      </div>
    </div>
  );
}
