'use client';

import { useState } from 'react';
import { monthGoals } from '@/app/dashboard/mock-data/mock-data';

export function MonthGoals() {
  const [goals, setGoals] = useState(monthGoals);

  const toggleGoal = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, checked: !goal.checked } : goal
      )
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 h-full shadow-sm transition-colors duration-300">
      <h2 className="text-lg font-semibold text-black dark:text-white mb-6">Month Goal&apos;s</h2>

      <div className="space-y-4">
        {goals.map((goal) => (
          <label
            key={goal.id}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={goal.checked}
                onChange={() => toggleGoal(goal.id)}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  goal.checked
                    ? 'bg-black border-black dark:bg-white dark:border-white'
                    : 'border-gray-300 dark:border-neutral-700 group-hover:border-gray-400 dark:group-hover:border-neutral-500'
                }`}
              >
                {goal.checked && (
                  <svg
                    className="w-4 h-4 text-white dark:text-black"
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
                )}
              </div>
            </div>
            <span
              className={`text-base transition-colors ${
                goal.checked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-black dark:text-white'
              }`}
            >
              {goal.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
