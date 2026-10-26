import React from 'react';
import { BookOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = BookOpen,
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 ring-8 ring-slate-50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
