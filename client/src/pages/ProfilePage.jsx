import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Settings,
  Mail,
  Phone,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingService } from '../services/settingService';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, isAdmin, updateProfile } = useAuth();

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [staffId, setStaffId] = useState(user?.staffId || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Admin Library Settings state
  const [settings, setSettings] = useState({
    borrowDays: 14,
    dailyLateFee: 5,
    maxBooksPerUser: 5,
    libraryName: 'Athena Central Library',
    libraryEmail: 'contact@athenalibrary.edu'
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const fetchSettings = async () => {
        try {
          const res = await settingService.getSettings();
          if (res.settings) {
            setSettings({
              borrowDays: res.settings.borrowDays || 14,
              dailyLateFee: res.settings.dailyLateFee || 5,
              maxBooksPerUser: res.settings.maxBooksPerUser || 5,
              libraryName: res.settings.libraryName || 'Athena Central Library',
              libraryEmail: res.settings.libraryEmail || 'contact@athenalibrary.edu'
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchSettings();
    }
  }, [isAdmin]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({
        name,
        phone,
        studentId: user?.role === 'student' ? studentId : undefined,
        staffId: user?.role === 'staff' ? staffId : undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });

      toast.success('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await settingService.updateSettings(settings);
      toast.success('Library system configuration updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-blue-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                <Badge variant={user?.role} size="sm">
                  {user?.role}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Account Status:</span>
            <Badge variant={user?.accountStatus} size="sm">
              {user?.accountStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Profile & Security Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Personal Information & Security</h2>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-6 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address (Institutional)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-slate-500 cursor-not-allowed"
              />
            </div>

            {user?.role === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Student ID Number
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            {user?.role === 'staff' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Staff / Faculty ID Number
                </label>
                <input
                  type="text"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0100"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Change Password (Leave blank to keep current password)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Updating Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Admin Only: Library System Configuration */}
      {isAdmin && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
            <Settings className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Library Policy & System Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Configure loan duration, daily penalty fee rates, and system-wide thresholds
              </p>
            </div>
          </div>

          <form onSubmit={handleSettingsSubmit} className="space-y-6 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Borrow Period (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.borrowDays}
                  onChange={(e) => setSettings({ ...settings, borrowDays: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Default loan duration (default: 14)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Daily Late Fee Rate (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={settings.dailyLateFee}
                  onChange={(e) => setSettings({ ...settings, dailyLateFee: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Penalty per overdue day (default: ₹5)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Max Active Loans per Patron
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.maxBooksPerUser}
                  onChange={(e) => setSettings({ ...settings, maxBooksPerUser: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Simultaneous checkout limit
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Library Official Title
                </label>
                <input
                  type="text"
                  value={settings.libraryName}
                  onChange={(e) => setSettings({ ...settings, libraryName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.libraryEmail}
                  onChange={(e) => setSettings({ ...settings, libraryEmail: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSettings ? 'Saving Policy...' : 'Update System Configuration'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
