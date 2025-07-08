'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, FolderIcon, CalendarIcon, UserGroupIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, XMarkIcon, CurrencyDollarIcon, PencilIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import { useNotification } from '@/components/notifications/NotificationProvider';
import ProjectHeader from './components/ProjectHeader';
import ProjectStats from './components/ProjectStats';
import ProjectFilters from './components/ProjectFilters';
import ProjectCard from './components/ProjectCard';
import CreateProjectModal from './components/CreateProjectModal';
import UpdateProjectModal from './components/UpdateProjectModal';
import PaymentUpdateModal from './components/PaymentUpdateModal';

function ProjectsContent() {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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
    paidAmount: '',
    category: ''
  });
  const [projectCategories, setProjectCategories] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchProjectCategories();
  }, []);

  const fetchProjectCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const projectCats = data.filter(category => category.type === 'project');
        setProjectCategories(projectCats);
      }
    } catch (error) {
      console.error('Error fetching project categories:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        showError('Failed to fetch projects. Please try again.');
      }
    } catch (error) {
      showError('Error loading projects. Please check your connection.');
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
          paidAmount: '',
          category: ''
        });
        setShowCreateForm(false);
        
        // Show success notification
        if (project.status === 'completed' && project.budget > 0 && project.cost > 0) {
          showSuccess(`Project "${project.name}" created and income generated successfully!`, {
            title: 'Project Created'
          });
        } else {
          showSuccess(`Project "${project.name}" created successfully!`, {
            title: 'Project Created'
          });
        }
      } else {
        const errorData = await response.json();
        showError(`Failed to create project: ${errorData.error}${errorData.details ? ' - ' + errorData.details : ''}`, {
          title: 'Creation Failed'
        });
      }
    } catch (error) {
      showError('Failed to create project. Please check your connection and try again.', {
        title: 'Network Error'
      });
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
        
        // Show appropriate notification based on status change
        if (newStatus !== project.status) {
          if (newStatus === 'due') {
            showWarning(`Payment updated. Project "${project.name}" status changed to Due (payment required).`, {
              title: 'Payment Updated'
            });
          } else if (newStatus === 'in-progress') {
            showSuccess(`Payment completed! Project "${project.name}" is now fully paid and back in progress.`, {
              title: 'Payment Completed'
            });
          }
        } else {
          showSuccess(`Payment amount updated for project "${project.name}".`, {
            title: 'Payment Updated'
          });
        }
      } else {
        showError('Failed to update payment amount. Please try again.', {
          title: 'Update Failed'
        });
      }
    } catch (error) {
      showError('Error updating payment. Please check your connection.', {
        title: 'Network Error'
      });
    }
  };

  const markProjectCompleted = async (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      // Check if full payment has been made
      if (project.paidAmount < project.budget) {
        showWarning(`Cannot complete project. Payment required: $${(project.budget - project.paidAmount).toLocaleString()} remaining of $${project.budget.toLocaleString()} total budget.`, {
          title: 'Payment Required',
          duration: 8000
        });
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
        
        // Show success notification
        if (!project.incomeGenerated && project.budget > 0 && project.cost > 0) {
          showSuccess(`Project "${project.name}" completed successfully and income generated!`, {
            title: 'Project Completed',
            duration: 6000
          });
        } else {
          showSuccess(`Project "${project.name}" marked as completed!`, {
            title: 'Project Completed'
          });
        }
      } else {
        showError('Failed to complete project. Please try again.', {
          title: 'Completion Failed'
        });
      }
    } catch (error) {
      showError('Error completing project. Please check your connection.', {
        title: 'Network Error'
      });
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
        
        showSuccess(`Project "${editingProject.name}" updated successfully!`, {
          title: 'Project Updated'
        });
      } else {
        showError('Failed to update project. Please try again.', {
          title: 'Update Failed'
        });
      }
    } catch (error) {
      showError('Error updating project. Please check your connection.', {
        title: 'Network Error'
      });
    }
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    try {
      const newAmount = parseFloat(newPaymentAmount) || 0;
      const currentPaid = parseFloat(editingPayment.paidAmount) || 0;
      const totalPaidAmount = currentPaid + newAmount;
      
      const updateData = {
        paidAmount: totalPaidAmount
      };
      
      const response = await fetch(`/api/projects/${editingPayment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        // Refresh projects list
        fetchProjects();
        setShowPaymentForm(false);
        setEditingPayment(null);
        setNewPaymentAmount('');
        
        showSuccess(`Payment of $${newAmount.toLocaleString()} added. Total paid: $${totalPaidAmount.toLocaleString()}!`, {
          title: 'Payment Updated'
        });
      } else {
        showError('Failed to update payment amount. Please try again.', {
          title: 'Update Failed'
        });
      }
    } catch (error) {
      showError('Error updating payment. Please check your connection.', {
        title: 'Network Error'
      });
    }
  };

  const openUpdateForm = (project) => {
    setEditingProject(project);
    setShowUpdateForm(true);
  };

  const openPaymentForm = (project) => {
    setEditingPayment(project);
    setNewPaymentAmount('');
    setShowPaymentForm(true);
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
    // Filter by tab (active/completed/due)
    let tabMatch = true;
    if (activeTab === 'active') {
      tabMatch = project.status !== 'completed';
    } else if (activeTab === 'completed') {
      tabMatch = project.status === 'completed';
    } else if (activeTab === 'due') {
      tabMatch = (project.paidAmount || 0) < (project.budget || 0);
    }
    
    // Filter by category
    const categoryMatch = !categoryFilter || project.category === categoryFilter;
    
    // Filter by search query (project name)
    const searchMatch = !searchQuery || project.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return tabMatch && categoryMatch && searchMatch;
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
    activeBudget: projects.filter(p => p.status !== 'completed').reduce((sum, p) => sum + (p.budget || 0), 0),
    totalDueAmount: projects.filter(p => (p.paidAmount || 0) < (p.budget || 0)).reduce((sum, p) => sum + ((p.budget || 0) - (p.paidAmount || 0)), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProjectHeader 
        projects={projects}
        projectStats={projectStats}
        onCreateProject={() => setShowCreateForm(true)}
      />



      <ProjectStats projectStats={projectStats} />

      <ProjectFilters 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        projects={projects}
        projectCategories={projectCategories}
        filteredProjects={filteredProjects}
      />

      {/* Enhanced Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            getStatusIcon={getStatusIcon}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
            openUpdateForm={openUpdateForm}
            openPaymentForm={openPaymentForm}
          />
        ))}
      </div>
      

      {showCreateForm && (
        <CreateProjectModal
          showCreateForm={showCreateForm}
          setShowCreateForm={setShowCreateForm}
          newProject={newProject}
          setNewProject={setNewProject}
          projectCategories={projectCategories}
          handleCreateProject={handleCreateProject}
        />
      )}
      {showUpdateForm && editingProject && (
        <UpdateProjectModal
          showUpdateForm={showUpdateForm}
          setShowUpdateForm={setShowUpdateForm}
          editingProject={editingProject}
          setEditingProject={setEditingProject}
          projectCategories={projectCategories}
          handleUpdateProject={handleUpdateProject}
          markProjectCompleted={markProjectCompleted}
        />
      )}

      {showPaymentForm && editingPayment && (
        <PaymentUpdateModal
          showPaymentForm={showPaymentForm}
          setShowPaymentForm={setShowPaymentForm}
          editingPayment={editingPayment}
          setEditingPayment={setEditingPayment}
          newPaymentAmount={newPaymentAmount}
          setNewPaymentAmount={setNewPaymentAmount}
          handlePaymentUpdate={handlePaymentUpdate}
        />
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