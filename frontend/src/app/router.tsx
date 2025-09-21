import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/LoginPage';
import InboxPage from '../features/inbox/InboxPage';
import ContactsPage from '../features/contacts/ContactsPage';
import DealsBoard from '../features/deals/DealsBoard';
import TasksPage from '../features/tasks/TasksPage';
import ActivitiesList from '../features/activities/ActivitiesList';
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

// シンプルなテストページコンポーネント
const TestPage: React.FC = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>Next Action CRM - テストページ</h1>
    <p>RouterProviderが正常に動作しています。</p>
    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '5px' }}>
      <h2>ステップ1: React ✅</h2>
      <p>基本的なReactコンポーネントが正常に動作しています。</p>
    </div>
    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '5px' }}>
      <h2>ステップ2: QueryClient ✅</h2>
      <p>React Queryが正常に動作しています。</p>
    </div>
    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '5px' }}>
      <h2>ステップ3: RouterProvider ✅</h2>
      <p>ルーターが正常に動作しています。</p>
    </div>
    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px' }}>
      <h2>ステップ4: ページコンポーネント 🔄</h2>
      <p>ページコンポーネントを一時的に無効化してテスト中...</p>
    </div>
  </div>
);

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
  {
    path: '/activities',
    element: (
      <ProtectedRoute>
        <ActivitiesList />
      </ProtectedRoute>
    ),
  },
  {
    path: '/test',
    element: (
      <ProtectedRoute>
        <div />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/inbox" replace />,
  },
]);
