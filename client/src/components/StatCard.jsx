import React from 'react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  subtitle,
  onClick
}) => {
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-200',
      iconBg: 'bg-blue-600 text-white',
      badge: 'bg-blue-100 text-blue-700'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'hover:border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
      badge: 'bg-indigo-100 text-indigo-700'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'hover:border-emerald-200',
      iconBg: 'bg-emerald-600 text-white',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-200',
      iconBg: 'bg-amber-600 text-white',
      badge: 'bg-amber-100 text-amber-700'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'hover:border-rose-200',
      iconBg: 'bg-rose-600 text-white',
      badge: 'bg-rose-100 text-rose-700'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'hover:border-purple-200',
      iconBg: 'bg-purple-600 text-white',
      badge: 'bg-purple-100 text-purple-700'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${scheme.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value !== undefined ? value : '—'}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${scheme.iconBg}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          {trend && (
            <span className={`px-2 py-0.5 rounded-md font-semibold ${scheme.badge}`}>
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
