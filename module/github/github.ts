import { db } from "../../lib/db";
import { Octokit } from "octokit";
import crypto from "crypto";

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
const GITHUB_REST_API = "https://api.github.com";

const WEBHOOK_EVENTS = [
  "push",
  "pull_request",
  "pull_request_review",
  "pull_request_review_comment",
  "issue_comment",
  "commit_comment",
];

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function getGithubToken(userId: string): Promise<string | null> {
  const account = await db.account.findFirst({
    where: {
      userId: userId,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  return account?.accessToken ?? null;
}
const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoryContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
        commitContributionsByRepository {
          repository {
            name
            owner {
              login
            }
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

export interface ContributionDay {
  contributionCount: number;
  date: string;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface RepositoryContribution {
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  contributions: {
    totalCount: number;
  };
}

export interface ContributionsCollection {
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalRepositoryContributions: number;
  contributionCalendar: ContributionCalendar;
  commitContributionsByRepository: RepositoryContribution[];
}

export interface UserContributions {
  user: {
    contributionsCollection: ContributionsCollection;
  };
}
export async function fetchUserContributions(
  userId: string,
  username: string,
  from?: string,
  to?: string
): Promise<ContributionsCollection | null> {
  const accessToken = await getGithubToken(userId);

  if (!accessToken) {
    throw new Error("GitHub access token not found for user");
  }

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const fromDate = from ?? oneYearAgo.toISOString();
  const toDate = to ?? now.toISOString();

  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: {
        username,
        from: fromDate,
        to: toDate,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data?: UserContributions;
    errors?: Array<{ message: string }>;
  };

  if (data.errors) {
    throw new Error(`GitHub GraphQL error: ${data.errors[0].message}`);
  }

  return data.data?.user.contributionsCollection ?? null;
}


export async function getContributionStats(userId: string, username: string) {
  const contributions = await fetchUserContributions(userId, username);

  if (!contributions) {
    return null;
  }

  return {
    totalCommits: contributions.totalCommitContributions,
    totalIssues: contributions.totalIssueContributions,
    totalPullRequests: contributions.totalPullRequestContributions,
    totalReviews: contributions.totalPullRequestReviewContributions,
    totalRepositories: contributions.totalRepositoryContributions,
    totalContributions: contributions.contributionCalendar.totalContributions,
    topRepositories: contributions.commitContributionsByRepository
      .sort((a, b) => b.contributions.totalCount - a.contributions.totalCount)
      .slice(0, 5)
      .map((repo) => ({
        name: `${repo.repository.owner.login}/${repo.repository.name}`,
        commits: repo.contributions.totalCount,
      })),
  };
}

export interface MonthlyStats {
  month: string; 
  year: number;
  monthName: string;
  totalContributions: number;
  averagePerDay: number;
  maxDayContributions: number;
  activeDays: number;
}


export async function getMonthlyActivityStats(
  userId: string,
  username: string,
  from?: string,
  to?: string
): Promise<MonthlyStats[] | null> {
  const contributions = await fetchUserContributions(userId, username, from, to);

  if (!contributions) {
    return null;
  }

  const monthlyMap = new Map<string, {
    contributions: number[];
    month: string;
    year: number;
    monthName: string;
  }>();

  contributions.contributionCalendar.weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        monthlyMap.set(monthKey, {
          contributions: [],
          month: monthKey,
          year: date.getFullYear(),
          monthName: monthNames[date.getMonth()],
        });
      }
      
      monthlyMap.get(monthKey)!.contributions.push(day.contributionCount);
    });
  });

  const monthlyStats: MonthlyStats[] = Array.from(monthlyMap.values()).map((monthData) => {
    const totalContributions = monthData.contributions.reduce((sum, count) => sum + count, 0);
    const activeDays = monthData.contributions.filter((count) => count > 0).length;
    const maxDayContributions = Math.max(...monthData.contributions);
    const averagePerDay = monthData.contributions.length > 0 
      ? totalContributions / monthData.contributions.length 
      : 0;

    return {
      month: monthData.month,
      year: monthData.year,
      monthName: monthData.monthName,
      totalContributions,
      averagePerDay: Math.round(averagePerDay * 100) / 100,
      maxDayContributions,
      activeDays,
    };
  });

  return monthlyStats.sort((a, b) => b.month.localeCompare(a.month));
}


const USER_PROFILE_QUERY = `
  query {
    viewer {
      login
      name
      email
      avatarUrl
      bio
      company
      location
    }
  }
`;

export interface GitHubProfile {
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
}

export async function getGithubProfile(userId: string): Promise<GitHubProfile | null> {
  const accessToken = await getGithubToken(userId);

  if (!accessToken) {
    throw new Error("GitHub access token not found for user");
  }

  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: USER_PROFILE_QUERY,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data?: { viewer: GitHubProfile };
    errors?: Array<{ message: string }>;
  };

  if (data.errors) {
    throw new Error(`GitHub GraphQL error: ${data.errors[0].message}`);
  }

  return data.data?.viewer ?? null;
}

export async function getUserContributionsByUserId(
  userId: string,
  from?: string,
  to?: string
): Promise<ContributionsCollection | null> {
  const profile = await getGithubProfile(userId);

  if (!profile) {
    return null;
  }

  return fetchUserContributions(userId, profile.login, from, to);
}


export async function getContributionStatsByUserId(userId: string) {
  const profile = await getGithubProfile(userId);

  if (!profile) {
    return null;
  }

  return getContributionStats(userId, profile.login);
}


export async function getMonthlyActivityStatsByUserId(
  userId: string,
  from?: string,
  to?: string
): Promise<MonthlyStats[] | null> {
  const profile = await getGithubProfile(userId);

  if (!profile) {
    return null;
  }

  return getMonthlyActivityStats(userId, profile.login, from, to);
}

const REPOS_QUERY = `
  query($cursor: String, $first: Int!) {
    viewer {
      repositories(
        first: $first, 
        after: $cursor, 
        orderBy: {field: UPDATED_AT, direction: DESC},
        ownerAffiliations: [OWNER]
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
        nodes {
          databaseId
          name
          nameWithOwner
          description
          url
          isPrivate
          primaryLanguage {
            name
          }
          stargazerCount
          forkCount
          openIssues: issues(states: OPEN) {
            totalCount
          }
        }
      }
    }
  }
`;

export interface GitHubRepo {
  databaseId: number;
  name: string;
  nameWithOwner: string;
  description: string | null;
  url: string;
  isPrivate: boolean;
  primaryLanguage: { name: string } | null;
  stargazerCount: number;
  forkCount: number;
  openIssues: { totalCount: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface ReposPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface UserReposResponse {
  repos: GitHubRepo[];
  pageInfo: ReposPageInfo;
  totalCount: number;
}


export async function fetchUserRepositories(
  userId: string,
  cursor?: string | null,
  first: number = 20
): Promise<UserReposResponse | null> {
  const accessToken = await getGithubToken(userId);

  if (!accessToken) {
    throw new Error("GitHub access token not found for user");
  }

  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: REPOS_QUERY,
      variables: {
        cursor: cursor || null,
        first,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as {
    data?: {
      viewer: {
        repositories: {
          pageInfo: ReposPageInfo;
          totalCount: number;
          nodes: GitHubRepo[];
        };
      };
    };
    errors?: Array<{ message: string }>;
  };

  if (data.errors) {
    throw new Error(`GitHub GraphQL error: ${data.errors[0].message}`);
  }

  const repos = data.data?.viewer.repositories;
  if (!repos) {
    return null;
  }

  return {
    repos: repos.nodes,
    pageInfo: repos.pageInfo,
    totalCount: repos.totalCount,
  };
}

export async function syncUserRepositories(
  userId: string,
  cursor?: string | null,
  first: number = 20
) {
  const reposData = await fetchUserRepositories(userId, cursor, first);

  if (!reposData) {
    return null;
  }

  const existingRepos = await db.repository.findMany({
    where: { userId },
    select: { githubId: true, isConnected: true },
  });

  const connectedMap = new Map(
    existingRepos.map((r) => [r.githubId, r.isConnected])
  );

  const reposWithStatus = reposData.repos.map((repo) => ({
    githubId: repo.databaseId,
    name: repo.name,
    fullName: repo.nameWithOwner,
    description: repo.description,
    url: repo.url,
    htmlUrl: repo.url,
    language: repo.primaryLanguage?.name ?? null,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    openIssues: repo.openIssues.totalCount,
    isPrivate: repo.isPrivate,
    isConnected: connectedMap.get(repo.databaseId) ?? false,
  }));

  return {
    repos: reposWithStatus,
    pageInfo: reposData.pageInfo,
    totalCount: reposData.totalCount,
  };
}


export interface WebhookConfig {
  id: number;
  url: string;
  active: boolean;
  events: string[];
  created_at: string;
}


export async function createRepositoryWebhook(
  userId: string,
  owner: string,
  repo: string,
  webhookUrl: string,
  secret: string
): Promise<WebhookConfig | null> {
  const accessToken = await getGithubToken(userId);

  if (!accessToken) {
    throw new Error("GitHub access token not found for user");
  }

  const response = await fetch(
    `${GITHUB_REST_API}/repos/${owner}/${repo}/hooks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        name: "web",
        active: true,
        events: WEBHOOK_EVENTS,
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: secret,
          insecure_ssl: "0",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Failed to create webhook:", response.status, errorData);
    
    if (response.status === 422) {
      const existingWebhook = await findExistingWebhook(userId, owner, repo, webhookUrl);
      if (existingWebhook) {
        return existingWebhook;
      }
    }
    
    throw new Error(
      `Failed to create webhook: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  return (await response.json()) as WebhookConfig;
}

async function findExistingWebhook(
  userId: string,
  owner: string,
  repo: string,
  webhookUrl: string
): Promise<WebhookConfig | null> {
  const accessToken = await getGithubToken(userId);

  if (!accessToken) {
    return null;
  }

  const response = await fetch(
    `${GITHUB_REST_API}/repos/${owner}/${repo}/hooks`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const webhooks = (await response.json()) as WebhookConfig[];
  return webhooks.find((hook) => hook.url === webhookUrl) ?? null;
}


export async function deleteRepositoryWebhook(
  userId: string,
  owner: string,
  repo: string,
  webhookId: number
): Promise<boolean> {
  const accessToken = await getGithubToken(userId);

  if (!accessToken) {
    throw new Error("GitHub access token not found for user");
  }

  const response = await fetch(
    `${GITHUB_REST_API}/repos/${owner}/${repo}/hooks/${webhookId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  return response.ok || response.status === 404;
}

/**
 * Check if webhook URL is a localhost URL that GitHub cannot reach
 * ngrok URLs and other tunnel services should NOT be blocked
 */
function isLocalhostUrl(): boolean {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  // Only block actual localhost URLs, not tunnels like ngrok
  return baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
}

function getWebhookUrl(): string {
  // Check for dedicated webhook URL first (for ngrok/tunnels)
  const webhookBaseUrl = process.env.WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;
  if (!webhookBaseUrl) {
    throw new Error("WEBHOOK_URL, NEXT_PUBLIC_APP_URL or BETTER_AUTH_URL environment variable is required for webhooks");
  }
  return `${webhookBaseUrl}/api/webhooks/github`;
}

/**
 * Check if webhooks can be created (not localhost)
 */
function canCreateWebhooks(): boolean {
  const webhookUrl = process.env.WEBHOOK_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "";
  // Can create webhooks if we have a public URL (not localhost)
  return !webhookUrl.includes("localhost") && !webhookUrl.includes("127.0.0.1") && webhookUrl.length > 0;
}


export async function toggleRepositoryConnection(
  userId: string,
  githubId: number,
  repoData?: {
    name: string;
    fullName: string;
    description: string | null;
    url: string;
    language: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    isPrivate: boolean;
  }
): Promise<{ isConnected: boolean; webhookCreated?: boolean; error?: string }> {
  const existing = await db.repository.findFirst({
    where: { userId, githubId },
  });

  if (existing) {
    const newConnectionState = !existing.isConnected;
    const [owner, repo] = existing.fullName.split("/");

    if (newConnectionState) {
      if (!canCreateWebhooks()) {
        console.log("[Webhook] Skipping webhook creation - no public URL configured");
        console.log("[Webhook] To enable webhooks, set WEBHOOK_URL to your ngrok/public URL");
        const updated = await db.repository.update({
          where: { id: existing.id },
          data: { 
            isConnected: true,
            webhookSecret: generateWebhookSecret(), 
          },
        });
        return { 
          isConnected: updated.isConnected, 
          webhookCreated: false,
          error: "Set WEBHOOK_URL env variable to your ngrok URL to enable webhooks"
        };
      }

      try {
        const webhookSecret = generateWebhookSecret();
        const webhookUrl = getWebhookUrl();
        console.log(`[Webhook] Creating webhook for ${owner}/${repo} at ${webhookUrl}`);
        const webhook = await createRepositoryWebhook(
          userId,
          owner,
          repo,
          webhookUrl,
          webhookSecret
        );

        const updated = await db.repository.update({
          where: { id: existing.id },
          data: {
            isConnected: true,
            webhookId: webhook?.id ?? null,
            webhookSecret: webhookSecret,
          },
        });

        return { 
          isConnected: updated.isConnected, 
          webhookCreated: !!webhook 
        };
      } catch (error) {
        console.error("Failed to create webhook:", error);
        const updated = await db.repository.update({
          where: { id: existing.id },
          data: { isConnected: true },
        });
        return { 
          isConnected: updated.isConnected, 
          webhookCreated: false,
          error: error instanceof Error ? error.message : "Failed to create webhook"
        };
      }
    } else {
      try {
        if (existing.webhookId) {
          await deleteRepositoryWebhook(userId, owner, repo, existing.webhookId);
        }
      } catch (error) {
        console.error("Failed to delete webhook:", error);
      }

      const updated = await db.repository.update({
        where: { id: existing.id },
        data: {
          isConnected: false,
          webhookId: null,
          webhookSecret: null,
        },
      });

      return { isConnected: updated.isConnected };
    }
  } else if (repoData) {
    const [owner, repo] = repoData.fullName.split("/");
    let webhookId: number | null = null;
    let webhookSecret: string | null = generateWebhookSecret();
    let webhookCreated = false;
    let webhookError: string | undefined;

    if (!canCreateWebhooks()) {
      console.log("[Webhook] Skipping webhook creation for new repo - no public URL configured");
      webhookError = "Set WEBHOOK_URL env variable to your ngrok URL to enable webhooks";
    } else {
      try {
        const webhookUrl = getWebhookUrl();
        console.log(`[Webhook] Creating webhook for ${owner}/${repo} at ${webhookUrl}`);
        const webhook = await createRepositoryWebhook(
          userId,
          owner,
          repo,
          webhookUrl,
          webhookSecret
        );
        webhookId = webhook?.id ?? null;
        webhookCreated = !!webhook;
        if (webhookCreated) {
          console.log(`[Webhook] Successfully created webhook ID: ${webhookId}`);
        }
      } catch (error) {
        console.error("Failed to create webhook for new repo:", error);
        webhookError = error instanceof Error ? error.message : "Failed to create webhook";
      }
    }

    const created = await db.repository.create({
      data: {
        githubId,
        userId,
        name: repoData.name,
        fullName: repoData.fullName,
        description: repoData.description,
        url: repoData.url,
        htmlUrl: repoData.url,
        language: repoData.language,
        stars: repoData.stars,
        forks: repoData.forks,
        openIssues: repoData.openIssues,
        isPrivate: repoData.isPrivate,
        isConnected: true,
        webhookId,
        webhookSecret,
      },
    });

    return { 
      isConnected: created.isConnected, 
      webhookCreated,
      error: webhookError
    };
  }

  return { isConnected: false };
}

const BINARY_EXTENSIONS = /\.(png|jpg|jpeg|gif|bmp|tiff|webp|ico|mp4|mp3|mov|avi|mkv|exe|dll|bin|class|jar|zip|tar|gz|rar|7z|pdf|doc|docx|xls|xlsx|ppt|pptx|woff|woff2|ttf|eot|svg|lock|node)$/i;

export interface RepoFile {
  path: string;
  content: string;
}

export async function getRepoFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string = ""
): Promise<RepoFile[]> {
  const octokit = new Octokit({ auth: token });
  const files: RepoFile[] = [];

  async function fetchDirectory(dirPath: string) {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: dirPath,
    });

    const items = Array.isArray(data) ? data : [data];

    for (const item of items) {
      if (item.type === "dir") {
        await fetchDirectory(item.path);
      } else if (item.type === "file") {
        if (BINARY_EXTENSIONS.test(item.name)) continue;
        if (item.size > 100000) continue;

        try {
          const { data: fileData } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: item.path,
          });

          if ("content" in fileData && fileData.encoding === "base64") {
            const content = Buffer.from(fileData.content, "base64").toString("utf-8");
            files.push({ path: item.path, content });
          }
        } catch {
          continue;
        }
      }
    }
  }

  await fetchDirectory(path);
  return files;
}