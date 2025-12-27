'use client';

import { useEffect, useState } from 'react';
import { overallStats } from "@/app/dashboard/mock-data/mock-data";

export function OverallInformation() {
  const [stats, setStats] = useState(overallStats);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tasksCompleted: Math.max(0, prev.tasksCompleted + (Math.random() > 0.5 ? 1 : -1)),
        progressPercent: Math.min(100, Math.max(0, prev.progressPercent + (Math.random() > 0.5 ? 1 : -1))),
        inProgressCount: Math.max(0, prev.inProgressCount + (Math.random() > 0.8 ? 1 : -1)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black dark:bg-neutral-900 text-white rounded-3xl p-6 h-full flex flex-col transition-colors duration-300">
      <h2 className="text-lg font-semibold mb-6">Overall Information</h2>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <div className="text-5xl font-bold mb-2 transition-all duration-500">{stats.tasksCompleted}</div>
          <div className="text-gray-400 text-sm">Tasks done</div>
        </div>
        <div>
          <div className="text-5xl font-bold mb-2 transition-all duration-500">{stats.projectsStopped}</div>
          <div className="text-gray-400 text-sm">Project's stopped</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="font-semibold">{stats.progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-4 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white" />
          <div>
            <div className="text-2xl font-bold">{stats.projectsCount}</div>
            <div className="text-gray-400 text-xs">Project's</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <div>
            <div className="text-2xl font-bold transition-all duration-500">{stats.inProgressCount}</div>
            <div className="text-gray-400 text-xs">In progress</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-700" />
          <div>
            <div className="text-2xl font-bold">{stats.completeCount}</div>
            <div className="text-gray-400 text-xs">Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}
