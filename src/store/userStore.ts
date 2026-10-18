/**
 * [INPUT]: 依赖 localBackend 进行身份验证和用户信息更新
 * [OUTPUT]: 对外提供 useUserStore hook，管理当前用户 session 和 profile
 * [POS]: store/userStore，前端用户状态中心
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { create } from 'zustand';
import { localBackend } from '../lib/localBackend';

interface User {
  id: string;
  email?: string;
  profile?: {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

interface UserState {
  user: User | null;
  loading: boolean;
  
  fetchUser: () => Promise<void>;
  updateProfile: (updates: { fullName?: string; avatarUrl?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await localBackend.auth.getCurrentSession();
      set({ user: session?.user || null });
      
      // Note: Insforge SDK might not have onAuthStateChange in the same way, 
      // or we might need to poll or handle it differently.
      // For now, we fetch once.
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (updates) => {
    try {
      const { data, error } = await localBackend.auth.setProfile({
        name: updates.fullName,
        avatar_url: updates.avatarUrl,
      });
      
      if (error) throw error;
      
      // Merge updates into current user state
      set((state) => ({
        user: state.user ? { 
          ...state.user, 
          profile: { ...state.user.profile, ...data } 
        } : null
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  uploadAvatar: (file: File) => localBackend.uploadAvatar(file),

  signOut: async () => {
    await localBackend.auth.signOut();
    set({ user: null });
  }
}));
