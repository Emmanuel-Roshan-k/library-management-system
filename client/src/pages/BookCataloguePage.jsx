import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  X,
  Send,
  Sparkles
} from 'lucide-react';
import { bookService } from '../services/bookService';
import { borrowService } from '../services/borrowService';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';

const BookCataloguePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter and sort state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Request Borrow Modal state
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);
  const [userNotes, setUserNotes] = useState('');
  const [submittingBorrow, setSubmittingBorrow] = useState(false);

  const fetchCatalogue = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sortBy,
        order
      };
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All') params.category = category;
      if (availability && availability !== 'all') params.availability = availability;

      const data = await bookService.getBooks(params);
      setBooks(data.books || []);
      setCategories(data.categories || []);
      setTotalBooks(data.totalBooks || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load catalogue:', err);
      toast.error('Failed to load library catalogue.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, availability, sortBy, order]);

  useEffect(() => {
    fetchCatalogue();
  }, [fetchCatalogue]);

  // Sync state to URL params
  const updateFilters = (newParams) => {
    const updated = {
      search,
      category,
      availability,
      sortBy,
      order,
      page: 1,
      ...newParams
    };

    const cleanParams = {};
    if (updated.search) cleanParams.search = updated.search;
    if (updated.category && updated.category !== 'All') cleanParams.category = updated.category;
    if (updated.availability && updated.availability !== 'all') cleanParams.availability = updated.availability;
    if (updated.sortBy !== 'createdAt') cleanParams.sortBy = updated.sortBy;
    if (updated.order !== 'desc') cleanParams.order = updated.order;
    if (updated.page > 1) cleanParams.page = updated.page;

    setSearchParams(cleanParams);
    if (newParams.page) setPage(newParams.page);
    else setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('All');
    setAvailability('all');
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  const handleOpenBorrowModal = (book) => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a borrow request.');
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      navigate(`/books/${book._id}`);
      return;
    }

    setSelectedBookForBorrow(book);
    setUserNotes('');
  };

  const handleConfirmBorrow = async (e) => {
    e.preventDefault();
    if (!selectedBookForBorrow) return;

    try {
      setSubmittingBorrow(true);
      await borrowService.requestBorrow(selectedBookForBorrow._id, userNotes);
      toast.success(`Request for '${selectedBookForBorrow.title}' submitted!`);
      setSelectedBookForBorrow(null);
      fetchCatalogue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setSubmittingBorrow(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Athena Open Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Library Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Search and filter across {totalBooks} catalogued volumes and academic resources
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-96">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, author, or ISBN..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-20 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => {
                setCategory('All');
                updateFilters({ category: 'All' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                category === 'All'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  updateFilters({ category: cat });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Availability & Sorting Dropdowns */}
          <div className="flex items-center gap-3">
            {/* Availability */}
            <select
              value={availability}
              onChange={(e) => {
                setAvailability(e.target.value);
                updateFilters({ availability: e.target.value });
              }}
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Copies</option>
              <option value="available">In Stock Only</option>
              <option value="unavailable">Out of Stock</option>
            </select>

            {/* Sort Order */}
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                updateFilters({ sortBy: sb, order: ord });
              }}
              className="text-xs font-semibold rounded-xl border border-slate-200 bg-white py-2 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="createdAt-desc">Newest Additions</option>
              <option value="title-asc">Title: A &rarr; Z</option>
              <option value="title-desc">Title: Z &rarr; A</option>
              <option value="publicationYear-desc">Year: Newest</option>
              <option value="publicationYear-asc">Year: Oldest</option>
              <option value="availableCopies-desc">Availability: High to Low</option>
            </select>

            {(search || category !== 'All' || availability !== 'all') && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1.5"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <LoadingSpinner text="Searching catalogue records..." />
      ) : books.length === 0 ? (
        <EmptyState
          title="No books found"
          description="We couldn't find any books matching your current search or category filters."
          actionText="Clear All Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onRequestBorrow={() => handleOpenBorrowModal(book)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalBooks}
            pageSize={12}
            onPageChange={(p) => updateFilters({ page: p })}
          />
        </>
      )}

      {/* Borrow Request Modal */}
      <Modal
        isOpen={!!selectedBookForBorrow}
        onClose={() => setSelectedBookForBorrow(null)}
        title="Submit Borrowing Request"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSelectedBookForBorrow(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmBorrow}
              disabled={submittingBorrow}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submittingBorrow ? 'Submitting...' : 'Confirm Request'}</span>
            </button>
          </>
        }
      >
        {selectedBookForBorrow && (
          <div className="space-y-4 text-xs">
            <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <img
                src={selectedBookForBorrow.coverImage}
                alt=""
                className="w-16 h-20 object-cover rounded-lg shadow-sm"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{selectedBookForBorrow.title}</h4>
                <p className="text-slate-600 font-medium">by {selectedBookForBorrow.author}</p>
                <p className="text-slate-500">ISBN: {selectedBookForBorrow.ISBN}</p>
                <p className="text-emerald-600 font-semibold">
                  {selectedBookForBorrow.availableCopies} Copies Available on {selectedBookForBorrow.shelfLocation}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 leading-relaxed">
              Standard borrowing policy: Books are issued for <strong>14 days</strong> upon librarian approval.
              A daily fee of ₹5 applies to overdue returns.
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Notes for the Librarian (Optional):
              </label>
              <textarea
                rows="3"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g. Course code, project topic, or request pickup date..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookCataloguePage;
