import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Menu,
  Check,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Badge from './Badge';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md transition-all">
      {/* Left side: Hamburger toggle + quick search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalogue by title, author, or ISBN..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </form>
      </div>

      {/* Right side: Notifications & User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={`p-3 text-xs transition-colors cursor-pointer rounded-xl hover:bg-slate-50 ${
                        !n.isRead ? 'bg-blue-50/50 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 p-2 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block text-xs font-semibold text-blue-600 hover:text-blue-800 py-1"
                >
                  View all notifications &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-bold text-slate-800 line-clamp-1">{user?.name}</p>
              <div className="flex items-center gap-1">
                <Badge variant={user?.role} size="xs">
                  {user?.role}
                </Badge>
              </div>
            </div>
            <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 z-50">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Profile & Security</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Library Settings</span>
                  </Link>
                )}

                <Link
                  to="/books"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Browse Catalogue</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
