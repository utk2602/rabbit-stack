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
  Trash2,
  Key,
  Settings2,
  ShieldCheck
} from "lucide-react";

type FilterType = "all" | "connected" | "not-connected" | "public" | "private";
type LanguageFilter = string | null;
type ReviewMode = "balanced" | "security" | "performance" | "style" | "strict";
type ReviewSeverity = "info" | "warning" | "error";

interface ReviewSettings {
  mode: ReviewMode;
  minimumSeverityToPost: ReviewSeverity;
  customRules: string | null;
  useRepositoryRules: boolean;
}

const REVIEW_MODES: Array<{ value: ReviewMode; label: string }> = [
  { value: "balanced", label: "Balanced" },
  { value: "security", label: "Security" },
  { value: "performance", label: "Performance" },
  { value: "style", label: "Style" },
  { value: "strict", label: "Strict" },
];

const SEVERITY_OPTIONS: Array<{ value: ReviewSeverity; label: string }> = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
];

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Java: "bg-primary",
  Go: "bg-cyan-500",
  Rust: "bg-primary/80",
  Ruby: "bg-red-500",
  PHP: "bg-indigo-500",
  "C#": "bg-purple-500",
  "C++": "bg-pink-500",
  C: "bg-gray-500",
  Swift: "bg-primary/60",
  Kotlin: "bg-purple-400",
  Dart: "bg-blue-400",
  HTML: "bg-red-400",
  CSS: "bg-blue-300",
  Shell: "bg-green-400",
  Vue: "bg-emerald-500",
  Svelte: "bg-primary",
};

export function RepositoryList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [settingsRepo, setSettingsRepo] = useState<Repository | null>(null);
  
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

  const handleToggleConnection = async (repo: Repository) => {
    const { isConnected, ...repoData } = repo;

    // If disconnecting, no need for API key check
    if (isConnected) {
      performToggle(repo, repoData);
      return;
    }

    // Check if user already has an API key saved
    try {
      const res = await fetch("/api/settings/openai-key");
      const data = await res.json();

      if (data.hasKey) {
        // Key already saved — proceed
        performToggle(repo, repoData);
        return;
      }
    } catch {
      // If check fails, still prompt for key to be safe
    }

    // Prompt for OpenAI API key via a persistent toast with input
    promptForApiKey(repo, repoData);
  };

  const promptForApiKey = (repo: Repository, repoData: Omit<Repository, "isConnected">) => {
    const toastId = `api-key-${repo.githubId}`;
    toast(
      <ApiKeyToastContent
        repoName={repo.fullName}
        onSubmit={async (apiKey) => {
          toast.dismiss(toastId);

          toast.loading("Saving API key...", { id: `saving-key-${repo.githubId}` });

          try {
            const res = await fetch("/api/settings/openai-key", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ apiKey }),
            });
            const result = await res.json();

            if (!res.ok) {
              toast.error(result.error || "Invalid API key", {
                id: `saving-key-${repo.githubId}`,
              });
              // Re-prompt
              promptForApiKey(repo, repoData);
              return;
            }

            toast.success("API key saved!", { id: `saving-key-${repo.githubId}` });
            performToggle(repo, repoData);
          } catch (err) {
            toast.error("Failed to save API key. Please try again.", {
              id: `saving-key-${repo.githubId}`,
            });
            promptForApiKey(repo, repoData);
          }
        }}
        onCancel={() => {
          toast.dismiss(toastId);
          toast.error("Cannot proceed without an OpenAI API key", {
            description: "An API key is required for AI-powered code embeddings and reviews.",
            duration: 5000,
          });
        }}
      />,
      {
        id: toastId,
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  const performToggle = (repo: Repository, repoData: Omit<Repository, "isConnected">) => {
    const action = repo.isConnected ? "Disconnecting" : "Connecting";
    
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
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
                      filter === f ? "text-primary" : "text-foreground"
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
            className="px-4 py-2.5 bg-secondary border border-border rounded-lg text-muted-foreground focus:outline-none focus:border-primary transition-colors"
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
              onSettingsClick={() => setSettingsRepo(repo)}
              isToggling={toggleConnection.isPending}
            />
          ))}
        </div>
      )}

      {settingsRepo && (
        <ReviewSettingsModal
          repo={settingsRepo}
          onClose={() => setSettingsRepo(null)}
        />
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

interface ApiKeyToastContentProps {
  repoName: string;
  onSubmit: (apiKey: string) => void;
  onCancel: () => void;
}

function ApiKeyToastContent({ repoName, onSubmit, onCancel }: ApiKeyToastContentProps) {
  const [key, setKey] = useState("");

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <Key className="w-4 h-4 text-primary shrink-0" />
        <p className="font-semibold text-sm">OpenAI API Key Required</p>
      </div>
      <p className="text-xs text-muted-foreground">
        To connect <span className="font-medium text-foreground">{repoName}</span>, enter your OpenAI API key. It powers code embeddings for AI reviews.
      </p>
      <input
        type="password"
        placeholder="sk-..."
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && key.trim()) onSubmit(key.trim());
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => key.trim() && onSubmit(key.trim())}
          disabled={!key.trim()}
          className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors"
        >
          Save & Connect
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-accent transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface RepositoryCardProps {
  repo: Repository;
  onToggleConnection: () => void;
  onSettingsClick: () => void;
  isToggling: boolean;
}

function RepositoryCard({ repo, onToggleConnection, onSettingsClick, isToggling }: RepositoryCardProps) {
  const languageColor = repo.language ? LANGUAGE_COLORS[repo.language] || "bg-zinc-500" : null;
  const canEditSettings = repo.isConnected && Boolean(repo.id);

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
              className="font-medium hover:text-primary transition-colors truncate"
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
        <div className="flex shrink-0 items-center gap-2">
          {canEditSettings && (
            <button
              onClick={onSettingsClick}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-accent hover:bg-accent hover:text-foreground"
              title="Review settings"
              aria-label={`Review settings for ${repo.fullName}`}
            >
              <Settings2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onToggleConnection}
            disabled={isToggling}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              repo.isConnected
                ? "bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
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
    </div>
  );
}

interface ReviewSettingsModalProps {
  repo: Repository;
  onClose: () => void;
}

function ReviewSettingsModal({ repo, onClose }: ReviewSettingsModalProps) {
  const [settings, setSettings] = useState<ReviewSettings>({
    mode: "balanced",
    minimumSeverityToPost: "warning",
    customRules: "",
    useRepositoryRules: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      if (!repo.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/repositories/${repo.id}/review-settings`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load review settings");
        }

        if (isMounted) {
          setSettings({
            mode: data.settings.mode,
            minimumSeverityToPost: data.settings.minimumSeverityToPost,
            customRules: data.settings.customRules ?? "",
            useRepositoryRules: data.settings.useRepositoryRules,
          });
        }
      } catch (error) {
        toast.error("Failed to load review settings", {
          description: error instanceof Error ? error.message : "Please try again.",
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [repo.id]);

  const saveSettings = async () => {
    if (!repo.id) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/repositories/${repo.id}/review-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save review settings");
      }

      toast.success("Review settings saved", {
        description: `${repo.fullName} will use the updated review profile.`,
      });
      onClose();
    } catch (error) {
      toast.error("Failed to save review settings", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">Review profile</span>
            </div>
            <h3 className="truncate text-lg font-semibold">{repo.fullName}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close review settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-10 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading settings...
          </div>
        ) : (
          <div className="space-y-5 p-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Review mode</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {REVIEW_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setSettings((current) => ({ ...current, mode: mode.value }))}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      settings.mode === mode.value
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:border-accent hover:text-foreground"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="block text-sm font-medium">Minimum posted severity</span>
                <select
                  value={settings.minimumSeverityToPost}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      minimumSeverityToPost: event.target.value as ReviewSeverity,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
                >
                  {SEVERITY_OPTIONS.map((severity) => (
                    <option key={severity.value} value={severity.value}>
                      {severity.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary px-4 py-3">
                <span className="text-sm font-medium">Use repo rules file</span>
                <input
                  type="checkbox"
                  checked={settings.useRepositoryRules}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      useRepositoryRules: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-primary"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="block text-sm font-medium">Custom review rules</span>
              <textarea
                value={settings.customRules ?? ""}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    customRules: event.target.value,
                  }))
                }
                rows={7}
                placeholder="Example: Flag missing authorization checks on API routes. Prefer small, focused comments over broad style feedback."
                className="w-full resize-y rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
            </label>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border p-5">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={saveSettings}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
