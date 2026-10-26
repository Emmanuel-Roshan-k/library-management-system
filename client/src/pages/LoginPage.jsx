import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Library, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await login({ email, password });
      toast.success(`Welcome back, ${data.user.name}!`);

      if (from) {
        navigate(from, { replace: true });
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.user.role === 'staff') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to sign in. Please check credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill buttons for testing
  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@library.com');
      setPassword('Admin@123');
    } else if (role === 'student') {
      setEmail('student@library.com');
      setPassword('Student@123');
    } else if (role === 'staff') {
      setEmail('staff@library.com');
      setPassword('Staff@123');
    }
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Library className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Athena Library Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your institutional credentials to access your dashboard
          </p>
        </div>

        {/* Quick Demo Autofill Bar */}
        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Quick Demo Fill:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm transition-all text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('student')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm transition-all text-center"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('staff')}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm transition-all text-center"
            >
              Staff
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@library.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-md shadow-blue-500/20 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
            Register as Student or Staff &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
