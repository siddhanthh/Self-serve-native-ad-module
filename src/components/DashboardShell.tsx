"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

export type NavItem = {
  title: string;
  href: string;
  roles: string[];
};

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail: string;
  userRole: string;
  initial: string;
  allowedNavItems: NavItem[];
}

export default function DashboardShell({
  children,
  userEmail,
  userRole,
  initial,
  allowedNavItems,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Returns a custom SVG icon based on the navigation item title
  const getIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'overview':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z" />
          </svg>
        );
      case 'create campaign':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'approve campaigns':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'user management':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* --- TOP NAVBAR --- */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            
            {/* Brand & Mobile Menu Button */}
            <div className="flex items-center justify-start">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="nav:hidden text-gray-500 bg-transparent hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 rounded-lg text-sm p-2 focus:outline-none cursor-pointer"
              >
                <span className="sr-only">Toggle sidebar</span>
                <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h10"/>
                </svg>
              </button>
              <Link href="/dashboard" className="flex ms-2 md:me-24 items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor"/>
                  <rect x="18" y="4" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.6"/>
                  <rect x="4" y="18" width="10" height="10" rx="2" fill="currentColor" fillOpacity="0.4"/>
                  <path d="M18 20C18 18.8954 18.8954 18 20 18H26C27.1046 18 28 18.8954 28 20V26C28 27.1046 27.1046 28 26 28H20C18.8954 28 18 27.1046 18 26V20Z" fill="currentColor"/>
                </svg>
                <span className="self-center text-xl font-bold whitespace-nowrap text-gray-900">Ad-Module</span>
              </Link>
            </div>

            {/* User Profile Area */}
            <div className="flex items-center">
              <div 
                className="flex items-center ms-3 relative"
                onMouseEnter={() => setIsProfileDropdownOpen(true)}
                onMouseLeave={() => setIsProfileDropdownOpen(false)}
              >
                <button 
                  type="button" 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex text-sm rounded-full focus:ring-4 focus:ring-gray-300 cursor-pointer"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                    {initial}
                  </div>
                </button>
                
                {/* Profile Dropdown Container */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full pt-1.5 z-50 w-44">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {userEmail}
                        </p>
                        <p className="text-xs text-gray-500 truncate uppercase mt-1">
                          Role: {userRole}
                        </p>
                      </div>
                      <ul className="p-2 text-sm text-gray-700 font-medium">
                        <li>
                          <Link 
                            href="/dashboard" 
                            className="inline-flex items-center w-full p-2 hover:bg-gray-100 hover:text-gray-900 rounded"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <LogoutButton />
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- SIDEBAR --- */}
      <aside 
        id="top-bar-sidebar" 
        className={`fixed top-0 left-0 z-40 w-64 h-full pt-20 transition-transform bg-white border-r border-gray-200 nav:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`} 
        aria-label="Sidebar"
      >
        <div className="h-full px-4 py-4 overflow-y-auto bg-white flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 block mb-4">
              Campaign Suite
            </span>
            <ul className="space-y-1.5 font-medium">
              {allowedNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      {getIcon(item.title)}
                      <span className="whitespace-nowrap">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Sidebar status / footer block */}
          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/60">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-gray-500 uppercase">Active Status</span>
                <span className="text-[10px] font-bold text-blue-600 capitalize">{userRole}</span>
              </div>
              <div className="text-xs text-gray-600 font-medium truncate">
                {userEmail}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-900/50 nav:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT & FOOTER AREA --- */}
      <div className="nav:ml-64 pt-14 flex flex-col flex-1 min-h-screen">
        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between w-full px-8 py-6 text-center border-t gap-y-4 border-gray-200 bg-white">
          <p className="block text-gray-500 text-xs font-semibold">
            &copy; {new Date().getFullYear()} Ad-Module. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 text-xs text-gray-500">
            <li><a href="#" className="hover:text-gray-900 transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">License</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Contribute</a></li>
            <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
          </ul>
        </footer>
      </div>
    </div>
  );
}
