import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Copy,
  CheckCircle2,
  BookMarked,
  Users,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatDate';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Compiling live library analytics..." />;
  }

  const stats = data?.stats || {};
  const popularBooks = data?.popularBooks || [];
  const monthlyTrends = data?.monthlyTrends || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const recentActivities = data?.recentActivities || [];

  const PIE_COLORS = ['#2563eb', '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Administrative Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Live Monitor
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status of library inventory, active loans, and student requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/borrowing/requests"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Requests ({stats.pendingRequests || 0})</span>
          </Link>
          <Link
            to="/admin/books/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Add Book</span>
          </Link>
        </div>
      </div>

      {/* KPI Statistic Cards (8 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unique Titles"
          value={stats.totalBooks}
          icon={BookOpen}
          color="blue"
          trend="In Library"
          subtitle="Catalogued volumes"
          onClick={() => navigate('/admin/books')}
        />
        <StatCard
          title="Total Physical Copies"
          value={stats.totalCopies}
          icon={Copy}
          color="indigo"
          subtitle={`${stats.availableCopies} available on shelf`}
        />
        <StatCard
          title="Available on Shelf"
          value={stats.availableCopies}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Ready for checkout"
          onClick={() => navigate('/books?availability=available')}
        />
        <StatCard
          title="Currently Borrowed"
          value={stats.currentlyBorrowed}
          icon={BookMarked}
          color="purple"
          subtitle="Active student loans"
          onClick={() => navigate('/admin/borrowing/issued')}
        />
        <StatCard
          title="Registered Students"
          value={stats.registeredStudents}
          icon={Users}
          color="blue"
          subtitle="Active student patrons"
          onClick={() => navigate('/admin/users?role=student')}
        />
        <StatCard
          title="Faculty & Staff"
          value={stats.registeredStaff}
          icon={Users}
          color="indigo"
          subtitle="Active faculty patrons"
          onClick={() => navigate('/admin/users?role=staff')}
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={FileCheck2}
          color="amber"
          subtitle="Awaiting librarian review"
          onClick={() => navigate('/admin/borrowing/requests')}
        />
        <StatCard
          title="Overdue Books"
          value={stats.overdueBooks}
          icon={AlertTriangle}
          color="rose"
          subtitle="Past due deadline"
          onClick={() => navigate('/admin/borrowing/overdue')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Most Borrowed Books
              </h3>
              <p className="text-xs text-slate-500">Top titles by lifetime borrow count</p>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            {popularBooks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No borrowing activity recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularBooks} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={110}
                    tickFormatter={(val) => (val.length > 16 ? `${val.substring(0, 16)}...` : val)}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="borrowCount" fill="#2563eb" radius={[0, 8, 8, 0]} name="Times Borrowed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Activity Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Monthly Borrowing Trends
              </h3>
              <p className="text-xs text-slate-500">Loans and returns over time</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            {monthlyTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Data accumulating for new month...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="borrows"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorBorrows)"
                    name="Books Borrowed"
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorReturns)"
                    name="Books Returned"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Category Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Collection by Category
            </h3>
            <p className="text-xs text-slate-500">Distribution of catalogued genres</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {categoryDistribution.slice(0, 4).map((c, i) => (
              <div key={c._id} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="truncate text-slate-600 font-medium">{c._id}: {c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Recent Library Activity
              </h3>
              <p className="text-xs text-slate-500">Latest loan and return transactions</p>
            </div>
            <Link
              to="/admin/borrowing/history"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Patron</th>
                  <th className="py-2.5 px-3">Book</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Due / Return Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No recent activities found.
                    </td>
                  </tr>
                ) : (
                  recentActivities.map((act) => (
                    <tr key={act._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800">{act.userId?.name || 'Unknown'}</p>
                        <span className="text-[10px] text-slate-400 capitalize">{act.userId?.role}</span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 max-w-[180px] truncate" title={act.bookId?.title}>
                        {act.bookId?.title || 'Unknown Title'}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={act.status} size="xs">
                          {act.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {act.returnDate ? (
                          <span className="text-emerald-600 font-semibold">
                            Ret: {formatDate(act.returnDate)}
                          </span>
                        ) : act.dueDate ? (
                          <span className={act.status === 'overdue' ? 'text-rose-600 font-bold' : ''}>
                            Due: {formatDate(act.dueDate)}
                          </span>
                        ) : (
                          formatDate(act.requestDate)
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
