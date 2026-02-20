/**
 * [INPUT]: 依赖 useContactStore 管理联系人状态，依赖 lucide-react 提供图标，依赖 SmartInput/SmartTagInput 组件
 * [OUTPUT]: 对外提供 QuickAddModal 组件，用于快速录入和编辑联系人
 * [POS]: components/QuickAddModal，作为全局模态框被 MainLayout 或 App 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Building2, StickyNote, Link2, Plus, Check } from 'lucide-react';
import { useContactStore } from '../store/contactStore';
import type { Tag, Contact } from '../types/contact';
import { SmartInput, SmartTagInput } from './SmartInput';

const TAG_COLORS: Record<string, string> = {
  industry: '#007AFF',
  skill: '#5AC8FA',
  relationship: '#34C759',
  location: '#FF9500',
  custom: '#AF52DE',
  role: '#FF3B30',
};

interface QuickAddModalProps {}

export default function QuickAddModal({}: QuickAddModalProps) {
  const { setQuickAddOpen, allTags, addContact, updateContact, editingContactId, contacts, setEditingContactId, quickAddInitialName, setQuickAddInitialName, filter } = useContactStore();
  const contact = editingContactId ? contacts.find(c => c.id === editingContactId) : null;

  const companySuggestions = useMemo(() => {
    const companies = new Set<string>();
    contacts.forEach(c => {
      if (c.company && c.company.trim()) {
        companies.add(c.company.trim());
      }
    });
    return Array.from(companies).sort();
  }, [contacts]);

  const industrySuggestions = useMemo(() => {
    return allTags
      .filter(t => t.category === 'industry')
      .map(t => t.label)
      .sort();
  }, [allTags]);

  const skillSuggestions = useMemo(() => {
    return allTags
      .filter(t => t.category === 'skill')
      .map(t => t.label)
      .sort();
  }, [allTags]);

  const roleSuggestions = useMemo(() => {
    return allTags
      .filter(t => t.category === 'role')
      .map(t => t.label)
      .sort();
  }, [allTags]);

  const relationshipSuggestions = useMemo(() => {
    return allTags
      .filter(t => t.category === 'relationship')
      .map(t => t.label)
      .sort();
  }, [allTags]);

  const [form, setForm] = useState({
    name: '', company: '', bonjourLink: '', notes: '',
    tags: [] as Tag[],
  });
  const [tagInputs, setTagInputs] = useState({
    industry: '', skill: '', role: '', relationship: '',
  });

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name, company: contact.company,
        bonjourLink: contact.bonjourLink || '', notes: contact.notes || '',
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
      if (filter.relationship) {
        const tag = allTags.find(t => t.category === 'relationship' && t.label === filter.relationship);
        if (tag) activeTags.push(tag);
      }
      setForm({
        name: quickAddInitialName || '', company: '', bonjourLink: '', notes: '',
        tags: activeTags,
      });
    }
  }, [contact, quickAddInitialName, filter, allTags]);

  const handleClose = () => {
    setQuickAddOpen(false);
    setEditingContactId(null);
    setQuickAddInitialName('');
  };

  const addTag = (label: string, category: 'industry' | 'skill' | 'role' | 'relationship') => {
    const trimmed = label.trim();
    if (!trimmed || form.tags.some(t => t.label === trimmed && t.category === category)) return;
    const existing = allTags.find(t => t.label === trimmed && t.category === category);
    const newTag: Tag = existing || {
      id: `${category}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: trimmed, category, color: TAG_COLORS[category],
    };
    setForm(f => ({ ...f, tags: [...f.tags, newTag] }));
  };

  const removeTag = (tagId: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t.id !== tagId) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, category: 'industry' | 'skill' | 'role' | 'relationship') => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(tagInputs[category], category); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const contactData = {
      name: form.name, company: form.company, bonjourLink: form.bonjourLink,
      notes: form.notes, tags: form.tags, avatar: '',
    };
    try {
      if (contact) {
        updateContact(contact.id, contactData);
      } else {
        addContact({
          ...contactData,
          createdAt: new Date().toISOString().split('T')[0],
          lastContactedAt: new Date().toISOString().split('T')[0],
        });
      }
      handleClose();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  /* ── Input field helper ── */
  const inputCls = "w-full pl-9 pr-3 py-2 bg-grey-50 dark:bg-grey-800 border border-border dark:border-grey-700 rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-tertiary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-grey-900 rounded-card shadow-card-hover w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-border dark:border-grey-800"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border dark:border-grey-800 flex items-center justify-between bg-grey-50/50 dark:bg-grey-800/50">
          <h2 className="text-base font-semibold text-text-primary dark:text-text-primary-dark">{contact ? '编辑联系人' : '快速添加联系人'}</h2>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-fill-quaternary text-text-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 overflow-y-auto">
          <form id="quick-add-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">姓名</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
                <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="输入姓名" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">公司/组织</label>
              <SmartInput
                value={form.company}
                onChange={company => setForm(f => ({ ...f, company }))}
                suggestions={companySuggestions}
                placeholder="所属公司或组织"
                icon={<Building2 size={15} />}
                inputClassName="bg-grey-50 dark:bg-grey-800 border border-border dark:border-grey-700 rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-text-tertiary"
              />
            </div>

            {/* Tag sections */}
            <div className="space-y-3">
              {([
                ['industry', '行业标签', industrySuggestions, '#007AFF'],
                ['skill', '专业技能标签', skillSuggestions, '#5AC8FA'],
                ['role', '岗位标签', roleSuggestions, '#FF3B30'],
                ['relationship', '第一次认识渠道', relationshipSuggestions, '#34C759'],
              ] as const).map(([cat, label, suggestions, color]) => (
                <div key={cat}>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{label}</label>
                  <SmartTagInput
                    value={tagInputs[cat as 'industry' | 'skill' | 'role' | 'relationship']}
                    onChange={val => setTagInputs(prev => ({ ...prev, [cat]: val }))}
                    selectedTags={form.tags.filter(t => t.category === cat)}
                    onRemoveTag={removeTag}
                    suggestions={suggestions}
                    placeholder={`输入${label.replace('标签', '').replace('第一次认识', '')}...`}
                    tagColor={color}
                    onAddTag={label => addTag(label, cat as 'industry' | 'skill' | 'role' | 'relationship')}
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Bonjour 名片链接</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={15} />
                <input type="url" value={form.bonjourLink} onChange={e => setForm(f => ({ ...f, bonjourLink: e.target.value }))} className={inputCls} placeholder="输入网页链接或小程序链接..." />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">备注</label>
              <div className="relative">
                <StickyNote className="absolute left-3 top-3 text-text-tertiary" size={15} />
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                  className="w-full pl-9 pr-3 py-2 bg-grey-50 dark:bg-grey-800 border border-border dark:border-grey-700 rounded-lg text-sm text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-text-tertiary"
                  placeholder="关于这位联系人的其他信息..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-border dark:border-grey-800 bg-grey-50/50 dark:bg-grey-800/50 flex justify-end gap-2.5">
          <button onClick={handleClose} className="px-4 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-fill-quaternary transition-colors">
            取消
          </button>
          <button type="submit" form="quick-add-form" className="px-5 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-all active:scale-95">
            {contact ? '保存修改' : '确认添加'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
