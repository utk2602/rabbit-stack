'use client';

import { useEffect, useState } from 'react';
import { monthProgress } from "@/app/dashboard/mock-data/mock-data";

export function MonthProgress() {
  const [percentage, setPercentage] = useState(monthProgress.percentage);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.min(100, Math.max(0, prev + change));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 h-full shadow-sm flex flex-col transition-colors duration-300">
      <h2 className="text-lg font-semibold text-black dark:text-white mb-6">Month Progress</h2>

      {/* Radial Chart */}
      <div className="flex justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-gray-100 dark:stroke-neutral-800"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-black dark:stroke-white transition-all duration-500"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-black dark:text-white transition-all duration-500">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats Legend */}
      <div className="space-y-3 mb-6">
        {monthProgress.stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</span>
            </div>
            <span className="text-sm font-semibold text-black dark:text-white">{stat.value}%</span>
          </div>
        ))}
      </div>

      {/* Download Button */}
      <button className="w-full bg-black text-white dark:bg-white dark:text-black py-3 rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors mt-auto">
        Download Report
      </button>
    </div>
  );
}
