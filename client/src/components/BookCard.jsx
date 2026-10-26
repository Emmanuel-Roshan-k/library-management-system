import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Badge from './Badge';

const BookCard = ({ book, onRequestBorrow, isBorrowing = false }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <img
          src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
          alt={book.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
          }}
        />

        {/* Floating Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900/80 text-white backdrop-blur-md shadow-sm">
            {book.category}
          </span>
        </div>

        {/* Availability Pill */}
        <div className="absolute bottom-3 left-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {book.availableCopies} Copies Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/90 text-white backdrop-blur-md shadow-sm">
              <XCircle className="w-3.5 h-3.5" />
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Book Information */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors" title={book.title}>
            {book.title}
          </h4>
          <p className="text-sm font-medium text-slate-600 mt-1 line-clamp-1">
            by {book.author}
          </p>

          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>ISBN: {book.ISBN}</span>
            {book.publicationYear && <span>{book.publicationYear}</span>}
          </div>

          {book.shelfLocation && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{book.shelfLocation}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
          <Link
            to={`/books/${book._id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {onRequestBorrow && (
            <button
              onClick={() => onRequestBorrow(book)}
              disabled={!isAvailable || isBorrowing}
              className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl text-white transition-all shadow-sm ${
                isAvailable
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Borrow</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
