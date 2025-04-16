'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../src/lib/supabase-client';
import { useRouter } from 'next/navigation';

// 创建上下文类型
type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{
    user: User | null;
    session: Session | null;
    error: AuthError | null;
  }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  getCurrentSession: () => Promise<Session | null>;
  updateUserProfile: (updates: any) => Promise<{ error: any | null }>;
  getUserProfile: () => Promise<{ data: any | null; error: any | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  uploadAvatar: (file: File) => Promise<{ error: any | null; url: string | null }>;
  getUserDownloads: () => Promise<{ data: any[] | null; error: any | null }>;
};

// 创建默认上下文
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// 创建提供者组件
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => getSupabaseClient());
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 获取初始会话
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(session);
        setUser(session?.user || null);
      } catch (error: any) {
        setError(error.message);
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 设置身份验证变更监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log('Auth state changed:', event);
        
        // 只在特定事件时更新状态，避免不必要的更新
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          console.log('更新会话状态:', session ? '已登录' : '未登录');
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);
        }
      }
    );

    // 清理监听器
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 登出函数
  const signOut = async () => {
    try {
      console.log('执行登出操作');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('登出API错误:', error);
        throw error;
      }
      
      console.log('登出成功，更新状态');
      setUser(null);
      setSession(null);
      
      // 不再自动跳转，返回成功状态
      return { success: true };
    } catch (error: any) {
      console.error('登出错误:', error.message);
      return { success: false, error };
    }
  };

  // 登录函数
  const signIn = async (email: string, password: string) => {
    try {
      console.log('尝试登录:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('登录API错误:', error);
        return {
          user: null,
          session: null,
          error
        };
      }
      
      console.log('登录成功，更新状态');
      
      if (data.user) {
        // 在更新状态前，尝试获取用户的管理员信息
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', data.user.id)
            .single();
          
          console.log('用户权限信息:', profile);
          
          // 如果是管理员，更新用户元数据
          if (profile?.is_admin || data.user.email === 'xjiami2@gmail.com' || data.user.email === 'admin.test@gmail.com') {
            console.log('设置管理员权限');
            await supabase.auth.updateUser({
              data: { is_admin: true }
            });
          }
        } catch (profileError) {
          console.error('获取管理员信息失败:', profileError);
        }
        
        setUser(data.user);
        setSession(data.session);
      }
      
      return {
        user: data?.user || null,
        session: data?.session || null,
        error: null
      };
    } catch (error: any) {
      console.error('登录过程错误:', error.message);
      return {
        user: null,
        session: null,
        error: error
      };
    }
  };

  // 注册新用户
  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      // 如果注册成功，初始化用户资料
      if (!error) {
        // 注意：这一步通常会通过数据库触发器或函数自动完成
        // 这里仅作为示例
      }
      
      return { error };
    } catch (error) {
      console.error('注册错误:', error);
      return { error: error as AuthError };
    }
  };

  // 获取当前会话
  const getCurrentSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('获取会话错误:', error);
      return null;
    }
  };

  // 更新用户资料
  const updateUserProfile = async (updates: any) => {
    try {
      if (!user) {
        throw new Error('未登录');
      }
      
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);
        
      return { error };
    } catch (error) {
      console.error('更新用户资料错误:', error);
      return { error };
    }
  };

  // 获取用户资料
  const getUserProfile = async () => {
    try {
      if (!user) {
        return { data: null, error: new Error('未登录') };
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      return { data, error };
    } catch (error) {
      console.error('获取用户资料错误:', error);
      return { data: null, error };
    }
  };

  // 更新密码
  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('更新密码错误:', error);
      return { error: error as AuthError };
    }
  };

  // 上传头像
  const uploadAvatar = async (file: File) => {
    try {
      if (!user) {
        throw new Error('未登录');
      }
      
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // 上传文件
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // 更新用户资料中的头像URL
      await updateUserProfile({
        avatar_url: publicUrl,
        updated_at: new Date(),
      });
      
      return { error: null, url: publicUrl };
    } catch (error) {
      console.error('上传头像错误:', error);
      return { error, url: null };
    }
  };

  // 获取用户下载的笔刷
  const getUserDownloads = async () => {
    try {
      if (!user) {
        return { data: null, error: new Error('未登录') };
      }
      
      const { data, error } = await supabase
        .from('brush_downloads')
        .select(`
          id, 
          download_date,
          brushes (
            id, 
            title, 
            preview_image_url
          )
        `)
        .eq('user_id', user.id)
        .order('download_date', { ascending: false });
        
      return { data, error };
    } catch (error) {
      console.error('获取用户下载记录错误:', error);
      return { data: null, error };
    }
  };

  // 重置密码
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { error };
    } catch (error) {
      console.error('重置密码错误:', error);
      return { error: error as AuthError };
    }
  };

  const value = {
    supabase,
    session,
    user,
    loading,
    error,
    signOut,
    signIn,
    signUp,
    resetPassword,
    getCurrentSession,
    updateUserProfile,
    getUserProfile,
    updatePassword,
    uploadAvatar,
    getUserDownloads,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// 自定义钩子，用于访问上下文
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
} 