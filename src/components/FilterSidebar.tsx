/**
 * [INPUT]: 依赖 useContactStore 获取 contacts 数据
 * [OUTPUT]: 对外提供 FilterSidebar 组件，用于筛选联系人
 * [POS]: components/FilterSidebar，侧边栏筛选器组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useContactStore } from '../store/contactStore';

const filterCategories = [
  { key: 'industry', label: '行业', icon: '🏢' },
  { key: 'role', label: '职位标签', icon: '💼' },
  { key: 'skill', label: '专业技能', icon: '🎯' },
  { key: 'relationship', label: '第一次认识渠道', icon: '🤝' },
  { key: 'location', label: '所在城市', icon: '📍' },
];

export default function FilterSidebar() {
  const { contacts, filter, setFilter } = useContactStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    industry: true, role: true, skill: true, relationship: true, location: true,
  });

  const availableTags = useMemo(() => {
    const uniqueTags = new Map();
    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        if (!uniqueTags.has(tag.id)) uniqueTags.set(tag.id, tag);
      });
    });
    return Array.from(uniqueTags.values());
  }, [contacts]);

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      {filterCategories.map(cat => {
        const tags = availableTags.filter(t => t.category === cat.key);
        const currentValue = filter[cat.key as keyof typeof filter];
        const isExpanded = expanded[cat.key];

        return (
          <div key={cat.key} className="border-b border-border/50 dark:border-grey-800 pb-3 last:border-0">
            <button
              onClick={() => toggle(cat.key)}
              className="w-full flex items-center justify-between mb-2 px-2 py-1 hover:bg-fill-quaternary rounded-md transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">{cat.icon}</span>
                <span className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider group-hover:text-primary transition-colors">{cat.label}</span>
              </div>
              <ChevronDown
                size={14}
                className={`text-text-secondary transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {/* "全部" pill */}
                    <button
                      onClick={() => setFilter({ [cat.key]: '' })}
                      className={`px-3 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                        !currentValue
                          ? 'bg-primary text-white'
                          : 'bg-fill-quaternary text-text-secondary hover:bg-fill-secondary hover:text-text-primary'
                      }`}
                    >
                      全部
                    </button>
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => setFilter({ [cat.key]: currentValue === tag.label ? '' : tag.label })}
                        className={`px-3 py-1 rounded-pill text-xs font-medium transition-all duration-200 ${
                          currentValue === tag.label
                            ? 'bg-primary text-white'
                            : 'bg-fill-quaternary text-text-secondary hover:bg-fill-secondary hover:text-text-primary'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
