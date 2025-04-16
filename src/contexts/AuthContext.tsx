import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signIn, signOut, signUp, getSupabaseClient } from '@/lib/supabase-client';

interface UserProfile {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  subscription_status?: 'free' | 'active' | 'premium';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 获取当前用户，如果已经登录
    async function loadUser() {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser || null);
        
        // 如果有用户，则获取其个人资料
        if (currentUser) {
          const userProfile = await getUserProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('加载用户信息时出错:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUser();
  }, []);

  // 登录函数
  async function handleSignIn(email: string, password: string) {
    try {
      setIsLoading(true);
      const { user: authUser } = await signIn(email, password);
      setUser(authUser);
      
      if (authUser) {
        const userProfile = await getUserProfile(authUser.id);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('登录时出错:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // 注册函数
  async function handleSignUp(email: string, password: string, username: string) {
    try {
      setIsLoading(true);
      const { user: authUser } = await signUp(email, password, username);
      setUser(authUser);
      
      if (authUser) {
        const userProfile = await getUserProfile(authUser.id);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('注册时出错:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // 登出函数
  async function handleSignOut() {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('登出时出错:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // 获取用户资料
  async function getUserProfile(userId: string) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    } catch (error) {
      console.error('获取用户资料时出错:', error);
      return null;
    }
  }

  const value = {
    user,
    profile,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
} 