/**
 * [INPUT]: 依赖 useContactStore 获取 contacts 和控制 modal 状态
 * [OUTPUT]: 对外提供 GlobalSearchModal 组件，用于全局搜索联系人
 * [POS]: components/GlobalSearchModal，全局搜索入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContactStore } from '../store/contactStore';
import { Search, Briefcase, Hash, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearchModal() {
  const navigate = useNavigate();
  const { 
    contacts, 
    searchModalOpen, 
    setSearchModalOpen, 
    setFilter,
    getAvatarColor,
    setQuickAddOpen,
    setQuickAddInitialName
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
      
      // If no results and Enter is pressed, open quick add
      if (e.key === 'Enter' && query.trim() !== '' && filteredContacts.length === 0) {
        handleQuickAdd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen, query]);

  // Filter logic
  const filteredContacts = query.trim() === '' ? [] : contacts.filter(c => {
    const q = query.toLowerCase();
    const matchName = c.name.toLowerCase().includes(q);
    const matchTag = c.tags.some(t => t.label.toLowerCase().includes(q));
    const matchCompany = (c.company || '').toLowerCase().includes(q);
    return matchName || matchTag || matchCompany;
  }).slice(0, 5);

  const handleSelect = (contactName: string) => {
    setFilter({ search: contactName });
    setSearchModalOpen(false);
    navigate('/');
  };

  const handleQuickAdd = () => {
    setSearchModalOpen(false);
    setQuickAddInitialName(query);
    setQuickAddOpen(true);
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
          className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 border border-gray-100"
        >
          {/* Search Input Header */}
          <div className="flex items-center px-4 py-4 border-b border-gray-100">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-lg outline-none placeholder:text-gray-400 text-gray-800"
              placeholder="搜索姓名、标签或公司..."
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
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() === '' ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-sm">输入关键词搜索您的人脉网络</p>
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">联系人</div>
                {filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleSelect(contact.name)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center group transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm mr-4 shrink-0"
                      style={{ backgroundColor: getAvatarColor(contact.name) }}
                    >
                      {contact.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 mr-2 truncate">{contact.name}</span>
                        {contact.title && (
                          <span className="text-xs text-gray-500 truncate border-l border-gray-300 pl-2">{contact.title}</span>
                        )}
                      </div>
                      <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                        {contact.company && (
                          <div className="flex items-center truncate">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {contact.company}
                          </div>
                        )}
                        {contact.tags.length > 0 && (
                          <div className="flex items-center truncate">
                            <Hash className="w-3 h-3 mr-1" />
                            {contact.tags[0].label}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
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
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <span><kbd className="font-sans bg-white border border-gray-200 rounded px-1">↑</kbd> <kbd className="font-sans bg-white border border-gray-200 rounded px-1">↓</kbd> 切换选中</span>
              <span><kbd className="font-sans bg-white border border-gray-200 rounded px-1">↵</kbd> 跳转</span>
            </div>
            <span>BridgeFlow Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
