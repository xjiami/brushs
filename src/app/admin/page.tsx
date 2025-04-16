'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getBrushes, getCategories, deleteBrush } from '@/lib/supabase-client';
import { getSupabaseClient } from '@/lib/supabase-client';

// 定义数据类型
interface Brush {
  id: string;
  title: string;
  description: string;
  preview_image_url: string;
  category_id: string;
  categories?: { name: string; id: string };
  is_featured: boolean;
  is_free: boolean;
  price?: number;
  download_count: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  brush_count?: number;
}

interface User {
  id: string;
  email: string;
  username: string;
  subscription_status: string;
  created_at: string;
}

export default function AdminPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  // 创建一个 ref 来标记是否已加载数据，防止重复加载
  const dataLoadedRef = useRef(false);
  
  const [activeTab, setActiveTab] = useState<'brushes' | 'categories' | 'users'>('brushes');
  const [brushes, setBrushes] = useState<Brush[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 根据URL参数设置初始标签
  useEffect(() => {
    if (tabParam === 'categories') {
      setActiveTab('categories');
    } else if (tabParam === 'users') {
      setActiveTab('users');
    } else {
      setActiveTab('brushes');
    }
  }, [tabParam]);

  // 提取数据加载逻辑为独立函数，优化可重用性和性能
  const loadData = useCallback(async () => {
    // 如果已经加载过数据，跳过
    if (dataLoadedRef.current) {
      return;
    }
    
    console.log('开始加载管理面板数据');
    setIsLoading(true);
    setError('');
    
    try {
      // 获取 Supabase 客户端 - 使用全局单例
      const supabase = getSupabaseClient();
      
      // 获取当前用户会话
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('用户未登录');
        setError('请先登录');
        setIsLoading(false);
        window.location.href = '/login';
        return;
      }
      
      // 验证管理员权限 - 直接检查 session 信息中的元数据，减少额外请求
      const isAdmin = user.user_metadata?.is_admin === true;
      const isSpecialAdmin = user.email === 'xjiami2@gmail.com' || user.email === 'admin.test@gmail.com';
      
      // 如果 session 没有管理员信息，检查数据库
      if (!isAdmin && !isSpecialAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (!profile?.is_admin) {
          console.error('用户无管理权限');
          setError('您没有管理员权限');
          setIsLoading(false);
          return;
        }
      }
      
      // 并行加载所有数据以提高性能
      const [brushesResponse, categoriesResponse, usersResponse] = await Promise.all([
        // 使用获取笔刷列表的优化查询
        supabase
          .from('brushes')
          .select('*, categories(id, name)')
          .order('created_at', { ascending: false }),
          
        // 获取分类列表
        supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true }),
          
        // 获取用户列表 - 限制字段减少数据量
        supabase
          .from('profiles')
          .select('id, email, username, subscription_status, created_at')
          .order('created_at', { ascending: false })
      ]);
      
      // 处理各个响应并更新状态
      if (brushesResponse.error) throw brushesResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;
      if (usersResponse.error) {
        console.error('获取用户列表错误:', usersResponse.error);
        // 错误但仍继续加载其他数据
        setUsers([]);
      } else {
        setUsers(usersResponse.data || []);
      }
      
      // 一次性更新所有状态，避免多次渲染
      setBrushes(brushesResponse.data || []);
      setCategories(categoriesResponse.data || []);
      
      // 标记数据已加载
      dataLoadedRef.current = true;
      
      console.log('管理面板数据加载完成');
    } catch (err) {
      console.error('加载数据失败:', err);
      let errorMsg = '加载数据失败，请刷新页面重试';
      if (err instanceof Error) {
        errorMsg += `: ${err.message}`;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFeatureToggle = async (id: string) => {
    try {
      console.log(`尝试切换笔刷特色状态:`, id);
      
      // 找到当前笔刷
      const brush = brushes.find(b => b.id === id);
      if (!brush) {
        console.error('找不到笔刷:', id);
        return;
      }
      
      // 获取Supabase客户端
      const supabase = getSupabaseClient();
      
      // 更新特色状态
      console.log(`更新笔刷 ${id} 的特色状态从 ${brush.is_featured} 到 ${!brush.is_featured}`);
      const { error } = await supabase
        .from('brushes')
        .update({ is_featured: !brush.is_featured })
        .eq('id', id);
      
      if (error) {
        console.error('更新特色状态API错误:', error);
        throw error;
      }
      
      console.log('特色状态更新成功，正在更新本地状态');
      
      // 更新本地状态
      setBrushes(prev => 
        prev.map(brush => 
          brush.id === id ? { ...brush, is_featured: !brush.is_featured } : brush
        )
      );
      
      console.log('特色状态切换完成');
    } catch (err) {
      console.error('更新推荐状态失败:', err);
      alert('更新失败，请重试');
    }
  };

  const handleDeleteBrush = async (id: string) => {
    console.log(`尝试删除笔刷:`, id);
    
    if (window.confirm('确定要删除这个笔刷吗？此操作无法撤销。')) {
      try {
        console.log('用户确认删除，执行删除操作');
        await deleteBrush(id);
        console.log('删除笔刷成功，更新本地状态');
        setBrushes(prev => prev.filter(brush => brush.id !== id));
        console.log('本地状态更新完成');
      } catch (err) {
        console.error('删除笔刷失败:', err);
        alert('删除失败，请重试');
      }
    } else {
      console.log('用户取消删除操作');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    console.log(`尝试删除分类:`, id);
    
    if (window.confirm('确定要删除这个分类吗？此操作无法撤销，相关笔刷的分类将变为"未分类"。')) {
      try {
        console.log('用户确认删除，执行删除操作');
        // 获取Supabase客户端
        const supabase = getSupabaseClient();
        
        // 删除分类
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('删除分类API错误:', error);
          throw error;
        }
        
        console.log('删除分类成功，更新本地状态');
        // 更新本地状态
        setCategories(prev => prev.filter(category => category.id !== id));
        console.log('本地状态更新完成');
      } catch (err) {
        console.error('删除分类失败:', err);
        alert('删除失败，请重试');
      }
    } else {
      console.log('用户取消删除操作');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg max-w-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">管理面板</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
          >
            返回网站
          </Link>
          <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-3 py-1 rounded-full">
            管理员
          </span>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">笔刷数量</h2>
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{brushes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">分类数量</h2>
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{categories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">用户数量</h2>
              <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 管理选项卡 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('brushes')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'brushes'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              笔刷管理
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'categories'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              分类管理
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              用户管理
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* 笔刷管理 */}
          {activeTab === 'brushes' && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">笔刷列表</h2>
                <Link
                  href="/admin/brushes/new"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  添加新笔刷
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        笔刷
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        分类
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        状态
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        下载次数
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        创建日期
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {brushes.map((brush) => (
                      <tr key={brush.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden">
                              <Image
                                src={brush.preview_image_url || 'https://via.placeholder.com/40'}
                                alt={brush.title}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {brush.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                {brush.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {brush.categories?.name || '未分类'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {brush.is_featured ? (
                              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-xs px-2.5 py-0.5 rounded-full">
                                推荐
                              </span>
                            ) : null}
                            {brush.is_free ? (
                              <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs px-2.5 py-0.5 rounded-full">
                                免费
                              </span>
                            ) : (
                              <span className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full">
                                付费
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {brush.download_count?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(brush.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/brushes/edit/${brush.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              编辑
                            </Link>
                            <button
                              onClick={() => handleFeatureToggle(brush.id)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              {brush.is_featured ? '取消推荐' : '推荐'}
                            </button>
                            <button
                              onClick={() => handleDeleteBrush(brush.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 分类管理 */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">分类列表</h2>
                <Link
                  href="/admin/categories/new"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  添加新分类
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        分类名称
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        笔刷数量
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {category.brush_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/categories/edit/${category.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              编辑
                            </Link>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 用户管理 */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">用户列表</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        用户
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        订阅
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        注册日期
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.username}
                            </div>
                            <div className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.subscription_status === 'premium' ? (
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full">
                              高级会员
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 text-xs px-2.5 py-0.5 rounded-full">
                              免费用户
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              查看详情
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 