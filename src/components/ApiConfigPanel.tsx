/**
 * [INPUT]: 依赖 backend API 进行 API 配置的 CRUD 操作
 * [OUTPUT]: 对外提供 ApiConfigPanel 组件，管理第三方 API 配置
 * [POS]: components/ApiConfigPanel，个人中心页面的 API 配置面板
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, RefreshCw, Trash2, Settings, CheckCircle, AlertCircle, 
  Loader2, ChevronDown, ChevronUp, Key, Link2, Database, Globe
} from 'lucide-react';
import { api } from '../lib/api';
import type { ApiConfig, ApiProvider } from '../types/contact';

interface ApiConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigsChange?: () => void;
}

const PROVIDER_INFO: Record<ApiProvider, { name: string; icon: string; fields: { key: string; label: string; placeholder: string; type: 'text' | 'password' }[]; description: string }> = {
  feishu: {
    name: '飞书',
    icon: '📨',
    description: '从飞书表格同步联系人数据',
    fields: [
      { key: 'appId', label: 'App ID', placeholder: 'cli_xxxxx', type: 'text' },
      { key: 'appSecret', label: 'App Secret', placeholder: 'xxxxxxxx', type: 'password' },
      { key: 'sheetId', label: '表格 ID', placeholder: '0xxxxx', type: 'text' },
    ]
  },
  notion: {
    name: 'Notion',
    icon: '📝',
    description: '从 Notion 数据库同步联系人',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'secret_xxxxx', type: 'password' },
      { key: 'databaseId', label: 'Database ID', placeholder: 'xxxxx', type: 'text' },
    ]
  },
  google_contacts: {
    name: 'Google 通讯录',
    icon: '� Gmail',
    description: '同步 Google 联系人',
    fields: [
      { key: 'credentials', label: 'OAuth 凭据 (JSON)', placeholder: '{"web": {...}}', type: 'text' },
    ]
  },
  custom: {
    name: '自定义 Webhook',
    icon: '🔗',
    description: '配置自定义 Webhook 进行数据同步',
    fields: [
      { key: 'webhookUrl', label: 'Webhook URL', placeholder: 'https://example.com/webhook', type: 'text' },
      { key: 'secret', label: '密钥', placeholder: '可选的签名密钥', type: 'password' },
    ]
  }
};

export default function ApiConfigPanel({ isOpen, onClose, onConfigsChange }: ApiConfigPanelProps) {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [newConfig, setNewConfig] = useState<Partial<ApiConfig>>({
    name: '',
    provider: 'feishu',
    config: {},
    enabled: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchConfigs();
    }
  }, [isOpen]);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await api.fetch('/api/api-configs');
      if (res.ok) {
        const data = await res.json();
        setConfigs(data);
      }
    } catch (err) {
      console.error('Failed to fetch configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newConfig.name || !newConfig.provider) {
      setMessage({ type: 'error', text: '请填写配置名称' });
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.fetch('/api/api-configs', {
        method: 'POST',
        body: JSON.stringify(newConfig),
      });

      if (res.ok) {
        const created = await res.json();
        setConfigs([...configs, created]);
        setShowAddForm(false);
        setNewConfig({ name: '', provider: 'feishu', config: {}, enabled: true });
        setMessage({ type: 'success', text: '配置已添加' });
        onConfigsChange?.();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || '添加失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '添加失败，请检查网络' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<ApiConfig>) => {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.fetch(`/api/api-configs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updated = await res.json();
        setConfigs(configs.map(c => c.id === id ? updated : c));
        setEditingId(null);
        setMessage({ type: 'success', text: '配置已更新' });
        onConfigsChange?.();
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || '更新失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '更新失败，请检查网络' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此配置吗？')) return;

    setError(null);
    setMessage(null);

    try {
      const res = await api.fetch(`/api/api-configs/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setConfigs(configs.filter(c => c.id !== id));
        setMessage({ type: 'success', text: '配置已删除' });
        onConfigsChange?.();
      } else {
        setMessage({ type: 'error', text: '删除失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '删除失败，请检查网络' });
    }
  };

  const handleSync = async (id: string) => {
    setSyncingId(id);
    setError(null);

    try {
      const res = await api.fetch(`/api/api-configs/${id}/sync`, {
        method: 'POST',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '同步已触发' });
        fetchConfigs();
      } else {
        setMessage({ type: 'error', text: '同步触发失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '同步触发失败' });
    } finally {
      setSyncingId(null);
    }
  };

  const getProviderIcon = (provider: ApiProvider) => {
    switch (provider) {
      case 'feishu': return '📨';
      case 'notion': return '📝';
      case 'google_contacts': return '📧';
      case 'custom': return '🔗';
      default: return '⚙️';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing': return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <RefreshCw className="w-4 h-4 text-text-secondary" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-grey-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border dark:border-grey-800">
            <div>
              <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">API 配置</h2>
              <p className="text-sm text-text-secondary mt-1">管理第三方数据同步</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-grey-100 dark:hover:bg-grey-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Config List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : configs.length === 0 && !showAddForm ? (
              <div className="text-center py-8 text-text-secondary">
                <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无 API 配置</p>
                <p className="text-sm mt-1">添加配置以实现数据同步</p>
              </div>
            ) : (
              <div className="space-y-3">
                {configs.map(config => (
                  <div key={config.id} className="border border-border dark:border-grey-700 rounded-xl overflow-hidden">
                    {/* Config Header */}
                    <div 
                      className="flex items-center justify-between p-4 bg-grey-50 dark:bg-grey-800/50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === config.id ? null : config.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getProviderIcon(config.provider)}</span>
                        <div>
                          <h3 className="font-medium text-text-primary dark:text-text-primary-dark">{config.name}</h3>
                          <p className="text-xs text-text-secondary">{PROVIDER_INFO[config.provider]?.name || config.provider}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSyncStatusIcon(config.syncStatus)}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSync(config.id); }}
                          disabled={syncingId === config.id}
                          className="p-2 hover:bg-white dark:hover:bg-grey-700 rounded-lg transition-colors disabled:opacity-50"
                          title="立即同步"
                        >
                          <RefreshCw className={`w-4 h-4 text-text-secondary ${syncingId === config.id ? 'animate-spin' : ''}`} />
                        </button>
                        {expandedId === config.id ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedId === config.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border dark:border-grey-700"
                        >
                          <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={config.enabled}
                                  onChange={(e) => handleUpdate(config.id, { enabled: e.target.checked })}
                                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                                />
                                <span className="text-sm text-text-secondary">启用同步</span>
                              </label>
                              <button
                                onClick={() => handleDelete(config.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {config.lastSyncAt && (
                              <p className="text-xs text-text-secondary">
                                上次同步: {new Date(config.lastSyncAt).toLocaleString('zh-CN')}
                              </p>
                            )}

                            <p className="text-sm text-text-secondary">{PROVIDER_INFO[config.provider]?.description}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}

            {/* Add Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border border-border dark:border-grey-700 rounded-xl overflow-hidden"
                >
                  <div className="p-4 space-y-4 bg-grey-50 dark:bg-grey-800/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-text-primary dark:text-text-primary-dark">添加新配置</h3>
                      <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-grey-200 dark:hover:bg-grey-700 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">配置名称</label>
                        <input
                          type="text"
                          value={newConfig.name}
                          onChange={e => setNewConfig({ ...newConfig, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-grey-800 focus:outline-none focus:border-primary/50"
                          placeholder="例如：我的飞书通讯录"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">服务提供商</label>
                        <select
                          value={newConfig.provider}
                          onChange={e => setNewConfig({ ...newConfig, provider: e.target.value as ApiProvider, config: {} })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-grey-800 focus:outline-none focus:border-primary/50"
                        >
                          {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                            <option key={key} value={key}>{info.icon} {info.name}</option>
                          ))}
                        </select>
                      </div>

                      {PROVIDER_INFO[newConfig.provider || 'feishu']?.fields.map(field => (
                        <div key={field.key}>
                          <label className="block text-sm font-medium text-text-primary mb-1">{field.label}</label>
                          <input
                            type={field.type}
                            value={(newConfig.config as Record<string, string>)?.[field.key] || ''}
                            onChange={e => setNewConfig({ 
                              ...newConfig, 
                              config: { ...newConfig.config, [field.key]: e.target.value }
                            })}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-grey-800 focus:outline-none focus:border-primary/50"
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleAdd}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover disabled:opacity-70 transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      添加配置
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {!showAddForm && (
            <div className="p-4 border-t border-border dark:border-grey-800">
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-border dark:border-grey-700 rounded-xl text-text-secondary hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加 API 配置
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
