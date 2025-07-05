'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalPayables: 0,
    totalReceivables: 0,
  });

  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    income: [],
    expenses: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to default values if API call fails
      setStats({
        totalIncome: 0,
        totalExpenses: 0,
        totalPayables: 0,
        totalReceivables: 0,
      });

      setMonthlyData({
        labels: [],
        income: [],
        expenses: [],
      });
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
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Financial Overview</h1>
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                <span>Loading data...</span>
              </div>
            ) : (
              <button
                onClick={fetchDashboardData}
                className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                title="Refresh data"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 dark:bg-primary/20 rounded-md p-3">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Income</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">${stats.totalIncome.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-md p-3">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Expenses</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">${stats.totalExpenses.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-md p-3">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Payables</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">${stats.totalPayables.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-md p-3">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Receivables</dt>
                    <dd className="text-lg font-semibold text-gray-900 dark:text-white">${stats.totalReceivables.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Financial Distribution</h2>
            <div className="aspect-w-16 aspect-h-9">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="aspect-w-16 aspect-h-9">
              <Bar options={barOptions} data={barData} />
            </div>
          </div>
        </div>
    </div>
  );
}