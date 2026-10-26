import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Clock,
  AlertTriangle,
  History,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading faculty dashboard..." />;
  }

  const stats = data?.stats || {};
  const recentRecords = data?.recentRecords || [];
  const recommendedBooks = data?.recommendedBooks || [];

  return (
    <div className="space-y-8">
      {/* Faculty Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Faculty Portal • Staff ID: {user?.staffId || 'N/A'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Access academic literature, research publications, syllabus textbooks, and manage your department loans.
          </p>

          <div className="pt-2">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Search Library Repository</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Loans"
          value={stats.myCurrentlyBorrowed || 0}
          icon={BookOpen}
          color="emerald"
          subtitle="Currently checked out"
          onClick={() => navigate('/borrowing/history?status=borrowed')}
        />
        <StatCard
          title="Pending Requests"
          value={stats.myPendingRequests || 0}
          icon={Clock}
          color="amber"
          subtitle="Faculty requisitions"
          onClick={() => navigate('/borrowing/history?status=pending')}
        />
        <StatCard
          title="Overdue Notice"
          value={stats.myOverdue || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle={stats.myOverdue > 0 ? 'Action required' : 'No overdue items'}
          onClick={() => navigate('/borrowing/history?status=overdue')}
        />
        <StatCard
          title="Total Checkouts"
          value={stats.myTotalHistory || 0}
          icon={History}
          color="blue"
          subtitle="Lifetime faculty loans"
          onClick={() => navigate('/borrowing/history')}
        />
      </div>

      {/* Faculty Borrowing Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Current & Recent Loans</h3>
            <p className="text-xs text-slate-500">Tracking departmental and personal loans</p>
          </div>
          <Link
            to="/borrowing/history"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Title & Author</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Issue Date</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No active loan records found. Browse the catalogue to submit a request.
                  </td>
                </tr>
              ) : (
                recentRecords.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{rec.bookId?.title}</p>
                      <p className="text-[11px] text-slate-500">{rec.bookId?.author}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{rec.bookId?.category}</td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(rec.issueDate || rec.requestDate)}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {rec.dueDate ? formatDate(rec.dueDate) : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={rec.status} size="xs">
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/books/${rec.bookId?._id}`}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Academic Textbooks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Academic Reference Materials</h3>
            <p className="text-xs text-slate-500">Available titles in stock</p>
          </div>
          <Link to="/books" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View Catalogue &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedBooks.slice(0, 3).map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onRequestBorrow={() => navigate(`/books/${book._id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
