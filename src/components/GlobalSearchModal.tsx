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

const PAGES = [
  { label: '人脉总览', keywords: ['人脉', '总览', 'dashboard', 'home'], path: '/', icon: Layout },
  { label: '沟通记录', keywords: ['沟通', '记录', 'timeline', 'history'], path: '/timeline', icon: Clock },
  { label: '关系图谱', keywords: ['关系', '图谱', 'network', 'graph'], path: '/network', icon: GitFork },
  { label: '社交周报', keywords: ['周报', 'report', 'analysis'], path: '/report', icon: FileText },
];

export default function GlobalSearchModal() {
  const navigate = useNavigate();
  const {
    contacts, relationships, searchModalOpen, setSearchModalOpen, setFilter,
    getAvatarColor, setQuickAddOpen, setQuickAddInitialName, setShowAddRecordForm, setAddRecordInitialSummary
  } = useContactStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchModalOpen && inputRef.current) setTimeout(() => inputRef.current?.focus(), 50);
    if (!searchModalOpen) setQuery('');
  }, [searchModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchModalOpen) return;
      if (e.key === 'Escape') setSearchModalOpen(false);
      if (e.key === 'Enter' && query.trim() !== '' && hasNoResults) handleQuickAdd();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen, query]);

  const q = query.toLowerCase().trim();

  const filteredPages = q === '' ? [] : PAGES.filter(p => p.label.toLowerCase().includes(q) || p.keywords.some(k => k.includes(q)));
  const filteredContacts = q === '' ? [] : contacts.filter(c => c.name.toLowerCase().includes(q) || c.tags.some(t => t.label.toLowerCase().includes(q)) || (c.company || '').toLowerCase().includes(q)).slice(0, 5);
  const filteredRecords = q === '' ? [] : contacts.flatMap(c => c.communicationRecords.filter(r => r.summary.toLowerCase().includes(q) || r.details?.toLowerCase().includes(q)).map(r => ({ ...r, contact: c }))).slice(0, 3);
  const filteredRelationships = q === '' ? [] : relationships.map(r => { const source = contacts.find(c => c.id === r.sourceContactId); const target = contacts.find(c => c.id === r.targetContactId); if (!source || !target) return null; return { ...r, source, target }; }).filter(r => r && (r.type.toLowerCase().includes(q) || r.source.name.toLowerCase().includes(q) || r.target.name.toLowerCase().includes(q))).slice(0, 3);

  const hasNoResults = q !== '' && filteredPages.length === 0 && filteredContacts.length === 0 && filteredRecords.length === 0 && filteredRelationships.length === 0;

  const handlePageSelect = (path: string) => { navigate(path); setSearchModalOpen(false); };
  const handleContactSelect = (contactName: string) => { setFilter({ search: contactName }); setSearchModalOpen(false); navigate('/'); };
  const handleQuickAdd = () => { setSearchModalOpen(false); setQuickAddInitialName(query); setQuickAddOpen(true); };
  const handleAddRecord = () => { setSearchModalOpen(false); setAddRecordInitialSummary(query); setShowAddRecordForm(true); navigate('/timeline'); };

  if (!searchModalOpen) return null;

  /* ── Shared styles ── */
  const sectionHeader = "px-4 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider bg-grey-50/50 dark:bg-grey-800/50";
  const rowCls = "w-full text-left px-4 py-2.5 hover:bg-fill-quaternary flex items-center group transition-colors";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSearchModalOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -16 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white dark:bg-grey-900 rounded-xl shadow-card-hover overflow-hidden relative z-10 border border-border dark:border-grey-800 flex flex-col max-h-[80vh]"
        >
          {/* Search input */}
          <div className="flex items-center px-4 py-3 border-b border-border dark:border-grey-800 shrink-0">
            <Search className="w-5 h-5 text-text-secondary mr-3" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-base outline-none placeholder:text-text-tertiary text-text-primary dark:text-text-primary-dark bg-transparent"
              placeholder="搜索人脉、记录、关系或跳转页面..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={() => setSearchModalOpen(false)} className="p-1 hover:bg-fill-quaternary rounded-md transition-colors">
              <div className="text-[10px] text-text-secondary font-medium px-1.5 py-0.5 border border-border dark:border-grey-700 rounded">ESC</div>
            </button>
          </div>

          {/* Results */}
          <div className="overflow-y-auto flex-1">
            {q === '' ? (
              <div className="py-10 text-center text-text-secondary">
                <p className="text-sm">输入关键词全局搜索</p>
                <div className="flex justify-center gap-3 mt-3 text-xs">
                  {['人脉', '沟通记录', '关系图谱'].map(t => (
                    <span key={t} className="bg-fill-quaternary px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            ) : hasNoResults ? (
              <div className="py-2">
                <button onClick={handleQuickAdd} className={`${rowCls} bg-primary/5 border-l-3 border-primary`}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10 text-primary mr-3 shrink-0"><UserPlus size={17} /></div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-primary text-sm">创建新联系人</span>
                    <div className="text-xs text-text-secondary mt-0.5">添加 <span className="font-medium text-primary">"{query}"</span> 到您的网络</div>
                  </div>
                  <span className="text-[10px] text-primary/60 font-medium px-1.5 py-0.5 bg-primary/5 rounded border border-primary/15">Enter</span>
                </button>
                <button onClick={handleAddRecord} className={rowCls}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-fill-quaternary text-text-secondary mr-3 shrink-0"><MessageSquare size={17} /></div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-text-primary dark:text-text-primary-dark text-sm">添加沟通记录</span>
                    <div className="text-xs text-text-secondary mt-0.5">记录关于 <span className="font-medium">"{query}"</span> 的事项</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="py-2 pb-4">
                {filteredPages.length > 0 && (
                  <div className="mb-1">
                    <div className={sectionHeader}>导航</div>
                    {filteredPages.map(page => (
                      <button key={page.path} onClick={() => handlePageSelect(page.path)} className={rowCls}>
                        <div className="w-8 h-8 rounded-md bg-fill-quaternary flex items-center justify-center text-text-secondary mr-3 shrink-0"><page.icon size={15} /></div>
                        <span className="font-medium text-text-primary dark:text-text-primary-dark text-sm">{page.label}</span>
                        <span className="ml-auto text-xs text-text-secondary">跳转</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredContacts.length > 0 && (
                  <div className="mb-1">
                    <div className={sectionHeader}>人脉</div>
                    {filteredContacts.map(contact => (
                      <button key={contact.id} onClick={() => handleContactSelect(contact.name)} className={rowCls}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-xs mr-3 shrink-0" style={{ backgroundColor: getAvatarColor(contact.name) }}>
                          {contact.name.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <span className="font-medium text-text-primary dark:text-text-primary-dark text-sm mr-2 truncate">{contact.name}</span>
                            {contact.title && <span className="text-xs text-text-secondary truncate border-l border-border pl-2">{contact.title}</span>}
                          </div>
                          {contact.company && <div className="text-xs text-text-secondary truncate mt-0.5">{contact.company}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredRecords.length > 0 && (
                  <div className="mb-1">
                    <div className={sectionHeader}>沟通记录</div>
                    {filteredRecords.map((record: any) => (
                      <button key={record.id} onClick={() => { setSearchModalOpen(false); navigate('/timeline'); }} className={rowCls}>
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3 shrink-0"><MessageSquare size={15} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-text-primary dark:text-text-primary-dark text-sm truncate">{record.summary}</div>
                          <div className="text-xs text-text-secondary truncate mt-0.5">与 <span className="font-medium">{record.contact.name}</span> · {record.date}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredRelationships.length > 0 && (
                  <div className="mb-1">
                    <div className={sectionHeader}>关系</div>
                    {filteredRelationships.map((rel: any) => (
                      <button key={rel.id} onClick={() => { setSearchModalOpen(false); navigate('/network'); }} className={rowCls}>
                        <div className="w-8 h-8 rounded-md bg-accent-purple/10 flex items-center justify-center text-accent-purple mr-3 shrink-0"><GitFork size={15} /></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-text-primary dark:text-text-primary-dark text-sm truncate">{rel.source.name} <span className="text-text-secondary mx-1">↔</span> {rel.target.name}</div>
                          <div className="text-xs text-text-secondary truncate mt-0.5">{rel.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-grey-50/50 dark:bg-grey-800/50 px-4 py-2 text-xs text-text-secondary flex items-center justify-between border-t border-border dark:border-grey-800 shrink-0">
            <div className="flex items-center space-x-3">
              <span><kbd className="bg-white dark:bg-grey-800 border border-border dark:border-grey-700 rounded px-1 text-[10px]">↑</kbd> <kbd className="bg-white dark:bg-grey-800 border border-border dark:border-grey-700 rounded px-1 text-[10px]">↓</kbd> 切换</span>
              <span><kbd className="bg-white dark:bg-grey-800 border border-border dark:border-grey-700 rounded px-1 text-[10px]">↵</kbd> 确认</span>
            </div>
            <span>BridgeFlow Command</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
