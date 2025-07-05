"use client";
import { useState } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-72 transition-all duration-300">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <footer className="mt-auto py-4 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Personal Finance Tracker. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <a href="#" className="text-xs text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
          