import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';

// All 21 Frontend Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import BookCataloguePage from './pages/BookCataloguePage';
import BookDetailsPage from './pages/BookDetailsPage';
import AddBookPage from './pages/AddBookPage';
import EditBookPage from './pages/EditBookPage';
import ManageBooksPage from './pages/ManageBooksPage';
import BorrowingRequestsPage from './pages/BorrowingRequestsPage';
import IssuedBooksPage from './pages/IssuedBooksPage';
import ReturnManagementPage from './pages/ReturnManagementPage';
import OverdueBooksPage from './pages/OverdueBooksPage';
import BorrowingHistoryPage from './pages/BorrowingHistoryPage';
import UserManagementPage from './pages/UserManagementPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0f172a',
                color: '#fff',
                fontSize: '13px',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Public Layout Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/books" element={<BookCataloguePage />} />
              <Route path="/books/:id" element={<BookDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Portal Routes (Inside MainLayout with Sidebar & Top Navbar) */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin / Librarian Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageBooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books/add"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AddBookPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EditBookPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/borrowing/requests"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BorrowingRequestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/borrowing/issued"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <IssuedBooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/borrowing/returns"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ReturnManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/borrowing/overdue"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <OverdueBooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/borrowing/history"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BorrowingHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Student Dedicated Route */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Staff Dedicated Route */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared Member Routes */}
              <Route path="/borrowing/history" element={<BorrowingHistoryPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
