/**
 * [INPUT]: 依赖 contactStore 获取沟通记录，依赖 RelationshipModal
 * [OUTPUT]: 对外提供 Timeline 页面组件，展示沟通历史与跟进事项
 * [POS]: pages/Timeline，核心功能页面之一，管理时间维度的交互记录
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Plus, Check, Handshake, ShoppingBag, Ticket, Briefcase, MoreHorizontal, X, Link2, Clock } from 'lucide-react';
import RelationshipModal from '../components/RelationshipModal';
import { useContactStore } from '../store/contactStore';
import type { CommunicationRecord } from '../types/contact';

const typeIcons: Record<string, any> = {
  connection: Handshake, purchase: ShoppingBag, invitation: Ticket, service: Briefcase, other: MoreHorizontal,
};
const typeLabels: Record<string, string> = {
  connection: '合作建联', purchase: '购买服务', invitation: '嘉宾邀请', service: '提供服务', other: '其它',
};
const typeColors: Record<string, string> = {
  connection: '#007AFF', purchase: '#34C759', invitation: '#FF9500', service: '#AF52DE', other: '#8A8A8E',
};

export default function Timeline() {
  const { contacts, getAvatarColor, addCommunicationRecord, setQuickAddOpen, setQuickAddInitialName, showAddRecordForm, setShowAddRecordForm, addRecordInitialSummary, setAddRecordInitialSummary } = useContactStore();
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [comboboxInput, setComboboxInput] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: 'connection' as CommunicationRecord['type'], summary: '', followUpDate: '', followUpNote: '', followUpDeadline: '' });
  const [showFollowUpDeadlinePicker, setShowFollowUpDeadlinePicker] = useState(false);
  const [relationshipModalOpen, setRelationshipModalOpen] = useState(false);
  const [relationshipSourceId, setRelationshipSourceId] = useState<string | null>(null);

  useEffect(() => {
    if (showAddRecordForm && !newRecord.followUpDate) {
      setNewRecord(prev => ({ ...prev, followUpDate: new Date().toISOString().split('T')[0] }));
    }
    if (addRecordInitialSummary) {
      setNewRecord(prev => ({ ...prev, summary: addRecordInitialSummary }));
      setAddRecordInitialSummary('');
    }
  }, [addRecordInitialSummary, setAddRecordInitialSummary, showAddRecordForm, newRecord.followUpDate]);

  const allRecords = contacts.flatMap(c => (c.communicationRecords || []).map(r => ({ ...r, contact: c }))).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const grouped = allRecords.reduce((acc, r) => { if (!acc[r.date]) acc[r.date] = []; acc[r.date].push(r); return acc; }, {} as Record<string, typeof allRecords>);

  const handleAddRecord = () => {
    if (selectedContactIds.length === 0 || !newRecord.summary) return;
    selectedContactIds.forEach(id => {
      addCommunicationRecord(id, {
        contactId: id, date: new Date().toISOString().split('T')[0], type: newRecord.type,
        summary: newRecord.summary,
        ...(newRecord.followUpDate ? { followUp: { date: newRecord.followUpDeadline || newRecord.followUpDate, note: newRecord.followUpNote, done: false } } : {}),
      });
    });
    setShowAddRecordForm(false);
    setNewRecord({ type: 'connection', summary: '', followUpDate: new Date().toISOString().split('T')[0], followUpNote: '', followUpDeadline: '' });
    setSelectedContactIds([]); setComboboxInput('');
  };

  const pendingFollowUps = contacts.flatMap(c => c.communicationRecords.filter(r => r.followUp && !r.followUp.done).map(r => ({ ...r, contact: c }))).sort((a, b) => (a.followUp?.date || '').localeCompare(b.followUp?.date || ''));

  /* ── Shared input style ── */
  const inputCls = "w-full h-9 px-3 rounded-lg border border-border dark:border-grey-700 text-sm bg-white dark:bg-grey-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary dark:text-text-primary-dark tracking-tight">沟通时间轴</h1>
          <p className="text-sm text-text-secondary mt-1">记录每一次有价值的交流</p>
        </div>
        <button onClick={() => setShowAddRecordForm(!showAddRecordForm)} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
          <Plus size={15} /> 添加记录
        </button>
      </div>

      {/* ── Add form ── */}
      {showAddRecordForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-grey-900 rounded-card border border-border dark:border-grey-800 p-5 mb-6 shadow-card">
          <h3 className="font-semibold text-text-primary dark:text-text-primary-dark mb-4 text-sm">新增沟通记录</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">联系人</label>
              <div className="relative">
                {selectedContactIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedContactIds.map(id => { const c = contacts.find(c => c.id === id); if (!c) return null; return (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-xs font-medium bg-primary/10 text-primary">
                        {c.name} <button onClick={() => setSelectedContactIds(ids => ids.filter(i => i !== id))} className="hover:text-primary-hover"><X size={11} /></button>
                      </span>
                    ); })}
                  </div>
                )}
                <input type="text" value={comboboxInput} onChange={e => { setComboboxInput(e.target.value); setIsComboboxOpen(true); }} onFocus={() => setIsComboboxOpen(true)} onBlur={() => setTimeout(() => setIsComboboxOpen(false), 200)}
                  placeholder={selectedContactIds.length > 0 ? "继续添加..." : "搜索或添加联系人..."} className={inputCls} />
                {isComboboxOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-grey-900 border border-border dark:border-grey-800 rounded-lg shadow-card max-h-60 overflow-y-auto">
                    {contacts.filter(c => !selectedContactIds.includes(c.id)).filter(c => c.name.toLowerCase().includes(comboboxInput.toLowerCase()) || c.company.toLowerCase().includes(comboboxInput.toLowerCase())).map(c => (
                      <button key={c.id} onClick={() => { setSelectedContactIds(prev => [...prev, c.id]); setComboboxInput(''); setIsComboboxOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-fill-quaternary flex items-center justify-between">
                        <span className="font-medium text-text-primary dark:text-text-primary-dark">{c.name}</span>
                        <span className="text-xs text-text-secondary">{c.company}</span>
                      </button>
                    ))}
                    {comboboxInput && !contacts.some(c => c.name.toLowerCase() === comboboxInput.toLowerCase()) && (
                      <button onClick={() => { setQuickAddInitialName(comboboxInput); setQuickAddOpen(true); setIsComboboxOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary/5 flex items-center gap-2 font-medium border-t border-border dark:border-grey-800">
                        <Plus size={13} /> 添加 "{comboboxInput}"
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">沟通类型</label>
              <div className="flex gap-1">
                {Object.entries(typeLabels).map(([key, label]) => (
                  <button key={key} onClick={() => setNewRecord(r => ({ ...r, type: key as any }))}
                    className={`flex-1 h-9 rounded-lg text-xs font-medium transition-all ${newRecord.type === key ? 'text-white' : 'bg-fill-quaternary text-text-secondary hover:bg-fill-secondary'}`}
                    style={newRecord.type === key ? { backgroundColor: typeColors[key] } : {}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-text-secondary mb-1 block">沟通记录</label>
            <textarea value={newRecord.summary} onChange={e => setNewRecord(r => ({ ...r, summary: e.target.value }))} placeholder="记录此次沟通内容..." rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border dark:border-grey-700 text-sm bg-white dark:bg-grey-800 resize-none focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-text-primary dark:text-text-primary-dark" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">跟进日期</label>
              <input type="date" value={newRecord.followUpDate} onChange={e => setNewRecord(r => ({ ...r, followUpDate: e.target.value }))} className={inputCls} />
            </div>
            <div className="relative">
              <label className="text-xs font-medium text-text-secondary mb-1 block">跟进任务</label>
              <div className="flex gap-1">
                <input type="text" value={newRecord.followUpNote} onChange={e => setNewRecord(r => ({ ...r, followUpNote: e.target.value }))} placeholder="需要跟进的事项..." className="flex-1 h-9 px-3 rounded-lg border border-border dark:border-grey-700 text-sm bg-white dark:bg-grey-800 text-text-primary dark:text-text-primary-dark focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" />
                <button type="button" onClick={() => setShowFollowUpDeadlinePicker(!showFollowUpDeadlinePicker)} className="h-9 px-2 rounded-lg border border-border dark:border-grey-700 bg-fill-quaternary hover:bg-fill-secondary text-text-secondary flex items-center gap-1 text-xs">
                  <Clock size={14} />
                </button>
              </div>
              {showFollowUpDeadlinePicker && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-grey-800 rounded-lg border border-border dark:border-grey-700 shadow-lg z-20">
                  <input type="date" value={newRecord.followUpDeadline} onChange={e => { setNewRecord(r => ({ ...r, followUpDeadline: e.target.value })); setShowFollowUpDeadlinePicker(false); }} className="text-xs" />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2.5">
            <button onClick={() => setShowAddRecordForm(false)} className="px-4 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-fill-quaternary transition-colors">取消</button>
            <button onClick={handleAddRecord} disabled={selectedContactIds.length === 0 || !newRecord.summary}
              className="px-5 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              确认添加
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Timeline body ── */}
      <div className="flex gap-6">
        <div className="flex-1">
          {Object.entries(grouped).map(([date, records]) => (
            <div key={date} className="mb-6 relative">
              <div className="sticky top-20 z-10 bg-surface-bg/95 dark:bg-surface-bg-dark/95 backdrop-blur-sm py-1.5 mb-3 flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10" />
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">{date}</h3>
                <span className="text-xs text-text-secondary">{records.length} 条记录</span>
              </div>
              <div className="absolute left-[3.5px] top-8 bottom-0 w-px bg-border dark:bg-grey-800" />
              <div className="space-y-3 pl-7">
                {records.map((record, index) => {
                  const Icon = typeIcons[record.type] || MoreHorizontal;
                  return (
                    <motion.div key={record.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                      className="bg-white dark:bg-grey-900 rounded-xl border border-border dark:border-grey-800 p-4 hover:shadow-card transition-shadow group relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: typeColors[record.type] || '#8A8A8E' }}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-text-primary dark:text-text-primary-dark text-sm">{record.summary}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
                              <span className="font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">{typeLabels[record.type] || '其它'}</span>
                              <span>·</span>
                              <span className="font-medium">{record.contact.name}</span>
                              <button onClick={(e) => { e.stopPropagation(); setRelationshipSourceId(record.contact.id); setRelationshipModalOpen(true); }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-primary/5 text-text-secondary hover:text-primary rounded transition-all ml-0.5" title="添加关系">
                                <Link2 size={11} />
                              </button>
                              <span>·</span>
                              <span>{record.contact.company}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed pl-[46px]">{record.details}</p>
                      {record.followUp && (
                        <div className={`mt-3 ml-[46px] flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border ${
                          record.followUp.done ? 'bg-accent-green/10 text-accent-green border-accent-green/20' : 'bg-accent-amber/10 text-accent-amber border-accent-amber/20'
                        }`}>
                          {record.followUp.done ? <Check size={13} /> : <ArrowRight size={13} />}
                          <span>跟进: {record.followUp.note}</span>
                          <span className="ml-auto opacity-75">{record.followUp.date}</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
          {allRecords.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-fill-quaternary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-text-secondary" size={22} />
              </div>
              <h3 className="text-base font-semibold text-text-primary dark:text-text-primary-dark">暂无沟通记录</h3>
              <p className="text-sm text-text-secondary mt-1">点击右上角添加第一条记录</p>
            </div>
          )}
        </div>

        {/* Right sidebar — Pending follow-ups */}
        <div className="w-72 shrink-0 hidden xl:block">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-grey-900 rounded-card border border-border dark:border-grey-800 p-4 shadow-card">
              <h3 className="font-semibold text-text-primary dark:text-text-primary-dark mb-3 flex items-center gap-2 text-sm">
                <div className="w-1 h-3.5 rounded-full bg-accent-amber" />
                待跟进事项
                <span className="ml-auto text-xs font-medium bg-accent-amber/10 text-accent-amber px-2 py-0.5 rounded-pill">{pendingFollowUps.length}</span>
              </h3>
              <div className="space-y-2.5">
                {pendingFollowUps.map(record => (
                  <div key={record.id} className="p-2.5 rounded-lg bg-accent-amber/5 border border-accent-amber/10 hover:bg-accent-amber/10 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="text-xs font-semibold text-text-primary dark:text-text-primary-dark line-clamp-1">{record.summary}</div>
                      <span className="text-[10px] font-medium text-accent-amber bg-white dark:bg-grey-800 px-1.5 py-0.5 rounded border border-accent-amber/15 shrink-0 ml-2">{record.followUp?.date}</span>
                    </div>
                    <div className="text-xs text-text-secondary mb-1.5 line-clamp-2">{record.followUp?.note}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[7px]" style={{ backgroundColor: getAvatarColor(record.contact.name) }}>
                        {record.contact.name[0]}
                      </div>
                      <span>{record.contact.name}</span>
                    </div>
                  </div>
                ))}
                {pendingFollowUps.length === 0 && (
                  <div className="text-center py-6 text-text-secondary text-xs">暂无待跟进事项</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <RelationshipModal isOpen={relationshipModalOpen} onClose={() => setRelationshipModalOpen(false)} sourceContactId={relationshipSourceId} />
    </div>
  );
}
