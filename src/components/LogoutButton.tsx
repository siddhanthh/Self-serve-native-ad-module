"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      await fetch('/api/logout', { method: 'POST' });
      
      router.refresh();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex items-center w-full p-2 text-left hover:bg-gray-100 hover:text-gray-900 rounded text-sm text-gray-700 font-medium cursor-pointer"
    >
      {isLoggingOut ? 'Signing out...' : 'Sign out'}
    </button>
  );
}