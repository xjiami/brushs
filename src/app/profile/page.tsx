'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../../context/SupabaseContext';

// 模拟用户数据，实际项目中应该从Supabase获取
const mockUser = {
  id: '123',
  username: '张艺术家',
  email: 'artist@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
  subscription: 'premium',
  subscriptionExpiry: '2024-12-31',
};

// 模拟已购买/下载的笔刷
const mockDownloads = [
  {
    id: '1',
    title: '水彩效果笔刷套装',
    imageUrl: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    downloadDate: '2023-10-15',
  },
  {
    id: '2',
    title: '素描铅笔套装',
    imageUrl: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    downloadDate: '2023-09-28',
  },
  {
    id: '3',
    title: '油画质感笔刷集',
    imageUrl: 'https://images.unsplash.com/photo-1579965342575-16428a7c8881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    downloadDate: '2023-09-10',
  },
];

export default function ProfilePage() {
  const { user, isLoading, updateUserProfile, getUserProfile, updatePassword, uploadAvatar, signOut } = useSupabase();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'downloads' | 'settings'>('downloads');
  const [downloads, setDownloads] = useState<any[]>([]);
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    avatar_url: '',
    subscription: 'free' as 'free' | 'premium',
    subscriptionExpiry: '',
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchUserData();
    }
  }, [user, isLoading, router]);
  
  const fetchUserData = async () => {
    try {
      const { data, error } = await getUserProfile();
      
      if (error) throw error;
      
      if (data) {
        setProfileData({
          username: data.username || mockUser.username,
          email: user?.email || mockUser.email,
          avatar_url: data.avatar_url || mockUser.avatarUrl,
          subscription: data.subscription_status || 'free',
          subscriptionExpiry: data.subscription_expiry || '',
        });
        setDownloads(mockDownloads);
      } else {
        // 如果没有数据，使用模拟数据
        setProfileData({
          username: mockUser.username,
          email: mockUser.email,
          avatar_url: mockUser.avatarUrl,
          subscription: mockUser.subscription as 'free' | 'premium',
          subscriptionExpiry: mockUser.subscriptionExpiry,
        });
        setDownloads(mockDownloads);
      }
    } catch (error) {
      console.error('获取用户数据时出错:', error);
      setError('获取用户数据时出错。请刷新页面重试。');
      
      // 错误时使用模拟数据
      setProfileData({
        username: mockUser.username,
        email: mockUser.email,
        avatar_url: mockUser.avatarUrl,
        subscription: mockUser.subscription as 'free' | 'premium',
        subscriptionExpiry: mockUser.subscriptionExpiry,
      });
      setDownloads(mockDownloads);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };
  
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setProfileLoading(true);
    
    try {
      // 更新用户资料
      const updates = {
        username: profileData.username,
        updated_at: new Date(),
      };
      
      const { error: updateError } = await updateUserProfile(updates);
      if (updateError) throw updateError;
      
      // 如果选择了新头像，上传它
      if (selectedImage) {
        const { error: uploadError, url } = await uploadAvatar(selectedImage);
        if (uploadError) throw uploadError;
        
        if (url) {
          setProfileData(prev => ({ ...prev, avatar_url: url }));
        }
      }
      
      setSuccessMessage('个人资料已成功更新！');
      
    } catch (error) {
      console.error('更新个人资料时出错:', error);
      setError('更新个人资料时出错。请重试。');
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setPasswordLoading(true);
    
    try {
      // 基本验证
      if (newPassword !== confirmPassword) {
        throw new Error('两次输入的密码不匹配');
      }
      
      if (newPassword.length < 6) {
        throw new Error('密码必须至少包含6个字符');
      }
      
      // 更新密码
      const { error: passwordError } = await updatePassword(newPassword);
      if (passwordError) throw passwordError;
      
      setSuccessMessage('密码已成功更新！');
      
      // 清空密码字段
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error) {
      console.error('更新密码时出错:', error);
      setError(error instanceof Error ? error.message : '更新密码时出错。请重试。');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('退出登录时出错:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <p className="mt-2">加载用户数据...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">个人中心</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <Image
                src={profileData.avatar_url}
                alt={profileData.username}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profileData.username}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profileData.email}</p>
            </div>
          </div>
          <div className="sm:ml-auto">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              profileData.subscription === 'premium' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {profileData.subscription === 'premium' ? (
                <>
                  <span>高级会员</span>
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    (到期时间: {profileData.subscriptionExpiry})
                  </span>
                </>
              ) : '免费会员'}
            </div>
          </div>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'downloads'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            我的笔刷
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            账户设置
          </button>
        </nav>
      </div>

      {/* 我的笔刷 */}
      {activeTab === 'downloads' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">已下载的笔刷</h3>
            <Link
              href="/browse"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              浏览更多笔刷
            </Link>
          </div>

          {downloads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloads.map((brush) => (
                <div key={brush.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="relative h-40 w-full">
                    <Image
                      src={brush.imageUrl}
                      alt={brush.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{brush.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">下载日期: {brush.downloadDate}</p>
                    <div className="flex justify-between">
                      <Link
                        href={`/brushes/${brush.id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        查看详情
                      </Link>
                      <button className="text-sm font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300">
                        重新下载
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">您还没有下载任何笔刷</p>
              <Link
                href="/browse"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors inline-block"
              >
                浏览笔刷
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 账户设置 */}
      {activeTab === 'settings' && (
        <div className="space-y-10">
          {successMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-300">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          
          {/* 个人资料设置 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">个人资料</h3>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <Image
                      src={selectedImage ? URL.createObjectURL(selectedImage) : profileData.avatar_url}
                      alt={profileData.username}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-md text-sm">
                    更改头像
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      用户名
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      电子邮箱
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      disabled
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm bg-gray-50 dark:bg-gray-800"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      邮箱地址无法直接修改，如需更改请联系客服
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                    profileLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {profileLoading ? '保存中...' : '保存个人资料'}
                </button>
              </div>
            </form>
          </div>

          {/* 修改密码 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">修改密码</h3>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  当前密码
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  新密码
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  确认新密码
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                    passwordLoading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {passwordLoading ? '更新中...' : '更新密码'}
                </button>
              </div>
            </form>
          </div>

          {/* 订阅管理 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">订阅管理</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  当前订阅计划: <span className="font-medium">{profileData.subscription === 'premium' ? '高级会员' : '免费会员'}</span>
                </p>
                {profileData.subscription === 'premium' && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    到期时间: <span className="font-medium">{profileData.subscriptionExpiry}</span>
                  </p>
                )}
              </div>

              {profileData.subscription === 'premium' ? (
                <div className="space-y-4">
                  <button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    管理订阅
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    您可以在此管理您的订阅，包括取消自动续费或更改订阅计划
                  </p>
                </div>
              ) : (
                <div>
                  <Link
                    href="/plans"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors inline-block text-sm font-medium"
                  >
                    升级到高级会员
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 账户操作 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">账户操作</h3>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                退出登录
              </button>
              
              <button
                className="px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                删除账户
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                删除账户将永久移除您的所有数据，此操作无法撤销
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 