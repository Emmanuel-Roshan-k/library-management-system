import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  BookOpen,
  Users,
  AlertTriangle,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { reportService } from '../services/reportService';
import { exportToCSV } from '../utils/exportCsv';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('borrowing'); // 'borrowing', 'popular', 'overdue', 'users'
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'borrowing') {
        res = await reportService.getBorrowingReport({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        });
      } else if (activeTab === 'popular') {
        res = await reportService.getPopularBooksReport();
      } else if (activeTab === 'overdue') {
        res = await reportService.getOverdueReport();
      } else if (activeTab === 'users') {
        res = await reportService.getUsersReport();
      }

      setReportData(res?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to compile report data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate, statusFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) {
      toast.error('No tabular data to export.');
      return;
    }

    const filename = `athena_${activeTab}_report_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(reportData, filename);
    toast.success('Report exported to CSV successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Library Analytics & Reports Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Filter institutional usage records and export certified tabular CSV audit sheets
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={reportData.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-40 active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Current Report (CSV)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto">
        {[
          { id: 'borrowing', label: 'Circulation Activity', icon: RotateCcw },
          { id: 'popular', label: 'Most Borrowed Books', icon: TrendingUp },
          { id: 'overdue', label: 'Overdue Books & Fees', icon: AlertTriangle },
          { id: 'users', label: 'Patron Directory', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar (Active for circulation tab) */}
      {activeTab === 'borrowing' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">From Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">To Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-800"
            >
              <option value="all">All</option>
              <option value="borrowed">Borrowed</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {(startDate || endDate || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setStatusFilter('all');
              }}
              className="text-rose-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Report Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Generating dataset..." />
        ) : reportData.length === 0 ? (
          <EmptyState
            title="No report entries"
            description="There is no data matching the selected report parameters."
          />
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'borrowing' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Patron Name</th>
                    <th className="py-3 px-4">Role / ID</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Return Date</th>
                    <th className="py-3 px-4">Late Fee</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.userName}</td>
                      <td className="py-3 px-4 capitalize text-slate-600">
                        {row.userRole} ({row.userIdentifier})
                      </td>
                      <td className="py-3 px-4 text-slate-800 max-w-xs truncate">{row.bookTitle}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{row.bookISBN}</td>
                      <td className="py-3 px-4 text-slate-600">{row.issueDate || '—'}</td>
                      <td className="py-3 px-4 text-slate-600">{row.dueDate || '—'}</td>
                      <td className="py-3 px-4 text-slate-600">{row.returnDate || '—'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.lateFee > 0 ? `₹${row.lateFee}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'popular' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Total Borrows</th>
                    <th className="py-3 px-4">Currently Loaned</th>
                    <th className="py-3 px-4">Available Copies</th>
                    <th className="py-3 px-4">Shelf Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row, idx) => (
                    <tr key={row.bookId} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-extrabold text-blue-600">#{idx + 1}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{row.title}</p>
                        <p className="text-[11px] text-slate-500">by {row.author}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{row.ISBN}</td>
                      <td className="py-3 px-4 text-slate-700">{row.category}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{row.totalBorrows} times</td>
                      <td className="py-3 px-4 text-blue-600 font-bold">{row.currentActive} active</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{row.availableCopies} left</td>
                      <td className="py-3 px-4 text-slate-600">{row.shelfLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'overdue' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Days Overdue</th>
                    <th className="py-3 px-4">Calculated Late Fee</th>
                    <th className="py-3 px-4">Borrower Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-rose-50/30">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{row.userName}</p>
                        <p className="text-[11px] text-slate-500">{row.userEmail}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.bookTitle}</td>
                      <td className="py-3 px-4 text-rose-600 font-semibold">{row.dueDate}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">{row.overdueDays} Days</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">₹{row.lateFee}</td>
                      <td className="py-3 px-4 text-slate-600">{row.userPhone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'users' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Patron Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">ID Number</th>
                    <th className="py-3 px-4">Active Loans</th>
                    <th className="py-3 px-4">Lifetime Loans</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3 px-4 text-slate-600">{row.email}</td>
                      <td className="py-3 px-4 capitalize font-semibold">{row.role}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{row.identifier}</td>
                      <td className="py-3 px-4 font-bold text-blue-600">{row.activeBorrows}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.totalHistory}</td>
                      <td className="py-3 px-4 text-slate-500">{row.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
