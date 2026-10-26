import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Send,
  UserCheck,
  Building,
  Hash,
  Share2
} from 'lucide-react';
import { bookService } from '../services/bookService';
import { borrowService } from '../services/borrowService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();

  const [book, setBook] = useState(null);
  const [stats, setStats] = useState({ totalTimesBorrowed: 0, currentlyIssued: 0 });
  const [loading, setLoading] = useState(true);

  // Borrow Request Modal
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [submittingBorrow, setSubmittingBorrow] = useState(false);

  // Delete Book Modal (Admin)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const res = await bookService.getBookById(id);
      setBook(res.book);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      toast.error('Book not found or failed to load.');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const handleBorrowRequest = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to request books.');
      navigate('/login');
      return;
    }

    try {
      setSubmittingBorrow(true);
      await borrowService.requestBorrow(book._id, userNotes);
      toast.success(`Request for '${book.title}' submitted to librarian!`);
      setShowBorrowModal(false);
      fetchBookDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmittingBorrow(false);
    }
  };

  const handleDeleteBook = async () => {
    try {
      setDeleting(true);
      await bookService.deleteBook(book._id);
      toast.success('Book deleted successfully from library records.');
      navigate('/admin/books');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete book.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving volume information..." />;
  }

  if (!book) return null;

  const isAvailable = book.availableCopies > 0;
  const availabilityPercentage = Math.round((book.availableCopies / book.totalCopies) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </button>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/books/edit/${book._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Book</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Book Cover Container */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-md border border-slate-200">
              <img
                src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                alt={book.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-900/80 text-white backdrop-blur-md">
                  {book.category}
                </span>
              </div>
            </div>

            {/* Quick Location Badge */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Physical Location</span>
                <span className="font-semibold text-slate-800">{book.shelfLocation || 'General Stacks'}</span>
              </div>
            </div>
          </div>

          {/* Book Information & Metadata */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    In Stock ({book.availableCopies} available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                    <XCircle className="w-3.5 h-3.5" />
                    All Copies Currently Loaned
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {book.title}
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                Authored by <span className="text-blue-600 font-bold">{book.author}</span>
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">ISBN</span>
                <span className="font-bold text-slate-800">{book.ISBN}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Publisher</span>
                <span className="font-bold text-slate-800 truncate block">{book.publisher || 'Unknown'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Publication Year</span>
                <span className="font-bold text-slate-800">{book.publicationYear || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Inventory</span>
                <span className="font-bold text-slate-800">{book.totalCopies} Copies</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Times Borrowed</span>
                <span className="font-bold text-slate-800">{stats.totalTimesBorrowed} times</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Currently On Loan</span>
                <span className="font-bold text-blue-600">{stats.currentlyIssued} active</span>
              </div>
            </div>

            {/* Availability Stock Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Inventory Availability</span>
                <span>{book.availableCopies} of {book.totalCopies} copies remaining ({availabilityPercentage}%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    availabilityPercentage > 50
                      ? 'bg-emerald-500'
                      : availabilityPercentage > 20
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
            </div>

            {/* Synopsis / Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Book Synopsis & Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {book.description || 'No description provided for this catalogued volume.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              {!isAdmin && (
                <button
                  onClick={() => setShowBorrowModal(true)}
                  disabled={!isAvailable}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all ${
                    isAvailable
                      ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/20'
                      : 'bg-slate-300 cursor-not-allowed text-slate-500'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{isAvailable ? 'Request to Borrow This Book' : 'Currently Out of Stock'}</span>
                </button>
              )}

              {isAdmin && (
                <Link
                  to={`/admin/borrowing/issued?bookId=${book._id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>View Active Loans for This Book</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Request Modal */}
      <Modal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        title={`Borrow Request: ${book.title}`}
        footer={
          <>
            <button
              onClick={() => setShowBorrowModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleBorrowRequest}
              disabled={submittingBorrow}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingBorrow ? 'Submitting...' : 'Confirm Loan Request'}</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            You are requesting <strong>{book.title}</strong> by {book.author}.
          </p>
          <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
            The book will be reserved for you once approved by the librarian desk. Standard borrowing duration is 14 days.
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Optional Note / Research Project Code:
            </label>
            <textarea
              rows="3"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g. For CS-301 Midterm preparation..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal (Admin) */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Book Deletion"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteBook}
              disabled={deleting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to delete <strong>{book.title}</strong> (ISBN: {book.ISBN})?
          <br /><br />
          <span className="text-rose-600 font-semibold">
            Note: The system will block deletion if there are any active borrowing or pending request records for this volume.
          </span>
        </p>
      </Modal>
    </div>
  );
};

export default BookDetailsPage;
