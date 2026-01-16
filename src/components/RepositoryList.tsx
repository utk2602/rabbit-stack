"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRepositories, useToggleRepositoryConnection, Repository, RepositoriesPage } from "@/hooks/useRepositories";
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
  ChevronDown
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
    toggleConnection.mutate(
      { githubId: repo.githubId, repoData },
      {
        onSuccess: (data) => {
          if (data.isConnected) {
            if (data.webhookCreated) {
              console.log(`Repository ${repo.fullName} connected with webhook successfully.`);
            } else if (data.error) {
              // In development mode, just log the message (localhost webhooks are expected to fail)
              if (data.error.includes("development mode") || data.error.includes("localhost")) {
                console.log(`[Dev Mode] ${repo.fullName} connected. ${data.error}`);
              } else {
                // Production webhook failure - show alert
                alert(`Repository connected, but webhook creation failed: ${data.error}. Automatic code reviews may not work.`);
              }
            }
          }
        },
        onError: (error) => {
          console.error("Failed to toggle connection:", error);
          alert("Failed to update repository connection. Please try again.");
        }
      }
    );
  };

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="ml-3 text-zinc-400">Loading repositories...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load repositories</h3>
        <p className="text-zinc-400 text-sm">{error?.message || "Something went wrong"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Your Repositories</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {totalCount} total repositories • {filteredRepos.length} shown
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:border-zinc-700 transition-colors"
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
              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 py-1">
                {(["all", "connected", "not-connected", "public", "private"] as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-800 transition-colors flex items-center justify-between ${
                      filter === f ? "text-purple-400" : "text-zinc-300"
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
            className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:border-purple-500 transition-colors"
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
          <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No repositories found</h3>
          <p className="text-zinc-400 text-sm">Try adjusting your search or filters</p>
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
            <div className="flex items-center gap-2 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more...</span>
            </div>
          ) : (
            <span className="text-zinc-500 text-sm">Scroll for more</span>
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
    <div className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Repo Name */}
          <div className="flex items-center gap-2 mb-2">
            {repo.isPrivate ? (
              <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
            ) : (
              <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
            )}
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-white hover:text-purple-400 transition-colors truncate"
            >
              {repo.fullName}
            </a>
          </div>

          {/* Description */}
          {repo.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
              {repo.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
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
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
              : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-700"
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
