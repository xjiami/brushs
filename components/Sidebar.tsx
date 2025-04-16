'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../context/SupabaseContext';
import { getCategories } from '@/lib/supabase-client';
import { Category } from '@/types/category';

interface SidebarProps {
  isAdmin?: boolean;
}

const Sidebar = ({ isAdmin = false }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut, loading, supabase } = useSupabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // 直接从用户元数据中检查管理员权限
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // 获取所有分类
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('获取分类失败:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    // 检查用户是否为管理员，优先使用props，再检查用户元数据
    const checkAdminStatus = async () => {
      // 如果已经通过props设置为管理员，则直接返回
      if (isAdmin) {
        setIsAdminUser(true);
        return;
      }
      
      if (!user) return;
      
      // 首先检查已知的管理员电子邮件
      if (user.email === 'xjiami2@gmail.com') {
        setIsAdminUser(true);
        return;
      }
      
      // 检查用户元数据
      if (user.user_metadata?.is_admin) {
        setIsAdminUser(true);
        return;
      }
      
      // 从profiles表中获取用户数据，使用上下文中的supabase实例
      try {
        // 使用上下文提供的 supabase 实例
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('获取管理员信息错误:', error.message);
          return;
        }
          
        if (data?.is_admin) {
          console.log('从profiles表中检测到管理员权限');
          setIsAdminUser(true);
        }
      } catch (error) {
        console.error('检查管理员权限时出错:', error instanceof Error ? error.message : error);
      }
    };
    
    checkAdminStatus();
  }, [user, isAdmin, supabase]);

  // 简化的导航项，添加图标
  const mainNavItems = [
    { 
      name: 'Home', 
      path: '/',
      icon: (
        <svg className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Browse', 
      path: '/browse',
      icon: (
        <svg className="w-5 h-5 mr-2 text-teal-500 dark:text-teal-400 group-hover:text-teal-600 dark:group-hover:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      name: 'Tutorials', 
      path: '/tutorials',
      icon: (
        <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      name: 'Community', 
      path: '/community',
      icon: (
        <svg className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: 'Plans', 
      path: '/plans',
      icon: (
        <svg className="w-5 h-5 mr-2 text-pink-500 dark:text-pink-400 group-hover:text-pink-600 dark:group-hover:text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const userNavItems = user
    ? [
        { 
          name: 'Profile', 
          path: '/profile',
          icon: (
            <svg className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        { 
          name: 'My Downloads', 
          path: '/downloads',
          icon: (
            <svg className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )
        },
      ]
    : [];

  const adminNavItems = [
    { 
      name: 'Admin Panel', 
      path: '/admin',
      icon: (
        <svg className="w-5 h-5 mr-2 text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard',
      icon: (
        <svg className="w-5 h-5 mr-2 text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Add Brush', 
      path: '/admin/brushes/new',
      icon: (
        <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Manage Categories', 
      path: '/admin?tab=categories',
      icon: (
        <svg className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400 group-hover:text-purple-600 dark:group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    { 
      name: 'Storage Management', 
      path: '/admin/storage',
      icon: (
        <svg className="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400 group-hover:text-amber-600 dark:group-hover:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  // 检查是否应该显示管理员菜单
  const shouldShowAdminMenu = isAdminUser || isAdmin || (user?.email === 'xjiami2@gmail.com');

  return (
    <>
      {/* 移动端菜单按钮 - 改进样式 */}
      <button
        className="fixed top-4 left-4 z-50 block md:hidden bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-700 active:scale-90 border border-gray-200 dark:border-gray-700"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* 移动端侧边栏抽屉 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景蒙版 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 dark:bg-black/60 z-40 md:hidden"
              onClick={toggleSidebar}
            ></motion.div>
            
            {/* 侧边栏内容 */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs z-50 md:hidden"
            >
              <div className="h-full flex flex-col bg-white/35 dark:bg-gray-900/35 shadow-xl backdrop-blur-xl">
                {/* 侧边栏头部 */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200/40 dark:border-gray-800/40">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Procreate Brushes</h2>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={toggleSidebar}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* 侧边栏内容 */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* 主导航 */}
                  <nav className="space-y-1 mb-6">
                    {mainNavItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center px-3 py-2 text-base rounded-lg transition-all duration-200 group border border-transparent ${
                          pathname === item.path
                            ? 'bg-blue-50/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium border-blue-200/70 dark:border-blue-800/70 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-200/60 dark:hover:border-gray-700/60 hover:shadow-sm'
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  
                  {/* 分类列表 */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 px-3 drop-shadow-sm">
                      Categories
                    </h3>
                    <nav className="space-y-1">
                      {categoriesLoading ? (
                        <div className="flex items-center px-3 py-2 text-gray-500 dark:text-gray-400">
                          <svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </div>
                      ) : categories.length > 0 ? (
                        categories.map((category) => (
                          <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center justify-between px-3 py-2 text-base rounded-lg transition-all duration-200 border border-transparent ${
                              pathname === `/categories/${category.slug}`
                                ? 'bg-blue-50/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium border-blue-200/70 dark:border-blue-800/70 shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-200/60 dark:hover:border-gray-700/60 hover:shadow-sm'
                            }`}
                          >
                            <span>{category.name}</span>
                            {category.brush_count !== undefined && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-800/50 text-teal-600 dark:text-teal-400 font-medium">
                                {category.brush_count}
                              </span>
                            )}
                          </Link>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-gray-500 dark:text-gray-400">No categories</p>
                      )}
                    </nav>
                  </div>

                  {/* 用户导航 */}
                  {user && (
                    <div>
                      <h3 className="px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider drop-shadow-sm">
                        User Menu
                      </h3>
                      <div className="mt-1 space-y-1">
                        {userNavItems.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                              pathname === item.path
                                ? 'bg-blue-50/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium border border-blue-200/70 dark:border-blue-800/70 shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white hover:border hover:border-gray-200/50 dark:hover:border-gray-700/50 hover:shadow-sm'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 管理员菜单 */}
                  {shouldShowAdminMenu && (
                    <div>
                      <h3 className="px-4 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider drop-shadow-sm">
                        Admin Area
                      </h3>
                      <div className="mt-1 space-y-1">
                        {adminNavItems.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                              pathname === item.path
                                ? 'bg-blue-50/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium border border-blue-200/70 dark:border-blue-800/70 shadow-sm'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 hover:text-gray-900 dark:hover:text-white hover:border hover:border-gray-200/50 dark:hover:border-gray-700/50 hover:shadow-sm'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 用户资料区域 - 修复头像背景 */}
                {user && (
                  <div className="flex-shrink-0 flex border-t border-gray-200/40 dark:border-gray-800/40 p-4">
                    <div className="flex-shrink-0 w-full bg-white/25 dark:bg-gray-800/25 p-3 rounded-lg backdrop-blur-sm shadow-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="inline-block h-10 w-10 rounded-full bg-gray-100/70 dark:bg-gray-800/60 overflow-hidden">
                            {user.user_metadata?.avatar_url ? (
                              <img src={user.user_metadata.avatar_url} alt="User avatar" className="h-full w-full object-cover" />
                            ) : (
                              <svg className="h-full w-full text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            )}
                          </span>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.user_metadata?.username || user.email || 'User'}
                          </p>
                          <button
                            onClick={signOut}
                            className="mt-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 桌面端固定侧边栏 - 改进设计和交互 */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white/35 dark:bg-gray-900/35 border-r border-gray-200/30 dark:border-gray-800/30 shadow-sm backdrop-blur-xl">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-6">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors drop-shadow-sm">
                Procreate Brushes
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-3 space-y-8">
              {/* 主导航 */}
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border border-transparent ${
                      pathname === item.path
                        ? 'bg-blue-50/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-blue-200/70 dark:border-blue-800/70 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-200/60 dark:hover:border-gray-700/60 hover:shadow-sm'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* 分类列表 */}
              <div>
                <h3 className="px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 drop-shadow-sm">
                  Brush Categories
                </h3>
                <div className="space-y-1">
                  {categoriesLoading ? (
                    <div className="px-3 py-2 text-gray-500 dark:text-gray-400 flex items-center">
                      <svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 border border-transparent ${
                          pathname === `/categories/${category.slug}`
                            ? 'bg-blue-50/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium border-blue-200/70 dark:border-blue-800/70 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-200/60 dark:hover:border-gray-700/60 hover:shadow-sm'
                        }`}
                      >
                        <span>{category.name}</span>
                        {category.brush_count !== undefined && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-teal-100 dark:bg-teal-800/50 text-teal-600 dark:text-teal-400 font-medium">
                            {category.brush_count}
                          </span>
                        )}
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No categories</p>
                  )}
                </div>
              </div>

              {/* 用户菜单 */}
              {user && (
                <div>
                  <h3 className="px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 drop-shadow-sm">
                    User Menu
                  </h3>
                  <div className="space-y-1">
                    {userNavItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 border border-transparent group ${
                          pathname === item.path
                            ? 'bg-blue-50/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium border-blue-200/70 dark:border-blue-800/70 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-200/60 dark:hover:border-gray-700/60 hover:shadow-sm'
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 管理员菜单 */}
              {shouldShowAdminMenu && (
                <div>
                  <h3 className="px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3 drop-shadow-sm">
                    Admin Area
                  </h3>
                  <div className="space-y-1">
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 border border-transparent group ${
                          pathname === item.path
                            ? 'bg-blue-50/90 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium border-blue-200/70 dark:border-blue-800/70 shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white hover:border-gray-200/60 dark:hover:border-gray-700/60 hover:shadow-sm'
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
          
          {/* 用户资料区域 - 修复头像背景 */}
          {user && (
            <div className="flex-shrink-0 flex border-t border-gray-200/40 dark:border-gray-800/40 p-4">
              <div className="flex-shrink-0 w-full bg-white/25 dark:bg-gray-800/25 p-3 rounded-lg backdrop-blur-sm shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="inline-block h-10 w-10 rounded-full bg-gray-100/70 dark:bg-gray-800/60 overflow-hidden">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="User avatar" className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-full w-full text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.user_metadata?.username || user.email || 'User'}
                    </p>
                    <button
                      onClick={signOut}
                      className="mt-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar; 