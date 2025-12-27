'use client';

export function AddTask() {
  return (
    <button className="w-full h-full bg-white dark:bg-neutral-900 rounded-3xl border-2 border-dashed border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 transition-colors min-h-[120px] flex items-center justify-center group shadow-sm">
      <div className="text-center">
        <div className="text-3xl mb-2 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          +
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
          Add a task
        </div>
      </div>
    </button>
  );
}
