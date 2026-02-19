/**
 * [INPUT]: 依赖 contactStore 进行关系数据操作 (addRelationship)
 * [OUTPUT]: 对外提供 RelationshipModal 组件，用于建立资产间的连接
 * [POS]: components/RelationshipModal，业务模态框组件，被 Dashboard 和 Timeline 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Search } from 'lucide-react';
import { useContactStore } from '../store/contactStore';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceContactId: string | null;
}

export default function RelationshipModal({ isOpen, onClose, sourceContactId }: RelationshipModalProps) {
  const { contacts, addRelationship } = useContactStore();
  const [targetId, setTargetId] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');

  const sourceContact = contacts.find(c => c.id === sourceContactId);
  
  const availableContacts = contacts.filter(c => c.id !== sourceContactId);
  const filteredContacts = availableContacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceContactId || !targetId || !type) return;
    
    await addRelationship({
      sourceContactId,
      targetContactId: targetId,
      type
    });
    onClose();
    setTargetId('');
    setType('');
    setSearch('');
  };

  if (!isOpen || !sourceContact) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              添加关系
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                当前联系人
              </label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                {sourceContact.name}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                连接对象
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索联系人..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all mb-2"
                />
              </div>
              
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {filteredContacts.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setTargetId(c.id)}
                    className={`p-2 cursor-pointer hover:bg-primary-light transition-colors flex items-center justify-between ${targetId === c.id ? 'bg-primary-light ring-1 ring-primary' : ''}`}
                  >
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.company}</span>
                  </div>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">未找到联系人</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                关系类型
              </label>
              <input
                type="text"
                placeholder="例如：同事、朋友、校友..."
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!targetId || !type}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认连接
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
