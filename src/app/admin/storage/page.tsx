'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function StorageManagementPage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newBucketName, setNewBucketName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creatingBucket, setCreatingBucket] = useState(false);
  
  // 加载存储桶列表
  useEffect(() => {
    async function loadBuckets() {
      try {
        setLoading(true);
        setError(null);
        
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          throw new Error(`获取存储桶列表失败: ${error.message}`);
        }
        
        setBuckets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取存储桶列表失败');
        console.error('加载存储桶错误:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadBuckets();
  }, []);
  
  // 创建新的存储桶
  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBucketName.trim()) {
      setCreateError('请输入存储桶名称');
      return;
    }
    
    try {
      setCreatingBucket(true);
      setCreateError(null);
      setCreateSuccess(null);
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.storage.createBucket(
        newBucketName.trim(), 
        { public: isPublic }
      );
      
      if (error) {
        throw new Error(`创建存储桶失败: ${error.message}`);
      }
      
      // 刷新存储桶列表
      const { data: updatedBuckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('刷新存储桶列表失败:', listError);
      } else {
        setBuckets(updatedBuckets || []);
      }
      
      setCreateSuccess(`存储桶 ${newBucketName} 创建成功!`);
      setNewBucketName('');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : '创建存储桶失败');
      console.error('创建存储桶错误:', err);
    } finally {
      setCreatingBucket(false);
    }
  };
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">存储桶管理</h1>
        <Link
          href="/admin"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          返回管理面板
        </Link>
      </div>
      
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <h2 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">存储桶说明</h2>
        <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
          网站需要以下存储桶才能正常运行:
        </p>
        <ul className="mt-2 list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1 ml-2">
          <li><strong>brush-files</strong> - 存储笔刷文件</li>
          <li><strong>brush-previews</strong> - 存储笔刷预览图</li>
          <li><strong>brush-gallery</strong> - 存储笔刷画廊图片</li>
          <li><strong>avatars</strong> - 存储用户头像</li>
          <li><strong>category-images</strong> - 存储分类图片</li>
        </ul>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      
      {/* 存储桶列表 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">现有存储桶</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        ) : buckets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">没有找到存储桶</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">公开访问</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {buckets.map((bucket) => (
                  <tr key={bucket.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{bucket.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{bucket.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(bucket.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {bucket.public ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">公开</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">私有</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 创建新存储桶表单 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">创建新存储桶</h3>
        </div>
        
        <div className="p-6">
          {createSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-300">
              {createSuccess}
            </div>
          )}
          
          {createError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
              {createError}
            </div>
          )}
          
          <form onSubmit={handleCreateBucket} className="space-y-4">
            <div>
              <label htmlFor="bucketName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                存储桶名称
              </label>
              <input
                type="text"
                id="bucketName"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="例如: category-images"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                存储桶名称只能包含小写字母、数字和连字符
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                公开访问 (推荐)
              </label>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={creatingBucket}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  creatingBucket
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {creatingBucket ? '创建中...' : '创建存储桶'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* 快速创建按钮 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">快速创建必要存储桶</h3>
        </div>
        
        <div className="p-6">
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            如果缺少必要的存储桶，可以使用下面的按钮快速创建所有必要的存储桶。
          </p>
          
          <button
            onClick={async () => {
              try {
                setCreatingBucket(true);
                setCreateError(null);
                
                const supabase = getSupabaseClient();
                const requiredBuckets = ['brush-files', 'brush-previews', 'brush-gallery', 'avatars', 'category-images'];
                const existingBuckets = buckets.map(b => b.name);
                
                // 找出缺少的存储桶
                const missingBuckets = requiredBuckets.filter(name => !existingBuckets.includes(name));
                
                if (missingBuckets.length === 0) {
                  setCreateSuccess('所有必要的存储桶已存在！');
                  return;
                }
                
                // 创建缺少的存储桶
                let createdCount = 0;
                for (const bucketName of missingBuckets) {
                  const { error } = await supabase.storage.createBucket(bucketName, { public: true });
                  if (!error) createdCount++;
                }
                
                // 刷新存储桶列表
                const { data: updatedBuckets } = await supabase.storage.listBuckets();
                setBuckets(updatedBuckets || []);
                
                setCreateSuccess(`成功创建了 ${createdCount} 个存储桶！`);
              } catch (err) {
                setCreateError(err instanceof Error ? err.message : '创建存储桶失败');
              } finally {
                setCreatingBucket(false);
              }
            }}
            disabled={creatingBucket}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              creatingBucket
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {creatingBucket ? '创建中...' : '一键创建所有必要存储桶'}
          </button>
        </div>
      </div>
    </div>
  );
} 