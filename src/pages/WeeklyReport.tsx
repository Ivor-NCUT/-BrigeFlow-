import { motion } from 'framer-motion';
import { BarChart3, Users, MessageSquare, ArrowRight, TrendingUp, Award, Calendar } from 'lucide-react';
import { useContactStore } from '../store/contactStore';

export default function WeeklyReport() {
  const { contacts, getWeeklyStats, getInactiveContacts, getAvatarColor } = useContactStore();
  const stats = getWeeklyStats();
  const inactive = getInactiveContacts();

  // Industry distribution
  const industryMap: Record<string, number> = {};
  contacts.forEach(c => c.tags.filter(t => t.category === 'industry').forEach(t => {
    industryMap[t.label] = (industryMap[t.label] || 0) + 1;
  }));
  const industries = Object.entries(industryMap).sort((a, b) => b[1] - a[1]);
  const maxIndustry = Math.max(...industries.map(i => i[1]), 1);

  // Top contacts by interaction
  const topContacts = [...contacts].sort((a, b) => b.interactionCount - a.interactionCount).slice(0, 5);

  // Relationship distribution
  const relMap: Record<string, number> = {};
  contacts.forEach(c => c.tags.filter(t => t.category === 'relationship').forEach(t => {
    relMap[t.label] = (relMap[t.label] || 0) + 1;
  }));

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">社交周报</h1>
          <p className="text-sm text-gray-500 mt-1">回顾本周人脉拓展成果 · {today}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm">
          <BarChart3 size={16} />
          生成报告
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: '总人脉数', value: contacts.length, icon: Users, color: '#4F46E5', bg: '#EEF2FF' },
          { label: '本周新增', value: stats.newContacts, icon: TrendingUp, color: '#059669', bg: '#ECFDF5' },
          { label: '本周沟通', value: stats.communications, icon: MessageSquare, color: '#D97706', bg: '#FFFBEB' },
          { label: '待跟进', value: stats.followUps, icon: ArrowRight, color: '#DC2626', bg: '#FEF2F2' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Industry distribution */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={16} className="text-primary" />
            行业分布
          </h3>
          <div className="space-y-3">
            {industries.map(([label, count]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{label}</span>
                  <span className="text-gray-400">{count} 人</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxIndustry) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Relationship types */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={16} className="text-primary" />
            关系类型分布
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(relMap).map(([label, count]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top contacts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            互动最频繁
          </h3>
          <div className="space-y-3">
            {topContacts.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-300 w-5">{i + 1}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: getAvatarColor(c.name) }}>
                  {c.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.company}</div>
                </div>
                <span className="text-sm font-bold text-primary">{c.interactionCount} 次</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Inactive contacts - Smart group */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-amber-500" />
            半年未联系（智能分组）
          </h3>
          {inactive.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">太棒了，没有遗忘的朋友 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inactive.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: getAvatarColor(c.name) }}>
                    {c.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-400">最后联系: {c.lastContactedAt}</div>
                  </div>
                  <button className="text-xs text-primary bg-primary-light px-2.5 py-1 rounded-lg font-medium hover:bg-primary/10 transition-colors">
                    联系 TA
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
