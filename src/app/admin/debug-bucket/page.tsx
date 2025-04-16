'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function DebugBucketPage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createResult, setCreateResult] = useState<string | null>(null);
  const [creatingBucket, setCreatingBucket] = useState(false);
  
  // 加载存储桶列表
  const loadBuckets = async () => {
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
  };
  
  useEffect(() => {
    loadBuckets();
  }, []);
  
  // 创建category-images存储桶
  const createCategoryImagesBucket = async () => {
    try {
      setCreatingBucket(true);
      setCreateResult(null);
      setError(null);
      
      // 方法1：使用API
      const response = await fetch('/admin/api/storage/create-category-bucket');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '通过API创建存储桶失败');
      }
      
      // 方法2：直接使用客户端API
      /*
      const supabase = getSupabaseClient();
      const { error } = await supabase.storage.createBucket('category-images', { 
        public: true 
      });
      
      if (error) {
        throw new Error(`创建存储桶失败: ${error.message}`);
      }
      */
      
      setCreateResult('存储桶创建成功！');
      // 刷新存储桶列表
      await loadBuckets();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建存储桶失败');
      console.error('创建存储桶错误:', err);
    } finally {
      setCreatingBucket(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">存储桶调试工具</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-medium">错误：</p>
          <p>{error}</p>
        </div>
      )}
      
      {createResult && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          <p>{createResult}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">现有存储桶</h2>
        
        {loading ? (
          <p>加载中...</p>
        ) : buckets.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    存储桶名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    公开访问
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {buckets.map((bucket) => (
                  <tr key={bucket.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {bucket.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {bucket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {new Date(bucket.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {bucket.public ? '是' : '否'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>没有找到任何存储桶</p>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">创建 category-images 存储桶</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          点击下面的按钮创建 category-images 存储桶。如果存储桶已存在，操作将被忽略。
        </p>
        
        <button
          onClick={createCategoryImagesBucket}
          disabled={creatingBucket}
          className={`px-4 py-2 rounded-md shadow-sm text-white font-medium ${
            creatingBucket
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {creatingBucket ? '创建中...' : '创建存储桶'}
        </button>
        
        <button
          onClick={loadBuckets}
          disabled={loading}
          className="ml-4 px-4 py-2 rounded-md border border-gray-300 shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? '刷新中...' : '刷新列表'}
        </button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">使用API创建所有必需存储桶</h2>
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          点击下面的按钮使用API创建所有必需的存储桶。
        </p>
        
        <button
          onClick={async () => {
            try {
              setCreatingBucket(true);
              setCreateResult(null);
              setError(null);
              
              const response = await fetch('/admin/api/storage/fix', {
                method: 'POST'
              });
              
              const result = await response.json();
              
              if (!response.ok) {
                throw new Error(result.error || '通过API创建存储桶失败');
              }
              
              setCreateResult(`API结果: ${result.message}, 已创建: ${result.created.join(', ') || '无'}`);
              // 刷新存储桶列表
              await loadBuckets();
            } catch (err) {
              setError(err instanceof Error ? err.message : '创建存储桶失败');
              console.error('创建存储桶错误:', err);
            } finally {
              setCreatingBucket(false);
            }
          }}
          disabled={creatingBucket}
          className={`px-4 py-2 rounded-md shadow-sm text-white font-medium ${
            creatingBucket
              ? 'bg-green-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          }`}
        >
          {creatingBucket ? '创建中...' : '使用API创建所有存储桶'}
        </button>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="font-bold text-yellow-800 mb-2">调试信息</h3>
        <p className="text-yellow-700 mb-2">
          此页面用于调试和确保存储桶正确创建。如果您在上传图片时遇到"Bucket not found"错误，
          请使用此页面创建必要的存储桶。
        </p>
        <p className="text-yellow-700">
          所需的存储桶: brush-files, brush-previews, brush-gallery, avatars, category-images
        </p>
      </div>
    </div>
  );
} 