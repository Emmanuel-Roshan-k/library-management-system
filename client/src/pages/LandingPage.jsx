import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Library,
  Users,
  CheckCircle2,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { bookService } from '../services/bookService';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

const LandingPage = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await bookService.getBooks({ limit: 4, availability: 'available' });
        setFeaturedBooks(data.books || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-6 py-16 sm:px-12 sm:py-24 shadow-2xl mx-4 sm:mx-8">
        {/* Background decorative glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Next-Generation MERN Library Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Discover, Borrow & Manage Knowledge with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Athena Library
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, digital-first library management ecosystem for universities, students,
            faculty, and librarians. Seamless inventory tracking, automated due dates, and instant borrowing.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search thousands of titles, authors, or ISBNs..."
                className="w-full rounded-2xl bg-white/10 border border-white/20 py-4 pl-12 pr-32 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick link chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span>Popular searches:</span>
            {['Computer Science', 'Artificial Intelligence', 'Physics', 'Literature'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => navigate(`/books?category=${encodeURIComponent(cat)}`)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights / Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
            Engineered for Modern Libraries
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Everything your library needs in one unified dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Real-time Catalogue & Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore dynamic inventory, shelf and rack coordinates, total copies, and instant availability.
              Never lose track of a volume again.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Smart Due Dates & Return Desk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Default 14-day borrowing windows with automated overdue alerts and transparent late fee
              calculations (configurable by administrator).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Role-Based Access Control</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tailored workflows for Librarians, Students, and Faculty members. Full CRUD, reports, and
              instant CSV tabular data export.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Available Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Books</h2>
            <p className="text-xs text-slate-500 mt-1">Ready for instant loan and study</p>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3.5 py-2 rounded-xl transition-colors"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading featured books..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onRequestBorrow={() => navigate(`/books/${book._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Demo Credentials Box */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white">
                Quick Demo Access
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">Ready to test the system?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Pre-configured sample accounts are available for Admin, Student, and Faculty roles.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono text-slate-700">
                <span className="bg-white/80 px-2 py-1 rounded border border-slate-200">
                  Admin: admin@library.com
                </span>
                <span className="bg-white/80 px-2 py-1 rounded border border-slate-200">
                  Student: student@library.com
                </span>
                <span className="bg-white/80 px-2 py-1 rounded border border-slate-200">
                  Staff: staff@library.com
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
