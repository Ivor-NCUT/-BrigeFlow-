/**
 * [INPUT]: 依赖 useContactStore 获取 contacts, sharedPages, filter 等状态
 * [OUTPUT]: 对外提供 SharePage 页面，支持创建、管理、筛选和生成特定人脉分享链接
 * [POS]: pages/SharePage，分享功能的核心入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Eye, EyeOff, Globe, Lock, Copy, Check, Link2, Settings,
  Plus, ArrowLeft, Trash2, Search, Filter, X
} from 'lucide-react';
import { useContactStore } from '../store/contactStore';
import FilterSidebar from '../components/FilterSidebar';
import { SharedPage, ShareConfig } from '../types/contact';
import { format } from 'date-fns';

const defaultConfig: ShareConfig = {
  isPublic: true,
  showIndustry: true,
  showSkills: true,
  showNotes: false,
  showConnections: true,
  customDomain: '',
  selectedContacts: []
};

export default function SharePage() {
  const {
    contacts,
    sharedPages,
    fetchSharedPages,
    createSharedPage,
    deleteSharedPage,
    getFilteredContacts,
    getAvatarColor,
    setFilter
  } = useContactStore();

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [config, setConfig] = useState<ShareConfig>(defaultConfig);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Load pages on mount
  useEffect(() => {
    fetchSharedPages();
  }, []);

  // Reset filter when entering editor
  useEffect(() => {
    if (mode !== 'list') {
      setFilter({ search: '', industry: '', skill: '', relationship: '', location: '', role: '' });
    }
  }, [mode]);

  // Handle Create
  const handleCreate = () => {
    setMode('create');
    setTitle('');
    setSlug('');
    setConfig(defaultConfig);
    setSelectedIds(new Set());
  };

  // Handle Edit (TODO: Update backend to support update, for now just create new/delete old or keep simple)
  // For MVP, we might only support Create and Delete, or "View Details"
  // Let's support creating a NEW page based on an old one for now if update API isn't ready.
  // Actually, we can just delete and recreate if we want to "Edit", or implementing UPDATE is better.
  // Backend `PUT /api/shared-pages/:id` is NOT implemented yet.
  // So I will stick to Create/Delete for now, or just Create.

  // Handle Save
  const handleSave = async () => {
    if (!title || !slug) return;

    const newPage = {
      title,
      slug,
      config: {
        ...config,
        selectedContacts: Array.from(selectedIds)
      }
    };

    await createSharedPage(newPage);
    setMode('list');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this shared page?')) {
      await deleteSharedPage(id);
    }
  };

  const handleCopyLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/s/${slug}`; // In real app: custom domain
    navigator.clipboard.writeText(url);
    setCopiedLink(slug);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Filtered contacts for the middle column
  const filteredContacts = getFilteredContacts();

  // Toggle selection
  const toggleContact = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAllFiltered = () => {
    const newSet = new Set(selectedIds);
    filteredContacts.forEach(c => newSet.add(c.id));
    setSelectedIds(newSet);
  };

  const deselectAllFiltered = () => {
    const newSet = new Set(selectedIds);
    filteredContacts.forEach(c => newSet.delete(c.id));
    setSelectedIds(newSet);
  };

  // Stats for preview
  const selectedContactsList = contacts.filter(c => selectedIds.has(c.id));

  const industryMap: Record<string, number> = {};
  selectedContactsList.forEach(c => c.tags.filter(t => t.category === 'industry').forEach(t => {
    industryMap[t.label] = (industryMap[t.label] || 0) + 1;
  }));
  const industries = Object.entries(industryMap).sort((a, b) => b[1] - a[1]);

  const skillMap: Record<string, number> = {};
  selectedContactsList.forEach(c => c.tags.filter(t => t.category === 'skill').forEach(t => {
    skillMap[t.label] = (skillMap[t.label] || 0) + 1;
  }));
  const skills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]);


  if (mode === 'list') {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">分享页面管理</h1>
            <p className="text-sm text-text-secondary mt-1">创建和管理特定的人脉分享列表</p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary-hover transition-colors shadow-subtle"
          >
            <Plus size={18} />
            创建新分享页
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedPages.map(page => (
            <div key={page.id} className="bg-white dark:bg-grey-900 rounded-xl border border-border dark:border-grey-800 p-6 hover:shadow-card-hover transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Globe size={20} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleCopyLink(page.slug, e)}
                    className="p-2 hover:bg-fill-quaternary rounded-lg text-text-secondary transition-colors"
                    title="复制链接"
                  >
                    {copiedLink === page.slug ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={(e) => handleDelete(page.id, e)}
                    className="p-2 hover:bg-red-50 text-grey-400 hover:text-accent-red rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-text-primary mb-1">{page.title}</h3>
              <div className="flex items-center gap-2 text-xs text-text-secondary mb-4">
                <Link2 size={12} />
                <span className="truncate">/s/{page.slug}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border dark:border-grey-800">
                <div className="text-xs text-text-secondary">
                  {page.config.selectedContacts?.length || 0} 位联系人
                </div>
                <div className="text-xs text-text-tertiary">
                  {format(new Date(page.createdAt), 'yyyy-MM-dd')}
                </div>
              </div>
            </div>
          ))}

          {sharedPages.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary bg-grey-50 dark:bg-grey-900 rounded-xl border border-dashed border-grey-300 dark:border-grey-700">
              <p>暂无分享页面，点击右上角创建</p>
            </div>
          )}
        </div>
      </div>
    );
  }


  // Editor View
  return (
    <div className="flex flex-col h-screen bg-grey-50 dark:bg-grey-950">
      {/* Top Bar */}
      <header className="bg-white dark:bg-grey-900 border-b border-border dark:border-grey-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setMode('list')}
            className="p-2 hover:bg-fill-quaternary rounded-lg text-text-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-border dark:bg-grey-800" />
          <div className="flex flex-col gap-1">
            <input
              type="text"
              placeholder="页面标题 (如: 孵化器朋友)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="font-semibold text-text-primary placeholder-text-tertiary focus:outline-none bg-transparent"
            />
            <div className="flex items-center gap-1 text-xs text-text-tertiary">
              <span>bridgeflow.io/s/</span>
              <input
                type="text"
                placeholder="slug-url"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="focus:outline-none bg-transparent border-b border-dashed border-grey-300 dark:border-grey-700 focus:border-primary w-32"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-sm text-text-secondary mr-4">
                已选 {selectedIds.size} 人
            </div>
            <button
                onClick={handleSave}
                disabled={!title || !slug || selectedIds.size === 0}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                保存并生成链接
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Filters */}
        <div className="w-64 bg-white dark:bg-grey-900 border-r border-border dark:border-grey-800 overflow-y-auto p-4 shrink-0">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
                <Filter size={16} />
                筛选联系人
            </div>
            <FilterSidebar />
        </div>

        {/* Middle: Selection */}
        <div className="w-80 bg-white dark:bg-grey-900 border-r border-border dark:border-grey-800 overflow-y-auto flex flex-col shrink-0">
            <div className="p-4 border-b border-border dark:border-grey-800 sticky top-0 bg-white dark:bg-grey-900 z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-secondary">筛选结果 ({filteredContacts.length})</span>
                    <div className="flex gap-2">
                        <button onClick={selectAllFiltered} className="text-xs text-primary hover:underline">全选</button>
                        <button onClick={deselectAllFiltered} className="text-xs text-text-secondary hover:underline">取消</button>
                    </div>
                </div>
            </div>
            <div className="divide-y divide-grey-100 dark:divide-grey-800">
                {filteredContacts.map(c => (
                    <div
                        key={c.id}
                        onClick={() => toggleContact(c.id)}
                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-fill-quaternary transition-colors ${selectedIds.has(c.id) ? 'bg-primary/5' : ''}`}
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.has(c.id) ? 'bg-primary border-primary' : 'border-grey-300 dark:border-grey-600'}`}>
                            {selectedIds.has(c.id) && <Check size={10} className="text-white" />}
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-medium shrink-0" style={{ backgroundColor: getAvatarColor(c.name) }}>
                            {c.name[0]}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-text-primary truncate">{c.name}</div>
                            <div className="text-xs text-text-secondary truncate">{c.company || c.tags.find(t=>t.category==='role')?.label}</div>
                        </div>
                    </div>
                ))}
                {filteredContacts.length === 0 && (
                    <div className="p-8 text-center text-sm text-text-tertiary">
                        没有符合筛选条件的联系人
                    </div>
                )}
            </div>
        </div>

        {/* Right: Preview & Config */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Config Panel */}
                <div className="bg-white dark:bg-grey-900 rounded-xl border border-border dark:border-grey-800 p-4 shadow-subtle">
                    <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                        <Settings size={14} />
                        页面显示设置
                    </h3>
                    <div className="flex flex-wrap gap-4">
                         {[
                            { key: 'showIndustry' as const, label: '行业分布' },
                            { key: 'showSkills' as const, label: '技能标签' },
                            { key: 'showConnections' as const, label: '关系网络' },
                            { key: 'showNotes' as const, label: '备注信息' },
                          ].map(item => (
                            <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                                <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${config[item.key] ? 'bg-primary' : 'bg-grey-200 dark:bg-grey-700'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={!!config[item.key]}
                                        onChange={() => setConfig(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                    />
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config[item.key] ? 'translate-x-4' : ''}`} />
                                </div>
                                <span className="text-sm text-text-secondary">{item.label}</span>
                            </label>
                          ))}
                    </div>
                </div>

                {/* Live Preview */}
                <div className="bg-white dark:bg-grey-900 rounded-card border border-border dark:border-grey-800 overflow-hidden shadow-card-hover">
                    <div className="bg-gradient-to-r from-primary to-primary-600 px-8 py-10 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe size={14} className="opacity-70" />
                            <span className="text-xs opacity-70">bridgeflow.io/s/{slug || '...'}</span>
                        </div>
                        <h2 className="text-2xl font-semibold">{title || '页面标题'}</h2>
                        <p className="text-sm opacity-80 mt-1">共 {selectedIds.size} 位行业伙伴</p>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Industry */}
                        {config.showIndustry && industries.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-text-primary mb-4">行业分布</h3>
                                <div className="flex flex-wrap gap-2">
                                    {industries.map(([label, count]) => (
                                        <div key={label} className="px-4 py-2 bg-primary/5 rounded-xl text-center">
                                            <div className="text-lg font-semibold text-primary">{count}</div>
                                            <div className="text-xs text-text-secondary">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {config.showSkills && skills.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-text-primary mb-4">专业技能</h3>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map(([label, count]) => (
                                        <span key={label} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-pill text-sm font-medium">
                                            {label} ({count})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Contacts Grid */}
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary mb-4">人脉伙伴</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {selectedContactsList.map(c => (
                                    <div key={c.id} className="flex items-center gap-3 p-3 bg-fill-quaternary rounded-xl">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: getAvatarColor(c.name) }}>
                                            {c.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-text-primary">{c.name}</div>
                                            <div className="text-xs text-text-secondary">{c.company}</div>
                                            {config.showNotes && c.notes && (
                                                <div className="text-xs text-text-tertiary mt-0.5 truncate max-w-[180px]">"{c.notes}"</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}