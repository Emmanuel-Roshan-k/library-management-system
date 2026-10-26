import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Library, BookOpen, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PublicLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'staff') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {/* Public Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">Athena</span>
              <span className="text-sm font-semibold text-blue-600 ml-1">Library</span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/books"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Catalogue</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
              >
                <span>Dashboard ({user?.name?.split(' ')[0]})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Join Library</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Library className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">Athena Central Library Management System</span>
          </div>
          <p>© {new Date().getFullYear()} Athena Library. Full Stack MERN pair programming.</p>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <Link to="/books" className="hover:text-blue-600">Catalogue</Link>
            <Link to="/login" className="hover:text-blue-600">Student Login</Link>
            <Link to="/login" className="hover:text-blue-600">Staff Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
