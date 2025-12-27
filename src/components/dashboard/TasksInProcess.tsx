'use client';

import { tasksInProcess } from "@/app/dashboard/mock-data/mock-data";

export function TasksInProcess() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Task In process</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasksInProcess.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-sm flex items-center justify-between transition-colors duration-300"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: task.avatarBg }}
              >
                {task.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-black dark:text-white">{task.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{task.time}</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
