'use client';

import { useEffect, useState } from 'react';
import { lastProjects } from "@/app/dashboard/mock-data/mock-data";

export function LastProjects() {
  const [projects, setProjects] = useState(lastProjects);

  useEffect(() => {
    const interval = setInterval(() => {
      setProjects(prev => prev.map(p => {
        if (p.status === 'completed') return p;
        const change = Math.random() > 0.5 ? 1 : -1;
        return {
          ...p,
          progress: Math.min(100, Math.max(0, (p.progress || 0) + change))
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-black dark:text-white">Last Project&apos;s</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-black dark:bg-neutral-900 text-white rounded-3xl p-6 flex flex-col justify-between min-h-[180px] transition-colors duration-300"
          >
            <h3 className="font-semibold text-lg mb-4">{project.title}</h3>

            {project.status === 'completed' ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-400">Completed</span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
