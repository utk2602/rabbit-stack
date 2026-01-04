import { requireAuth } from "../../../lib/auth-utils";
import { getUserContributionsByUserId, getContributionStatsByUserId, getMonthlyActivityStatsByUserId, getGithubProfile } from "../../../module/github/github";
import { ContributionGraph } from "../../components/ContributionGraph";
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
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
          <Github className="w-16 h-16 mx-auto mb-6 text-white" />
          <h1 className="text-2xl font-bold mb-2">Connect GitHub</h1>
          <p className="text-zinc-400 mb-6">
            To see your dashboard stats, please connect your GitHub account.
          </p>
          <Link 
            href="/api/auth/signin"
            className="inline-block bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
          >
            Connect GitHub Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xl">R</span>
            </div>
            <span className="font-bold text-lg tracking-tight">Rabbit Stack</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
              <img 
                src={profile.avatarUrl} 
                alt={profile.login} 
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm font-medium text-zinc-300">{profile.login}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-white to-zinc-500">{profile.name || profile.login}</span>
          </h1>
          <p className="text-zinc-400">Here's what's happening with your code reviews and repositories.</p>
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
            icon={<Code2 className="w-5 h-5 text-orange-400" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Chart */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-zinc-400" />
                  Contribution Activity
                </h2>
                <select className="bg-zinc-900 border border-zinc-800 text-sm rounded-lg px-3 py-1 text-zinc-400 outline-none focus:border-zinc-600">
                  <option>Last 12 Months</option>
                </select>
              </div>
              
              {monthlyStats && monthlyStats.length > 0 ? (
                <div className="h-52 flex items-end gap-1.5 w-full px-2">
                  {monthlyStats.slice().reverse().map((month, i) => {
                    const max = Math.max(...(monthlyStats.map(m => m.totalContributions)), 1);
                    const heightPercent = max > 0 ? (month.totalContributions / max) * 100 : 0;
                    // Use pixel-based height instead of percentage for reliability
                    const maxBarHeight = 180; // pixels
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
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-900 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-700 pointer-events-none z-10 shadow-xl">
                            <div className="font-semibold text-white">{month.monthName} {month.year}</div>
                            <div className="text-zinc-400">{month.totalContributions} contributions</div>
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
                <div className="h-64 flex items-center justify-center text-zinc-500">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No contribution data available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Contribution Graph */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
               <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-zinc-400" />
                  Daily Contributions
                </h2>
              </div>
              {contributions ? (
                <ContributionGraph calendar={contributions.contributionCalendar} />
              ) : (
                <div className="text-zinc-500 text-center py-8">No contribution data available</div>
              )}
            </div>

            {/* Recent Repositories (Mocked as "Recent Reviews" style) */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Top Repositories</h2>
                <button className="text-sm text-zinc-400 hover:text-white transition-colors">View All</button>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {stats.topRepositories.map((repo, i) => (
                  <div key={i} className="p-4 hover:bg-zinc-900/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition-colors">
                        <GitCommit className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-zinc-200 group-hover:text-white transition-colors">{repo.name}</h3>
                        <p className="text-sm text-zinc-500">{repo.commits} commits</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-zinc-500 mb-1">Activity</div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <div key={j} className={`w-1 h-4 rounded-full ${j < 3 ? 'bg-emerald-500/50' : 'bg-zinc-800'}`} />
                          ))}
                        </div>
                      </div>
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <TrendingUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all group text-left">
                  <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:text-blue-300">
                    <GitPullRequest className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Review PR</div>
                    <div className="text-xs text-zinc-500">Start a new code review</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-zinc-600 transition-all group text-left">
                  <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:text-purple-300">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Connect Repo</div>
                    <div className="text-xs text-zinc-500">Add a new repository</div>
                  </div>
                </button>
              </div>
            </div>

            {/* System Status / Info */}
            <div className="bg-linear-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Code2 className="w-24 h-24" />
              </div>
              <h2 className="text-lg font-semibold mb-2 relative z-10">Rabbit Stack AI</h2>
              <p className="text-sm text-zinc-400 mb-4 relative z-10">
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
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-zinc-800/50 rounded-lg group-hover:bg-zinc-800 transition-colors">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-zinc-400 text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      </div>
    </div>
  );
}
