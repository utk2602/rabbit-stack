'use client';

import { useEffect, useState } from 'react';
import { weeklyProcessData } from "@/app/dashboard/mock-data/mock-data";

export function WeeklyProcess() {
  const [data, setData] = useState(weeklyProcessData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(d => ({
        ...d,
        work: Math.max(0, d.work + (Math.random() - 0.5) * 10),
        meditation: Math.max(0, d.meditation + (Math.random() - 0.5) * 10)
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.work, d.meditation])
  );

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 h-full shadow-sm transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-black dark:text-white">Weekly Process</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-black dark:bg-white" />
            <span className="text-gray-600 dark:text-gray-400">Work</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Meditation</span>
          </div>
        </div>
      </div>

      {/* Simple Line Chart Representation */}
      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 280 160">
          {/* Grid Lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              y1={i * 40}
              x2="280"
              y2={i * 40}
              className="stroke-gray-100 dark:stroke-neutral-800"
              strokeWidth="1"
            />
          ))}

          {/* Work Line */}
          <polyline
            fill="none"
            className="stroke-black dark:stroke-white transition-all duration-500"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data
              .map((d, i) => {
                const x = (i * 280) / (data.length - 1);
                const y = 160 - (d.work / maxValue) * 140;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Meditation Line */}
          <polyline
            fill="none"
            stroke="#9ca3af"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500"
            points={data
              .map((d, i) => {
                const x = (i * 280) / (data.length - 1);
                const y = 160 - (d.meditation / maxValue) * 140;
                return `${x},${y}`;
              })
              .join(' ')}
          />
        </svg>

        {/* Day Labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          {data.map((d) => (
            <span key={d.day}>{d.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
