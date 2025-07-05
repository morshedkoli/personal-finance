import { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CalendarIcon, TagIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

export default function FinanceForm({ type, onSubmit, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
  });
  
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        
        // Filter categories based on type
        const filteredCategories = data
          .filter(category => category.type.toLowerCase() === type.toLowerCase())
          .map(category => category.name);
          
        setCategories(filteredCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories if API fails
        const defaultCategories = {
          income: ['Salary', 'Freelance', 'Investment', 'Other'],
          expense: ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'],
          receivable: ['Client', 'Refund', 'Loan', 'Other'],
          payable: ['Bill', 'Rent', 'Subscription', 'Other'],
        };
        
        setCategories(defaultCategories[type] || []);
      }
    };
    
    fetchCategories();
  }, [type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-md mx-auto transition-all duration-300">
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {type === 'income' && <span className="inline-flex items-center justify-center p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full"><CurrencyDollarIcon className="h-5 w-5 text-green-600 dark:text-green-400" /></span>}
          {type === 'expense' && <span className="inline-flex items-center justify-center p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full"><CurrencyDollarIcon className="h-5 w-5 text-red-600 dark:text-red-400" /></span>}
          {type === 'payable' && <span className="inline-flex items-center justify-center p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full"><UserIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" /></span>}
          {type === 'receivable' && <span className="inline-flex items-center justify-center p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full"><UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" /></span>}
          Add {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to add a new {type} record.</p>
      </div>
      {(type === 'payable' || type === 'receivable') && (
        <div className="group">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            Name <span className="text-red-500 ml-1">*</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">(Required)</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <UserIcon className={`h-5 w-5 ${type === 'payable' ? 'text-orange-500' : 'text-blue-500'}`} aria-hidden="true" />
            </div>
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all duration-200 sm:text-sm shadow-sm"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {type === 'payable' ? 'Person or company you owe money to' : 'Person or company that owes you money'}
          </p>
        </div>
      )}
      <div className="group">
        <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          Amount <span className="text-red-500 ml-1">*</span>
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">(Required)</span>
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <CurrencyDollarIcon 
              className={`h-5 w-5 ${type === 'income' ? 'text-green-500' : ''} ${type === 'expense' ? 'text-red-500' : ''} ${type === 'payable' ? 'text-orange-500' : ''} ${type === 'receivable' ? 'text-blue-500' : ''}`} 
              aria-hidden="true" 
            />
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            step="0.01"
            required
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            className={`block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 hover:border-primary/50 transition-all duration-200 sm:text-sm shadow-sm
              ${type === 'income' ? 'focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-800/30' : ''}
              ${type === 'expense' ? 'focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800/30' : ''}
              ${type === 'payable' ? 'focus:border-orange-500 focus:ring-orange-200 dark:focus:ring-orange-800/30' : ''}
              ${type === 'receivable' ? 'focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800/30' : ''}
            `}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 dark:text-gray-400 text-sm">$</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter the exact amount {type === 'income' || type === 'receivable' ? 'received' : 'paid'} (dollars and cents)
        </p>
      </div>

      <div className="group">
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
          Description <span className="text-red-500 ml-1">*</span>
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">(Required)</span>
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <DocumentTextIcon 
              className={`h-5 w-5 ${type === 'income' ? 'text-green-500' : ''} ${type === 'expense' ? 'text-red-500' : ''} ${type === 'payable' ? 'text-orange-500' : ''} ${type === 'receivable' ? 'text-blue-500' : ''}`} 
              aria-hidden="true" 
            />
          </div>
          <input
            type="text"
            name="description"
            id="description"
            required
            placeholder="Enter description"
            value={formData.description}
            onChange={handleChange}
            className={`block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 hover:border-primary/50 transition-all duration-200 sm:text-sm shadow-sm
              ${type === 'income' ? 'focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-800/30' : ''}
              ${type === 'expense' ? 'focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800/30' : ''}
              ${type === 'payable' ? 'focus:border-orange-500 focus:ring-orange-200 dark:focus:ring-orange-800/30' : ''}
              ${type === 'receivable' ? 'focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800/30' : ''}
            `}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Brief description of the {type} (e.g., {type === 'income' ? 'Monthly salary' : type === 'expense' ? 'Grocery shopping' : type === 'payable' ? 'Rent payment' : 'Client invoice'})
        </p>
      </div>

      {(type === 'income' || type === 'expense') && (
        <div className="group">
          <label htmlFor="category" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            Category <span className="text-red-500 ml-1">*</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">(Required)</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <TagIcon 
                className={`h-5 w-5 ${type === 'income' ? 'text-green-500' : 'text-red-500'}`} 
                aria-hidden="true" 
              />
            </div>
            <select
              name="category"
              id="category"
              required
              value={formData.category}
              onChange={handleChange}
              className={`block w-full rounded-lg pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 hover:border-primary/50 transition-all duration-200 sm:text-sm shadow-sm appearance-none
                ${type === 'income' ? 'focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-800/30' : ''}
                ${type === 'expense' ? 'focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800/30' : ''}
              `}
            >
              <option value="" className="text-gray-500 dark:text-gray-300">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category} className="text-gray-700 dark:text-white">
                  {category}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Select the appropriate category for this {type}
          </p>
        </div>
      )}

      {(type === 'income' || type === 'expense') ? (
        <div className="group">
          <label htmlFor="date" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            Date <span className="text-red-500 ml-1">*</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">(Required)</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon 
                className={`h-5 w-5 ${type === 'income' ? 'text-green-500' : 'text-red-500'}`} 
                aria-hidden="true" 
              />
            </div>
            <input
              type="date"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
              className={`block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 hover:border-primary/50 transition-all duration-200 sm:text-sm shadow-sm
                ${type === 'income' ? 'focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-800/30' : ''}
                ${type === 'expense' ? 'focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-800/30' : ''}
              `}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Date when this {type} occurred
          </p>
        </div>
      ) : (
        <div className="group">
          <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            Due Date <span className="text-red-500 ml-1">*</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">(Required)</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon 
                className={`h-5 w-5 ${type === 'payable' ? 'text-orange-500' : 'text-blue-500'}`} 
                aria-hidden="true" 
              />
            </div>
            <input
              type="date"
              name="dueDate"
              id="dueDate"
              required
              value={formData.dueDate}
              onChange={handleChange}
              className={`block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 hover:border-primary/50 transition-all duration-200 sm:text-sm shadow-sm
                ${type === 'payable' ? 'focus:border-orange-500 focus:ring-orange-200 dark:focus:ring-orange-800/30' : ''}
                ${type === 'receivable' ? 'focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800/30' : ''}
              `}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Date when this {type} is due
          </p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed
            ${type === 'income' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : ''}
            ${type === 'expense' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : ''}
            ${type === 'payable' ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' : ''}
            ${type === 'receivable' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : ''}
            focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {isSubmitting ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span className="mr-2">
                {type === 'income' && <CurrencyDollarIcon className="h-5 w-5 text-white" />}
                {type === 'expense' && <CurrencyDollarIcon className="h-5 w-5 text-white" />}
                {type === 'payable' && <UserIcon className="h-5 w-5 text-white" />}
                {type === 'receivable' && <UserIcon className="h-5 w-5 text-white" />}
              </span>
              <span>Save {type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </>
          )}
        </button>
        
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          All fields marked with * are required
        </p>
      </div>
    </form>
  );
}