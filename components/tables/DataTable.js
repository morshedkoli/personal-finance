import { format } from 'date-fns';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

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
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {getHeaders().map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 sm:pl-6"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={getHeaders().length} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                      <div className="flex justify-center items-center py-8">
                        <ArrowPathIcon className="animate-spin h-8 w-8 text-primary" />
                        <span className="ml-2">Loading data...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={getHeaders().length} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900 dark:text-gray-200 sm:pl-6">
                        {formatDate(type === 'payable' || type === 'receivable' ? item.dueDate : item.date)}
                      </td>
                      {(type === 'payable' || type === 'receivable') && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {item.name}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </td>
                      {(type === 'income' || type === 'expense') && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {item.category}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.amount)}
                      </td>
                      {(type === 'payable' || type === 'receivable') && (
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {getStatus(item)}
                        </td>
                      )}
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                        {(type === 'payable' || type === 'receivable') && (
                          <button
                            onClick={() => onToggleStatus(item.id)}
                            disabled={isUpdating === item.id}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                          >
                            {isUpdating === item.id ? (
                              <>
                                <ArrowPathIcon className="animate-spin -ml-1 mr-1 h-4 w-4" />
                                Updating...
                              </>
                            ) : (
                              <>Toggle Status</>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(item.id)}
                          disabled={isDeleting === item.id}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                        >
                          {isDeleting === item.id ? (
                            <>
                              <ArrowPathIcon className="animate-spin -ml-1 mr-1 h-4 w-4" />
                              Deleting...
                            </>
                          ) : (
                            <>Delete</>
                          )}
                        </button>
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