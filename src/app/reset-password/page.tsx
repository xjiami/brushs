'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '../../../context/SupabaseContext';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { user, isLoading: authLoading, updatePassword } = useSupabase();

  useEffect(() => {
    // 检查是否有通过链接访问的凭证
    const checkAuth = async () => {
      if (!authLoading && !user) {
        // 如果没有用户登录，显示错误信息
        setError('无效的重置链接或链接已过期。请重新请求密码重置。');
      }
    };

    checkAuth();
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // 验证两次输入的密码是否一致
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    // 验证密码长度
    if (password.length < 6) {
      setError('密码必须至少包含6个字符');
      setIsLoading(false);
      return;
    }

    try {
      // 更新密码
      const { error: updateError } = await updatePassword(password);
      
      if (updateError) throw updateError;
      
      // 成功
      setSuccessMessage('密码已成功重置。您将在5秒后被重定向到登录页面。');
      
      // 5秒后重定向到登录页面
      setTimeout(() => {
        router.push('/login');
      }, 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '密码重置失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <p className="mt-2">验证中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            重置密码
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            请设置您的新密码
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm">
              {error}
              {!user && (
                <p className="mt-2">
                  <Link 
                    href="/forgot-password" 
                    className="text-red-600 dark:text-red-400 font-medium hover:underline"
                  >
                    返回重置密码页面
                  </Link>
                </p>
              )}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-md text-sm">
              {successMessage}
            </div>
          )}
          
          {user ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  新密码
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  确认新密码
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? '重置中...' : '重置密码'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <Link 
                href="/login" 
                className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-500 dark:hover:text-blue-300"
              >
                返回登录页面
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 