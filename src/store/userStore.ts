/**
 * [INPUT]: 依赖 insforge client 进行身份验证和用户信息更新
 * [OUTPUT]: 对外提供 useUserStore hook，管理当前用户 session 和 profile
 * [POS]: store/userStore，前端用户状态中心
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { create } from 'zustand';
import { insforge } from '../lib/insforge';

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
      const { data: { session } } = await insforge.auth.getCurrentSession();
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
      const { data, error } = await insforge.auth.setProfile({
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

  uploadAvatar: async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Assuming 'avatars' bucket exists
      const { error: uploadError } = await insforge.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = insforge.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  signOut: async () => {
    await insforge.auth.signOut();
    set({ user: null });
  }
}));
