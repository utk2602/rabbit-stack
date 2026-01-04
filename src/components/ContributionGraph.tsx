"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ContributionCalendar, ContributionDay } from '../../module/github/github';

interface ContributionGraphProps {
  calendar: ContributionCalendar;
}

export function ContributionGraph({ calendar }: ContributionGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDay, setHoveredDay] = useState<{ day: ContributionDay; x: number; y: number } | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [calendar]);

  const weeks = calendar.weeks;
    const allDays = weeks.flatMap(week => week.contributionDays);
  const maxContributions = Math.max(...allDays.map(d => d.contributionCount), 0);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-zinc-900';
        if (count >= maxContributions * 0.75) return 'bg-purple-500';
    if (count >= maxContributions * 0.5) return 'bg-purple-600/80';
    if (count >= maxContributions * 0.25) return 'bg-purple-700/60';
    return 'bg-purple-900/40';
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="w-full relative">
      <div 
        ref={containerRef}
        className="w-full overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="min-w-fit p-4 bg-black border border-zinc-800 rounded-xl">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              <div className="w-8 shrink-0" />
              
              <div className="flex gap-0.5 text-xs text-zinc-400">
                {weeks.map((week, i) => {
                  const date = new Date(week.contributionDays[0].date);
                  const prevWeek = weeks[i - 1];
                  const prevDate = prevWeek ? new Date(prevWeek.contributionDays[0].date) : null;
                                    const isNewMonth = !prevDate || date.getMonth() !== prevDate.getMonth();
                  
                  return (
                    <div key={i} className="w-2.5 relative h-4">
                      {isNewMonth && (
                        <span className="absolute top-0 left-0 text-[10px] font-medium">
                          {months[date.getMonth()]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-1">
              <div className="flex flex-col gap-1 text-[10px] text-zinc-500 pt-2 pr-2  left-0 z-10 w-8 shrink-0">
                
              </div>

              <div className="flex gap-0.5">
                {weeks.map((week, weekIndex) => {

                  const days = new Array(7).fill(null);
                  week.contributionDays.forEach(day => {
                    days[day.weekday] = day;
                  });

                  return (
                    <div key={weekIndex} className="flex flex-col gap-0.5">
                      {days.map((day, dayIndex) => (
                        day ? (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`w-2.5 h-2.5 rounded-sm ${getIntensityClass(day.contributionCount)} cursor-pointer transition-all hover:ring-1 hover:ring-zinc-400 hover:scale-110`}
                            onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setHoveredDay({ 
                                    day, 
                                    x: rect.left + rect.width / 2, 
                                    y: rect.top 
                                });
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        ) : (
                          <div key={`${weekIndex}-${dayIndex}`} className="w-2.5 h-2.5" />
                        )
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 text-xs text-zinc-400 mt-2">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900" />
                <div className="w-2.5 h-2.5 rounded-sm bg-purple-900/40" />
                <div className="w-2.5 h-2.5 rounded-sm bg-purple-700/60" />
                <div className="w-2.5 h-2.5 rounded-sm bg-purple-600/80" />
                <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {hoveredDay && (
        <div 
            className="fixed z-50 bg-zinc-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-zinc-700 pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px] whitespace-nowrap"
            style={{ 
                left: hoveredDay.x, 
                top: hoveredDay.y 
            }}
        >
            <div className="font-semibold">
                {hoveredDay.day.contributionCount} contributions
            </div>
            <div className="text-zinc-400">
                {new Date(hoveredDay.day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
        </div>
      )}
    </div>
  );
}
