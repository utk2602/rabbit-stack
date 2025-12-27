import { getSession } from "../../../lib/auth-utils";
import { Auth } from "../../components/Auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <Auth>
      <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {session.user.name || session.user.email}!</p>
          </div>
          <form action={async () => {
            'use server';
            redirect('/');
          }}>
            <button className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors">
              Go Home
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Code Reviews</h3>
            <p className="text-3xl font-bold text-indigo-400">0</p>
            <p className="text-sm text-gray-400 mt-2">Total reviews completed</p>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
            <p className="text-3xl font-bold text-violet-400">0</p>
            <p className="text-sm text-gray-400 mt-2">Projects being monitored</p>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">Issues Found</h3>
            <p className="text-3xl font-bold text-pink-400">0</p>
            <p className="text-sm text-gray-400 mt-2">Issues detected this month</p>
          </div>
        </div>

        <div className="mt-8 bg-neutral-900 border border-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <p className="text-gray-400">No recent activity to display.</p>
        </div>
      </div>
    </div>
    </Auth>
  );
}
