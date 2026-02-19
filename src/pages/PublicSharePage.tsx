/**
 * [INPUT]: 依赖后端 API 获取公开分享页配置，依赖 URL slug 参数
 * [OUTPUT]: 对外提供 PublicSharePage 页面，展示特定的关系资产分享内容
 * [POS]: pages/PublicSharePage，公开访问的分享页视图
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { client } from '../lib/client';
import { ShareConfig, Contact } from '../types/contact';

// Helper for avatar color
const getAvatarColor = (name: string) => {
  const avatarColors = ['#007AFF', '#5AC8FA', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#00C7BE', '#005BB5'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

export default function PublicSharePage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<{ title: string; config: ShareConfig } | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    const fetchPage = async () => {
      try {
        setLoading(true);
        // Fetch page config
        const res = await client.api.fetch(`/api/shared-pages/public/${slug}`);
        if (!res.ok) throw new Error('Page not found');
        const pageData = await res.json();

        // Parse config if it's a string (though backend might return object if I fixed it there, let's be safe)
        const config = typeof pageData.config === 'string' ? JSON.parse(pageData.config) : pageData.config;

        setPage({ ...pageData, config });
        setContacts(pageData.contacts || []);

      } catch (e) {
        setError('无法加载分享页面');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-text-secondary">加载中...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-accent-red">{error}</div>;
  if (!page) return null;

  const { config } = page;

  // Stats
  const industryMap: Record<string, number> = {};
  contacts.forEach(c => c.tags.filter(t => t.category === 'industry').forEach(t => {
    industryMap[t.label] = (industryMap[t.label] || 0) + 1;
  }));
  const industries = Object.entries(industryMap).sort((a, b) => b[1] - a[1]);

  const skillMap: Record<string, number> = {};
  contacts.forEach(c => c.tags.filter(t => t.category === 'skill').forEach(t => {
    skillMap[t.label] = (skillMap[t.label] || 0) + 1;
  }));
  const skills = Object.entries(skillMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-grey-50 p-4 md:p-8">
       <div className="max-w-4xl mx-auto bg-surface rounded-2xl border border-border dark:border-grey-800 overflow-hidden shadow-card-hover">
          <div className="bg-gradient-to-r from-primary to-primary-600 px-8 py-10 text-white">
            <div className="flex items-center gap-2 mb-2">
                <Globe size={14} className="opacity-70" />
                <span className="text-xs opacity-70">bridgeflow.io</span>
            </div>
            <h2 className="text-2xl font-bold">{page.title}</h2>
            <p className="text-sm opacity-80 mt-1">共 {contacts.length} 位行业伙伴</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Industry */}
            {config.showIndustry && industries.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-4">行业分布</h3>
                    <div className="flex flex-wrap gap-2">
                        {industries.map(([label, count]) => (
                            <div key={label} className="px-4 py-2 bg-primary/5 rounded-xl text-center">
                                <div className="text-lg font-bold text-primary">{count}</div>
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
                            <span key={label} className="px-3 py-1.5 bg-accent-green/10 text-accent-green rounded-pill text-sm font-medium">
                                {label} ({count})
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Contacts Grid */}
            <div>
                <h3 className="text-sm font-semibold text-text-primary mb-4">资产伙伴</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contacts.map(c => (
                        <div key={c.id} className="flex items-center gap-3 p-3 bg-fill-quaternary rounded-xl">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getAvatarColor(c.name) }}>
                                {c.name[0]}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-text-primary">{c.name}</div>
                                <div className="text-xs text-text-secondary">{c.company}</div>
                                {config.showNotes && c.notes && (
                                    <div className="text-xs text-grey-400 mt-0.5 truncate max-w-[180px]">"{c.notes}"</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
       </div>
       <div className="mt-8 text-center text-xs text-grey-400">
          Powered by BridgeFlow
       </div>
    </div>
  );
}
