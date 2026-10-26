import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Send,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { borrowService } from '../services/borrowService';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const BorrowingRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);

  // Approve Modal state
  const [approveTarget, setApproveTarget] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [approving, setApproving] = useState(false);

  // Reject Modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await borrowService.getAllRequests({
        status: statusFilter,
        page,
        limit: 10
      });
      setRequests(data.requests || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load borrow requests.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    try {
      setApproving(true);
      await borrowService.approveRequest(approveTarget._id, adminNotes);
      toast.success(`Request approved! Book issued until due date.`);
      setApproveTarget(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setApproving(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    try {
      setRejecting(true);
      await borrowService.rejectRequest(rejectTarget._id, rejectReason);
      toast.success('Borrow request rejected.');
      setRejectTarget(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Borrowing Requisitions & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming book loan requests submitted by students and faculty
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { label: 'Pending', value: 'pending' },
            { label: 'Borrowed / Active', value: 'borrowed' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'All', value: 'all' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.value
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Checking loan requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            title="No requests found"
            description={`There are currently no '${statusFilter}' requests in the system.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Requested Book</th>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Copies Available</th>
                  <th className="py-3 px-4">User Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Librarian Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{r.userId?.name || 'Unknown'}</p>
                      <p className="text-[11px] text-slate-500">{r.userId?.email}</p>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {r.userId?.role} {r.userId?.studentId ? `• ${r.userId?.studentId}` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 max-w-xs truncate">{r.bookId?.title}</p>
                      <p className="text-[11px] text-slate-500">ISBN: {r.bookId?.ISBN}</p>
                      <p className="text-[10px] text-blue-600">{r.bookId?.shelfLocation}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(r.requestDate)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          (r.bookId?.availableCopies || 0) > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {r.bookId?.availableCopies || 0} left
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {r.userNotes || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={r.status} size="xs">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setApproveTarget(r);
                              setAdminNotes('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setRejectTarget(r);
                              setRejectReason('Book copy unavailable / reserved.');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Processed</span>
                      )}
                    </td>
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
            pageSize={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        title="Approve & Issue Book"
        footer={
          <>
            <button
              onClick={() => setApproveTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmApprove}
              disabled={approving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{approving ? 'Issuing...' : 'Confirm Approval & Issue'}</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Approve request for <strong>{approveTarget?.bookId?.title}</strong> for{' '}
            <strong>{approveTarget?.userId?.name}</strong>.
          </p>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
            • 1 physical copy will be deducted from inventory automatically.<br />
            • The due date will be calculated 14 days from today.<br />
            • The borrower will receive an in-app confirmation notification.
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Admin Notes (Optional):
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Issued in mint condition from Stack CS-101"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Decline Borrowing Request"
        footer={
          <>
            <button
              onClick={() => setRejectTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={rejecting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{rejecting ? 'Declining...' : 'Confirm Rejection'}</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Decline request for <strong>{rejectTarget?.bookId?.title}</strong>.
          </p>
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Reason for Declining (Sent to Student):
            </label>
            <textarea
              rows="3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Book is temporarily on reserve for library reference only..."
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BorrowingRequestsPage;
