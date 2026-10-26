import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Send,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { bookService } from '../services/bookService';
import { borrowService } from '../services/borrowService';
import { userService } from '../services/userService';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const ManageBooksPage = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  // Direct Issue Modal state
  const [issueBookTarget, setIssueBookTarget] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [issuing, setIssuing] = useState(false);

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookService.getBooks({
        page,
        limit: 10,
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined
      });
      setBooks(data.books || []);
      setCategories(data.categories || []);
      setTotalBooks(data.totalBooks || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load books.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Open Direct Issue Modal
  const handleOpenDirectIssue = async (book) => {
    setIssueBookTarget(book);
    setSelectedUserId('');
    setAdminNotes('');
    try {
      // Fetch active students and staff
      const res = await userService.getAllUsers({ limit: 100, status: 'active' });
      const nonAdmins = (res.users || []).filter((u) => u.role !== 'admin');
      setUsersList(nonAdmins);
      if (nonAdmins.length > 0) setSelectedUserId(nonAdmins[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDirectIssue = async (e) => {
    e.preventDefault();
    if (!issueBookTarget || !selectedUserId) return;

    try {
      setIssuing(true);
      await borrowService.issueBookDirectly({
        userId: selectedUserId,
        bookId: issueBookTarget._id,
        adminNotes
      });
      toast.success(`Book issued directly to user!`);
      setIssueBookTarget(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setIssuing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await bookService.deleteBook(deleteTarget._id);
      toast.success('Book deleted successfully');
      setDeleteTarget(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete book.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Library Books
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete inventory administration: update details, coordinates, or issue direct loans
          </p>
        </div>

        <Link
          to="/admin/books/add"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </Link>
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
            placeholder="Search by title, author, or ISBN..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching inventory records..." />
        ) : books.length === 0 ? (
          <EmptyState
            title="No books found"
            description="No books found matching the current criteria."
            actionText="Add a New Book"
            onAction={() => navigate('/admin/books/add')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Book Details</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Copies</th>
                  <th className="py-3 px-4">Shelf Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                          alt=""
                          className="h-12 w-9 object-cover rounded-md shadow-sm shrink-0 border border-slate-200"
                        />
                        <div>
                          <Link
                            to={`/books/${b._id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 line-clamp-1 text-xs sm:text-sm"
                          >
                            {b.title}
                          </Link>
                          <p className="text-[11px] text-slate-500">by {b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{b.ISBN}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${b.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {b.availableCopies}
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-600">{b.totalCopies}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {b.shelfLocation || 'Stack A1'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Direct Issue Button */}
                        <button
                          onClick={() => handleOpenDirectIssue(b)}
                          disabled={b.availableCopies <= 0}
                          title="Direct Issue to Student/Staff"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/books/${b._id}`}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/admin/books/edit/${b._id}`}
                          title="Edit Book"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setDeleteTarget(b)}
                          title="Delete Book"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
            totalItems={totalBooks}
            pageSize={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Direct Issue Modal */}
      <Modal
        isOpen={!!issueBookTarget}
        onClose={() => setIssueBookTarget(null)}
        title={`Direct Issue: ${issueBookTarget?.title}`}
        footer={
          <>
            <button
              onClick={() => setIssueBookTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDirectIssue}
              disabled={issuing || !selectedUserId}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{issuing ? 'Issuing...' : 'Issue Book Directly'}</span>
            </button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Issue <strong>{issueBookTarget?.title}</strong> directly to a student or faculty member without a pre-existing request.
          </p>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Select Borrower (Student / Faculty):
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role.toUpperCase()}) — {u.email} {u.studentId ? `[ID: ${u.studentId}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Librarian Notes (Optional):
            </label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. In-person desk checkout, verified student card"
              className="w-full rounded-xl border border-slate-200 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Book Deletion"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
          <br /><br />
          <span className="text-rose-600 font-semibold">
            System Constraint: Books with active loans or pending requests cannot be deleted.
          </span>
        </p>
      </Modal>
    </div>
  );
};

export default ManageBooksPage;
