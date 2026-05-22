"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Check,
  Clock3,
  DatabaseZap,
  FolderGit2,
  GitFork,
  Globe,
  Key,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  Repository,
  RepositoriesPage,
  useRepositories,
  useToggleRepositoryConnection,
} from "@/hooks/useRepositories";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/empty-state";
import { GlowPanel } from "@/components/ui/glow-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

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
  TypeScript: "bg-blue-400",
  JavaScript: "bg-yellow-300",
  Python: "bg-emerald-400",
  Java: "bg-orange-300",
  Go: "bg-cyan-300",
  Rust: "bg-orange-500",
  Ruby: "bg-rose-400",
  PHP: "bg-indigo-400",
  "C#": "bg-violet-400",
  "C++": "bg-pink-400",
  C: "bg-slate-400",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-400",
  Dart: "bg-sky-400",
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
  const [settingsRepo, setSettingsRepo] = useState<Repository | null>(null);
  const [reindexingRepoId, setReindexingRepoId] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useRepositories();

  const toggleConnection = useToggleRepositoryConnection();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const allRepos = useMemo((): Repository[] => {
    return data?.pages.flatMap((page: RepositoriesPage) => page.repos) ?? [];
  }, [data]);

  const languages = useMemo(() => {
    const langs = new Set<string>();
    allRepos.forEach((repo) => {
      if (repo.language) langs.add(repo.language);
    });
    return Array.from(langs).sort();
  }, [allRepos]);

  const filteredRepos = useMemo((): Repository[] => {
    return allRepos.filter((repo) => {
      const matchesSearch =
        searchQuery === "" ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesFilter =
        filter === "all" ||
        (filter === "connected" && repo.isConnected) ||
        (filter === "not-connected" && !repo.isConnected) ||
        (filter === "public" && !repo.isPrivate) ||
        (filter === "private" && repo.isPrivate);

      const matchesLanguage = !languageFilter || repo.language === languageFilter;

      return matchesSearch && matchesFilter && matchesLanguage;
    });
  }, [allRepos, filter, languageFilter, searchQuery]);

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
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

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
                description: "Webhook created successfully. AI code reviews are enabled.",
              });
            } else if (data.error) {
              toast.warning(`Connected ${repo.fullName}`, {
                id: `toggle-${repo.githubId}`,
                description: data.error.includes("development mode") ||
                  data.error.includes("localhost") ||
                  data.error.includes("WEBHOOK_URL")
                  ? "Set WEBHOOK_URL for automatic code reviews."
                  : `Webhook creation failed: ${data.error}`,
              });
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
        onError: (toggleError) => {
          console.error("Failed to toggle connection:", toggleError);
          toast.error(`Failed to ${action.toLowerCase()} ${repo.fullName}`, {
            id: `toggle-${repo.githubId}`,
            description:
              toggleError instanceof Error ? toggleError.message : "Please try again.",
          });
        },
      }
    );
  };

  const promptForApiKey = (
    repo: Repository,
    repoData: Omit<Repository, "isConnected">
  ) => {
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
              promptForApiKey(repo, repoData);
              return;
            }

            toast.success("API key saved", { id: `saving-key-${repo.githubId}` });
            performToggle(repo, repoData);
          } catch {
            toast.error("Failed to save API key. Please try again.", {
              id: `saving-key-${repo.githubId}`,
            });
            promptForApiKey(repo, repoData);
          }
        }}
        onCancel={() => {
          toast.dismiss(toastId);
          toast.error("Cannot proceed without an OpenAI API key", {
            description:
              "An API key is required for AI-powered code embeddings and reviews.",
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

  const handleToggleConnection = async (repo: Repository) => {
    const { isConnected, ...repoData } = repo;

    if (isConnected) {
      performToggle(repo, repoData);
      return;
    }

    try {
      const res = await fetch("/api/settings/openai-key");
      const keyData = await res.json();

      if (keyData.hasKey) {
        performToggle(repo, repoData);
        return;
      }
    } catch {
      // Prompt for the key if the optimistic pre-check fails.
    }

    promptForApiKey(repo, repoData);
  };

  const handleDisconnectAll = async () => {
    const connectedRepos = allRepos.filter((repo) => repo.isConnected);
    if (connectedRepos.length === 0) {
      toast.info("No connected repositories to disconnect.");
      return;
    }

    toast.loading(`Disconnecting ${connectedRepos.length} repositories...`, {
      id: "disconnect-all",
    });

    try {
      const response = await fetch("/api/repositories/connected/all", {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Please try again.");
      }

      toast.success("All repositories disconnected", {
        id: "disconnect-all",
        description: `Successfully disconnected ${result.disconnected} repositories.`,
      });
      window.location.reload();
    } catch (disconnectError) {
      toast.error("Failed to disconnect repositories", {
        id: "disconnect-all",
        description:
          disconnectError instanceof Error ? disconnectError.message : "Please try again.",
      });
    }
  };

  const handleReindex = async (repo: Repository) => {
    if (!repo.id) return;

    setReindexingRepoId(repo.id);
    toast.loading(`Queueing reindex for ${repo.fullName}...`, {
      id: `reindex-${repo.id}`,
    });

    try {
      const response = await fetch(`/api/repositories/${repo.id}/reindex`, {
        method: "POST",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to queue reindex");
      }

      toast.success(`Reindex queued for ${repo.fullName}`, {
        id: `reindex-${repo.id}`,
      });
      await refetch();
    } catch (reindexError) {
      toast.error("Failed to queue reindex", {
        id: `reindex-${repo.id}`,
        description:
          reindexError instanceof Error ? reindexError.message : "Please try again.",
      });
    } finally {
      setReindexingRepoId(null);
    }
  };

  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const connectedCount = allRepos.filter((repo) => repo.isConnected).length;
  const indexedCount = allRepos.filter((repo) => repo.indexingStatus === "completed").length;
  const failedIndexCount = allRepos.filter((repo) => repo.indexingStatus === "failed").length;
  const filterOptions: Array<{ value: FilterType; label: string; count?: number }> = [
    { value: "all", label: "All", count: allRepos.length },
    { value: "connected", label: "Connected", count: connectedCount },
    { value: "not-connected", label: "Available", count: allRepos.length - connectedCount },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  if (isLoading) {
    return <LoadingState label="Loading repositories..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load repositories"
        description={error?.message || "Something went wrong while reading GitHub repositories."}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FolderGit2}
        eyebrow="Repository control"
        title="Repositories"
        description="Connect GitHub repositories, configure review behavior, and monitor indexing readiness for AI code reviews."
        meta={
          <>
            <StatusBadge tone="info">{totalCount} total</StatusBadge>
            <StatusBadge tone="good">{connectedCount} connected</StatusBadge>
            <StatusBadge tone={failedIndexCount > 0 ? "warn" : "idle"}>
              {indexedCount} indexed
            </StatusBadge>
          </>
        }
        actions={
          connectedCount > 0 ? (
            <button
              onClick={handleDisconnectAll}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 text-sm font-medium text-rose-200 transition-colors hover:bg-rose-400/15"
            >
              <Trash2 className="h-4 w-4" />
              Disconnect All ({connectedCount})
            </button>
          ) : null
        }
      />

      <GlowPanel className="p-4" accent="cyan">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search repositories, owners, or descriptions..."
              containerClassName="w-full xl:max-w-xl"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SegmentedControl
                value={filter}
                options={filterOptions}
                onValueChange={setFilter}
                className="w-full sm:w-auto"
              />
              {languages.length > 0 && (
                <label className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={languageFilter || ""}
                    onChange={(event) => setLanguageFilter(event.target.value || null)}
                    className="h-10 w-full rounded-lg border border-border bg-secondary/70 pl-9 pr-9 text-sm text-muted-foreground outline-none transition-colors focus:border-primary sm:w-48"
                  >
                    <option value="">All languages</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredRepos.length} of {totalCount} repositories.
          </p>
        </div>
      </GlowPanel>

      {filteredRepos.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No repositories found"
          description="Try adjusting your search, connection filter, or language filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredRepos.map((repo) => (
            <RepositoryCard
              key={repo.githubId}
              repo={repo}
              onToggleConnection={() => handleToggleConnection(repo)}
              onSettingsClick={() => setSettingsRepo(repo)}
              onReindexClick={() => handleReindex(repo)}
              isToggling={toggleConnection.isPending}
              isReindexing={reindexingRepoId === repo.id}
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

      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-6">
          {isFetchingNextPage ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more...</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Scroll for more</span>
          )}
        </div>
      )}
    </div>
  );
}

function ApiKeyToastContent({
  repoName,
  onSubmit,
  onCancel,
}: {
  repoName: string;
  onSubmit: (apiKey: string) => void;
  onCancel: () => void;
}) {
  const [key, setKey] = useState("");

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm font-semibold">OpenAI API Key Required</p>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        To connect <span className="font-medium text-foreground">{repoName}</span>, enter
        your OpenAI API key. It powers code embeddings and AI review context.
      </p>
      <input
        type="password"
        placeholder="sk-..."
        value={key}
        onChange={(event) => setKey(event.target.value)}
        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Enter" && key.trim()) onSubmit(key.trim());
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => key.trim() && onSubmit(key.trim())}
          disabled={!key.trim()}
          className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          Save and connect
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function RepositoryCard({
  repo,
  onToggleConnection,
  onSettingsClick,
  onReindexClick,
  isToggling,
  isReindexing,
}: {
  repo: Repository;
  onToggleConnection: () => void;
  onSettingsClick: () => void;
  onReindexClick: () => void;
  isToggling: boolean;
  isReindexing: boolean;
}) {
  const languageColor = repo.language ? LANGUAGE_COLORS[repo.language] || "bg-zinc-400" : null;
  const canEditSettings = repo.isConnected && Boolean(repo.id);
  const indexingLabel = getIndexingLabel(repo);
  const IndexingIcon = getIndexingIcon(repo.indexingStatus);

  return (
    <GlowPanel interactive className="p-5" accent={repo.isConnected ? "primary" : "cyan"}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              {repo.isPrivate ? (
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-medium transition-colors hover:text-primary"
              >
                {repo.fullName}
              </a>
            </div>
            {repo.description && (
              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                {repo.description}
              </p>
            )}
          </div>

          <StatusBadge tone={repo.isConnected ? "good" : "idle"}>
            {repo.isConnected ? "Connected" : "Available"}
          </StatusBadge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {repo.language && (
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-full", languageColor)} />
              {repo.language}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" />
            {repo.stars.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" />
            {repo.forks.toLocaleString()}
          </span>
          {repo.isConnected && (
            <span
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1",
                getIndexingTone(repo.indexingStatus)
              )}
              title={repo.lastIndexError ?? indexingLabel}
            >
              <IndexingIcon
                className={cn(
                  "h-3.5 w-3.5 shrink-0",
                  repo.indexingStatus === "indexing" && "animate-spin"
                )}
              />
              <span className="truncate">{indexingLabel}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-4">
          <div className="flex items-center gap-2">
            {canEditSettings && (
              <>
                <IconButton
                  onClick={onReindexClick}
                  disabled={isReindexing}
                  label={`Reindex ${repo.fullName}`}
                >
                  <RefreshCw className={cn("h-4 w-4", isReindexing && "animate-spin")} />
                </IconButton>
                <IconButton onClick={onSettingsClick} label={`Review settings for ${repo.fullName}`}>
                  <Settings2 className="h-4 w-4" />
                </IconButton>
              </>
            )}
          </div>

          <button
            onClick={onToggleConnection}
            disabled={isToggling}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors disabled:opacity-60",
              repo.isConnected
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                : "border-border bg-secondary/70 text-foreground hover:border-primary/40 hover:bg-accent"
            )}
          >
            {repo.isConnected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {repo.isConnected ? "Connected" : "Connect"}
          </button>
        </div>
      </div>
    </GlowPanel>
  );
}

function IconButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/70 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-foreground disabled:opacity-60"
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function getIndexingLabel(repo: Repository) {
  switch (repo.indexingStatus) {
    case "completed":
      return `Indexed ${repo.indexedFileCount.toLocaleString()} files`;
    case "indexing":
      return "Indexing codebase";
    case "failed":
      return repo.lastIndexError ? `Index failed: ${repo.lastIndexError}` : "Indexing failed";
    default:
      return "Index pending";
  }
}

function getIndexingIcon(status: Repository["indexingStatus"]) {
  if (status === "completed") return DatabaseZap;
  if (status === "failed") return AlertCircle;
  if (status === "indexing") return Loader2;
  return Clock3;
}

function getIndexingTone(status: Repository["indexingStatus"]) {
  if (status === "completed") return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  if (status === "failed") return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  if (status === "indexing") return "border-cyan-400/20 bg-cyan-400/10 text-cyan-200";
  return "border-border bg-secondary/70 text-muted-foreground";
}

function ReviewSettingsModal({
  repo,
  onClose,
}: {
  repo: Repository;
  onClose: () => void;
}) {
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
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load review settings");
        }

        if (isMounted) {
          setSettings({
            mode: result.settings.mode,
            minimumSeverityToPost: result.settings.minimumSeverityToPost,
            customRules: result.settings.customRules ?? "",
            useRepositoryRules: result.settings.useRepositoryRules,
          });
        }
      } catch (loadError) {
        toast.error("Failed to load review settings", {
          description: loadError instanceof Error ? loadError.message : "Please try again.",
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
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save review settings");
      }

      toast.success("Review settings saved", {
        description: `${repo.fullName} will use the updated review profile.`,
      });
      onClose();
    } catch (saveError) {
      toast.error("Failed to save review settings", {
        description: saveError instanceof Error ? saveError.message : "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
      <GlowPanel className="max-h-[92vh] w-full max-w-2xl overflow-y-auto" accent="violet">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Review profile
              </span>
            </div>
            <h3 className="truncate text-lg font-semibold">{repo.fullName}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Tune how Rabbit Stack comments on this repository.
            </p>
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
          <LoadingState label="Loading settings..." />
        ) : (
          <div className="space-y-5 p-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Review mode</label>
              <SegmentedControl
                value={settings.mode}
                options={REVIEW_MODES}
                onValueChange={(mode) =>
                  setSettings((current) => ({ ...current, mode }))
                }
              />
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
                  className="h-10 w-full rounded-lg border border-border bg-secondary/70 px-3 text-sm outline-none transition-colors focus:border-primary"
                >
                  {SEVERITY_OPTIONS.map((severity) => (
                    <option key={severity.value} value={severity.value}>
                      {severity.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/50 px-4 py-3">
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
                className="w-full resize-y rounded-lg border border-border bg-secondary/70 px-3 py-2.5 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
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
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save settings
          </button>
        </div>
      </GlowPanel>
    </div>
  );
}
