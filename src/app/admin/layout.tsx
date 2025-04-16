'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');
  
  // 判断当前路径是否活动，处理带查询参数的情况
  const isActive = (path: string) => {
    // 如果是简单路径，直接比较
    if (!path.includes('?')) {
      return pathname === path;
    }
    
    // 如果是带tab的路径
    const [basePath, queryPart] = path.split('?');
    const tabMatch = queryPart.match(/tab=([^&]*)/);
    const tabValue = tabMatch ? tabMatch[1] : null;
    
    return pathname === basePath && currentTab === tabValue;
  };
  
  const adminNavItems = [
    { name: '管理面板', path: '/admin' },
    { name: '数据仪表盘', path: '/admin/dashboard' },
    { name: '添加笔刷', path: '/admin/brushes/new' },
    { name: '管理分类', path: '/admin?tab=categories' },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link 
                  href="/" 
                  className="text-xl font-bold text-blue-600 dark:text-blue-400"
                >
                  Procreate笔刷
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.path)
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none"
                >
                  返回网站
                </Link>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  管理员
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 