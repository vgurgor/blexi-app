'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import NotificationsDropdown from './NotificationsDropdown';
import UserProfileDropdown from './UserProfileDropdown';
import { useAuth } from '@/lib/auth';

export default function TopNav() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { tenant } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-md bg-white/50 dark:bg-white/5 border-b border-black/10 dark:border-white/10 transition-colors">
        <div className="flex items-center justify-between px-6 h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/dashboard')}
              className="hover:opacity-80 transition-opacity"
            >
              <h1 className="text-2xl font-black text-gray-900 dark:text-transparent dark:bg-gradient-to-r dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 dark:bg-clip-text transition-colors">
                {tenant?.name || 'BLEXI'}
              </h1>
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl px-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Arama yapın..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-cyan-400 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={notificationsRef}>
              <button 
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg relative group transition-colors" 
                title="Bildirimler"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-cyan-500 dark:bg-cyan-400 rounded-full"></span>
              </button>
              <NotificationsDropdown 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
              />
            </div>
            <ThemeToggle />
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg group transition-colors" title="Ayarlar">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
            </button>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg group transition-colors"
                title="Profil"
              >
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
              </button>
              <UserProfileDropdown
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}