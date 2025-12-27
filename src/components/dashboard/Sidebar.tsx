'use client';

import Link from 'next/link';
import { sidebarItems, integrations, teams } from '../../app/dashboard/mock-data/mock-data';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-neutral-900 border-r border-gray-100 dark:border-neutral-800 flex-col p-6 transition-transform duration-300 z-50 w-64 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'
      } lg:flex`}
    >
      {/* Brand Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-black dark:text-white">Growth</h1>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              item.active
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Integration Section */}
        <div className="pt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Integration
          </h3>
          {integrations.map((integration) => (
            <Link
              key={integration.label}
              href={integration.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
            >
              <span className="text-xl">{integration.icon}</span>
              <span className="font-medium">{integration.label}</span>
            </Link>
          ))}
        </div>

        {/* Teams Section */}
        <div className="pt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Teams
          </h3>
          {teams.map((team) => (
            <Link
              key={team.name}
              href={team.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              <span className="font-medium">{team.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Settings at Bottom */}
      <Link
        href="/settings"
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all mt-auto"
      >
        <span className="text-xl">⚙️</span>
        <span className="font-medium">Settings</span>
      </Link>
    </aside>
  );
}
