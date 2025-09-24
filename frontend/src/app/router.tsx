import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import InboxPage from '../features/inbox/InboxPage';
import ContactsPage from '../features/contacts/ContactsPage';
import DealsBoard from '../features/deals/DealsBoard';
import TasksPage from '../features/tasks/TasksPage';
import Layout from '../components/Layout';
import { useAuth } from './auth/AuthProvider';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/inbox" replace />;
  }

  return <>{children}</>;
};

// テストページは不要のため削除

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/inbox" replace />,
  },
  {
    path: '/inbox',
    element: (
      <ProtectedRoute>
        <InboxPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/contacts',
    element: (
      <ProtectedRoute>
        <ContactsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/deals',
    element: (
      <ProtectedRoute>
        <DealsBoard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tasks',
    element: (
      <ProtectedRoute>
        <TasksPage />
      </ProtectedRoute>
    ),
  },
  // 活動ログページは削除
  {
    path: '*',
    element: <Navigate to="/inbox" replace />,
  },
]);
