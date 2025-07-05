import { format } from 'date-fns';
import { ArrowPathIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { CurrencyDollarIcon, CalendarIcon, TagIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function DataTable({ data, type, onDelete, onToggleStatus, isDeleting, isUpdating, isLoading }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getHeaders = () => {
    switch (type) {
      case 'income':
      case 'expense':
        return ['Date', 'Description', 'Category', 'Amount', 'Actions'];
      case 'payable':
      case 'receivable':
        return ['Due Date', 'Name', 'Description', 'Amount', 'Status', 'Actions'];
      default:
        return [];
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getStatus = (item) => {
    if (type === 'payable') {
      return item.isPaid ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
          Paid
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
          Unpaid
        </span>
      );
    } else if (type === 'receivable') {
      return item.isReceived ? (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
          Received
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
          Pending
        </span>
      );
    }
    return null;
  };

  return (
    <div className="mt-8 flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full py-2 align-middle">
          <div className="overflow-hidden shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {getHeaders().map((header) => {
                    let icon = null;
                    switch(header) {
                      case 'Date':
                      case 'Due Date':
                        icon = <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />;
                        break;
                      case 'Description':
                        icon = <DocumentTextIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />;
                        break;
                      case 'Category':
                        icon = <TagIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />;
                        break;
                      case 'Amount':
                        icon = <CurrencyDollarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />;
                        break;
                      case 'Name':
                        icon = <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />;
                        break;
                    }
                    
                    return (
                      <th
                        key={header}
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:pl-6"
                      >
                        <div className="flex items-center">
                          {icon}
                          {header}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={getHeaders().length} className="py-8 text-center">
                      <div className="flex flex-col justify-center items-center py-12">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                          <ArrowPathIcon className="animate-spin h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Loading data...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This may take a moment</p>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={getHeaders().length} className="py-8 text-center">
                      <div className="flex flex-col justify-center items-center py-12">
                        <div className="rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-4">
                          {type === 'income' && <CurrencyDollarIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                          {type === 'expense' && <CurrencyDollarIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                          {type === 'payable' && <UserIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                          {type === 'receivable' && <UserIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />}
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No {type} records found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add your first {type} record to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-gray-200 sm:pl-6">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1.5 flex-shrink-0" />
                          {formatDate(type === 'payable' || type === 'receivable' ? item.dueDate : item.date)}
                        </div>
                      </td>
                      {(type === 'payable' || type === 'receivable') && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1.5 flex-shrink-0" />
                            {item.name}
                          </div>
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1.5 flex-shrink-0" />
                          <span className="truncate max-w-xs">{item.description}</span>
                        </div>
                      </td>
                      {(type === 'income' || type === 'expense') && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center">
                            <TagIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1.5 flex-shrink-0" />
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              {item.category}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1.5 flex-shrink-0" />
                          <span className={`
                            ${type === 'income' || type === 'receivable' ? 'text-green-600 dark:text-green-400' : ''}
                            ${type === 'expense' || type === 'payable' ? 'text-red-600 dark:text-red-400' : ''}
                          `}>
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </td>
                      {(type === 'payable' || type === 'receivable') && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {getStatus(item)}
                        </td>
                      )}
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end space-x-2">
                          {(type === 'payable' || type === 'receivable') && (
                            <button
                              onClick={() => onToggleStatus(item.id)}
                              disabled={isUpdating === item.id}
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${isUpdating === item.id ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'} text-blue-700 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={`Mark as ${type === 'payable' ? (item.isPaid ? 'Unpaid' : 'Paid') : (item.isReceived ? 'Pending' : 'Received')}`}
                            >
                              {isUpdating === item.id ? (
                                <>
                                  <ArrowPathIcon className="animate-spin h-3.5 w-3.5 mr-1" />
                                  <span>Updating...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
                                  <span>{type === 'payable' ? (item.isPaid ? 'Mark Unpaid' : 'Mark Paid') : (item.isReceived ? 'Mark Pending' : 'Mark Received')}</span>
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(item.id)}
                            disabled={isDeleting === item.id}
                            className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${isDeleting === item.id ? 'bg-red-100 dark:bg-red-900/30' : 'bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30'} text-red-700 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="Delete this record"
                          >
                            {isDeleting === item.id ? (
                              <>
                                <ArrowPathIcon className="animate-spin h-3.5 w-3.5 mr-1" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <TrashIcon className="h-3.5 w-3.5 mr-1" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}