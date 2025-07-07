'use client';

import { XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function PaymentUpdateModal({ 
  showPaymentForm, 
  setShowPaymentForm, 
  editingPayment, 
  setEditingPayment, 
  newPaymentAmount, 
  setNewPaymentAmount, 
  handlePaymentUpdate 
}) {
  if (!showPaymentForm || !editingPayment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-8 rounded-t-2xl border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">Update Payment</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Add or modify payment amount</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowPaymentForm(false);
                setEditingPayment(null);
                setNewPaymentAmount('');
              }}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-8">
          <div className={`mb-4 p-3 border rounded-lg ${
            editingPayment.status === 'due' 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-center">
              <CurrencyDollarIcon className={`h-5 w-5 mr-2 ${
                editingPayment.status === 'due' ? 'text-red-500' : 'text-green-500'
              }`} />
              <p className={`text-sm ${
                editingPayment.status === 'due' 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-green-700 dark:text-green-300'
              }`}>
                <strong>Project:</strong> {editingPayment.name} ({editingPayment.status === 'due' ? 'Due Payment' : 'Completed'})
              </p>
            </div>
            <div className={`mt-2 text-sm ${
              editingPayment.status === 'due' 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              <p><strong>Total Budget:</strong> ${editingPayment.budget?.toLocaleString()}</p>
              <p><strong>Current Paid:</strong> ${editingPayment.paidAmount?.toLocaleString()}</p>
              <p><strong>Remaining:</strong> ${((editingPayment.budget || 0) - (editingPayment.paidAmount || 0)).toLocaleString()}</p>
            </div>
          </div>

          <form onSubmit={handlePaymentUpdate} className="space-y-6">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                editingPayment.status === 'due' 
                  ? 'text-red-700 dark:text-red-300' 
                  : 'text-green-700 dark:text-green-300'
              }`}>
                New Payment Amount ($)
                <span className={`ml-2 text-xs px-3 py-1 rounded-full font-normal ${
                  editingPayment.status === 'due'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                }`}>
                  Add Payment
                </span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={((editingPayment.budget || 0) - (editingPayment.paidAmount || 0))}
                value={newPaymentAmount}
                onChange={(e) => setNewPaymentAmount(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-white focus:ring-2 transition-all duration-200 ${
                  editingPayment.status === 'due'
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 focus:ring-red-500 focus:border-red-500'
                    : 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 focus:ring-green-500 focus:border-green-500'
                }`}
                placeholder="Enter new payment amount"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentForm(false);
                  setEditingPayment(null);
                  setNewPaymentAmount('');
                }}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium rounded-xl border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <CurrencyDollarIcon className="h-4 w-4" />
                Update Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}