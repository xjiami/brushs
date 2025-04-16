'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('正在处理登录...');
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleAuthCallback() {
      const supabase = getSupabaseClient();
      
      try {
        // 获取会话信息
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session?.user) {
          throw new Error('未获取到用户信息');
        }
        
        const { user } = session;
        
        // 检查用户资料是否已存在
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // 如果用户资料不存在，则创建新资料
        if (!existingProfile) {
          // 从OAuth提供商中获取用户名
          const username = user.user_metadata?.name || 
                         user.user_metadata?.full_name || 
                         user.user_metadata?.username || 
                         user.email?.split('@')[0] || 
                         '用户' + Math.floor(Math.random() * 1000);
                         
          // 检查是否是管理员邮箱
          const isAdmin = user.email === 'xjiami2@gmail.com';
          
          // 创建用户资料
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: user.id, 
                username: username,
                email: user.email,
                avatar_url: user.user_metadata?.avatar_url,
                subscription_status: 'free',
                is_admin: isAdmin,
                created_at: new Date()
              }
            ]);
          
          if (profileError) {
            throw profileError;
          }
          
          // 如果是管理员，更新用户元数据
          if (isAdmin) {
            await supabase.auth.updateUser({
              data: { is_admin: true }
            });
          }
        } else if (existingProfile.is_admin) {
          // 如果现有用户是管理员，确保用户元数据也反映这一点
          await supabase.auth.updateUser({
            data: { is_admin: true }
          });
        }
        
        // 重定向到首页或其他页面
        setMessage('登录成功，正在跳转...');
        router.push('/profile');
        
      } catch (err: any) {
        console.error('OAuth回调处理错误:', err);
        setError(err.message || '登录过程中出现错误');
      }
    }
    
    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
        {error ? (
          <div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">登录失败</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
            >
              返回登录页
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">授权处理中</h2>
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
} 