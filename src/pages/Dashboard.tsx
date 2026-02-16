/**
 * [INPUT]: 依赖 contactStore 获取人脉数据，依赖 RelationshipModal 处理关系连接
 * [OUTPUT]: 对外提供 Dashboard 页面组件，展示人脉总览、卡片/表格视图
 * [POS]: pages/Dashboard，系统的核心着陆页，提供数据概览与操作入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink, MessageSquare, Calendar, ArrowRight, Pencil, Trash2, Link2, Upload, Download, Loader2 } from 'lucide-react';
import RelationshipModal from '../components/RelationshipModal';
import ImportModal from '../components/ImportModal';
import { useContactStore } from '../store/contactStore';
import type { Contact } from '../types/contact';
import { supabase } from '../lib/supabase';
import { API_BASE } from '../lib/api';
import bonjourIcon from '../assets/icons/bonjour-profile.svg';
import magicHatIcon from '../assets/icons/magic-hat.svg';
import celebrateIcon from '../assets/icons/celebrate.svg';

function ContactCard({ contact, index, onEdit, selected, onSelect, onConnect }: { contact: Contact; index: number; onEdit: (contact: Contact) => void; selected: boolean; onSelect: (selected: boolean) => void; onConnect: (contact: Contact) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { getAvatarColor } = useContactStore();
  const color = getAvatarColor(contact.name);

  const recentRecord = contact.communicationRecords[0];
  const pendingFollowUp = contact.communicationRecords.find(r => r.followUp && !r.followUp.done);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={`glass-card overflow-hidden ${selected ? 'ring-2 ring-primary border-primary' : ''}`}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 rounded border-grey-300 dark:border-grey-600 text-primary focus:ring-primary cursor-pointer accent-primary"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text-primary dark:text-text-primary-dark text-base leading-tight">{contact.name}</h3>
                <p className="text-sm text-text-secondary mt-0.5">{contact.company}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onConnect(contact); }}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-fill-quaternary text-text-secondary hover:text-primary transition-colors"
                  title="添加关系"
                >
                  <Link2 size={15} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(contact); }}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-fill-quaternary text-text-secondary transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-fill-quaternary text-text-secondary transition-colors"
                >
                  {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {/* Tags — Bonjour pill style */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {contact.tags.map(tag => (
                <span
                  key={tag.id}
                  className="px-2.5 py-0.5 rounded-pill text-[11px] font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.label}
                </span>
              ))}
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <MessageSquare size={13} />
                {contact.interactionCount} 次互动
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                最近 {contact.lastContactedAt}
              </span>
            </div>

            {/* Pending follow-up */}
            {pendingFollowUp?.followUp && (
              <div className="mt-3 flex items-center gap-2 text-xs font-medium bg-accent-amber/10 text-accent-amber px-3 py-1.5 rounded-lg border border-accent-amber/20">
                <ArrowRight size={13} />
                <span>待跟进: {pendingFollowUp.followUp.note}</span>
                <span className="ml-auto opacity-75">{pendingFollowUp.followUp.date}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-grey-50/50 dark:bg-white/5"
          >
            <div className="px-5 pb-5 border-t border-border dark:border-grey-800 pt-4">
              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white dark:bg-grey-800 rounded-xl p-3 text-center border border-border/50 dark:border-grey-700">
                  <div className="text-lg font-semibold text-primary">{contact.interactionCount}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">总互动</div>
                </div>
                <div className="bg-white dark:bg-grey-800 rounded-xl p-3 text-center border border-border/50 dark:border-grey-700">
                  <div className="text-lg font-semibold text-accent-green">{contact.communicationRecords.length}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">沟通记录</div>
                </div>
                <div className="bg-white dark:bg-grey-800 rounded-xl p-3 text-center border border-border/50 dark:border-grey-700">
                  <div className="text-lg font-semibold text-accent-amber">{contact.connections.length}</div>
                  <div className="text-[11px] text-text-secondary mt-0.5">关联人脉</div>
                </div>
              </div>

              {/* Bonjour link */}
              {contact.bonjourLink && (
                <a
                  href={contact.bonjourLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors group bg-primary/5 p-3 rounded-xl border border-primary/10 mb-4"
                >
                  <div className="w-7 h-7 rounded-md bg-white dark:bg-grey-800 flex items-center justify-center shadow-subtle p-1.5">
                    <img src={bonjourIcon} alt="Bonjour" className="w-full h-full" />
                  </div>
                  <span className="truncate flex-1">Bonjour! 数字名片</span>
                  <ExternalLink size={13} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              )}

              {/* Notes */}
              {contact.notes && (
                <div className="text-sm text-text-secondary bg-white dark:bg-grey-800 border border-border/50 dark:border-grey-700 rounded-xl p-3 mb-4 italic">
                  "{contact.notes}"
                </div>
              )}

              {/* Recent records */}
              {contact.communicationRecords.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">最近沟通</h4>
                  <div className="space-y-2">
                    {contact.communicationRecords.slice(0, 3).map(record => (
                      <div key={record.id} className="flex items-start gap-2.5 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1">
                          <span className="text-text-primary dark:text-text-primary-dark font-medium block">{record.summary}</span>
                          <span className="text-xs text-text-secondary">{record.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interaction frequency */}
              <div className="mt-5">
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">互动频率</h4>
                <div className="flex items-end gap-1 h-14">
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = new Date();
                    month.setMonth(month.getMonth() - (11 - i));
                    const monthStr = month.toISOString().slice(0, 7);
                    const count = contact.communicationRecords.filter(r => r.date.startsWith(monthStr)).length;
                    const maxCount = Math.max(1, ...Array.from({ length: 12 }, (_, j) => {
                      const m = new Date();
                      m.setMonth(m.getMonth() - (11 - j));
                      return contact.communicationRecords.filter(r => r.date.startsWith(m.toISOString().slice(0, 7))).length;
                    }));
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all"
                        style={{
                          height: `${Math.max(10, (count / maxCount) * 100)}%`,
                          backgroundColor: count > 0 ? '#007AFF' : 'currentColor',
                          opacity: count > 0 ? 0.5 + (count / maxCount) * 0.5 : 0.08,
                        }}
                        title={`${monthStr}: ${count} 次`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-text-secondary mt-1.5">
                  <span>12月前</span>
                  <span>本月</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Dashboard Main Component ── */
export default function Dashboard() {
  const { getFilteredContacts, activeView, setActiveView, getInactiveContacts, setEditingContactId, setQuickAddOpen, deleteContacts, contacts: allContacts } = useContactStore();
  const contacts = getFilteredContacts();
  const inactive = getInactiveContacts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [relationshipModalOpen, setRelationshipModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [relationshipSourceId, setRelationshipSourceId] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_BASE}/api/contacts/export`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('导出失败');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `缘脉导出_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContactId(contact.id);
    setQuickAddOpen(true);
  };

  const handleConnect = (contact: Contact) => {
    setRelationshipSourceId(contact.id);
    setRelationshipModalOpen(true);
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id); else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(contacts.map(c => c.id)) : new Set());
  };

  const handleDeleteSelected = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.size} 位联系人吗？`)) {
      deleteContacts(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark tracking-tight">人脉总览</h1>
          <p className="text-sm text-text-secondary mt-1">共 {contacts.length} 位联系人</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-red/10 text-accent-red rounded-lg hover:bg-accent-red/15 transition-colors text-sm font-medium"
            >
              <Trash2 size={16} />
              删除 ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setImportModalOpen(true)}
            className="glass-button flex items-center gap-1.5 text-text-secondary text-sm font-medium"
          >
            <Upload size={16} />
            批量导入
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="glass-button flex items-center gap-1.5 text-text-secondary text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            批量导出
          </button>
          <div className="flex items-center gap-0.5 bg-fill-quaternary rounded-lg p-1">
            {(['table', 'cards'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeView === view ? 'bg-white dark:bg-grey-800 text-primary shadow-subtle' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {view === 'cards' ? '卡片' : '表格'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Smart reminder */}
      {inactive.length > 0 && (
        <div className="mb-6 bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <img src={magicHatIcon} alt="Magic" className="w-4 h-4" />
              智能提醒
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              有 <strong>{inactive.length}</strong> 位联系人超过半年未联系：
              {inactive.slice(0, 3).map(c => c.name).join('、')}
              {inactive.length > 3 && ` 等`}
            </p>
          </div>
          <button className="text-sm font-medium text-primary bg-white dark:bg-grey-800 border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
            查看全部
          </button>
        </div>
      )}

      {/* Cards view */}
      {activeView === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {contacts.map((contact, idx) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              index={idx}
              onEdit={handleEdit}
              selected={selectedIds.has(contact.id)}
              onSelect={(checked) => handleSelect(contact.id, checked)}
              onConnect={handleConnect}
            />
          ))}
        </div>
      )}

      {/* Table view */}
      {activeView === 'table' && (
        <div className="bg-white dark:bg-grey-900 rounded-card overflow-hidden border border-border dark:border-grey-800 shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border dark:border-grey-800 bg-grey-50/50 dark:bg-grey-800/50">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedIds.size === contacts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-grey-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">姓名</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">行业</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">职位标签</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">专业技能</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">认识渠道</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">城市</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">最近联系</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">互动</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id} className={`border-b border-border/50 dark:border-grey-800 hover:bg-fill-quaternary transition-colors ${selectedIds.has(contact.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(contact.id)}
                      onChange={(e) => handleSelect(contact.id, e.target.checked)}
                      className="w-4 h-4 rounded border-grey-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{contact.name}</div>
                    <div className="text-xs text-text-secondary">{contact.company}</div>
                  </td>
                  {(['industry', 'role', 'skill', 'relationship', 'location'] as const).map(cat => (
                    <td key={cat} className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.filter(t => t.category === cat).map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 rounded-pill text-[10px] font-medium text-white" style={{ backgroundColor: tag.color }}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm text-text-secondary">{contact.lastContactedAt}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary dark:text-text-primary-dark">{contact.interactionCount}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-fill-quaternary text-text-secondary transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {contacts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-grey-50 dark:bg-grey-800 flex items-center justify-center mx-auto mb-5">
            <img src={celebrateIcon} alt="Empty" className="w-8 h-8 opacity-50" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">暂无匹配的联系人</h3>
          <p className="text-sm text-text-secondary mt-1">试试调整筛选条件或搜索其他关键词</p>
        </div>
      )}

      <RelationshipModal
        isOpen={relationshipModalOpen}
        onClose={() => setRelationshipModalOpen(false)}
        sourceContactId={relationshipSourceId || ''}
      />
      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </div>
  );
}
