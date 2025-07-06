'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, FolderIcon, CalendarIcon, UserGroupIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';

function ProjectsContent() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: '',
    agentName: '',
    cost: '',
    phoneNumber: '',
    paidAmount: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...newProject,
        budget: parseFloat(newProject.budget) || 0,
        cost: parseFloat(newProject.cost) || 0,
        paidAmount: parseFloat(newProject.paidAmount) || 0,
        progress: newProject.status === 'completed' ? 100 : 0
      };
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (response.ok) {
        const project = await response.json();
        
        // If project is completed, generate income
        if (project.status === 'completed' && project.budget > 0 && project.cost > 0) {
          await generateIncomeFromProject(project);
          // Update the project to mark income as generated
          await fetch(`/api/projects/${project.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ incomeGenerated: true }),
          });
        }
        
        // Refresh projects list
        fetchProjects();
        
        setNewProject({
          name: '',
          description: '',
          status: 'planning',
          priority: 'medium',
          startDate: '',
          endDate: '',
          budget: '',
          agentName: '',
          cost: '',
          phoneNumber: '',
          paidAmount: ''
        });
        setShowCreateForm(false);
      } else {
        const errorData = await response.json();
        alert(`Error creating project: ${errorData.error}${errorData.details ? '\n' + errorData.details : ''}`);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const generateIncomeFromProject = async (project) => {
    try {
      const revenue = project.budget - project.cost;
      if (revenue > 0) {
        // Create income record from project revenue
        const incomeData = {
          amount: revenue,
          category: 'Project Income',
          description: `Project Revenue: ${project.name} (Budget: $${project.budget} - Cost: $${project.cost})`,
          date: new Date().toISOString().split('T')[0]
        };
        
        // Make API call to create income record
        const response = await fetch('/api/income', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(incomeData)
        });
        
        if (response.ok) {
          console.log('Income generated successfully:', incomeData);
        } else {
          console.error('Failed to generate income:', await response.text());
        }
      } else {
        console.log('No revenue to generate (project cost >= budget)');
      }
    } catch (error) {
      console.error('Error generating income:', error);
    }
  };

  const updatePaidAmount = async (projectId, newPaidAmount) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      const paidAmount = parseFloat(newPaidAmount) || 0;
      let newStatus = project.status;
      
      // Auto-update status based on payment completion
      if (project.status === 'in-progress' && paidAmount < project.budget) {
        newStatus = 'due';
      } else if (project.status === 'due' && paidAmount >= project.budget) {
        newStatus = 'in-progress';
      }
      
      const updateData = {
        paidAmount: paidAmount,
        ...(newStatus !== project.status && { status: newStatus })
      };
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        // Refresh projects list
        fetchProjects();
      } else {
        console.error('Failed to update paid amount');
      }
    } catch (error) {
      console.error('Error updating paid amount:', error);
    }
  };

  const markProjectCompleted = async (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      // Check if full payment has been made
      if (project.paidAmount < project.budget) {
        alert(`Cannot complete project. Payment required: $${(project.budget - project.paidAmount).toLocaleString()} remaining of $${project.budget.toLocaleString()} total budget.`);
        return;
      }
      
      const updateData = {
        status: 'completed',
        progress: 100
      };
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const updatedProject = await response.json();
        
        // Generate income if not already generated
        if (!project.incomeGenerated && project.budget > 0 && project.cost > 0) {
          await generateIncomeFromProject(updatedProject);
          // Update the project to mark income as generated
          await fetch(`/api/projects/${projectId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ incomeGenerated: true }),
          });
        }
        
        // Refresh projects list
        fetchProjects();
      } else {
        console.error('Failed to mark project as completed');
      }
    } catch (error) {
      console.error('Error marking project completed:', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...editingProject,
        budget: parseFloat(editingProject.budget) || 0,
        cost: parseFloat(editingProject.cost) || 0,
        paidAmount: parseFloat(editingProject.paidAmount) || 0
      };
      
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        // Refresh projects list
        fetchProjects();
        setShowUpdateForm(false);
        setEditingProject(null);
      } else {
        console.error('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const openUpdateForm = (project) => {
    if (project.status === 'completed') {
      return; // Prevent editing completed projects
    }
    setEditingProject({ ...project });
    setShowUpdateForm(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'planning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <FolderIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'due':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredProjects = projects.filter(project => {
    // Filter by tab (active/completed)
    return activeTab === 'active' ? project.status !== 'completed' : project.status === 'completed';
  });

  const projectStats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    planning: projects.filter(p => p.status === 'planning').length,
    due: projects.filter(p => p.status === 'due').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalCost: projects.reduce((sum, p) => sum + (p.cost || 0), 0),
    totalRevenue: projects.filter(p => p.status === 'completed').reduce((sum, p) => sum + ((p.budget || 0) - (p.cost || 0)), 0),
    totalPaidAmount: projects.reduce((sum, p) => sum + (p.paidAmount || 0), 0),
    activeBudget: projects.filter(p => p.status !== 'completed').reduce((sum, p) => sum + (p.budget || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Project Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your projects</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          New Project
        </button>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FolderIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Planning</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats.planning}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{projectStats.due}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-bold text-sm">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${projectStats.totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${projectStats.totalCost.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Project Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${projectStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center">
              <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${projectStats.totalPaidAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">$</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${projectStats.activeBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'active'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Active Projects ({projects.filter(p => p.status !== 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Completed Projects ({projects.filter(p => p.status === 'completed').length})
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(project.status)}
                  <h3 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                    {project.priority}
                  </span>
                  {project.status !== 'completed' && (
                    <button
                      onClick={() => openUpdateForm(project)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit Project"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{project.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{project.progress}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                  <span className="font-medium text-gray-900 dark:text-white">${project.budget?.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Agent:</span>
                  <span className="text-gray-900 dark:text-white">{project.agentName}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Timeline:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>
                


              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Name <span className="text-gray-500">(Optional)</span></label>
                  <input
                    type="text"
                    value={newProject.agentName}
                    onChange={(e) => setNewProject({...newProject, agentName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-gray-500">(Optional)</span></label>
                  <input
                    type="tel"
                    value={newProject.phoneNumber}
                    onChange={(e) => setNewProject({...newProject, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    value={newProject.cost}
                    onChange={(e) => setNewProject({...newProject, cost: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount ($)</label>
                  <input
                    type="number"
                    value={newProject.paidAmount}
                    onChange={(e) => setNewProject({...newProject, paidAmount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Project Modal */}
      {showUpdateForm && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Update Project</h3>
              <button
                onClick={() => {
                  setShowUpdateForm(false);
                  setEditingProject(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) => setEditingProject({...editingProject, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editingProject.endDate}
                    onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Name <span className="text-gray-500">(Optional)</span></label>
                  <input
                    type="text"
                    value={editingProject.agentName || ''}
                    onChange={(e) => setEditingProject({...editingProject, agentName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number <span className="text-gray-500">(Optional)</span></label>
                  <input
                    type="tel"
                    value={editingProject.phoneNumber || ''}
                    onChange={(e) => setEditingProject({...editingProject, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paid Amount ($)</label>
                  <input
                    type="number"
                    value={editingProject.paidAmount}
                    onChange={(e) => setEditingProject({...editingProject, paidAmount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateForm(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <ProjectsContent />
    </DashboardLayout>
  );
}