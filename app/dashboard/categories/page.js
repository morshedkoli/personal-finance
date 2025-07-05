'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'income' });
  const [activeTab, setActiveTab] = useState('income');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add category');
      }
      
      const addedCategory = await response.json();
      setCategories([...categories, addedCategory]);
      setNewCategory({ ...newCategory, name: '' });
    } catch (err) {
      console.error('Error adding category:', err);
      setError('Failed to add category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    setError(null);
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete category');
      }
      
      setCategories(categories.filter(category => category.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredCategories = categories.filter(category => category.type === activeTab);

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your income and expense categories
          </p>
        </div>
        <button 
          onClick={fetchCategories} 
          className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          disabled={isLoading}
        >
          <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:text-white"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <TagIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Enter category name"
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:text-white dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                 <>
                   <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                   Adding...
                 </>
               ) : (
                 <>
                   <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                   Add Category
                 </>
               )}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('income')}
                  className={`${activeTab === 'income'
                    ? 'border-primary text-primary dark:text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Income
                </button>
                <button
                  onClick={() => setActiveTab('expense')}
                  className={`${activeTab === 'expense'
                    ? 'border-primary text-primary dark:text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Expense
                </button>
              </nav>
            </div>
          </div>

          {isLoading && !categories.length ? (
            <div className="py-8 flex justify-center">
              <ArrowPathIcon className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <li key={category.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isDeleting === category.id}
                    >
                      {isDeleting === category.id ? (
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}
                    </button>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {isLoading ? 'Loading categories...' : `No ${activeTab} categories found. Add some!`}
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}