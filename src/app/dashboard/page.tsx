'use client';

import { useState } from 'react';
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OverallInformation } from "@/components/dashboard/OverallInformation";
import { WeeklyProcess } from "@/components/dashboard/WeeklyProcess";
import { MonthProgress } from "@/components/dashboard/MonthProgress";
import { MonthGoals } from "@/components/dashboard/MonthGoals";
import { TasksInProcess } from "@/components/dashboard/TasksInProcess";
import { AddTask } from "@/components/dashboard/AddTask";
import { LastProjects } from "@/components/dashboard/LastProjects";
import { useTheme } from 'next-themes';

export default function DashboardPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] dark:bg-neutral-950 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'}`}>
        <Sidebar isOpen={isSidebarOpen} />
      </div>

      {/* Main Content */}
      <main 
        className={`flex-1 p-6 lg:p-8 transition-all duration-300 ${
          isSidebarOpen ? 'lg:pl-72' : 'lg:pl-8'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-black dark:text-white">Hi, User!</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors">
              + Create
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
              🔔
            </button>
            <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-bold">
              U
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Row 1 */}
          <div className="lg:col-span-4">
            <OverallInformation />
          </div>
          <div className="lg:col-span-5">
            <WeeklyProcess />
          </div>
          <div className="lg:col-span-3">
            <MonthProgress />
          </div>

          {/* Row 2 */}
          <div className="lg:col-span-3">
            <MonthGoals />
          </div>
          <div className="lg:col-span-6">
            <TasksInProcess />
          </div>
          <div className="lg:col-span-3">
            <AddTask />
          </div>

          {/* Row 3 */}
          <div className="lg:col-span-12">
            <LastProjects />
          </div>
        </div>
      </main>
    </div>
  );
}
