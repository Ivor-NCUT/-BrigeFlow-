/**
 * [INPUT]: 依赖 contactStore 获取人脉数据，依赖 RelationshipModal 处理关系连接
 * [OUTPUT]: 对外提供 Dashboard 页面组件，展示人脉总览、卡片/表格视图
 * [POS]: pages/Dashboard，系统的核心着陆页，提供数据概览与操作入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink, MessageSquare, Calendar, ArrowRight, Pencil, Trash2, Link2, Upload } from 'lucide-react';
import RelationshipModal from '../components/RelationshipModal';
import ImportModal from '../components/ImportModal';
import { useContactStore } from '../store/contactStore';
import type { Contact } from '../types/contact';
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={`bg-surface rounded-[32px] border shadow-card hover:shadow-card-hover hover:border-border-hover transition-all duration-300 overflow-hidden group ${selected ? 'border-primary ring-1 ring-primary' : 'border-border'}`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-primary text-lg leading-tight">{contact.name}</h3>
                <p className="text-sm text-text-secondary mt-1 font-medium">{contact.company}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onConnect(contact); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary-light text-text-secondary hover:text-primary transition-colors"
                  title="添加关系"
                >
                  <Link2 size={16} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(contact); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-grey-100 text-text-secondary transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-grey-100 text-text-secondary transition-colors"
                >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {contact.tags.map(tag => (
                <span
                  key={tag.id}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white shadow-sm"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.label}
                </span>
              ))}
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-5 mt-4 text-xs font-medium text-text-secondary">
              <span className="flex items-center gap-1.5">
                <MessageSquare size={14} />
                {contact.interactionCount} 次互动
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                最近 {contact.lastContactedAt}
              </span>
            </div>

            {/* Pending follow-up badge */}
            {pendingFollowUp?.followUp && (
              <div className="mt-4 flex items-center gap-2.5 text-xs font-medium bg-amber-50 text-amber-700 px-3.5 py-2 rounded-xl border border-amber-100/50">
                <ArrowRight size={14} />
                <span>待跟进: {pendingFollowUp.followUp.note}</span>
                <span className="text-amber-500 ml-auto">{pendingFollowUp.followUp.date}</span>
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
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-grey-50/50"
          >
            <div className="px-6 pb-6 border-t border-border pt-5">
              {/* Interaction stats */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-white rounded-2xl p-3 text-center border border-border shadow-sm">
                  <div className="text-xl font-bold text-primary">{contact.interactionCount}</div>
                  <div className="text-[11px] font-medium text-text-secondary mt-0.5">总互动</div>
                </div>
                <div className="bg-white rounded-2xl p-3 text-center border border-border shadow-sm">
                  <div className="text-xl font-bold text-emerald-600">{contact.communicationRecords.length}</div>
                  <div className="text-[11px] font-medium text-text-secondary mt-0.5">沟通记录</div>
                </div>
                <div className="bg-white rounded-2xl p-3 text-center border border-border shadow-sm">
                  <div className="text-xl font-bold text-amber-600">{contact.connections.length}</div>
                  <div className="text-[11px] font-medium text-text-secondary mt-0.5">关联人脉</div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-3 mb-5">
                {contact.bonjourLink && (
                  <a
                    href={contact.bonjourLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm font-medium text-primary hover:text-primary-hover transition-colors group bg-primary-light/50 p-3 rounded-xl border border-primary/10"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm p-1.5">
                      <img src={bonjourIcon} alt="Bonjour" className="w-full h-full" />
                    </div>
                    <span className="truncate flex-1">Bonjour! 数字名片</span>
                    <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>

              {/* Notes */}
              {contact.notes && (
                <div className="text-sm text-text-secondary bg-white border border-border rounded-2xl p-4 mb-5 shadow-sm italic">
                  "{contact.notes}"
                </div>
              )}

              {/* Recent records */}
              {contact.communicationRecords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">最近沟通</h4>
                  <div className="space-y-3">
                    {contact.communicationRecords.slice(0, 3).map(record => (
                      <div key={record.id} className="flex items-start gap-3 text-sm group">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                        <div className="flex-1">
                          <span className="text-text-primary font-medium block">{record.summary}</span>
                          <span className="text-xs text-text-secondary">{record.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interaction frequency chart */}
              <div className="mt-6">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">互动频率</h4>
                <div className="flex items-end gap-1.5 h-16">
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
                        className="flex-1 rounded-t-md transition-all hover:opacity-100"
                        style={{
                          height: `${Math.max(10, (count / maxCount) * 100)}%`,
                          backgroundColor: count > 0 ? '#4F46E5' : '#FAFAFA',
                          opacity: count > 0 ? 0.6 + (count / maxCount) * 0.4 : 1,
                        }}
                        title={`${monthStr}: ${count} 次`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-medium text-text-secondary mt-2">
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

export default function Dashboard() {
  const { getFilteredContacts, activeView, setActiveView, getInactiveContacts, setEditingContactId, setQuickAddOpen, deleteContacts, contacts: allContacts } = useContactStore();
  const contacts = getFilteredContacts();
  const inactive = getInactiveContacts();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [relationshipModalOpen, setRelationshipModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [relationshipSourceId, setRelationshipSourceId] = useState<string | null>(null);

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
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(contacts.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
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
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-[clamp(1.5rem,8vw,2.25rem)] sm:text-4xl font-semibold text-text-primary tracking-tight">人脉总览</h1>
          <p className="text-base text-text-secondary mt-2 font-medium">共 {contacts.length} 位联系人</p>
        </div>
        <div className="flex items-center gap-4">
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              <Trash2 size={18} />
              删除 ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-text-secondary border border-border rounded-xl hover:bg-grey-50 transition-colors font-medium shadow-sm"
          >
            <Upload size={18} />
            批量导入
          </button>
          <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1.5 shadow-sm">
            {(['table', 'cards'] as const).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === view ? 'bg-primary-light text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-grey-50'
                }`}
              >
                {view === 'cards' ? '卡片' : '表格'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Smart group hint */}
      {inactive.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-primary-light to-white border border-primary/10 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <img src={magicHatIcon} alt="Magic" className="w-5 h-5" />
              智能提醒
            </h3>
            <p className="text-sm text-text-secondary mt-1 font-medium">
              有 <strong>{inactive.length}</strong> 位联系人超过半年未联系：
              {inactive.slice(0, 3).map(c => c.name).join('、')}
              {inactive.length > 3 && ` 等`}
            </p>
          </div>
          <button className="text-sm font-semibold text-primary bg-white border border-primary/20 px-4 py-2 rounded-xl hover:bg-primary-light transition-colors shadow-sm">
            查看全部
          </button>
        </div>
      )}

      {/* Contact cards */}
      {activeView === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {activeView === 'table' && (
        <div className="bg-white rounded-[24px] border border-border shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-grey-50/50">
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={contacts.length > 0 && selectedIds.size === contacts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">姓名</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">行业</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">职位标签</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">专业技能</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">第一次认识渠道</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">所在城市</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">最近联系</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">互动次数</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => {
                const color = useContactStore.getState().getAvatarColor(contact.name);
                return (
                  <tr key={contact.id} className={`border-b border-grey-50 hover:bg-grey-50/50 transition-colors ${selectedIds.has(contact.id) ? 'bg-primary-light/10' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={(e) => handleSelect(contact.id, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm font-bold text-text-primary">{contact.name}</div>
                          <div className="text-xs font-medium text-text-secondary">{contact.company}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Industry */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.filter(t => t.category === 'industry').map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white shadow-sm" style={{ backgroundColor: tag.color }}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.filter(t => t.category === 'role').map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white shadow-sm" style={{ backgroundColor: tag.color }}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Skill */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.filter(t => t.category === 'skill').map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white shadow-sm" style={{ backgroundColor: tag.color }}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Relationship */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.filter(t => t.category === 'relationship').map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white shadow-sm" style={{ backgroundColor: tag.color }}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {contact.tags.filter(t => t.category === 'location').map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold text-white shadow-sm" style={{ backgroundColor: tag.color }}>
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-text-secondary">{contact.lastContactedAt}</td>
                    <td className="px-6 py-4 text-sm font-bold text-text-primary">{contact.interactionCount}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-grey-100 text-text-secondary transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {contacts.length === 0 && (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-[24px] bg-grey-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <img src={celebrateIcon} alt="Empty" className="w-10 h-10 opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">暂无匹配的联系人</h3>
          <p className="text-base text-text-secondary mt-2">试试调整筛选条件或搜索其他关键词</p>
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