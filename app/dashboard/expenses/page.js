'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import FinanceForm from '@/components/forms/FinanceForm';
import DataTable from '@/components/tables/DataTable';
import { useNotification } from '@/components/notifications/NotificationProvider';

export default function ExpensesPage() {
  const { showSuccess, showError } = useNotification();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/expenses');
      if (!response.ok) {
        throw new Error('Failed to fetch expenses data');
      }
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      showError('Failed to load expenses data. Please refresh the page or check your connection.', {
        title: 'Loading Error'
      });
      setError('Failed to load expenses data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add expense');
      }
      
      const addedExpense = await response.json();
      setExpenses([addedExpense, ...expenses]);
      
      showSuccess(`Expense of $${addedExpense.amount.toLocaleString()} added successfully!`, {
        title: 'Expense Added'
      });
    } catch (err) {
      showError(`Failed to add expense: ${err.message}`, {
        title: 'Add Failed'
      });
      setError('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    setError(null);
    
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete expense');
      }
      
      const deletedExpense = expenses.find(expense => expense.id === id);
      setExpenses(expenses.filter(expense => expense.id !== id));
      
      showSuccess(`Expense record of $${deletedExpense?.amount?.toLocaleString() || 'N/A'} deleted successfully!`, {
        title: 'Expense Deleted'
      });
    } catch (err) {
      showError(`Failed to delete expense: ${err.message}`, {
        title: 'Delete Failed'
      });
      setError('Failed to delete expense. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  // Export function
  const exportToCSV = () => {
    if (expenses.length === 0) {
      showError('No expense data to export', { title: 'Export Failed' });
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        new Date(expense.date).toLocaleDateString(),
        `"${expense.description.replace(/"/g, '""')}"`,
        `"${expense.category.replace(/"/g, '""')}"`,
        expense.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccess(`Expenses report exported successfully (${expenses.length} records)`, {
      title: 'Export Complete'
    });
  };

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const thisMonthExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const currentDate = new Date();
      return expenseDate.getMonth() === currentDate.getMonth() && 
             expenseDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Find largest category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + Number(expense.amount);
    return acc;
  }, {});
  
  const largestCategory = Object.entries(categoryTotals).reduce(
    (largest, [category, amount]) => {
      return amount > largest.amount ? { category, amount } : largest;
    },
    { category: 'None', amount: 0 }
  );

  return (
    <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Expenses</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Track your expenses and manage your spending
            </p>
          </div>
          <button 
            onClick={fetchExpenses} 
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
          {/* Total Expenses Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-red-100 truncate">Total Expenses</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${totalExpenses.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-red-100">
                {expenses.length} total entries
              </p>
            </div>
          </div>
          
          {/* This Month Expenses Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-orange-100 truncate">This Month</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                ${thisMonthExpenses.toLocaleString()}
              </dd>
              <p className="mt-2 text-sm text-orange-100">
                Current month spending
              </p>
            </div>
          </div>
          
          {/* Largest Category Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 overflow-hidden shadow-lg rounded-xl text-white">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-yellow-100 truncate">Largest Category</dt>
              <dd className="mt-1 text-3xl font-extrabold">
                {largestCategory.category}
              </dd>
              <p className="mt-2 text-sm text-yellow-100">
                ${largestCategory.amount.toLocaleString()}
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

        {/* Add Expense Form */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Expense</h2>
            <FinanceForm type="expense" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expense History</h2>
            <DataTable
              data={expenses}
              type="expense"
              onDelete={handleDelete}
              isDeleting={isDeleting}
              isLoading={isLoading}
            />
          </div>
        </div>
    </div>
  );
}