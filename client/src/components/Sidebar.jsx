import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FileCheck2,
  BookMarked,
  RotateCcw,
  AlertTriangle,
  History,
  Users,
  BarChart3,
  Bell,
  Settings,
  User,
  X,
  Library
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isStudent, isStaff } = useAuth();
  const { unreadCount } = useNotification();

  const adminLinks = [
    { label: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Manage Books', to: '/admin/books', icon: BookOpen },
    { label: 'Add New Book', to: '/admin/books/add', icon: PlusCircle },
    { label: 'Borrow Requests', to: '/admin/borrowing/requests', icon: FileCheck2 },
    { label: 'Issued Books', to: '/admin/borrowing/issued', icon: BookMarked },
    { label: 'Return Desk', to: '/admin/borrowing/returns', icon: RotateCcw },
    { label: 'Overdue Books', to: '/admin/borrowing/overdue', icon: AlertTriangle },
    { label: 'Borrowing History', to: '/admin/borrowing/history', icon: History },
    { label: 'User Accounts', to: '/admin/users', icon: Users },
    { label: 'Reports & CSV', to: '/admin/reports', icon: BarChart3 },
    { label: 'System Settings', to: '/admin/settings', icon: Settings },
  ];

  const studentLinks = [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Book Catalogue', to: '/books', icon: BookOpen },
    { label: 'My Borrowings', to: '/borrowing/history', icon: History },
    { label: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profile & Security', to: '/profile', icon: User },
  ];

  const staffLinks = [
    { label: 'Staff Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Library Catalogue', to: '/books', icon: BookOpen },
    { label: 'My Loans & History', to: '/borrowing/history', icon: History },
    { label: 'Notifications', to: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profile & Security', to: '/profile', icon: User },
  ];

  const navLinks = isAdmin ? adminLinks : isStaff ? staffLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">
                Athena Library
              </span>
              <span className="block text-[10px] uppercase font-semibold text-blue-400 tracking-wider">
                MERN Full Stack
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-4 mx-4 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name}</p>
            <p className="text-[11px] font-medium text-slate-400 capitalize">
              Role: <span className="text-blue-400 font-semibold">{user?.role}</span>
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Menu Navigation
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 p-4 text-center">
          <p className="text-[11px] text-slate-500">Athena Library System v1.0</p>
          <p className="text-[10px] text-slate-600 mt-0.5">MERN paired with Tailwind</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
