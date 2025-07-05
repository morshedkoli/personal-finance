"use client";
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

export default function Header({ setSidebarOpen }) {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-4 shadow-md sm:gap-x-6 sm:px-6 lg:px-8">
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 lg:hidden" 
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-900/10 dark:bg-gray-600 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Welcome back,</span>
            <span className="ml-1 text-sm font-semibold text-gray-900 dark:text-white">{session?.user?.name?.split(' ')[0] || 'User'}</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="p-1 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
            <ThemeToggle />
          </div>
          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-x-1 rounded-full bg-white dark:bg-gray-800 p-1 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <span className="sr-only">Open user menu</span>
              <img
                className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-sm"
                src={session?.user?.image || '/default-avatar.png'}
                alt=""
              />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white" aria-hidden="true">
                  {session?.user?.name}
                </span>
                <svg className="ml-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </span>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right rounded-lg bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 focus:outline-none">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session?.user?.email}</p>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                        className={`${active ? 'bg-gray-50 dark:bg-gray-700 text-primary' : 'text-gray-700 dark:text-gray-200'} flex w-full items-center px-4 py-2 text-sm transition-colors duration-200`}
                      >
                        <svg className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </div>
  );
}