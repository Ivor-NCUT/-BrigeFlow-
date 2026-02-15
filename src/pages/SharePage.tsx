import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Eye, EyeOff, Globe, Lock, Copy, Check, Link2, Settings } from 'lucide-react';
import { useContactStore } from '../store/contactStore';

export default function SharePage() {
  const { contacts, shareConfig, updateShareConfig, getAvatarColor } = useContactStore();
  const [copied, setCopied] = useState(false);

  const shareableContacts = contacts.filter(c => c.shareVisible);
  const shareUrl = `https://${shareConfig.customDomain}.bridgeflow.io`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Industry stats for share
  const industryMap: Record<string, number> = {};
  shareableContacts.forEach(c => c.tags.filter(t => t.category === 'industry').forEach(t => {
    industryMap[t.label] = (industryMap[t.label] || 0) + 1;
  }));
  const industries = Object.entries(industryMap).sort((a, b) => b[1] - a[1]);

  // Skill stats
  const skillMap: Record<string, number> = {};
  shareableContacts.forEach(c => c.tags.filter(t => t.category === 'skill').forEach(t => {
    skillMap[t.label] = (skillMap[t.label] || 0) + 1;
  }));
  const skills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">分享页面编辑器</h1>
          <p className="text-sm text-gray-500 mt-1">自定义你的人脉网络展示页面</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-8">
        {/* Settings panel */}
        <div className="col-span-2 space-y-6">
          {/* Share link */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Link2 size={16} className="text-primary" />
              分享链接
            </h3>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 mb-1 block">个性化域名</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">https://</span>
                <input
                  type="text"
                  value={shareConfig.customDomain}
                  onChange={e => updateShareConfig({ customDomain: e.target.value })}
                  className="flex-1 h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
                <span className="text-sm text-gray-400">.connecthub.io</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center text-sm text-gray-600 truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </motion.div>

          {/* Privacy settings */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings size={16} className="text-primary" />
              公开范围设置
            </h3>
            <div className="space-y-4">
              {[
                { key: 'isPublic' as const, label: '公开页面', desc: '允许任何人通过链接访问', icon: shareConfig.isPublic ? Globe : Lock },
                { key: 'showIndustry' as const, label: '展示行业分布', desc: '显示联系人的行业标签统计', icon: Eye },
                { key: 'showSkills' as const, label: '展示专业技能', desc: '显示联系人的技能标签', icon: Eye },
                { key: 'showConnections' as const, label: '展示关系网络', desc: '显示人脉之间的连接关系', icon: Eye },
                { key: 'showNotes' as const, label: '展示备注信息', desc: '⚠️ 这可能包含敏感信息', icon: EyeOff },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <item.icon size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateShareConfig({ [item.key]: !shareConfig[item.key] })}
                    className={`w-11 h-6 rounded-full transition-all duration-200 ${
                      shareConfig[item.key] ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                      shareConfig[item.key] ? 'translate-x-[22px]' : 'translate-x-[2px]'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Preview */}
        <div className="col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            {/* Preview header */}
            <div className="bg-gradient-to-r from-primary to-purple-500 px-8 py-10 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="opacity-70" />
                <span className="text-xs opacity-70">{shareUrl}</span>
              </div>
              <h2 className="text-2xl font-bold">我的人脉网络</h2>
              <p className="text-sm opacity-80 mt-1">共 {shareableContacts.length} 位行业伙伴</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Industry distribution */}
              {shareConfig.showIndustry && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">行业分布</h3>
                  <div className="flex flex-wrap gap-2">
                    {industries.map(([label, count]) => (
                      <div key={label} className="px-4 py-2 bg-primary-light rounded-xl text-center">
                        <div className="text-lg font-bold text-primary">{count}</div>
                        <div className="text-xs text-gray-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {shareConfig.showSkills && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">专业技能标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(([label, count]) => (
                      <span key={label} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                        {label} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contacts preview */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">人脉伙伴</h3>
                <div className="grid grid-cols-2 gap-3">
                  {shareableContacts.slice(0, 6).map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getAvatarColor(c.name) }}>
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.company}</div>
                        {shareConfig.showNotes && c.notes && (
                          <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">"{c.notes}"</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection graph placeholder */}
              {shareConfig.showConnections && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">关系网络</h3>
                  <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      {shareableContacts.slice(0, 5).map((c, i) => (
                        <div
                          key={c.id}
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-md"
                          style={{
                            backgroundColor: getAvatarColor(c.name),
                            marginLeft: i > 0 ? '-8px' : '0',
                            zIndex: 5 - i,
                          }}
                        >
                          {c.name[0]}
                        </div>
                      ))}
                      {shareableContacts.length > 5 && (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 border-2 border-white shadow-md" style={{ marginLeft: '-8px' }}>
                          +{shareableContacts.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
