/**
 * [INPUT]: 依赖 Outlet 渲染子路由，依赖 contactStore 管理全局搜索/侧边栏状态
 * [OUTPUT]: 对外提供应用的主骨架 (Header + Sidebar + MainArea)
 * [POS]: layouts/MainLayout，全站的视觉容器与导航中枢
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, Users, Clock, Share2, BarChart3, ChevronLeft, ChevronRight, Globe2, UserPlus, X, AlertCircle, Loader2 } from 'lucide-react';
import { useContactStore } from '../store/contactStore';
import { useUserStore } from '../store/userStore';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickAddModal from '../components/QuickAddModal';
import GlobalSearchModal from '../components/GlobalSearchModal';
import FilterSidebar from '../components/FilterSidebar';
import ThemeToggle from '../components/ThemeToggle';

const navItems = [
  { path: '/', label: '资产总览', icon: Users },
  { path: '/timeline', label: '沟通记录', icon: Clock },
  { path: '/network', label: '关系图谱', icon: Globe2 },
  { path: '/report', label: '社交周报', icon: BarChart3 },
  { path: '/share', label: '分享页面', icon: Share2 },
];

export default function MainLayout() {
  const { filter, setFilter, quickAddOpen, setQuickAddOpen, sidebarCollapsed, setSidebarCollapsed, getInactiveContacts, contacts, fetchData, searchModalOpen, setSearchModalOpen, importStatus, setImportStatus } = useContactStore();
  const { user, fetchUser } = useUserStore();
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const inactive = getInactiveContacts();

  const [shortcutLabel, setShortcutLabel] = useState('⌘K');

  useEffect(() => {
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
    handleMediaQueryChange(mediaQuery);
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
    <div className="min-h-screen bg-surface-bg dark:bg-surface-bg-dark flex flex-col transition-colors duration-300">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-grey-900/90 backdrop-blur-glass border-b border-border dark:border-grey-800">
        <div className="flex items-center h-14 px-6 gap-5">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Globe2 className="text-white" size={18} />
            </div>
            <span className="font-semibold text-base tracking-tight text-text-primary dark:text-text-primary-dark">缘脉</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 ml-2">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:bg-fill-quaternary'
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
                className="w-full h-9 pl-10 pr-16 rounded-lg bg-grey-50 dark:bg-grey-800 text-sm text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-grey-700 transition-all border border-transparent focus:border-primary/30"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <span className="text-[10px] font-medium text-text-secondary bg-white dark:bg-grey-700 border border-border dark:border-grey-600 rounded px-1.5 py-0.5">{shortcutLabel}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-border dark:border-grey-800">
            <ThemeToggle />
            <button
              onClick={() => setQuickAddOpen(true)}
              className="h-8 px-3.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-all flex items-center gap-1.5"
            >
              <UserPlus size={15} />
              <span>快速录入</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-grey-100 dark:bg-grey-800 border border-border dark:border-grey-700 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
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

      {/* Import Progress Notification */}
      <AnimatePresence>
        {importStatus?.isImporting && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-14 z-30 bg-blue-50 border-b border-blue-100"
          >
            <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">
                  正在后台导入关系资产数据...
                </span>
              </div>
              <button
                onClick={() => setImportStatus(null)}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors"
              >
                <X size={14} className="text-blue-600" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Sidebar ── */}
        <aside
          className={`bg-white dark:bg-grey-900 border-r border-border dark:border-grey-800 transition-all duration-300 flex flex-col z-30 ${
            sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-[260px]'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-5">
            <FilterSidebar />
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-border dark:border-grey-800">
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Globe2 size={14} />
                </div>
                <span className="font-semibold text-sm text-text-primary dark:text-text-primary-dark">Pro 版本</span>
              </div>
              <p className="text-xs text-text-secondary mb-3">解锁 AI 智能分析与无限联系人存储</p>
              <button className="w-full py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-lg hover:bg-primary/15 transition-colors">
                升级套餐
              </button>
            </div>
          </div>
        </aside>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`fixed bottom-6 z-40 w-9 h-9 bg-white dark:bg-grey-800 rounded-full shadow-card border border-border dark:border-grey-700 flex items-center justify-center text-text-secondary hover:text-primary hover:shadow-card-hover transition-all ${
            sidebarCollapsed ? 'left-6' : 'left-[244px]'
          }`}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
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
