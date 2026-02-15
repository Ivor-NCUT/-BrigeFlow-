/**
 * [INPUT]: 依赖 Outlet 渲染子路由，依赖 contactStore 管理全局搜索/侧边栏状态
 * [OUTPUT]: 对外提供应用的主骨架 (Header + Sidebar + MainArea)
 * [POS]: layouts/MainLayout，全站的视觉容器与导航中枢
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Users, Clock, Share2, BarChart3, ChevronLeft, ChevronRight, Globe2, UserPlus, X, AlertCircle } from 'lucide-react';
import { useContactStore } from '../store/contactStore';
import { useUserStore } from '../store/userStore';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickAddModal from '../components/QuickAddModal';
import GlobalSearchModal from '../components/GlobalSearchModal';
import FilterSidebar from '../components/FilterSidebar';

const navItems = [
  { path: '/', label: '人脉总览', icon: Users },
  { path: '/timeline', label: '沟通记录', icon: Clock },
  { path: '/network', label: '关系图谱', icon: Globe2 },
  { path: '/report', label: '社交周报', icon: BarChart3 },
  { path: '/share', label: '分享页面', icon: Share2 },
];

export default function MainLayout() {
  const { filter, setFilter, quickAddOpen, setQuickAddOpen, sidebarCollapsed, setSidebarCollapsed, getInactiveContacts, contacts, fetchData, searchModalOpen, setSearchModalOpen } = useContactStore();
  const { user, fetchUser } = useUserStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const inactive = getInactiveContacts();

  const [shortcutLabel, setShortcutLabel] = useState('⌘K');

  useEffect(() => {
    // Detect OS for shortcut label
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    setShortcutLabel(isMac ? '⌘K' : 'Ctrl+K');
  }, []);

  useEffect(() => {
    fetchData();
    fetchUser();
  }, [fetchData, fetchUser]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1024px)');
    
    const handleMediaQueryChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSidebarCollapsed(e.matches);
    };

    // Initial check
    handleMediaQueryChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchModalOpen]);

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="flex items-center h-16 px-6 gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Globe2 className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight text-text-primary">缘脉 BridgeFlow</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1 ml-2 md:ml-4">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2 md:px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-grey-50 hover:scale-95'
                  }`
                }
                title={item.label}
              >
                <item.icon size={16} />
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 flex justify-end">
            <div className={`relative transition-all duration-300 ${searchFocused ? 'w-96' : 'w-72'}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input
                ref={searchRef}
                type="text"
                placeholder="搜索姓名、标签或公司..."
                value={filter.search}
                onChange={e => setFilter({ search: e.target.value })}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full h-10 pl-10 pr-16 rounded-lg border border-border bg-grey-50/80 text-sm placeholder:text-text-secondary focus:outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <span className="text-[10px] font-medium text-text-secondary bg-white border border-border rounded px-1.5 py-0.5">{shortcutLabel}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <button
              onClick={() => setQuickAddOpen(true)}
              className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover hover:scale-95 transition-all flex items-center gap-2 shadow-sm shadow-primary/20"
            >
              <UserPlus size={16} />
              <span>快速录入</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-full bg-grey-100 border border-white shadow-sm overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
            >
              <img 
                src={user?.user_metadata?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                alt={user?.user_metadata?.full_name || "User"} 
                className="w-full h-full object-cover" 
              />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-border transition-all duration-300 flex flex-col z-30 ${
            sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-[280px]'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-6">
            <FilterSidebar />
          </div>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-border">
            <div className="bg-gradient-to-br from-primary-light to-white rounded-2xl p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary">
                  <Globe2 size={16} />
                </div>
                <span className="font-semibold text-sm text-text-primary">Pro 版本</span>
              </div>
              <p className="text-xs text-text-secondary mb-3">解锁 AI 智能分析与无限联系人存储</p>
              <button className="w-full py-2 bg-white border border-primary/20 text-primary text-xs font-semibold rounded-lg hover:bg-primary-50 transition-colors">
                升级套餐
              </button>
            </div>
          </div>
        </aside>

        {/* Toggle Sidebar Button (Floating) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`fixed bottom-8 left-8 z-40 w-10 h-10 bg-white rounded-full shadow-lg border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:scale-110 transition-all ${
            !sidebarCollapsed && 'left-[260px]'
          }`}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-surface-bg p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {quickAddOpen && <QuickAddModal />}
      </AnimatePresence>

      {/* Global Search Modal */}
      <GlobalSearchModal />
    </div>
  );
}
