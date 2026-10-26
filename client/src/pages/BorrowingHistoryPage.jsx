import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  History,
  Download,
  Search,
  Filter,
  XCircle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { borrowService } from '../services/borrowService';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/exportCsv';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const BorrowingHistoryPage = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      const params = {
        status: status !== 'all' ? status : undefined,
        search: search.trim() || undefined,
        page,
        limit: 12
      };

      if (isAdmin) {
        data = await borrowService.getBorrowHistory(params);
      } else {
        data = await borrowService.getMyRecords(params);
      }

      setRecords(data.records || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load borrowing history.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, status, search, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleCancelPending = async (recordId) => {
    if (!window.confirm('Cancel this pending request?')) return;
    try {
      await borrowService.cancelRequest(recordId);
      toast.success('Request cancelled');
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleExportCSV = () => {
    const exportData = records.map((r) => ({
      BookTitle: r.bookId?.title || 'Unknown Title',
      ISBN: r.bookId?.ISBN || '',
      BorrowerName: r.userId?.name || 'Self',
      Role: r.userId?.role || '',
      Status: r.status,
      RequestDate: formatDate(r.requestDate),
      IssueDate: formatDate(r.issueDate),
      DueDate: formatDate(r.dueDate),
      ReturnDate: formatDate(r.returnDate),
      LateFeeAssessed: r.lateFee > 0 ? `₹${r.lateFee}` : '₹0'
    }));

    exportToCSV(exportData, `borrowing_history_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? 'Complete Circulation History' : 'My Borrowing History'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Archived log of all book checkouts, requests, and returns'
              : 'Record of your past and active loans, due dates, and fee receipts'}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={records.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Table to CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { label: 'All Records', value: 'all' },
            { label: 'Borrowed', value: 'borrowed' },
            { label: 'Returned', value: 'returned' },
            { label: 'Overdue', value: 'overdue' },
            { label: 'Pending', value: 'pending' },
            { label: 'Rejected', value: 'rejected' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                status === tab.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search records..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving loan archive..." />
        ) : records.length === 0 ? (
          <EmptyState
            title="No records found"
            description="There are no records matching your current filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  {isAdmin && <th className="py-3 px-4">Borrower</th>}
                  <th className="py-3 px-4">Request / Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Late Fee</th>
                  {!isAdmin && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{r.bookId?.title}</p>
                      <p className="text-[11px] text-slate-500">ISBN: {r.bookId?.ISBN}</p>
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{r.userId?.name || 'Unknown'}</p>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {r.userId?.role} • {r.userId?.studentId || r.userId?.staffId || 'ID: N/A'}
                        </span>
                      </td>
                    )}

                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(r.issueDate || r.requestDate)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {r.dueDate ? formatDate(r.dueDate) : '—'}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {r.returnDate ? (
                        <span className="text-emerald-700 font-semibold">{formatDate(r.returnDate)}</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant={r.status} size="xs">
                        {r.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-semibold">
                      {r.lateFee > 0 ? (
                        <span className="text-rose-600 font-bold">₹{r.lateFee}</span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>

                    {!isAdmin && (
                      <td className="py-3 px-4 text-right">
                        {r.status === 'pending' && (
                          <button
                            onClick={() => handleCancelPending(r._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={total}
            pageSize={12}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  );
};

export default BorrowingHistoryPage;
