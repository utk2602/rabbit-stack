import { requireAuth } from "../../../lib/auth-utils";
import { getUserContributionsByUserId, getContributionStatsByUserId, getMonthlyActivityStatsByUserId, getGithubProfile } from "../../../module/github/github";
import { ContributionGraph } from "../../components/ContributionGraph";
import { WaveCard } from "../../components/WaveCard";
import { 
  GitCommit, 
  GitPullRequest, 
  GitPullRequestDraft, 
  Github, 
  LayoutDashboard, 
  Star, 
  TrendingUp, 
  Users,
  Code2,
  Activity
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await requireAuth();
  const userId = session.user.id;
  const [profile, stats, monthlyStats, contributions] = await Promise.all([
    getGithubProfile(userId).catch(() => null),
    getContributionStatsByUserId(userId).catch(() => null),
    getMonthlyActivityStatsByUserId(userId).catch(() => null),
    getUserContributionsByUserId(userId).catch(() => null)
  ]);

  if (!profile || !stats) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center">
          <Github className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Connect GitHub</h1>
          <p className="text-zinc-400 mb-6">
            To see your dashboard stats, please connect your GitHub account.
          </p>
          <Link 
            href="/api/auth/signin"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/80 transition-colors"
          >
            Connect GitHub Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-amber-500">{profile.name || profile.login}</span>
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your code reviews and repositories.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Contributions" 
            value={stats.totalContributions} 
            icon={<Activity className="w-5 h-5 text-emerald-400" />}
            trend="+12% from last month" // Mock trend for now
          />
          <StatCard 
            title="Pull Requests" 
            value={stats.totalPullRequests} 
            icon={<GitPullRequest className="w-5 h-5 text-blue-400" />}
          />
          <StatCard 
            title="Code Reviews" 
            value={stats.totalReviews} 
            icon={<GitPullRequestDraft className="w-5 h-5 text-purple-400" />}
          />
          <StatCard 
            title="Repositories" 
            value={stats.totalRepositories} 
            icon={<Code2 className="w-5 h-5 text-primary" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card/30 border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  Contribution Activity
                </h2>
                <select className="bg-secondary border border-border text-sm rounded-lg px-3 py-1 text-muted-foreground outline-none focus:border-primary">
                  <option>Last 12 Months</option>
                </select>
              </div>
              
              {monthlyStats && monthlyStats.length > 0 ? (
                <div className="h-52 flex items-end gap-1.5 w-full px-2">
                  {monthlyStats.slice().reverse().map((month, i) => {
                    const max = Math.max(...(monthlyStats.map(m => m.totalContributions)), 1);
                    const heightPercent = max > 0 ? (month.totalContributions / max) * 100 : 0;
                    const maxBarHeight = 180; 
                    const barHeight = month.totalContributions > 0 
                      ? Math.max((heightPercent / 100) * maxBarHeight, 12) 
                      : 4;
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-0">
                        <div className="w-full relative flex items-end justify-center" style={{ height: `${maxBarHeight}px` }}>
                          <div 
                            className={`w-full max-w-7 mx-auto rounded-t-md transition-all duration-300 ${
                              month.totalContributions > 0 
                                ? 'bg-linear-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 shadow-lg shadow-emerald-500/20' 
                                : 'bg-zinc-800'
                            }`}
                            style={{ height: `${barHeight}px` }}
                          ></div>
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border pointer-events-none z-10 shadow-xl">
                            <div className="font-semibold">{month.monthName} {month.year}</div>
                            <div className="text-muted-foreground">{month.totalContributions} contributions</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium truncate w-full text-center">
                          {month.monthName.substring(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No contribution data available</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card/30 border border-border rounded-xl p-6">
               <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                  Daily Contributions
                </h2>
              </div>
              {contributions ? (
                <ContributionGraph calendar={contributions.contributionCalendar} />
              ) : (
                <div className="text-muted-foreground text-center py-8">No contribution data available</div>
              )}
            </div>

            <div className="bg-card/30 border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="text-lg font-semibold">Top Repositories</h2>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">View All</button>
              </div>
              <div className="divide-y divide-border">
                {stats.topRepositories.map((repo, i) => (
                  <div key={i} className="p-4 hover:bg-accent/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-accent transition-colors">
                        <GitCommit className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-foreground transition-colors">{repo.name}</h3>
                        <p className="text-sm text-muted-foreground">{repo.commits} commits</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground mb-1">Activity</div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <div key={j} className={`w-1 h-4 rounded-full ${j < 3 ? 'bg-primary/50' : 'bg-secondary'}`} />
                          ))}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                        <TrendingUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sine Wave Activity Graphs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <WaveCard
                title="Code Velocity"
                subtitle="Lines changed per day"
                color="#ffe0c2"
                waves={3}
                amplitude={25}
                frequency={0.02}
                height={90}
              />
              <WaveCard
                title="Review Throughput"
                subtitle="PRs reviewed over time"
                color="#4ade80"
                waves={2}
                amplitude={30}
                frequency={0.015}
                height={90}
              />
              <WaveCard
                title="Issue Resolution"
                subtitle="Avg resolution time trend"
                color="#60a5fa"
                waves={3}
                amplitude={20}
                frequency={0.025}
                height={90}
              />
              <WaveCard
                title="Commit Frequency"
                subtitle="Commits per hour pattern"
                color="#c084fc"
                waves={2}
                amplitude={28}
                frequency={0.018}
                height={90}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card/30 border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border hover:border-accent transition-all group text-left">
                  <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:text-blue-400">
                    <GitPullRequest className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Review PR</div>
                    <div className="text-xs text-muted-foreground">Start a new code review</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border hover:border-accent transition-all group text-left">
                  <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:text-purple-400">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Connect Repo</div>
                    <div className="text-xs text-muted-foreground">Add a new repository</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-linear-to-br from-primary/10 to-amber-500/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Code2 className="w-24 h-24" />
              </div>
              <h2 className="text-lg font-semibold mb-2 relative z-10">Rabbit Stack AI</h2>
              <p className="text-sm text-muted-foreground mb-4 relative z-10">
                Your AI code reviewer is active and ready to analyze your pull requests.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Operational
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: number | string, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-card/30 border border-border rounded-xl p-6 hover:border-accent transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-secondary rounded-lg group-hover:bg-accent transition-colors">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      </div>
    </div>
  );
}
