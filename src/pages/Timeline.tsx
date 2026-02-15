/**
 * [INPUT]: 依赖 contactStore 获取沟通记录，依赖 RelationshipModal
 * [OUTPUT]: 对外提供 Timeline 页面组件，展示沟通历史与跟进事项
 * [POS]: pages/Timeline，核心功能页面之一，管理时间维度的交互记录
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Phone, Mail, Users, Video, ArrowRight, Plus, Check, ChevronDown, Handshake, ShoppingBag, Ticket, Briefcase, MoreHorizontal, X, Link2 } from 'lucide-react';
import RelationshipModal from '../components/RelationshipModal';
import { useContactStore } from '../store/contactStore';
import type { CommunicationRecord } from '../types/contact';

const typeIcons: Record<string, any> = {
  connection: Handshake,
  purchase: ShoppingBag,
  invitation: Ticket,
  service: Briefcase,
  other: MoreHorizontal,
};

const typeLabels: Record<string, string> = {
  connection: '合作建联',
  purchase: '购买服务',
  invitation: '嘉宾邀请',
  service: '提供服务',
  other: '其它',
};

const typeColors: Record<string, string> = {
  connection: '#4F46E5',
  purchase: '#059669',
  invitation: '#D97706',
  service: '#7C3AED',
  other: '#6B7280',
};

export default function Timeline() {
  const { contacts, getAvatarColor, addCommunicationRecord, setQuickAddOpen, setQuickAddInitialName } = useContactStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [comboboxInput, setComboboxInput] = useState('');
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ type: 'connection' as CommunicationRecord['type'], summary: '', details: '', followUpDate: '', followUpNote: '' });
  const [relationshipModalOpen, setRelationshipModalOpen] = useState(false);
  const [relationshipSourceId, setRelationshipSourceId] = useState<string | null>(null);

  // Collect all records sorted by date
  const allRecords = contacts.flatMap(c =>
    c.communicationRecords.map(r => ({ ...r, contact: c }))
  ).sort((a, b) => b.date.localeCompare(a.date));

  // Group by date
  const grouped = allRecords.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {} as Record<string, typeof allRecords>);

  const handleAddRecord = () => {
    if (selectedContactIds.length === 0 || !newRecord.summary) return;

    selectedContactIds.forEach(id => {
      addCommunicationRecord(id, {
        contactId: id,
        date: new Date().toISOString().split('T')[0],
        type: newRecord.type,
        summary: newRecord.summary,
        details: newRecord.details,
        ...(newRecord.followUpDate ? {
          followUp: { date: newRecord.followUpDate, note: newRecord.followUpNote, done: false }
        } : {}),
      });
    });

    setShowAddForm(false);
    setNewRecord({ type: 'connection', summary: '', details: '', followUpDate: '', followUpNote: '' });
    setSelectedContactIds([]);
    setComboboxInput('');
  };

  // Pending follow-ups
  const pendingFollowUps = contacts.flatMap(c =>
    c.communicationRecords
      .filter(r => r.followUp && !r.followUp.done)
      .map(r => ({ ...r, contact: c }))
  ).sort((a, b) => (a.followUp?.date || '').localeCompare(b.followUp?.date || ''));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">沟通时间轴</h1>
          <p className="text-sm text-gray-500 mt-1">记录每一次有价值的交流</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
        >
          <Plus size={16} />
          添加记录
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-8"
        >
          <h3 className="font-semibold text-gray-900 mb-4">新增沟通记录</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">联系人</label>
              <div className="relative">
                {selectedContactIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedContactIds.map(id => {
                      const contact = contacts.find(c => c.id === id);
                      if (!contact) return null;
                      return (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary">
                          {contact.name}
                          <button onClick={() => setSelectedContactIds(ids => ids.filter(i => i !== id))} className="hover:text-primary-hover">
                            <X size={12} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <input
                  type="text"
                  value={comboboxInput}
                  onChange={e => {
                    setComboboxInput(e.target.value);
                    setIsComboboxOpen(true);
                  }}
                  onFocus={() => setIsComboboxOpen(true)}
                  onBlur={() => setTimeout(() => setIsComboboxOpen(false), 200)}
                  placeholder={selectedContactIds.length > 0 ? "继续添加..." : "搜索或添加联系人..."}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 bg-white"
                />
                {isComboboxOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {contacts
                      .filter(c => !selectedContactIds.includes(c.id))
                      .filter(c => c.name.toLowerCase().includes(comboboxInput.toLowerCase()) || c.company.toLowerCase().includes(comboboxInput.toLowerCase()))
                      .map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setSelectedContactIds(prev => [...prev, c.id]);
                            setComboboxInput('');
                            setIsComboboxOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span className="font-medium text-gray-900">{c.name}</span>
                          <span className="text-xs text-gray-400">{c.company}</span>
                        </button>
                      ))}
                    {comboboxInput && !contacts.some(c => c.name.toLowerCase() === comboboxInput.toLowerCase()) && (
                      <button
                        onClick={() => {
                          setQuickAddInitialName(comboboxInput);
                          setQuickAddOpen(true);
                          setIsComboboxOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-primary-light/10 flex items-center gap-2 font-medium border-t border-gray-100"
                      >
                        <Plus size={14} />
                        添加 "{comboboxInput}"
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">沟通类型</label>
              <div className="flex gap-1">
                {Object.entries(typeLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setNewRecord(r => ({ ...r, type: key as any }))}
                    className={`flex-1 h-9 rounded-lg text-xs font-medium transition-all ${
                      newRecord.type === key ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={newRecord.type === key ? { backgroundColor: typeColors[key] } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 mb-1 block">摘要</label>
            <input
              type="text"
              value={newRecord.summary}
              onChange={e => setNewRecord(r => ({ ...r, summary: e.target.value }))}
              placeholder="简要描述此次沟通"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 mb-1 block">详情</label>
            <textarea
              value={newRecord.details}
              onChange={e => setNewRecord(r => ({ ...r, details: e.target.value }))}
              placeholder="记录详细内容..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">跟进日期（可选）</label>
              <input
                type="date"
                value={newRecord.followUpDate}
                onChange={e => setNewRecord(r => ({ ...r, followUpDate: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">跟进备注</label>
              <input
                type="text"
                value={newRecord.followUpNote}
                onChange={e => setNewRecord(r => ({ ...r, followUpNote: e.target.value }))}
                placeholder="需要跟进的事项..."
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleAddRecord}
              disabled={selectedContactIds.length === 0 || !newRecord.summary}
              className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认添加
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex gap-8">
        {/* Main timeline */}
        <div className="flex-1">
          {Object.entries(grouped).map(([date, records], groupIndex) => (
            <div key={date} className="mb-8 relative">
              {/* Date header */}
              <div className="sticky top-20 z-10 bg-surface-bg/95 backdrop-blur-sm py-2 mb-4 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                <h3 className="text-sm font-bold text-gray-900">{date}</h3>
                <span className="text-xs font-medium text-gray-400">{records.length} 条记录</span>
              </div>

              {/* Timeline line */}
              <div className="absolute left-[5px] top-10 bottom-0 w-px bg-gray-200" />

              <div className="space-y-4 pl-8">
                {records.map((record, index) => {
                  const Icon = typeIcons[record.type] || MoreHorizontal;
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group relative"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                            style={{ backgroundColor: typeColors[record.type] || '#6B7280' }}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{record.summary}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              <span className="font-medium text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                                {typeLabels[record.type] || '其它'}
                              </span>
                              <span>·</span>
                              <span className="font-medium">{record.contact.name}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRelationshipSourceId(record.contact.id);
                                  setRelationshipModalOpen(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-primary-light text-gray-400 hover:text-primary rounded transition-all ml-1"
                                title="添加关系"
                              >
                                <Link2 size={12} />
                              </button>
                              <span>·</span>
                              <span>{record.contact.company}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed pl-[52px]">
                        {record.details}
                      </p>

                      {record.followUp && (
                        <div className={`mt-4 ml-[52px] flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border ${
                          record.followUp.done
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {record.followUp.done ? <Check size={14} /> : <ArrowRight size={14} />}
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
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">暂无沟通记录</h3>
              <p className="text-gray-500 mt-2">点击右上角添加第一条记录</p>
            </div>
          )}
        </div>

        {/* Right sidebar - Pending Follow-ups */}
        <div className="w-80 shrink-0 hidden xl:block">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-4 rounded-full bg-amber-500" />
                待跟进事项
                <span className="ml-auto text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  {pendingFollowUps.length}
                </span>
              </h3>
              
              <div className="space-y-3">
                {pendingFollowUps.map(record => (
                  <div key={record.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/50 hover:bg-amber-50 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-xs font-bold text-gray-900 line-clamp-1">{record.summary}</div>
                      <span className="text-[10px] font-medium text-amber-600 bg-white px-1.5 py-0.5 rounded border border-amber-100">
                        {record.followUp?.date}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {record.followUp?.note}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px]"
                        style={{ backgroundColor: useContactStore.getState().getAvatarColor(record.contact.name) }}
                      >
                        {record.contact.name[0]}
                      </div>
                      <span>{record.contact.name}</span>
                    </div>
                  </div>
                ))}

                {pendingFollowUps.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    暂无待跟进事项
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <RelationshipModal
        isOpen={relationshipModalOpen}
        onClose={() => setRelationshipModalOpen(false)}
        sourceContactId={relationshipSourceId}
      />
    </div>
  );
}