import React, { useState } from 'react';
import {
  Bell,
  Check,
  Trash2,
  BookOpen,
  AlertTriangle,
  RotateCcw,
  Clock,
  Sparkles
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatDate';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotification();

  const [filterUnread, setFilterUnread] = useState(false);

  const displayedNotifications = filterUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const getIcon = (type) => {
    switch (type) {
      case 'borrow_request':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'request_approved':
      case 'book_issued':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'book_returned':
        return <RotateCcw className="w-4 h-4 text-emerald-600" />;
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System notices, loan updates, approvals, return confirmations, and due date alerts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              filterUnread
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filterUnread ? 'Showing Unread' : 'Show Unread Only'}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading && notifications.length === 0 ? (
          <LoadingSpinner text="Checking for notices..." />
        ) : displayedNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up!"
            description={
              filterUnread
                ? 'You have zero unread notifications.'
                : 'There are no notifications in your inbox at this time.'
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedNotifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  !notif.isRead ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      title="Mark as read"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif._id)}
                    title="Delete notice"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
