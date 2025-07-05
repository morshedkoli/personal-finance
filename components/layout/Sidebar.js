"use client";
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  XMarkIcon,
  TagIcon, // Add this import for the categories icon
  CalendarIcon, // Add this import for the account/history icon
  UserCircleIcon, // Add this import for the profile icon
  Cog6ToothIcon, // Add this import for the settings icon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: HomeIcon },
  { name: 'Income', href: '/dashboard/income', icon: ArrowTrendingUpIcon },
  { name: 'Expenses', href: '/dashboard/expenses', icon: ArrowTrendingDownIcon },
  { name: 'Payables', href: '/dashboard/payables', icon: CreditCardIcon },
  { name: 'Receivables', href: '/dashboard/receivables', icon: CurrencyDollarIcon },
  { name: 'Categories', href: '/dashboard/categories', icon: TagIcon },
];

const accountNavigation = [
  { name: 'History', href: '/history', icon: CalendarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center mt-2">
        <div className="flex items-center">
          <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg mr-2">
            <CurrencyDollarIcon className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Finance Tracker</span>
        </div>
      </div>
      <nav className="flex flex-1 flex-col mt-2">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 pl-2">
          Main Menu
        </div>
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          <li>
            <ul role="list" className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-x-3 rounded-lg py-2.5 px-3 text-sm font-medium transition-all duration-200
                        ${isActive
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-sm'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:text-primary'}
                      `}
                    >
                      <div className={`flex-shrink-0 ${isActive ? 'bg-primary/10 dark:bg-primary/30 p-1.5 rounded-md' : 'p-1.5'}`}>
                        <item.icon
                          className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary'}`}
                          aria-hidden="true"
                        />
                      </div>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
          {/* Account Section */}
          <li className="mt-8">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 pl-2">
              Account
            </div>
            <ul role="list" className="space-y-1">
              {accountNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-x-3 rounded-lg py-2.5 px-3 text-sm font-medium transition-all duration-200
                        ${isActive
                          ? 'bg-primary/10 dark:bg-primary/20 text-primary shadow-sm'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/70 hover:text-primary'}
                      `}
                    >
                      <div className={`flex-shrink-0 ${isActive ? 'bg-primary/10 dark:bg-primary/30 p-1.5 rounded-md' : 'p-1.5'}`}>
                        <item.icon
                          className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 group-hover:text-primary'}`}
                          aria-hidden="true"
                        />
                      </div>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
        
        <div className="mt-auto pt-6 pb-4">
          <div className="rounded-lg bg-primary/5 dark:bg-primary/10 p-4">
            <h3 className="text-sm font-medium text-primary mb-2">Need Help?</h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">Check our documentation for tips on managing your finances effectively.</p>
            <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
              View Documentation →
            </a>
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                {sidebarContent}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 pb-4">
          {sidebarContent}
        </div>
      </div>
    </>
  );
}