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
import { MenuIcon as Menu, XIcon as X } from './icons/Icons';
import { useState, useCallback } from 'react';

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

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);

  const handleToggleSidebar = useCallback(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setSidebarVisible((prev) => !prev);
    } else {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* モバイル: オフキャンバスサイドバー */}
        <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`} aria-hidden={!sidebarOpen}>
          <div
            className={`fixed inset-0 bg-black/50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setSidebarOpen(false)}
          />
          <div className={`relative flex w-64 flex-1 flex-col transform bg-white border-r border-gray-200 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center flex-shrink-0 px-4 pt-5">
              <h1 className="text-xl font-bold text-gray-900">Next Action CRM</h1>
              <Button variant="ghost" size="icon" className="ml-auto" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md overflow-hidden min-w-0`}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                      />
                      <span className="truncate whitespace-nowrap">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4 h-16">
              <div className="flex items-center w-full min-w-0">
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate whitespace-nowrap">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate whitespace-nowrap">{user?.email}</p>
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

        {/* デスクトップ: 固定サイドバー（折りたたみ対応） */}
        <div className={`hidden md:flex md:flex-col ${sidebarVisible ? 'md:w-64' : 'md:w-16'} transition-all duration-200`}>
          <div className="flex flex-col h-screen sticky top-0 pt-5 overflow-y-auto bg-white border-r border-gray-200">
            <div className={`flex items-center flex-shrink-0 px-4 ${sidebarVisible ? '' : 'justify-center'}`}>
              {sidebarVisible ? (
                <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap overflow-hidden">Next Action CRM</h1>
              ) : (
                <span className="text-xl font-bold text-gray-900">N</span>
              )}
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
                      } group flex items-center ${sidebarVisible ? 'px-2' : 'px-0'} py-2 text-sm font-medium rounded-md overflow-hidden min-w-0`}
                      title={sidebarVisible ? undefined : item.name}
                    >
                      <item.icon
                        className={`${
                          isActive ? 'text-primary-foreground' : 'text-gray-400 group-hover:text-gray-500'
                        } ${sidebarVisible ? 'mr-3' : 'mx-auto'} flex-shrink-0 h-6 w-6`}
                      />
                      {sidebarVisible && (
                        <span className="truncate whitespace-nowrap">{item.name}</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className={`flex-shrink-0 flex border-t border-gray-200 p-4 h-16 ${sidebarVisible ? '' : 'justify-center'}`}>
              <div className={`flex items-center w-full min-w-0 ${sidebarVisible ? '' : 'justify-center'}`}>
                {sidebarVisible ? (
                  <>
                    <div className="ml-3 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate whitespace-nowrap">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate whitespace-nowrap">{user?.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="ml-auto"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="icon" onClick={logout} title="ログアウト">
                    <LogOut className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* ヘッダー（常時表示: デスクトップはサイドバーの表示切替、モバイルはオープン） */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="px-4 py-2 flex items-center">
              <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={handleToggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
              <span className="ml-2 font-semibold">Next Action CRM</span>
            </div>
          </div>
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
