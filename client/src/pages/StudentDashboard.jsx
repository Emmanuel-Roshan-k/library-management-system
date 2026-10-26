import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  History,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { borrowService } from '../services/borrowService';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const fetchStudentData = async () => {
    try {
      const res = await dashboardService.getStats();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleCancelRequest = async (recordId) => {
    if (!window.confirm('Are you sure you want to cancel this pending borrow request?')) return;
    try {
      setCancellingId(recordId);
      await borrowService.cancelRequest(recordId);
      toast.success('Borrow request cancelled.');
      fetchStudentData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching your student library profile..." />;
  }

  const stats = data?.stats || {};
  const recentRecords = data?.recentRecords || [];
  const recommendedBooks = data?.recommendedBooks || [];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Student Portal • ID: {user?.studentId || 'N/A'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Keep track of your study materials, upcoming due dates, and explore the newest university collections.
          </p>

          <div className="pt-2">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Full Catalogue</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Currently Borrowed"
          value={stats.myCurrentlyBorrowed || 0}
          icon={BookOpen}
          color="blue"
          subtitle="Books on active loan"
          onClick={() => navigate('/borrowing/history?status=borrowed')}
        />
        <StatCard
          title="Pending Requests"
          value={stats.myPendingRequests || 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting librarian review"
          onClick={() => navigate('/borrowing/history?status=pending')}
        />
        <StatCard
          title="Overdue Books"
          value={stats.myOverdue || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle={stats.myOverdue > 0 ? 'Daily late fee active' : 'All clear!'}
          onClick={() => navigate('/borrowing/history?status=overdue')}
        />
        <StatCard
          title="Lifetime Loans"
          value={stats.myTotalHistory || 0}
          icon={History}
          color="emerald"
          subtitle="Total books borrowed"
          onClick={() => navigate('/borrowing/history')}
        />
      </div>

      {/* My Active & Recent Loans */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">My Active & Recent Records</h3>
            <p className="text-xs text-slate-500">Your requested, borrowed, and recently returned volumes</p>
          </div>
          <Link
            to="/borrowing/history"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Book</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Requested / Issued</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    You have no active loans or requests. Check out the catalogue below to borrow!
                  </td>
                </tr>
              ) : (
                recentRecords.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rec.bookId?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                          alt=""
                          className="h-10 w-8 object-cover rounded-md shadow-sm shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{rec.bookId?.title}</p>
                          <p className="text-[11px] text-slate-500">by {rec.bookId?.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{rec.bookId?.category}</td>
                    <td className="py-3 px-3 text-slate-600">
                      {formatDate(rec.issueDate || rec.requestDate)}
                    </td>
                    <td className="py-3 px-3">
                      {rec.dueDate ? (
                        <span className={`font-semibold ${rec.status === 'overdue' ? 'text-rose-600' : 'text-slate-800'}`}>
                          {formatDate(rec.dueDate)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={rec.status} size="xs">
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {rec.status === 'pending' ? (
                        <button
                          onClick={() => handleCancelRequest(rec._id)}
                          disabled={cancellingId === rec._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      ) : (
                        <Link
                          to={`/books/${rec.bookId?._id}`}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Books to Borrow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recommended Reading</h3>
            <p className="text-xs text-slate-500">Available titles in stock ready to request</p>
          </div>
          <Link
            to="/books"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
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

export default StudentDashboard;
