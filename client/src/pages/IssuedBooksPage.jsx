import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookMarked,
  RotateCcw,
  Clock,
  AlertTriangle,
  User,
  Search,
  CheckCircle2
} from 'lucide-react';
import { borrowService } from '../services/borrowService';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const IssuedBooksPage = () => {
  const [searchParams] = useSearchParams();
  const bookIdQuery = searchParams.get('bookId');

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Return Modal state
  const [returnTarget, setReturnTarget] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [returning, setReturning] = useState(false);

  const fetchIssuedBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await borrowService.getBorrowHistory({
        status: 'borrowed',
        page,
        limit: 10
      });
      let recs = data.records || [];
      if (bookIdQuery) {
        recs = recs.filter((r) => r.bookId?._id === bookIdQuery);
      }
      setRecords(recs);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load issued books list');
    } finally {
      setLoading(false);
    }
  }, [page, bookIdQuery]);

  useEffect(() => {
    fetchIssuedBooks();
  }, [fetchIssuedBooks]);

  const handleConfirmReturn = async () => {
    if (!returnTarget) return;
    try {
      setReturning(true);
      const res = await borrowService.returnBook(returnTarget._id, adminNotes);
      toast.success(res.message || 'Book returned and inventory updated!');
      setReturnTarget(null);
      fetchIssuedBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process return');
    } finally {
      setReturning(false);
    }
  };

  const calculateDaysLeft = (dueDate) => {
    if (!dueDate) return 0;
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Currently Issued Books
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Active physical book loans across university students and faculty
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
          Total Active Loans: {total}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading active book checkouts..." />
        ) : records.length === 0 ? (
          <EmptyState
            title="No active loans"
            description="There are currently no books checked out."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Timeline / Status</th>
                  <th className="py-3 px-4 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  const daysLeft = calculateDaysLeft(r.dueDate);
                  const isOverdue = daysLeft < 0;

                  return (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{r.userId?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-500">{r.userId?.email}</p>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {r.userId?.role} • {r.userId?.studentId || r.userId?.staffId || 'ID: N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 line-clamp-1">{r.bookId?.title}</p>
                        <p className="text-[11px] text-slate-500">ISBN: {r.bookId?.ISBN}</p>
                        <span className="text-[10px] text-slate-400">{r.bookId?.shelfLocation}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(r.issueDate)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{formatDate(r.dueDate)}</td>
                      <td className="py-3 px-4">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {Math.abs(daysLeft)} Days Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <Clock className="w-3.5 h-3.5" />
                            {daysLeft} days remaining
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setReturnTarget(r);
                            setAdminNotes('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Process Return</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Return Modal */}
      <Modal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        title="Check-In / Return Book"
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
              <span>{returning ? 'Processing Return...' : 'Confirm Return & Restock'}</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Check in <strong>{returnTarget?.bookId?.title}</strong> returned by{' '}
            <strong>{returnTarget?.userId?.name}</strong>.
          </p>

          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
            • 1 physical copy will be automatically restored to library shelf stock.<br />
            • If returned after due date ({formatDate(returnTarget?.dueDate)}), late fees will be assessed automatically.
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Condition / Return Notes:
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Returned in good condition, spine intact"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IssuedBooksPage;
