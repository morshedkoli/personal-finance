'use client';

import { XMarkIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function UpdateProjectModal({ 
  showUpdateForm, 
  setShowUpdateForm, 
  editingProject, 
  setEditingProject, 
  projectCategories, 
  handleUpdateProject, 
  markProjectCompleted 
}) {
  if (!showUpdateForm || !editingProject) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-8 rounded-t-2xl border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <PencilIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Update Project</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Modify project details and settings</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowUpdateForm(false);
                setEditingProject(null);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {editingProject.status === 'completed' && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Project Completed:</strong> Only payment amount can be updated for completed projects.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8">
          <form onSubmit={handleUpdateProject} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Name</label>
              <input
                type="text"
                value={editingProject.name}
                onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                disabled={editingProject.status === 'completed'}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white transition-all duration-200 ${
                  editingProject.status === 'completed' 
                    ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                    : 'bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter project name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                value={editingProject.description}
                onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                disabled={editingProject.status === 'completed'}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white transition-all duration-200 ${
                  editingProject.status === 'completed' 
                    ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                    : 'bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter project description"
                rows="3"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={editingProject.status}
                  onChange={(e) => setEditingProject({...editingProject, status: e.target.value})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                >
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={editingProject.priority}
                  onChange={(e) => setEditingProject({...editingProject, priority: e.target.value})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editingProject.startDate}
                  onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={editingProject.endDate}
                  onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={editingProject.budget}
                  onChange={(e) => setEditingProject({...editingProject, budget: e.target.value})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingProject.progress || 0}
                  onChange={(e) => setEditingProject({...editingProject, progress: parseInt(e.target.value) || 0})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
            </div>
          
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={editingProject.category || ''}
                onChange={(e) => setEditingProject({...editingProject, category: e.target.value})}
                disabled={editingProject.status === 'completed'}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                  editingProject.status === 'completed' 
                    ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                    : 'bg-white dark:bg-gray-700'
                }`}
              >
                <option value="">Select a category</option>
                {projectCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Name <span className="text-gray-500">(Optional)</span></label>
                <input
                  type="text"
                  value={editingProject.agentName || ''}
                  onChange={(e) => setEditingProject({...editingProject, agentName: e.target.value})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-gray-500">(Optional)</span></label>
                <input
                  type="tel"
                  value={editingProject.phoneNumber || ''}
                  onChange={(e) => setEditingProject({...editingProject, phoneNumber: e.target.value})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost ($)</label>
                <input
                  type="number"
                  value={editingProject.cost}
                  onChange={(e) => setEditingProject({...editingProject, cost: e.target.value})}
                  disabled={editingProject.status === 'completed'}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed' 
                      ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' 
                      : 'bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  editingProject.status === 'completed' 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Paid Amount ($)
                  {editingProject.status === 'completed' && (
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Editable
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProject.paidAmount}
                  onChange={(e) => setEditingProject({...editingProject, paidAmount: parseFloat(e.target.value) || 0})}
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white ${
                    editingProject.status === 'completed'
                      ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowUpdateForm(false);
                  setEditingProject(null);
                }}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium rounded-xl border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  markProjectCompleted(editingProject.id);
                  setShowUpdateForm(false);
                  setEditingProject(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Complete
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Update Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}