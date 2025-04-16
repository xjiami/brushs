'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 模拟用户数据
const mockUsers = [
  { 
    id: '1', 
    email: 'user1@example.com', 
    username: 'artist123', 
    subscription: 'premium', 
    joinDate: '2023-01-15',
    subscriptionExpiry: '2024-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: '专业插画师，喜欢探索不同的绘画风格和技巧。目前专注于数字水彩和概念艺术创作。',
    location: '上海',
    website: 'https://artist123.example.com',
    totalDownloads: 78,
    lastActive: '2023-10-25'
  },
  { 
    id: '2', 
    email: 'user2@example.com', 
    username: 'creator456', 
    subscription: 'free', 
    joinDate: '2023-03-20',
    subscriptionExpiry: null,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: '自学艺术爱好者，正在学习Procreate的各种功能。喜欢绘制风景和静物。',
    location: '北京',
    website: '',
    totalDownloads: 12,
    lastActive: '2023-10-20'
  },
  { 
    id: '3', 
    email: 'user3@example.com', 
    username: 'procreate_fan', 
    subscription: 'premium', 
    joinDate: '2023-05-10',
    subscriptionExpiry: '2024-05-10',
    avatarUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    bio: '游戏美术设计师，使用Procreate创作概念艺术和角色设计。',
    location: '广州',
    website: 'https://artstation.com/procreate_fan',
    totalDownloads: 145,
    lastActive: '2023-10-28'
  }
];

// 模拟下载记录
const mockDownloads = [
  { id: '1', userId: '1', brushTitle: '水彩效果笔刷套装', date: '2023-10-15', price: '29.99' },
  { id: '2', userId: '1', brushTitle: '素描铅笔套装', date: '2023-09-28', price: '0' },
  { id: '3', userId: '1', brushTitle: '油画质感笔刷集', date: '2023-09-10', price: '39.99' },
  { id: '4', userId: '2', brushTitle: '素描铅笔套装', date: '2023-10-05', price: '0' },
  { id: '5', userId: '3', brushTitle: '水彩效果笔刷套装', date: '2023-10-20', price: '29.99' },
  { id: '6', userId: '3', brushTitle: '油画质感笔刷集', date: '2023-10-15', price: '39.99' },
  { id: '7', userId: '3', brushTitle: '素描铅笔套装', date: '2023-09-05', price: '0' },
];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 查找用户
        const userData = mockUsers.find(u => u.id === userId);
        if (!userData) {
          throw new Error('未找到用户');
        }
        
        // 获取该用户的下载记录
        const userDownloads = mockDownloads.filter(d => d.userId === userId);
        
        setUser(userData);
        setDownloads(userDownloads);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载用户数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4 text-red-700 dark:text-red-300">
            <h3 className="text-lg font-medium">出错了</h3>
            <p className="mt-1">{error || '无法加载用户数据'}</p>
            <div className="mt-3">
              <Link href="/admin?tab=users" className="text-red-700 dark:text-red-300 font-medium hover:text-red-600 dark:hover:text-red-200">
                返回用户列表
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户详情</h1>
        <Link
          href="/admin?tab=users"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          返回用户列表
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              个人资料
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              用户详细信息和账户状态。
            </p>
          </div>
          <div className="flex items-center">
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
              user.subscription === 'premium' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
            }`}>
              {user.subscription === 'premium' ? '高级会员' : '免费用户'}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              {user.avatarUrl ? (
                <div className="flex-shrink-0 h-20 w-20">
                  <Image
                    className="h-20 w-20 rounded-full"
                    src={user.avatarUrl}
                    alt={user.username}
                    width={80}
                    height={80}
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-2xl text-gray-500 dark:text-gray-400">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="ml-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.username}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                {user.bio && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200 sm:dark:divide-gray-700">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                注册日期
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {user.joinDate}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                订阅状态
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {user.subscription === 'premium' ? (
                  <span>高级会员（到期时间：{user.subscriptionExpiry}）</span>
                ) : (
                  <span>免费用户</span>
                )}
              </dd>
            </div>
            {user.location && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  位置
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  {user.location}
                </dd>
              </div>
            )}
            {user.website && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  网站
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {user.website}
                  </a>
                </dd>
              </div>
            )}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                总下载次数
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {user.totalDownloads}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                最近活动
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {user.lastActive}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 下载历史 */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            下载历史
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            用户下载的笔刷资源。
          </p>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700">
          {downloads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      笔刷名称
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      下载日期
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      价格
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {downloads.map((download) => (
                    <tr key={download.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {download.brushTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {download.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {download.price === '0' ? (
                          <span className="text-green-600 dark:text-green-400">免费</span>
                        ) : (
                          <span>¥{download.price}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
              此用户尚未下载任何笔刷资源。
            </div>
          )}
        </div>
      </div>

      {/* 管理操作 */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            管理操作
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            对此用户执行管理操作。
          </p>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5">
          <div className="flex flex-wrap gap-3">
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              发送消息
            </button>
            
            {user.subscription === 'free' ? (
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 dark:text-purple-100 dark:bg-purple-900 dark:hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                升级为高级会员
              </button>
            ) : (
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:text-yellow-100 dark:bg-yellow-900 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                取消高级会员
              </button>
            )}
            
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-100 dark:bg-red-900 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              禁止账户
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 