import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Ban,
  CheckCircle,
  Trash2,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react';
import { userService } from '../services/userService';
import { exportToCSV } from '../utils/exportCsv';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
    staffId: '',
    phone: ''
  });
  const [creating, setCreating] = useState(false);

  // View User Modal state
  const [viewUserTarget, setViewUserTarget] = useState(null);
  const [viewUserData, setViewUserData] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  // Delete User Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers({
        search: search.trim() || undefined,
        role: role !== 'all' ? role : undefined,
        status: status !== 'all' ? status : undefined,
        page,
        limit: 10
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await userService.createUser(newUser);
      toast.success('User account created successfully!');
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'student',
        studentId: '',
        staffId: '',
        phone: ''
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user account');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    try {
      await userService.updateUser(user._id, { accountStatus: nextStatus });
      toast.success(`Account marked as ${nextStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update account status');
    }
  };

  const handleOpenViewUser = async (user) => {
    setViewUserTarget(user);
    try {
      setLoadingView(true);
      const res = await userService.getUserById(user._id);
      setViewUserData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingView(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await userService.deleteUser(deleteTarget._id);
      toast.success('User account deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = users.map((u) => ({
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Identifier: u.studentId || u.staffId || '',
      Phone: u.phone || '',
      Status: u.accountStatus,
      JoinedDate: formatDate(u.createdAt)
    }));
    exportToCSV(exportData, `library_users_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Accounts & Members Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage library patrons, faculty credentials, administrative privileges, and suspensions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or student ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="staff">Faculty / Staff</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading member accounts..." />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description="No user accounts match your filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patron Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Institutional ID</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.role} size="xs">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {u.studentId || u.staffId || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.accountStatus} size="xs">
                        {u.accountStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenViewUser(u)}
                          title="View Details & Borrow Stats"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.accountStatus === 'active'
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.accountStatus === 'active' ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="Delete User"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Member Account"
        footer={
          <>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              disabled={creating}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Account'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password *</label>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Role *</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-900"
              >
                <option value="student">Student</option>
                <option value="staff">Faculty / Staff</option>
                <option value="admin">Administrator / Librarian</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                {newUser.role === 'staff' ? 'Staff ID' : 'Student ID'}
              </label>
              <input
                type="text"
                value={newUser.role === 'staff' ? newUser.staffId : newUser.studentId}
                onChange={(e) =>
                  setNewUser(
                    newUser.role === 'staff'
                      ? { ...newUser, staffId: e.target.value }
                      : { ...newUser, studentId: e.target.value }
                  )
                }
                className="w-full rounded-xl border border-slate-200 p-2 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
            <input
              type="text"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="+1-555-0100"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900"
            />
          </div>
        </form>
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={!!viewUserTarget}
        onClose={() => setViewUserTarget(null)}
        title={`Member Details: ${viewUserTarget?.name}`}
        footer={
          <button
            onClick={() => setViewUserTarget(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        }
      >
        {loadingView ? (
          <LoadingSpinner text="Retrieving member history..." />
        ) : (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block">Email</span>
                <span className="font-bold text-slate-800">{viewUserTarget?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Role</span>
                <span className="font-bold capitalize text-slate-800">{viewUserTarget?.role}</span>
              </div>
              <div>
                <span className="text-slate-400 block">ID Code</span>
                <span className="font-bold text-slate-800">
                  {viewUserTarget?.studentId || viewUserTarget?.staffId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Account Status</span>
                <span className="font-bold capitalize text-slate-800">{viewUserTarget?.accountStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-lg font-extrabold text-blue-600 block">
                  {viewUserData?.stats?.activeBorrowsCount || 0}
                </span>
                <span className="text-slate-500 font-medium">Currently Active Loans</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-lg font-extrabold text-emerald-600 block">
                  {viewUserData?.stats?.totalBorrowsCount || 0}
                </span>
                <span className="text-slate-500 font-medium">Lifetime Loans</span>
              </div>
            </div>

            {viewUserData?.activeBorrows?.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Active Books on Loan:</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {viewUserData.activeBorrows.map((b) => (
                    <div
                      key={b._id}
                      className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]"
                    >
                      <span className="font-semibold text-slate-800 truncate max-w-xs">
                        {b.bookId?.title}
                      </span>
                      <Badge variant={b.status} size="xs">
                        {b.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm User Deletion"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={deleting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete User'}
            </button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to delete user account <strong>{deleteTarget?.name}</strong>?
          <br /><br />
          <span className="text-rose-600 font-semibold">
            Constraint: Users with active loans or pending requests cannot be deleted.
          </span>
        </p>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
