import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variantStyles = {
    // Status variants
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    borrowed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    returned: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    overdue: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse',
    rejected: 'bg-slate-200 text-slate-700 border-slate-300',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
    
    // Role variants
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    student: 'bg-blue-100 text-blue-800 border-blue-200',
    staff: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    
    // Account variants
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200',
    
    // Stock variants
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    outOfStock: 'bg-rose-100 text-rose-800 border-rose-200',
    
    default: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const sizeStyles = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  const style = variantStyles[variant] || variantStyles.default;
  const sizeStyle = sizeStyles[size] || sizeStyles.sm;

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${style} ${sizeStyle} capitalize transition-all ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
