"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Repository {
  githubId: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  isPrivate: boolean;
  isConnected: boolean;
}

export interface RepositoriesPage {
  repos: Repository[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

export interface ConnectedRepository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  language: string | null;
  isPrivate: boolean;
}

export interface ConnectedReposResponse {
  count: number;
  repositories: ConnectedRepository[];
}

async function fetchRepositories(cursor?: string | null): Promise<RepositoriesPage> {
  const params = new URLSearchParams();
  if (cursor) {
    params.set("cursor", cursor);
  }
  params.set("limit", "20");

  const response = await fetch(`/api/repositories?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch repositories");
  }

  return response.json();
}

async function fetchConnectedRepositories(): Promise<ConnectedReposResponse> {
  const response = await fetch("/api/repositories/connected");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch connected repositories");
  }

  return response.json();
}

async function toggleConnection(
  githubId: number,
  repoData: Omit<Repository, "isConnected">
): Promise<{ isConnected: boolean }> {
  const response = await fetch("/api/repositories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ githubId, repoData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to toggle connection");
  }

  return response.json();
}

export function useRepositories() {
  return useInfiniteQuery({
    queryKey: ["repositories"],
    queryFn: ({ pageParam }) => fetchRepositories(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? lastPage.pageInfo.endCursor : undefined,
    staleTime: 1000 * 60 * 5, 
  });
}

export function useConnectedRepositories() {
  return useQuery({
    queryKey: ["repositories", "connected"],
    queryFn: fetchConnectedRepositories,
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleRepositoryConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      githubId,
      repoData,
    }: {
      githubId: number;
      repoData: Omit<Repository, "isConnected">;
    }) => toggleConnection(githubId, repoData),
    onMutate: async ({ githubId }) => {
      await queryClient.cancelQueries({ queryKey: ["repositories"] });
      const previousData = queryClient.getQueryData(["repositories"]);
      queryClient.setQueryData(["repositories"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: RepositoriesPage) => ({
            ...page,
            repos: page.repos.map((repo: Repository) =>
              repo.githubId === githubId
                ? { ...repo, isConnected: !repo.isConnected }
                : repo
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["repositories"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
  });
}
