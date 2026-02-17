/**
 * [INPUT]: 依赖 useUserStore 获取当前用户信息，依赖 insforge 进行登出
 * [OUTPUT]: 对外提供 ProfilePage 组件，允许用户修改昵称、头像和退出登录
 * [POS]: pages/ProfilePage，个人中心页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, LogOut, User as UserIcon, Upload } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, uploadAvatar, signOut } = useUserStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile({ fullName, avatarUrl });
      setMessage({ type: 'success', text: '个人资料已更新' });
    } catch (error) {
      setMessage({ type: 'error', text: '更新失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: '图片大小不能超过 5MB' });
      return;
    }

    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
      setMessage({ type: 'success', text: '头像上传成功' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: '上传失败，请确保已配置 Storage bucket "avatars"' });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">个人主页</h1>
          <p className="text-text-secondary mt-1">管理您的个人信息和账户设置</p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          退出登录
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border p-8 space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-grey-100 border-2 border-white shadow-md">
              {uploading ? (
                <div className="w-full h-full flex items-center justify-center bg-black/10">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                  <UserIcon size={40} />
                </div>
              )}
            </div>
            <button
              onClick={triggerFileInput}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-transform hover:scale-110 disabled:opacity-70 disabled:cursor-not-allowed"
              title="上传头像"
            >
              <Camera size={16} />
            </button>
          </div>
          <p className="text-sm text-text-secondary">支持 jpg, png 格式，最大 5MB</p>
        </div>

        {/* Form Section */}
        <div className="space-y-6 max-w-md mx-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">昵称</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-grey-50/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
              placeholder="请输入您的昵称"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  保存修改
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
