/**
 * [INPUT]: 依赖 useContactStore 管理联系人状态，依赖 lucide-react 提供图标
 * [OUTPUT]: 对外提供 QuickAddModal 组件，用于快速录入和编辑联系人
 * [POS]: components/QuickAddModal，作为全局模态框被 MainLayout 或 App 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Building2, StickyNote, Link2, Plus } from 'lucide-react';
import { useContactStore } from '../store/contactStore';
import type { Tag, Contact } from '../types/contact';

const TAG_COLORS: Record<string, string> = {
  industry: '#1e40af',
  skill: '#1d4ed8',
  relationship: '#2563eb',
  location: '#3b82f6',
  custom: '#4f46e5',
  role: '#8b5cf6',
};

interface QuickAddModalProps {}

export default function QuickAddModal({}: QuickAddModalProps) {
  const { setQuickAddOpen, allTags, addContact, updateContact, editingContactId, contacts, setEditingContactId, quickAddInitialName, setQuickAddInitialName, filter } = useContactStore();
  const contact = editingContactId ? contacts.find(c => c.id === editingContactId) : null;

  const [form, setForm] = useState({
    name: '', company: '', bonjourLink: '', notes: '',
    tags: [] as Tag[],
  });
  const [tagInputs, setTagInputs] = useState({
    industry: '',
    skill: '',
    role: '',
  });

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        company: contact.company,
        bonjourLink: contact.bonjourLink || '',
        notes: contact.notes || '',
        tags: contact.tags,
      });
    } else {
      const activeTags: Tag[] = [];
      if (filter.industry) {
        const tag = allTags.find(t => t.category === 'industry' && t.label === filter.industry);
        if (tag) activeTags.push(tag);
      }
      if (filter.skill) {
        const tag = allTags.find(t => t.category === 'skill' && t.label === filter.skill);
        if (tag) activeTags.push(tag);
      }
      if (filter.role) {
        const tag = allTags.find(t => t.category === 'role' && t.label === filter.role);
        if (tag) activeTags.push(tag);
      }

      setForm({
        name: quickAddInitialName || '',
        company: '', bonjourLink: '', notes: '',
        tags: activeTags,
      });
    }
  }, [contact, quickAddInitialName, filter, allTags]);

  const handleClose = () => {
    setQuickAddOpen(false);
    setEditingContactId(null);
    setQuickAddInitialName('');
  };

  const addTag = (label: string, category: 'industry' | 'skill' | 'role') => {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (form.tags.some(t => t.label === trimmed && t.category === category)) return;
    
    // Check if tag exists in global tags with same category
    const existing = allTags.find(t => t.label === trimmed && t.category === category);
    
    const newTag: Tag = existing || {
      id: `${category}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: trimmed,
      category: category,
      color: TAG_COLORS[category],
    };
    
    setForm(f => ({ ...f, tags: [...f.tags, newTag] }));
    setTagInputs(prev => ({ ...prev, [category]: '' }));
  };

  const removeTag = (tagId: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t.id !== tagId) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, category: 'industry' | 'skill' | 'role') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInputs[category], category);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const contactData = {
      name: form.name,
      company: form.company,
      bonjourLink: form.bonjourLink,
      notes: form.notes,
      tags: form.tags,
      avatar: '',
      createdAt: new Date().toISOString().split('T')[0],
      lastContactedAt: new Date().toISOString().split('T')[0],
    };

    if (contact) {
      updateContact(contact.id, contactData);
    } else {
      addContact(contactData);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">{contact ? '编辑联系人' : '快速添加联系人'}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="quick-add-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">姓名</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="输入姓名"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">公司/组织</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="所属公司或组织"
                />
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-4">
              {/* Industry Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">行业标签</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 min-h-[42px] flex flex-wrap gap-2">
                  {form.tags.filter(t => t.category === 'industry').map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.label}
                      <button type="button" onClick={() => removeTag(tag.id)} className="hover:opacity-80">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInputs.industry}
                    onChange={e => setTagInputs(prev => ({ ...prev, industry: e.target.value }))}
                    onKeyDown={e => handleTagKeyDown(e, 'industry')}
                    className="bg-transparent text-sm min-w-[60px] flex-1 focus:outline-none"
                    placeholder="输入行业..."
                  />
                </div>
              </div>

              {/* Skill Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">专业技能标签</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 min-h-[42px] flex flex-wrap gap-2">
                  {form.tags.filter(t => t.category === 'skill').map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.label}
                      <button type="button" onClick={() => removeTag(tag.id)} className="hover:opacity-80">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInputs.skill}
                    onChange={e => setTagInputs(prev => ({ ...prev, skill: e.target.value }))}
                    onKeyDown={e => handleTagKeyDown(e, 'skill')}
                    className="bg-transparent text-sm min-w-[60px] flex-1 focus:outline-none"
                    placeholder="输入技能..."
                  />
                </div>
              </div>

              {/* Role Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">岗位标签</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 min-h-[42px] flex flex-wrap gap-2">
                  {form.tags.filter(t => t.category === 'role').map(tag => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.label}
                      <button type="button" onClick={() => removeTag(tag.id)} className="hover:opacity-80">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInputs.role}
                    onChange={e => setTagInputs(prev => ({ ...prev, role: e.target.value }))}
                    onKeyDown={e => handleTagKeyDown(e, 'role')}
                    className="bg-transparent text-sm min-w-[60px] flex-1 focus:outline-none"
                    placeholder="输入岗位..."
                  />
                </div>
              </div>
            </div>

            {/* Bonjour Link */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Bonjour 名片链接/小程序链接</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="url"
                  value={form.bonjourLink}
                  onChange={e => setForm(f => ({ ...f, bonjourLink: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="输入网页链接或小程序链接..."
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">备注</label>
              <div className="relative">
                <StickyNote className="absolute left-3 top-3 text-gray-400" size={16} />
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder="关于这位联系人的其他信息..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            form="quick-add-form"
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            {contact ? '保存修改' : '确认添加'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}