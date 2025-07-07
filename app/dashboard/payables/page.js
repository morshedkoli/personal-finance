'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import FinanceForm from '@/components/forms/FinanceForm';
import DataTable from '@/components/tables/DataTable';
import { useNotification } from '@/components/notifications/NotificationProvider';

export default function PayablesPage() {
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError } = useNotification();

  const fetchPayables = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payables');
      if (!response.ok) {
        throw new Error('Failed to fetch payables');
      }
      const data = await response.json();
      setPayables(data);
    } catch (error) {
      console.error('Error fetching payables:', error);
      setError('Failed to load payables. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayables();
  }, []);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add payable');
      }

      await fetchPayables();
    } catch (error) {
      console.error('Error adding payable:', error);
      setError('Failed to add payable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/payables/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete payable');
      }

      await fetchPayables();
    } catch (error) {
      console.error('Error deleting payable:', error);
      setError('Failed to delete payable. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    setIsUpdating(id);
    try {
      // Find the current payable to toggle its status
      const payable = payables.find(p => p.id === id);
      if (!payable) return;

      const response = await fetch(`/api/payables/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPaid: !payable.isPaid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payable status');
      }

      await fetchPayables();
    } catch (error) {
      console.error('Error updating payable status:', error);
      setError('Failed to update payable status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Export function
  const exportToCSV = () => {
    if (payables.length === 0) {
      showError('No payables data to export', { title: 'Export Failed' });
      return;
    }

    const headers = ['Due Date', 'Name', 'Description', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...payables.map(payable => [
        new Date(payable.dueDate).toLocaleDateString(),
        `"${payable.name.replace(/"/g, '""')}"`,
        `"${payable.description.replace(/"/g, '""')}"`,
        payable.amount,
        payable.isPaid ? 'Paid' : 'Unpaid'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payables-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess(`Payables report exported successfully (${payables.length} records)`, {
      title: 'Export Complete'
    });
  };

  const totalPayables = payables.reduce((sum, payable) => sum + Number(payable.amount), 0);
  const unpaidPayables = payables.filter(p => !p.isPaid).reduce((sum, p) => sum + Number(p.amount), 0);
  const paidPayables = totalPayables - unpaidPayables;

  return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payables</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Track your bills and pending payments
            </p>
          </div>
          <button
            onClick={fetchPayables}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Refreshing...
              </>
            ) : (
              <>Refresh</>  
            )}
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
          {/* Total Payables Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-blue-100 truncate">Total Payables</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${totalPayables.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-blue-100">
                {payables.length} total entries
              </p>
            </div>
          </div>
          
          {/* Unpaid Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-yellow-100 truncate">Unpaid</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${unpaidPayables.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-yellow-100">
                {payables.filter(p => !p.isPaid).length} unpaid entries
              </p>
            </div>
          </div>
          
          {/* Paid Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-green-100 truncate">Paid</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${paidPayables.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-green-100">
                {payables.filter(p => p.isPaid).length} paid entries
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Payable Form */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Payable</h2>
            <FinanceForm type="payable" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>

        {/* Payables Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payables History</h2>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <ArrowPathIcon className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : payables.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No payables found</p>
            ) : (
              <DataTable
                data={payables}
                type="payable"
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