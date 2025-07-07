'use client';

import { PlusIcon, FolderIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ProjectHeader({ projects, projectStats, onCreateProject }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-blue-100 dark:border-gray-600">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Project Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            Manage and track your projects with ease
          </p>
          <div className="flex items-center mt-3 space-x-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FolderIcon className="h-4 w-4 mr-1" />
              {projects.length} Total Projects
            </div>
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              {projectStats.completed} Completed
            </div>
          </div>
        </div>
        <button
          onClick={onCreateProject}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PlusIcon className="h-5 w-5" />
          New Project
        </button>
      </div>
    </div>
  );
}