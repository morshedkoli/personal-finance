"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useNotification } from '@/components/notifications/NotificationProvider';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CreditCardIcon, BriefcaseIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function History() {
  const { showSuccess, showError } = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Fetch regular transactions
        const [transactionsResponse, paymentHistoryResponse] = await Promise.all([
          fetch("/api/dashboard?allTransactions=true"),
          fetch("/api/payment-history")
        ]);
        
        if (!transactionsResponse.ok || !paymentHistoryResponse.ok) {
          throw new Error("Failed to fetch transactions");
        }
        
        const transactionsData = await transactionsResponse.json();
        const paymentHistoryData = await paymentHistoryResponse.json();
        
        // Transform payment history to match transaction format
        const paymentTransactions = paymentHistoryData.map(payment => ({
          id: payment.id,
          type: 'project',
          subType: 'payment',
          name: `Payment: ${payment.project.name}`,
          description: payment.description,
          amount: payment.amount,
          date: payment.paymentDate,
          projectName: payment.project.name,
          previousTotal: payment.previousTotal,
          newTotal: payment.newTotal
        }));
        
        // Combine all transactions
        const allTransactions = [
          ...(transactionsData.allTransactions || []),
          ...paymentTransactions
        ];
        
        setTransactions(allTransactions);
      } catch (err) {
        setError(err.message);
        showError('Failed to load transaction history. Please check your connection and try again.');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => filter === 'all' || tx.type === filter)
    .sort((a, b) => {
      let aValue, bValue;
      if (sortBy === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortBy === 'amount') {
        aValue = a.amount || 0;
        bValue = b.amount || 0;
      } else if (sortBy === 'name') {
        aValue = (a.name || a.title || a.description || '').toLowerCase();
        bValue = (b.name || b.title || b.description || '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getTypeIcon = (type, subType) => {
    switch (type) {
      case 'income': return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'expense': return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      case 'payable': return <CreditCardIcon className="h-5 w-5 text-orange-500" />;
      case 'receivable': return <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />;
      case 'project':
        switch (subType) {
          case 'created': return <BriefcaseIcon className="h-5 w-5 text-purple-500" />;
          case 'payment': return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
          case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
          case 'overdue': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
          default: return <BriefcaseIcon className="h-5 w-5 text-purple-500" />;
        }
      default: return null;
    }
  };

  const getTypeColor = (type, subType) => {
    switch (type) {
      case 'income': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      case 'expense': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'payable': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'receivable': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      case 'project':
        switch (subType) {
          case 'created': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
          case 'payment': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
          case 'completed': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400';
          case 'overdue': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
          default: return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
        }
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Transaction History</h1>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Filter and Sort Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="all">All Transactions</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
                <option value="payable">Payables</option>
                <option value="receivable">Receivables</option>
                <option value="project">Project Activities</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="name">Name</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-primary focus:ring-primary"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">Income</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {transactions.filter(tx => tx.type === 'income').length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="text-red-600 dark:text-red-400 text-sm font-medium">Expenses</div>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {transactions.filter(tx => tx.type === 'expense').length}
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="text-orange-600 dark:text-orange-400 text-sm font-medium">Payables</div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {transactions.filter(tx => tx.type === 'payable').length}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Receivables</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {transactions.filter(tx => tx.type === 'receivable').length}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">Projects</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {transactions.filter(tx => tx.type === 'project').length}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
            <div className="text-gray-500 dark:text-gray-400">Loading transactions...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:text-primary/80"
            >
              Try again
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {filter === 'all' ? 'No transactions found.' : `No ${filter} transactions found.`}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((tx, idx) => (
                    <tr key={tx.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {tx.date ? new Date(tx.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTypeIcon(tx.type, tx.subType)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(tx.type, tx.subType)}`}>
                            {tx.type === 'project' ? (
                              tx.subType ? tx.subType.charAt(0).toUpperCase() + tx.subType.slice(1) : 'Project'
                            ) : (
                              tx.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1) : ""
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="font-medium">{tx.name || tx.title || "Untitled"}</div>
                        {tx.description && (
                          <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate max-w-xs">
                            {tx.description}
                          </div>
                        )}
                        {tx.type === 'project' && tx.subType === 'payment' && (
                          <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                            Previous: ${tx.previousTotal?.toLocaleString()} → New: ${tx.newTotal?.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {tx.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                        <span className={
                          tx.type === "expense" || tx.type === "payable" || (tx.type === "project" && tx.subType === "overdue") ? 
                            "text-red-600 dark:text-red-400" : 
                          tx.type === "project" && tx.subType === "completed" && tx.amount < 0 ?
                            "text-red-600 dark:text-red-400" :
                            "text-green-600 dark:text-green-400"
                        }>
                          {tx.type === "expense" || tx.type === "payable" || (tx.type === "project" && tx.subType === "completed" && tx.amount < 0) ? "- " : 
                           tx.type === "project" && tx.subType === "overdue" ? "" : "+ "}
                          {tx.type === "project" && tx.subType === "overdue" ? 
                            "Alert" : 
                            `$${tx.amount ? Math.abs(tx.amount).toLocaleString() : "0"}`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {tx.type === 'project' ? (
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              tx.subType === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              tx.subType === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              tx.subType === 'payment' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            }`}>
                              {tx.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1) : 'Active'}
                            </span>
                            {tx.priority && (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                tx.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                tx.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                              }`}>
                                {tx.priority.charAt(0).toUpperCase() + tx.priority.slice(1)} Priority
                              </span>
                            )}
                          </div>
                        ) : (tx.type === 'payable' && tx.isPaid) || (tx.type === 'receivable' && tx.isReceived) ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {tx.type === 'payable' ? 'Paid' : 'Received'}
                          </span>
                        ) : (tx.type === 'payable' || tx.type === 'receivable') ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination info */}
            <div className="bg-white dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {filteredTransactions.length} of {transactions.length} transactions
                {filter !== 'all' && (
                  <span className="ml-2 text-primary">({filter} only)</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}