'use client';

import { PencilIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function ProjectCard({ 
  project, 
  getStatusIcon, 
  getPriorityColor, 
  getStatusColor, 
  openUpdateForm, 
  openPaymentForm 
}) {
  return (
    <div 
      key={project.id} 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex flex-col h-full"
    >
      <div className="p-6 flex-1">
        {/* Header */}
        <div className="flex items-start mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mr-3">
            {getStatusIcon(project.status)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">{project.name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getPriorityColor(project.priority)}`}>
                {project.priority}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(project.status)}`}>
                {project.status.replace('-', ' ')}
              </span>
              {(project.paidAmount || 0) < (project.budget || 0) && (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  Payment Due
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{project.description}</p>
        </div>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
        </div>
        
        {/* Key Info */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Budget</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">${project.budget?.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Paid</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">${project.paidAmount?.toLocaleString()}</span>
          </div>
          
          {/* Due Amount */}
          {(project.paidAmount || 0) < (project.budget || 0) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Due Amount</span>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">${((project.budget || 0) - (project.paidAmount || 0)).toLocaleString()}</span>
            </div>
          )}
          
          {project.agentName && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Agent</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{project.agentName}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons at Bottom */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
        <div className="flex gap-2">
          {/* Show Edit button only if project is not completed or has outstanding payments */}
          {(project.status !== 'completed' || (project.paidAmount || 0) < (project.budget || 0)) && (
            <button
              onClick={() => openUpdateForm(project)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          )}
          
          {(project.paidAmount || 0) < (project.budget || 0) && (
            <button
              onClick={() => openPaymentForm(project)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md transition-colors duration-200"
            >
              <CurrencyDollarIcon className="h-4 w-4" />
              Payment
            </button>
          )}
          
          {/* Show completion message for completed projects with no due amount */}
          {project.status === 'completed' && (project.paidAmount || 0) >= (project.budget || 0) && (
            <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Project Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}