'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import FinanceForm from '@/components/forms/FinanceForm';
import DataTable from '@/components/tables/DataTable';
import { useNotification } from '@/components/notifications/NotificationProvider';

export default function IncomePage() {
  const { showSuccess, showError } = useNotification();
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [error, setError] = useState(null);

  const fetchIncomes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/income');
      if (!response.ok) {
        throw new Error('Failed to fetch income data');
      }
      const data = await response.json();
      setIncomes(data);
    } catch (err) {
      showError('Failed to load income data. Please refresh the page or check your connection.', {
        title: 'Loading Error'
      });
      setError('Failed to load income data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add income');
      }
      
      const addedIncome = await response.json();
      setIncomes([addedIncome, ...incomes]);
      
      showSuccess(`Income of $${addedIncome.amount.toLocaleString()} added successfully!`, {
        title: 'Income Added'
      });
    } catch (err) {
      showError(`Failed to add income: ${err.message}`, {
        title: 'Add Failed'
      });
      setError('Failed to add income. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    setError(null);
    
    try {
      const response = await fetch(`/api/income/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete income');
      }
      
      const deletedIncome = incomes.find(income => income.id === id);
      setIncomes(incomes.filter(income => income.id !== id));
      
      showSuccess(`Income record of $${deletedIncome?.amount?.toLocaleString() || 'N/A'} deleted successfully!`, {
        title: 'Income Deleted'
      });
    } catch (err) {
      showError(`Failed to delete income: ${err.message}`, {
        title: 'Delete Failed'
      });
      setError('Failed to delete income. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Export function
  const exportToCSV = () => {
    if (incomes.length === 0) {
      showError('No income data to export', { title: 'Export Failed' });
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...incomes.map(income => [
        new Date(income.date).toLocaleDateString(),
        `"${income.description.replace(/"/g, '""')}"`,
        `"${income.category.replace(/"/g, '""')}"`,
        income.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `income-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess(`Income report exported successfully (${incomes.length} records)`, {
      title: 'Export Complete'
    });
  };

  // Calculate statistics
  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const thisMonthIncome = incomes
    .filter(income => {
      const incomeDate = new Date(income.date);
      const currentDate = new Date();
      return incomeDate.getMonth() === currentDate.getMonth() && 
             incomeDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, income) => sum + Number(income.amount), 0);

  return (
    <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Income</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Track your income sources and manage your earnings
            </p>
          </div>
          <button 
            onClick={fetchIncomes} 
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
          {/* Total Income Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-blue-100 truncate">Total Income</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${totalIncome.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-blue-100">
                {incomes.length} total entries
              </p>
            </div>
          </div>
          
          {/* This Month Income Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-green-100 truncate">This Month</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${thisMonthIncome.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-green-100">
                Current month earnings
              </p>
            </div>
          </div>
          
          {/* Average Income Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-purple-100 truncate">Average Income</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${incomes.length > 0 ? (totalIncome / incomes.length).toLocaleString(undefined, {maximumFractionDigits: 2}) : 0}
              </dd>
              <p className="mt-2 text-sm text-purple-100">
                Per income entry
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

        {/* Add Income Form */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Income</h2>
            <FinanceForm type="income" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>

        {/* Income Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Income History</h2>
            <DataTable
              data={incomes}
              type="income"
              onDelete={handleDelete}
              isDeleting={isDeleting}
              isLoading={isLoading}
            />
          </div>
        </div>
    </div>
  );
}