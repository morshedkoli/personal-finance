'use client';

import { 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  FolderIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

export default function ProjectFilters({ 
  activeTab, 
  setActiveTab, 
  categoryFilter, 
  setCategoryFilter, 
  searchQuery,
  setSearchQuery,
  projectCategories, 
  projects, 
  filteredProjects 
}) {
  return (
    <>
      {/* Enhanced Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <ClockIcon className="h-4 w-4" />
            <span>Active ({projects.filter(p => p.status !== 'completed').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('due')}
            className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'due'
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>Due ({projects.filter(p => (p.paidAmount || 0) < (p.budget || 0)).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'completed'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
            }`}
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>Completed ({projects.filter(p => p.status === 'completed').length})</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-w-[250px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FolderIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm min-w-[200px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            >
              <option value="">All Categories</option>
              {projectCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Results Counter */}
          <div className="flex items-center space-x-2">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Showing {filteredProjects.length} of {projects.length} projects
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}