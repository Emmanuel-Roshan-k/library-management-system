import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookPlus,
  ArrowLeft,
  Image,
  Layers,
  MapPin,
  Calendar,
  Building,
  Hash,
  AlertCircle
} from 'lucide-react';
import { bookService } from '../services/bookService';
import toast from 'react-hot-toast';

const AddBookPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    ISBN: '',
    author: '',
    category: 'Computer Science',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    coverImage: '',
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: 'Stack CS-101',
    description: ''
  });

  const categories = [
    'Computer Science',
    'Artificial Intelligence',
    'Physics & Science',
    'Literature',
    'Business & Economics',
    'Mathematics',
    'Psychology',
    'History',
    'Engineering',
    'Medicine'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Keep availableCopies synced if totalCopies changes
      if (name === 'totalCopies' && prev.availableCopies === prev.totalCopies) {
        updated.availableCopies = value;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.ISBN || !formData.author || !formData.category) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const payload = {
        ...formData,
        totalCopies: parseInt(formData.totalCopies, 10),
        availableCopies: parseInt(formData.availableCopies, 10),
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear, 10) : undefined
      };

      const res = await bookService.createBook(payload);
      toast.success(`'${res.book.title}' added to library catalogue!`);
      navigate(`/books/${res.book._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create book record.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Admin Book Management
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <BookPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Add New Book to Collection</h1>
            <p className="text-xs text-slate-500">Record a new volume into the central university catalogue</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Book Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Structure and Interpretation of Computer Programs"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Author(s) *
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Harold Abelson & Gerald Jay Sussman"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                ISBN Identifier *
              </label>
              <input
                type="text"
                name="ISBN"
                required
                value={formData.ISBN}
                onChange={handleChange}
                placeholder="e.g. 978-0262510875"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category / Subject *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Publisher
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="e.g. MIT Press"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Publication Year
              </label>
              <input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Shelf / Stack Location
              </label>
              <input
                type="text"
                name="shelfLocation"
                value={formData.shelfLocation}
                onChange={handleChange}
                placeholder="e.g. Stack CS-204"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Copies in Stock *
              </label>
              <input
                type="number"
                name="totalCopies"
                min="1"
                required
                value={formData.totalCopies}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Available Copies
              </label>
              <input
                type="number"
                name="availableCopies"
                min="0"
                max={formData.totalCopies}
                value={formData.availableCopies}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Cover Image URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/... or direct image URL"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {formData.coverImage && (
                  <img
                    src={formData.coverImage}
                    alt="Preview"
                    className="h-10 w-10 object-cover rounded-lg border border-slate-200"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Book Abstract
              </label>
              <textarea
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Comprehensive overview of chapters, subject material, and scope..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/admin/books"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Cataloguing Book...' : 'Save Book to Catalogue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookPage;
