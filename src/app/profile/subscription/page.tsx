'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSubscription, cancelSubscription } from '@/lib/supabase-client';

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 如果没有登录，重定向到登录页
    if (!user && !isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError('');
        const data = await getUserSubscription(user.id);
        setSubscription(data);
      } catch (err: any) {
        console.error('获取订阅信息失败:', err);
        setError(err.message || '获取订阅信息时出错');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;
    
    const confirmed = window.confirm('确定要取消订阅吗？取消后，您将失去对付费内容的访问权限，但可以继续使用到当前订阅期结束。');
    if (!confirmed) return;
    
    try {
      setIsProcessing(true);
      await cancelSubscription(subscription.id);
      
      // 刷新订阅信息
      const updatedSubscription = await getUserSubscription(user.id);
      setSubscription(updatedSubscription);
      
      alert('订阅已成功取消，您可以继续使用到当前订阅期结束。');
    } catch (err: any) {
      console.error('取消订阅失败:', err);
      alert('取消订阅失败: ' + (err.message || '请稍后再试'));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '未知';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '已激活';
      case 'cancelled':
        return '已取消';
      case 'expired':
        return '已过期';
      case 'trialing':
        return '试用中';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <p className="mt-2">加载订阅信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">订阅管理</h1>
        <p className="text-gray-600 dark:text-gray-400">
          查看和管理您的笔刷资源订阅
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!subscription && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center py-8">
            <svg 
              className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">您当前没有活跃的订阅</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              订阅可以让您无限制地访问和下载我们的高品质笔刷资源
            </p>
            <Link
              href="/plans"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              查看订阅计划
            </Link>
          </div>
        </div>
      )}

      {subscription && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{subscription.plan_name || '高级订阅'}</h2>
                <p className="text-gray-600 dark:text-gray-400">{subscription.description || '无限制访问所有笔刷资源'}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                  {getStatusText(subscription.status)}
                </span>
              </div>
            </div>
            
            <div className="border-t dark:border-gray-700">
              <dl className="divide-y dark:divide-gray-700">
                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">订阅计划</dt>
                  <dd className="text-sm text-gray-900 dark:text-white md:col-span-2">{subscription.plan_name || '高级订阅'}</dd>
                </div>
                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">订阅开始日期</dt>
                  <dd className="text-sm text-gray-900 dark:text-white md:col-span-2">{formatDate(subscription.started_at || subscription.created_at)}</dd>
                </div>
                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {subscription.status === 'cancelled' ? '服务截止日期' : '下次续费日期'}
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white md:col-span-2">{formatDate(subscription.current_period_end)}</dd>
                </div>
                <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">订阅价格</dt>
                  <dd className="text-sm text-gray-900 dark:text-white md:col-span-2">
                    ¥{subscription.price?.toFixed(2) || '0.00'} / {subscription.interval === 'month' ? '月' : '年'}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              {subscription.status === 'active' && (
                <>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={isProcessing}
                    className={`px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isProcessing ? '处理中...' : '取消订阅'}
                  </button>
                  
                  <Link
                    href="/plans"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    升级订阅
                  </Link>
                </>
              )}
              
              {subscription.status === 'cancelled' && (
                <Link
                  href="/plans"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  重新订阅
                </Link>
              )}
              
              {subscription.status === 'expired' && (
                <Link
                  href="/plans"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  重新订阅
                </Link>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">帮助和支持</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">订阅问题或需要帮助？请联系我们的客户支持。</p>
                  <a 
                    href="mailto:support@example.com" 
                    className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                  >
                    support@example.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <svg className="h-6 w-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">查看我们的订阅条款和政策。</p>
                  <a 
                    href="/terms" 
                    className="text-blue-600 dark:text-blue-400 hover:underline mt-1 inline-block"
                  >
                    订阅条款和条件
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 