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
  { key: 'industry' as const, label: '行业', icon: '🏢' },
  { key: 'role' as const, label: '职位标签', icon: '💼' },
  { key: 'skill' as const, label: '专业技能', icon: '🎯' },
  { key: 'relationship' as const, label: '第一次认识渠道', icon: '🤝' },
  { key: 'location' as const, label: '所在城市', icon: '📍' },
];

export default function FilterSidebar() {
  const { contacts, filter, setFilter } = useContactStore();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    industry: true,
    role: true,
    skill: true,
    relationship: true,
    location: true,
  });

  const availableTags = useMemo(() => {
    const uniqueTags = new Map();
    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        // Use tag ID as key to ensure uniqueness
        if (!uniqueTags.has(tag.id)) {
          uniqueTags.set(tag.id, tag);
        }
      });
    });
    return Array.from(uniqueTags.values());
  }, [contacts]);

  const toggle = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {filterCategories.map(cat => {
        const tags = availableTags.filter(t => t.category === cat.key);
        const currentValue = filter[cat.key];
        const isExpanded = expanded[cat.key];

        return (
          <div key={cat.key} className="border-b border-border/50 pb-4 last:border-0">
            <button
              onClick={() => toggle(cat.key)}
              className="w-full flex items-center justify-between mb-3 px-2 py-1 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-80">{cat.icon}</span>
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider group-hover:text-primary transition-colors">{cat.label}</span>
              </div>
              <ChevronDown
                size={16}
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
                  <div className="grid grid-cols-2 gap-2 px-1">
                    <button
                      onClick={() => setFilter({ [cat.key]: '' })}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 col-span-2 ${
                        !currentValue
                          ? 'bg-primary-light text-primary shadow-sm'
                          : 'text-text-secondary hover:bg-grey-50 hover:text-text-primary'
                      }`}
                    >
                      全部
                    </button>
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => setFilter({ [cat.key]: currentValue === tag.label ? '' : tag.label })}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          currentValue === tag.label
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-text-secondary hover:bg-grey-50 hover:text-text-primary'
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
