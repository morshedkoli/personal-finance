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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
      {(type === 'payable' || type === 'receivable') && (
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Name
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <UserIcon className="h-5 w-5 text-primary/60 dark:text-primary/80" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="name"
              id="name"
              required
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
              className="block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-colors duration-200 sm:text-sm"
            />
          </div>
        </div>
      )}
      <div>
        <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Amount
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <CurrencyDollarIcon className="h-5 w-5 text-primary/60 dark:text-primary/80" aria-hidden="true" />
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
            className="block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-colors duration-200 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Description
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <DocumentTextIcon className="h-5 w-5 text-primary/60 dark:text-primary/80" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="description"
            id="description"
            required
            placeholder="Enter description"
            value={formData.description}
            onChange={handleChange}
            className="block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-colors duration-200 sm:text-sm"
          />
        </div>
      </div>

      {(type === 'income' || type === 'expense') && (
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Category
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <TagIcon className="h-5 w-5 text-primary/60 dark:text-primary/80" aria-hidden="true" />
            </div>
            <select
              name="category"
              id="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white bg-white dark:bg-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-colors duration-200 sm:text-sm appearance-none"
            >
              <option value="" className="text-gray-500 dark:text-gray-300">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category} className="text-gray-700 dark:text-white">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {(type === 'income' || type === 'expense') ? (
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Date
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-primary/60 dark:text-primary/80" aria-hidden="true" />
            </div>
            <input
              type="date"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 sm:text-sm"
            />
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Due Date
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" aria-hidden="true" />
            </div>
            <input
              type="date"
              name="dueDate"
              id="dueDate"
              required
              value={formData.dueDate}
              onChange={handleChange}
              className="block w-full rounded-lg pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors duration-200 sm:text-sm"
            />
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              Adding...
            </>
          ) : (
            <>Add {type.charAt(0).toUpperCase() + type.slice(1)}</>
          )}
        </button>
      </div>
    </form>
  );
}