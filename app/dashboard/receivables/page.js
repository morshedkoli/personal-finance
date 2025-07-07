'use client';

import { useState, useEffect } from 'react';
import FinanceForm from '@/components/forms/FinanceForm';
import DataTable from '@/components/tables/DataTable';
import { ArrowPathIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { useNotification } from '@/components/notifications/NotificationProvider';

export default function ReceivablesPage() {
  const [receivables, setReceivables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchReceivables();
  }, []);
  
  const fetchReceivables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/receivables');
      if (!response.ok) {
        throw new Error('Failed to fetch receivables');
      }
      const data = await response.json();
      setReceivables(data);
    } catch (err) {
      console.error('Error fetching receivables:', err);
      setError('Failed to load receivables. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/receivables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add receivable');
      }
      
      const addedReceivable = await response.json();
      setReceivables([addedReceivable, ...receivables]);
    } catch (err) {
      console.error('Error adding receivable:', err);
      setError('Failed to add receivable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    setError(null);
    
    try {
      const response = await fetch(`/api/receivables/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete receivable');
      }
      
      setReceivables(receivables.filter(receivable => receivable.id !== id));
    } catch (err) {
      console.error('Error deleting receivable:', err);
      setError('Failed to delete receivable. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (id) => {
    setIsUpdating(id);
    setError(null);
    
    try {
      // Find the current receivable to toggle its status
      const currentReceivable = receivables.find(r => r.id === id);
      if (!currentReceivable) return;
      
      const response = await fetch(`/api/receivables/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isReceived: !currentReceivable.isReceived
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update receivable status');
      }
      
      const updatedReceivable = await response.json();
      
      setReceivables(receivables.map(receivable =>
        receivable.id === id ? updatedReceivable : receivable
      ));
    } catch (err) {
      console.error('Error updating receivable status:', err);
      setError('Failed to update receivable status. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  // Export function
  const exportToCSV = () => {
    if (receivables.length === 0) {
      showError('No receivables data to export', { title: 'Export Failed' });
      return;
    }

    const headers = ['Due Date', 'Name', 'Description', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...receivables.map(receivable => [
        new Date(receivable.dueDate).toLocaleDateString(),
        `"${receivable.name.replace(/"/g, '""')}"`,
        `"${receivable.description.replace(/"/g, '""')}"`,
        receivable.amount,
        receivable.isReceived ? 'Received' : 'Pending'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `receivables-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess(`Receivables report exported successfully (${receivables.length} records)`, {
      title: 'Export Complete'
    });
  };

  // Calculate statistics
  const totalReceivables = receivables.reduce((sum, r) => sum + Number(r.amount), 0);
  const receivedReceivables = receivables.filter(r => r.isReceived).reduce((sum, r) => sum + Number(r.amount), 0);
  const pendingReceivables = receivables.filter(r => !r.isReceived).reduce((sum, r) => sum + Number(r.amount), 0);
  const receivedAmount = totalReceivables - pendingReceivables;

  return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Receivables</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Track payments you expect to receive
            </p>
          </div>
          <button 
            onClick={fetchReceivables} 
            className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Export Report Button */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
            Export Report
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Total Receivables Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-blue-100 truncate">Total Receivables</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${totalReceivables.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-blue-100">
                {receivables.length} total entries
              </p>
            </div>
          </div>
          
          {/* Received Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-green-100 truncate">Received</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${receivedReceivables.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-green-100">
                {receivables.filter(r => r.isReceived).length} received entries
              </p>
            </div>
          </div>
          
          {/* Pending Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-yellow-100 truncate">Pending</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${pendingReceivables.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-yellow-100">
                {receivables.filter(r => !r.isReceived).length} pending entries
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Add Receivable Form */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Receivable</h2>
            <FinanceForm 
              type="receivable" 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting} 
            />
          </div>
        </div>

        {/* Upcoming Receivables */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Upcoming Receivables</h2>
            <div className="flow-root">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <ArrowPathIcon className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : receivables.filter(r => !r.isReceived).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming receivables</p>
              ) : (
                <ul className="-mb-8">
                  {receivables
                    .filter(r => !r.isReceived)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 5)
                    .map((receivable, idx) => (
                      <li key={receivable.id}>
                        <div className="relative pb-8">
                          {idx !== 4 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                                <span className="text-white text-xs">{new Date(receivable.dueDate).getDate()}</span>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-900 dark:text-white">{receivable.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Due: {new Date(receivable.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap font-medium">
                                <span className="text-primary">
                                  ${Number(receivable.amount).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Receivables History */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Receivables History</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <ArrowPathIcon className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : receivables.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No receivables found</p>
            ) : (
              <DataTable 
                data={receivables} 
                type="receivable" 
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                isDeleting={isDeleting}
                isUpdating={isUpdating}
              />
            )}
          </div>
        </div>
      </div>
  );
}