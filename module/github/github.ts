import { db } from "../../lib/db";

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";

/**
 * Get GitHub access token for a user from the database
 */
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

/**
 * GraphQL query to fetch user contributions
 */
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

/**
 * Fetch user contributions from GitHub using GraphQL
 * @param userId - The user ID to fetch the GitHub token for
 * @param username - The GitHub username to fetch contributions for
 * @param from - Start date for contributions (ISO string)
 * @param to - End date for contributions (ISO string)
 */
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
): Promise<boolean> {
  const existing = await db.repository.findFirst({
    where: { userId, githubId },
  });

  if (existing) {
    const updated = await db.repository.update({
      where: { id: existing.id },
      data: { isConnected: !existing.isConnected },
    });
    return updated.isConnected;
  } else if (repoData) {
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
      },
    });
    return created.isConnected;
  }

  return false;
}
