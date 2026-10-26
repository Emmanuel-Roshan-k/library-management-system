import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-sm border border-blue-100 ring-8 ring-blue-50/50">
        <Library className="w-10 h-10" />
      </div>
      <span className="text-sm font-extrabold text-blue-600 uppercase tracking-widest">
        404 Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-3">
        Page Lost in the Archives
      </h1>
      <p className="text-slate-500 max-w-md text-xs sm:text-sm mb-8">
        The catalogued volume or dashboard endpoint you are looking for has been moved, archived,
        or does not exist.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-all"
        >
          <span>Browse Catalogue</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
