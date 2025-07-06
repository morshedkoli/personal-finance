'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { CurrencyDollarIcon, ChartPieIcon, CalendarIcon } from '@heroicons/react/24/outline';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalPayables: 0,
    totalReceivables: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    planningProjects: 0,
    dueProjects: 0,
    totalProjectBudget: 0,
    totalProjectCost: 0,
    totalProjectRevenue: 0,
    totalProjectPaidAmount: 0,
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    income: [],
    expenses: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [latestTransactions, setLatestTransactions] = useState([]);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setStats(data.stats);
      setMonthlyData(data.monthlyData);
      setLatestTransactions(data.latestTransactions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to default values if API call fails
      setStats({
        totalIncome: 0,
        totalExpenses: 0,
        totalPayables: 0,
        totalReceivables: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        planningProjects: 0,
        dueProjects: 0,
        totalProjectBudget: 0,
        totalProjectCost: 0,
        totalProjectRevenue: 0,
        totalProjectPaidAmount: 0,
      });

      setMonthlyData({
        labels: [],
        income: [],
        expenses: [],
      });
      setLatestTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Update chart options when component mounts and when theme changes
  useEffect(() => {
    // Function to update chart options based on theme
    const updateChartOptions = () => {
      // Only run in browser environment
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const textColor = isDarkMode ? 'white' : 'black';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        // Update pie chart options
        setPieOptions(prev => ({
          ...prev,
          plugins: {
            ...prev.plugins,
            legend: {
              ...prev.plugins.legend,
              labels: {
                ...prev.plugins.legend.labels,
                color: textColor,
              },
            },
          },
        }));
        
        // Update bar chart options
        setBarOptions(prev => ({
          ...prev,
          plugins: {
            ...prev.plugins,
            legend: {
              ...prev.plugins.legend,
              labels: {
                ...prev.plugins.legend.labels,
                color: textColor,
              },
            },
            title: {
              ...prev.plugins.title,
              color: textColor,
            },
          },
          scales: {
            x: {
              ...prev.scales.x,
              ticks: {
                ...prev.scales.x.ticks,
                color: textColor,
              },
              grid: {
                ...prev.scales.x.grid,
                color: gridColor,
              },
            },
            y: {
              ...prev.scales.y,
              ticks: {
                ...prev.scales.y.ticks,
                color: textColor,
              },
              grid: {
                ...prev.scales.y.grid,
                color: gridColor,
              },
            },
          },
        }));
      }
    };
    
    // Update options on mount
    updateChartOptions();
    
    // Listen for theme changes
    if (typeof window !== 'undefined') {
      window.addEventListener('themeChange', updateChartOptions);
      
      return () => {
        window.removeEventListener('themeChange', updateChartOptions);
      };
    }
  }, []);

  const pieData = {
    labels: ['Income', 'Expenses', 'Payables', 'Receivables'],
    datasets: [
      {
        data: [stats.totalIncome, stats.totalExpenses, stats.totalPayables, stats.totalReceivables],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const [pieOptions, setPieOptions] = useState({
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'black',
        },
      },
    },
  });

  const barData = {
    labels: monthlyData.labels || [],
    datasets: [
      {
        label: 'Income',
        data: monthlyData.income || [],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
      },
      {
        label: 'Expenses',
        data: monthlyData.expenses || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const [barOptions, setBarOptions] = useState({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'black',
        },
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses',
        color: 'black',
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'black',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  });

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <ChartPieIcon className="w-8 h-8 text-primary mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your finances at a glance</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300">
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin text-primary" />
                <span>Updating...</span>
              </div>
            ) : (
              <button
                onClick={fetchDashboardData}
                className="flex items-center bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 text-primary px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                title="Refresh data"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid - Financial Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Income Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/30">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-4">
                    <CurrencyDollarIcon className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Income</dt>
                    <dd className="flex items-baseline">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">${stats.totalIncome.toLocaleString()}</span>
                      <span className="ml-2 text-sm font-medium text-green-600 dark:text-green-400">
                        <ArrowDownIcon className="h-4 w-4 rotate-180 inline" />
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 dark:bg-primary/10 px-6 py-2">
              <div className="text-xs text-primary/80 font-medium">All time earnings</div>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-red-300 dark:hover:border-red-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-4">
                    <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Expenses</dt>
                    <dd className="flex items-baseline">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">${stats.totalExpenses.toLocaleString()}</span>
                      <span className="ml-2 text-sm font-medium text-red-600 dark:text-red-400">
                        <ArrowDownIcon className="h-4 w-4 inline" />
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 px-6 py-2">
              <div className="text-xs text-red-600/80 dark:text-red-400/80 font-medium">All time spending</div>
            </div>
          </div>

          {/* Payables Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-yellow-300 dark:hover:border-yellow-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-4">
                    <CalendarIcon className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Payables</dt>
                    <dd className="flex items-baseline">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">${stats.totalPayables.toLocaleString()}</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 px-6 py-2">
              <div className="text-xs text-yellow-600/80 dark:text-yellow-400/80 font-medium">Outstanding payments</div>
            </div>
          </div>

          {/* Receivables Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-green-300 dark:hover:border-green-700">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-4">
                    <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Receivables</dt>
                    <dd className="flex items-baseline">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">${stats.totalReceivables.toLocaleString()}</span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 px-6 py-2">
              <div className="text-xs text-green-600/80 dark:text-green-400/80 font-medium">Expected income</div>
            </div>
          </div>
        </div>

        {/* Project Statistics Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Project Overview</h2>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full">
              Project Statistics
            </span>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total Projects Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Projects</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalProjects}</p>
                  </div>
                  <div className="bg-blue-200 dark:bg-blue-700 rounded-lg p-3">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Active Projects Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Projects</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeProjects}</p>
                  </div>
                  <div className="bg-green-200 dark:bg-green-700 rounded-lg p-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Completed Projects Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Completed Projects</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.completedProjects}</p>
                  </div>
                  <div className="bg-purple-200 dark:bg-purple-700 rounded-lg p-3">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Project Budget Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Budget</p>
                    <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">${stats.totalProjectBudget.toLocaleString()}</p>
                  </div>
                  <div className="bg-indigo-200 dark:bg-indigo-700 rounded-lg p-3">
                    <CurrencyDollarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                </div>
              </div>

              {/* Project Cost Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Total Cost</p>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">${stats.totalProjectCost.toLocaleString()}</p>
                  </div>
                  <div className="bg-orange-200 dark:bg-orange-700 rounded-lg p-3">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Project Revenue Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Project Revenue</p>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">${stats.totalProjectRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-emerald-200 dark:bg-emerald-700 rounded-lg p-3">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Paid Amount Card */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl p-6 border border-teal-200 dark:border-teal-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Total Paid Amount</p>
                    <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">${stats.totalProjectPaidAmount.toLocaleString()}</p>
                  </div>
                  <div className="bg-teal-200 dark:bg-teal-700 rounded-lg p-3">
                    <svg className="w-6 h-6 text-teal-600 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Transactions Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center">
              <CalendarIcon className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Latest Transactions</h2>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary rounded-full">
              Last 5 transactions
            </span>
          </div>
          
          {latestTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                <CalendarIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-gray-900 dark:text-white font-medium mb-1">No transactions yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your recent transactions will appear here</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {latestTransactions.map((tx, idx) => {
                // Determine icon and color based on transaction type
                const getTypeStyles = (type) => {
                  switch(type) {
                    case 'income':
                      return {
                        bgColor: 'bg-primary/10 dark:bg-primary/20',
                        textColor: 'text-primary',
                        icon: <ArrowDownIcon className="h-4 w-4 rotate-180" />
                      };
                    case 'expense':
                      return {
                        bgColor: 'bg-red-100 dark:bg-red-900/30',
                        textColor: 'text-red-600 dark:text-red-400',
                        icon: <ArrowDownIcon className="h-4 w-4" />
                      };
                    case 'payable':
                      return {
                        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
                        textColor: 'text-yellow-600 dark:text-yellow-400',
                        icon: <CalendarIcon className="h-4 w-4" />
                      };
                    case 'receivable':
                      return {
                        bgColor: 'bg-green-100 dark:bg-green-900/30',
                        textColor: 'text-green-600 dark:text-green-400',
                        icon: <CurrencyDollarIcon className="h-4 w-4" />
                      };
                    default:
                      return {
                        bgColor: 'bg-gray-100 dark:bg-gray-700',
                        textColor: 'text-gray-600 dark:text-gray-400',
                        icon: <CurrencyDollarIcon className="h-4 w-4" />
                      };
                  }
                };
                
                const typeStyle = getTypeStyles(tx.type);
                
                return (
                  <li key={tx.id || idx} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`${typeStyle.bgColor} p-2 rounded-lg ${typeStyle.textColor}`}>
                          {typeStyle.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {tx.name || tx.title || tx.description || 'Untitled'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} • {tx.date ? new Date(tx.date).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${typeStyle.textColor}`}>
                        {tx.type === 'expense' || tx.type === 'payable' ? '- ' : '+ '}
                        {tx.amount ? `$${tx.amount.toLocaleString()}` : ''}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          
          {latestTransactions.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700">
              <a href="#" className="text-primary text-sm font-medium hover:text-primary/80 transition-colors flex items-center justify-center">
                View all transactions
              </a>
            </div>
          )}
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center mb-6">
              <ChartPieIcon className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financial Distribution</h2>
            </div>
            <div className="aspect-w-16 aspect-h-9 p-2">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center mb-6">
              <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Income vs Expenses</h2>
            </div>
            <div className="aspect-w-16 aspect-h-9 p-2">
              <Bar options={barOptions} data={barData} />
            </div>
          </div>
        </div>
    </div>
  );
}