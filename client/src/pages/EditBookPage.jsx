import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit3, ArrowLeft, AlertCircle } from 'lucide-react';
import { bookService } from '../services/bookService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    ISBN: '',
    author: '',
    category: 'Computer Science',
    publisher: '',
    publicationYear: 2024,
    coverImage: '',
    totalCopies: 1,
    availableCopies: 1,
    shelfLocation: '',
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

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await bookService.getBookById(id);
        const b = res.book;
        setFormData({
          title: b.title || '',
          ISBN: b.ISBN || '',
          author: b.author || '',
          category: b.category || 'Computer Science',
          publisher: b.publisher || '',
          publicationYear: b.publicationYear || 2024,
          coverImage: b.coverImage || '',
          totalCopies: b.totalCopies || 1,
          availableCopies: b.availableCopies !== undefined ? b.availableCopies : 1,
          shelfLocation: b.shelfLocation || '',
          description: b.description || ''
        });
      } catch (err) {
        toast.error('Failed to load book details');
        navigate('/admin/books');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload = {
        ...formData,
        totalCopies: parseInt(formData.totalCopies, 10),
        availableCopies: parseInt(formData.availableCopies, 10),
        publicationYear: formData.publicationYear ? parseInt(formData.publicationYear, 10) : undefined
      };

      await bookService.updateBook(id, payload);
      toast.success('Book updated successfully!');
      navigate(`/books/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update book';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading book information..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Admin Book Editor
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Edit Book Record</h1>
            <p className="text-xs text-slate-500">Update metadata, shelf coordinates, or copy inventory</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
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
                Available Copies *
              </label>
              <input
                type="number"
                name="availableCopies"
                min="0"
                max={formData.totalCopies}
                required
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
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                {formData.coverImage && (
                  <img
                    src={formData.coverImage}
                    alt=""
                    className="h-10 w-10 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description / Abstract
              </label>
              <textarea
                rows="4"
                name="description"
                value={formData.description}
                onChange={handleChange}
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
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookPage;
