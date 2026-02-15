/**
 * [INPUT]: 依赖 useContactStore 获取 contacts 和控制 modal 状态
 * [OUTPUT]: 对外提供 GlobalSearchModal 组件，用于全局搜索联系人
 * [POS]: components/GlobalSearchModal，全局搜索入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactStore } from '../store/contactStore';
import { Search, Briefcase, Hash, UserPlus, FileText, Layout, GitFork, Clock, MessageSquare, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Page definitions
const PAGES = [
  { label: '人脉总览', keywords: ['人脉', '总览', 'dashboard', 'home'], path: '/', icon: Layout },
  { label: '沟通记录', keywords: ['沟通', '记录', 'timeline', 'history'], path: '/timeline', icon: Clock },
  { label: '关系图谱', keywords: ['关系', '图谱', 'network', 'graph'], path: '/network', icon: GitFork },
  { label: '社交周报', keywords: ['周报', 'report', 'analysis'], path: '/report', icon: FileText },
];

export default function GlobalSearchModal() {
  const navigate = useNavigate();
  const { 
    contacts, 
    relationships,
    searchModalOpen, 
    setSearchModalOpen, 
    setFilter,
    getAvatarColor,
    setQuickAddOpen,
    setQuickAddInitialName,
    setShowAddRecordForm,
    setAddRecordInitialSummary
  } = useContactStore();
  
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (searchModalOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
    if (!searchModalOpen) {
      setQuery('');
    }
  }, [searchModalOpen]);

  // Handle keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchModalOpen) return;
      
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
      
      // Enter handling logic
      if (e.key === 'Enter' && query.trim() !== '') {
        // If no results, default to Quick Add Contact
        if (hasNoResults) {
          handleQuickAdd();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen, query]); // Added hasNoResults to dependency in implementation

  // --- Search Logic ---
  const q = query.toLowerCase().trim();

  // 1. Pages
  const filteredPages = q === '' ? [] : PAGES.filter(p => 
    p.label.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q))
  );

  // 2. Contacts
  const filteredContacts = q === '' ? [] : contacts.filter(c => {
    const matchName = c.name.toLowerCase().includes(q);
    const matchTag = c.tags.some(t => t.label.toLowerCase().includes(q));
    const matchCompany = (c.company || '').toLowerCase().includes(q);
    return matchName || matchTag || matchCompany;
  }).slice(0, 5);

  // 3. Records
  const filteredRecords = q === '' ? [] : contacts.flatMap(c => 
    c.communicationRecords
      .filter(r => r.summary.toLowerCase().includes(q) || r.details?.toLowerCase().includes(q))
      .map(r => ({ ...r, contact: c }))
  ).slice(0, 3);

  // 4. Relationships
  const filteredRelationships = q === '' ? [] : relationships.map(r => {
    const source = contacts.find(c => c.id === r.sourceContactId);
    const target = contacts.find(c => c.id === r.targetContactId);
    if (!source || !target) return null;
    return { ...r, source, target };
  }).filter(r => 
    r && (
      r.type.toLowerCase().includes(q) || 
      r.source.name.toLowerCase().includes(q) || 
      r.target.name.toLowerCase().includes(q)
    )
  ).slice(0, 3);

  const hasNoResults = q !== '' && 
    filteredPages.length === 0 && 
    filteredContacts.length === 0 && 
    filteredRecords.length === 0 && 
    filteredRelationships.length === 0;

  // --- Actions ---

  const handlePageSelect = (path: string) => {
    navigate(path);
    setSearchModalOpen(false);
  };

  const handleContactSelect = (contactName: string) => {
    setFilter({ search: contactName });
    setSearchModalOpen(false);
    navigate('/');
  };

  const handleQuickAdd = () => {
    setSearchModalOpen(false);
    setQuickAddInitialName(query);
    setQuickAddOpen(true);
  };

  const handleAddRecord = () => {
    setSearchModalOpen(false);
    setAddRecordInitialSummary(query);
    setShowAddRecordForm(true);
    navigate('/timeline');
  };

  if (!searchModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchModalOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 border border-gray-100 flex flex-col max-h-[80vh]"
        >
          {/* Search Input Header */}
          <div className="flex items-center px-4 py-4 border-b border-gray-100 shrink-0">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-lg outline-none placeholder:text-gray-400 text-gray-800"
              placeholder="搜索人脉、记录、关系或跳转页面..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button 
              onClick={() => setSearchModalOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <div className="text-xs text-gray-400 font-medium px-2 py-1 border border-gray-200 rounded">ESC</div>
            </button>
          </div>

          {/* Results */}
          <div className="overflow-y-auto flex-1">
            {q === '' ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-sm">输入关键词全局搜索</p>
                <div className="flex justify-center gap-4 mt-4 text-xs">
                  <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">人脉</span>
                  <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">沟通记录</span>
                  <span className="bg-gray-50 px-2 py-1 rounded border border-gray-100">关系图谱</span>
                </div>
              </div>
            ) : hasNoResults ? (
              <div className="py-2">
                 <button
                  onClick={handleQuickAdd}
                  className="w-full text-left px-4 py-3 bg-primary/5 hover:bg-primary/10 flex items-center group transition-colors border-l-4 border-primary"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-primary shadow-sm mr-4 shrink-0 border border-primary/20">
                    <UserPlus size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="font-medium text-primary mr-2 truncate">创建新联系人</span>
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      添加 <span className="font-semibold text-primary">"{query}"</span> 到您的网络
                    </div>
                  </div>
                  <div className="text-xs text-primary/60 font-medium px-2 py-1 bg-white rounded border border-primary/20">
                    Enter
                  </div>
                </button>
                <button
                  onClick={handleAddRecord}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center group transition-colors border-l-4 border-transparent"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 shadow-sm mr-4 shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 mr-2 truncate">添加沟通记录</span>
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      记录关于 <span className="font-semibold text-gray-700">"{query}"</span> 的事项
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="py-2 pb-6">
                {/* Pages */}
                {filteredPages.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">导航</div>
                    {filteredPages.map(page => (
                      <button
                        key={page.path}
                        onClick={() => handlePageSelect(page.path)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center group transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mr-4 shrink-0">
                          <page.icon size={16} />
                        </div>
                        <span className="font-medium text-gray-900">{page.label}</span>
                        <span className="ml-auto text-xs text-gray-400">跳转</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Contacts */}
                {filteredContacts.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">人脉</div>
                    {filteredContacts.map(contact => (
                      <button
                        key={contact.id}
                        onClick={() => handleContactSelect(contact.name)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center group transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs mr-4 shrink-0"
                          style={{ backgroundColor: getAvatarColor(contact.name) }}
                        >
                          {contact.name.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900 mr-2 truncate">{contact.name}</span>
                            {contact.title && <span className="text-xs text-gray-500 truncate border-l border-gray-300 pl-2">{contact.title}</span>}
                          </div>
                          {contact.company && <div className="text-xs text-gray-500 truncate mt-0.5">{contact.company}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Records */}
                {filteredRecords.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">沟通记录</div>
                    {filteredRecords.map((record: any) => (
                      <button
                        key={record.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          navigate('/timeline');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center group transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mr-4 shrink-0">
                          <MessageSquare size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{record.summary}</div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            与 <span className="font-medium text-gray-700">{record.contact.name}</span> · {record.date}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Relationships */}
                {filteredRelationships.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/50">关系</div>
                    {filteredRelationships.map((rel: any) => (
                      <button
                        key={rel.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          navigate('/network');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center group transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mr-4 shrink-0">
                          <GitFork size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{rel.source.name} <span className="text-gray-400 mx-1">↔</span> {rel.target.name}</div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {rel.type}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 flex items-center justify-between border-t border-gray-100 shrink-0">
            <div className="flex items-center space-x-4">
              <span><kbd className="font-sans bg-white border border-gray-200 rounded px-1">↑</kbd> <kbd className="font-sans bg-white border border-gray-200 rounded px-1">↓</kbd> 切换</span>
              <span><kbd className="font-sans bg-white border border-gray-200 rounded px-1">↵</kbd> 确认</span>
            </div>
            <span>BridgeFlow Command</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
