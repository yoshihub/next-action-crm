import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../app/auth/AuthProvider';
import { Button } from './ui/Button';
import {
  InboxIcon as Inbox,
  UsersIcon as Users,
  TrendingUpIcon as TrendingUp,
  CheckSquareIcon as CheckSquare,
  LogOutIcon as LogOut
} from './icons/Icons';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: '受信箱', href: '/inbox', icon: Inbox },
    { name: '連絡先', href: '/contacts', icon: Users },
    { name: '商談', href: '/deals', icon: TrendingUp },
    { name: 'タスク', href: '/tasks', icon: CheckSquare },
    // 活動ログは不要のためメニューから削除
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* サイドバー */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col h-screen sticky top-0 pt-5 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Next Action CRM</h1>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center w-full">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="ml-auto"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
