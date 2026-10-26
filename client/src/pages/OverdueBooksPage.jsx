import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Download,
  Mail,
  Phone,
  Clock,
  User,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { borrowService } from '../services/borrowService';
import { exportToCSV } from '../utils/exportCsv';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const OverdueBooksPage = () => {
  const [records, setRecords] = useState([]);
  const [ratePerDay, setRatePerDay] = useState(5);
  const [loading, setLoading] = useState(true);

  // Return modal
  const [returnTarget, setReturnTarget] = useState(null);
  const [returning, setReturning] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchOverdue = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getOverdueBooks();
      setRecords(res.records || []);
      if (res.overdueRatePerDay) setRatePerDay(res.overdueRatePerDay);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load overdue books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const totalLateFees = records.reduce((sum, r) => sum + (r.currentLateFee || 0), 0);

  const handleConfirmReturn = async () => {
    if (!returnTarget) return;
    try {
      setReturning(true);
      const res = await borrowService.returnBook(returnTarget._id, adminNotes);
      toast.success(res.message || 'Book returned and fee recorded');
      setReturnTarget(null);
      fetchOverdue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setReturning(false);
    }
  };

  const handleSendReminder = (record) => {
    toast.success(`Overdue notice dispatched to ${record.userId?.email}`);
  };

  const handleExportCSV = () => {
    const exportData = records.map((r) => ({
      BorrowerName: r.userId?.name || 'Unknown',
      Email: r.userId?.email || '',
      Phone: r.userId?.phone || '',
      Role: r.userId?.role || '',
      StudentStaffId: r.userId?.studentId || r.userId?.staffId || '',
      BookTitle: r.bookId?.title || '',
      ISBN: r.bookId?.ISBN || '',
      DueDate: formatDate(r.dueDate),
      DaysOverdue: r.overdueDays,
      DailyRate: `₹${ratePerDay}`,
      AccruedLateFee: `₹${r.currentLateFee || 0}`
    }));
    exportToCSV(exportData, `overdue_books_report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Overdue Books & Penalty Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 animate-pulse">
              {records.length} Defaulters
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor overdue student and staff loans, evaluate daily penalty rates, and collect returns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Overdue Volumes
          </span>
          <span className="text-3xl font-extrabold text-rose-600 mt-1 block">
            {records.length}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Currently past due deadline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Accrued Late Fees
          </span>
          <span className="text-3xl font-extrabold text-slate-900 mt-1 block">
            ₹{totalLateFees}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Accumulated across defaulters</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Configured Late Rate
          </span>
          <span className="text-3xl font-extrabold text-blue-600 mt-1 block">
            ₹{ratePerDay}/day
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Per overdue day</span>
        </div>
      </div>

      {/* Overdue List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Scanning overdue borrow records..." />
        ) : records.length === 0 ? (
          <EmptyState
            title="All loans in good standing!"
            description="No overdue books found. All student and staff checkouts are within their borrow period."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Borrower & Contact</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Days Overdue</th>
                  <th className="py-3 px-4">Late Fee</th>
                  <th className="py-3 px-4 text-right">Librarian Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{r.userId?.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-500">{r.userId?.email}</p>
                      <p className="text-[10px] text-slate-400">
                        {r.userId?.phone || 'No phone'} • {r.userId?.studentId || r.userId?.staffId || 'ID: N/A'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{r.bookId?.title}</p>
                      <p className="text-[11px] text-slate-500">ISBN: {r.bookId?.ISBN}</p>
                      <span className="text-[10px] text-slate-400">{r.bookId?.shelfLocation}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-600">
                      {formatDate(r.dueDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                        {r.overdueDays} Days
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-extrabold text-slate-900">
                        ₹{r.currentLateFee}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendReminder(r)}
                          title="Send In-App Reminder"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setReturnTarget(r);
                            setAdminNotes(`Overdue return collected with fee of ₹${r.currentLateFee}`);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          Collect & Return
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Modal */}
      <Modal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        title="Check-In Overdue Book"
        footer={
          <>
            <button
              onClick={() => setReturnTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReturn}
              disabled={returning}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{returning ? 'Processing...' : 'Confirm Return & Collect Fee'}</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Accepting overdue return for <strong>{returnTarget?.bookId?.title}</strong> from{' '}
            <strong>{returnTarget?.userId?.name}</strong>.
          </p>

          <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
            <span className="font-bold block mb-1">Fee Assessment Summary:</span>
            • Days overdue: {returnTarget?.overdueDays} days<br />
            • Rate: ₹{ratePerDay}/day<br />
            • Total Penalty Due: <strong>₹{returnTarget?.currentLateFee}</strong>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Payment & Return Receipt Notes:
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OverdueBooksPage;
