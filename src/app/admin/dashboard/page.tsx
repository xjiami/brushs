'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/supabase-client';

// 简单的图表组件
const SimpleLineChart = ({ data, title, color = 'blue' }: { data: any[], title: string, color?: string }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(item => item.count)) || 1;
  const chartHeight = 200;
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="h-[200px] flex items-end space-x-1">
        {data.slice(-14).map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`w-full bg-${color}-500 rounded-t`} 
              style={{ 
                height: `${(item.count / maxValue) * chartHeight}px`,
                minHeight: item.count > 0 ? '4px' : '0'
              }}
            />
            {index % 2 === 0 && (
              <span className="text-xs text-gray-500 mt-1 rotate-90 origin-left transform translate-y-6 -translate-x-2 w-20">
                {new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, change, changeType = 'positive' }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
    <div className="flex justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change && (
          <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
            {changeType === 'positive' ? '↑' : '↓'} {change}
          </p>
        )}
      </div>
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500 dark:text-blue-300">
          {icon}
        </div>
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (err: any) {
        console.error('获取仪表盘数据失败:', err);
        setError(err.message || '获取数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => router.refresh()}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          重试
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">管理员仪表盘</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => router.refresh()} 
            className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md"
          >
            刷新数据
          </button>
        </div>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="总笔刷数量" 
          value={stats?.totalBrushes || 0} 
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          } 
        />
        
        <StatCard 
          title="总下载次数" 
          value={stats?.totalDownloads || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          }
        />
        
        <StatCard 
          title="注册用户" 
          value={stats?.totalUsers || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        
        <StatCard 
          title="本周新增用户" 
          value={stats?.newUsersLastWeek || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
          change="12% 较上周"
          changeType="positive"
        />
      </div>
      
      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <h3 className="border-b border-gray-200 dark:border-gray-700 p-4 font-medium">下载趋势（最近14天）</h3>
          <SimpleLineChart 
            data={stats?.downloadsTrend || []} 
            title="每日下载量" 
            color="blue" 
          />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <h3 className="border-b border-gray-200 dark:border-gray-700 p-4 font-medium">用户增长（最近14天）</h3>
          <SimpleLineChart 
            data={stats?.userGrowth || []} 
            title="每日新增用户" 
            color="green" 
          />
        </div>
      </div>
      
      {/* 热门笔刷 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <h3 className="border-b border-gray-200 dark:border-gray-700 p-4 font-medium">热门笔刷（按下载量）</h3>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">笔刷</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">下载量</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats?.topBrushes?.map((brush: any) => (
                  <tr key={brush.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <Image
                            src={brush.preview_image_url || '/placeholder.jpg'}
                            alt={brush.title}
                            fill
                            className="object-cover rounded"
                            sizes="40px"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{brush.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{brush.download_count}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/brushes/edit/${brush.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        编辑
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {(!stats?.topBrushes || stats.topBrushes.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* 热门分类 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <h3 className="border-b border-gray-200 dark:border-gray-700 p-4 font-medium">热门分类</h3>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats?.topCategories?.map((category: any) => (
            <div key={category.category_id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">{category.name}</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">{category.count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">笔刷数量</p>
            </div>
          ))}
          
          {(!stats?.topCategories || stats.topCategories.length === 0) && (
            <div className="col-span-5 p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              暂无分类数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 