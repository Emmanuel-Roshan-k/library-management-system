import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  BookOpen,
  User,
  Clock,
  Sparkles
} from 'lucide-react';
import { borrowService } from '../services/borrowService';
import { settingService } from '../services/settingService';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const ReturnManagementPage = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const [recentReturns, setRecentReturns] = useState([]);
  const [settings, setSettings] = useState({ dailyLateFee: 5 });
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyData, settingsData] = await Promise.all([
        borrowService.getBorrowHistory({ limit: 50 }),
        settingService.getSettings()
      ]);

      const allRecords = historyData.records || [];
      const borrowed = allRecords.filter((r) => ['borrowed', 'overdue'].includes(r.status));
      const returned = allRecords.filter((r) => r.status === 'returned').slice(0, 8);

      setActiveLoans(borrowed);
      setRecentReturns(returned);
      if (settingsData.settings) setSettings(settingsData.settings);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load return desk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessReturn = async (record) => {
    try {
      setProcessingId(record._id);
      const res = await borrowService.returnBook(record._id, adminNotes);
      toast.success(res.message || 'Book returned and restocked successfully!');
      setAdminNotes('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredLoans = activeLoans.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = r.bookId?.title?.toLowerCase().includes(q);
    const isbnMatch = r.bookId?.ISBN?.toLowerCase().includes(q);
    const userMatch = r.userId?.name?.toLowerCase().includes(q);
    const idMatch = (r.userId?.studentId || r.userId?.staffId || '').toLowerCase().includes(q);
    return titleMatch || isbnMatch || userMatch || idMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Circulation Desk & Book Returns
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Active Desk
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Scan ISBN or search borrower ID to check in returns, calculate late fees, and restore shelf inventory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            Late Fee Rate: <span className="font-bold text-slate-900">₹{settings.dailyLateFee}/day</span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Quick Scan / Search Active Loans
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, Student ID, book ISBN, or book title..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Active Loans Ready for Return */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
            Loans Pending Return ({filteredLoans.length})
          </h3>
          <span className="text-xs text-slate-500">Click Check-in to process</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Checking circulation desk records..." />
        ) : filteredLoans.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {searchQuery ? 'No active loans match your search.' : 'No active loans pending return.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLoans.map((loan) => {
              const now = new Date();
              const due = new Date(loan.dueDate);
              const isOverdue = now > due;
              const diffMs = now - due;
              const overdueDays = isOverdue ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
              const calculatedFee = overdueDays * settings.dailyLateFee;

              return (
                <div
                  key={loan._id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={loan.bookId?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                      alt=""
                      className="w-14 h-18 object-cover rounded-xl shadow-sm border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{loan.bookId?.title}</h4>
                      <p className="text-xs text-slate-500">ISBN: {loan.bookId?.ISBN} • Shelf: {loan.bookId?.shelfLocation}</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="font-semibold text-slate-800">
                          Borrower: {loan.userId?.name}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">
                          {loan.userId?.studentId || loan.userId?.staffId || loan.userId?.email}
                        </span>
                        <Badge variant={loan.userId?.role} size="xs">
                          {loan.userId?.role}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 md:gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="text-xs space-y-0.5">
                      <span className="text-slate-400 block font-medium">Due Date</span>
                      <span className="font-bold text-slate-800">{formatDate(loan.dueDate)}</span>
                      {isOverdue && (
                        <span className="text-rose-600 font-bold block text-[11px]">
                          {overdueDays} Days Late (Fee: ₹{calculatedFee})
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleProcessReturn(loan)}
                      disabled={processingId === loan._id}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{processingId === loan._id ? 'Checking In...' : 'Accept Return & Restock'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Returns Log */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-3">
          Recently Processed Returns
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Book</th>
                <th className="py-2.5 px-3">Borrower</th>
                <th className="py-2.5 px-3">Return Date</th>
                <th className="py-2.5 px-3">Late Fee Assessed</th>
                <th className="py-2.5 px-3">Desk Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReturns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    No returns logged today.
                  </td>
                </tr>
              ) : (
                recentReturns.map((ret) => (
                  <tr key={ret._id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{ret.bookId?.title}</td>
                    <td className="py-2.5 px-3 text-slate-700">{ret.userId?.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{formatDate(ret.returnDate)}</td>
                    <td className="py-2.5 px-3">
                      {ret.lateFee > 0 ? (
                        <span className="font-bold text-rose-600">₹{ret.lateFee}</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">₹0 (On Time)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{ret.adminNotes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReturnManagementPage;
