'use client';

import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '@/lib/supabase-client';
import { getSupabaseClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function DebugPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<any[]>([]);
  const [bucketsLoading, setBucketsLoading] = useState(true);
  const [bucketsError, setBucketsError] = useState<string | null>(null);

  // 所需存储桶列表
  const requiredBuckets = ['brush-files', 'brush-previews', 'brush-gallery', 'avatars', 'category-images'];

  useEffect(() => {
    async function runDiagnostics() {
      try {
        setLoading(true);
        const result = await checkSupabaseConnection();
        setResults(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : '检查失败');
        console.error('诊断错误:', err);
      } finally {
        setLoading(false);
      }
    }

    async function checkBuckets() {
      try {
        setBucketsLoading(true);
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.storage.listBuckets();
        
        if (error) {
          throw new Error(error.message);
        }
        
        setBuckets(data || []);
      } catch (err) {
        setBucketsError(err instanceof Error ? err.message : '获取存储桶失败');
        console.error('存储桶检查错误:', err);
      } finally {
        setBucketsLoading(false);
      }
    }

    runDiagnostics();
    checkBuckets();
  }, []);

  const handleRunChecks = async () => {
    await checkSupabaseConnection();
    alert('请查看浏览器控制台以获取详细诊断信息');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Supabase 连接诊断</h1>
      
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <span>正在检查连接...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-300 mb-4">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-md text-green-700 dark:text-green-300">
            诊断信息已输出到控制台。按 F12 查看控制台日志。
          </div>
          
          <div>
            <p className="mb-2">控制台检查要点:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>检查环境变量是否已正确设置</li>
              <li>检查数据库连接是否成功</li>
              <li>检查是否有表结构错误</li>
              <li>检查身份验证状态</li>
            </ul>
          </div>
          
          {/* 存储桶检查部分 */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">存储桶状态检查</h2>
            
            {bucketsLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                <span>正在检查存储桶...</span>
              </div>
            ) : bucketsError ? (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-700 dark:text-red-300 mb-4">
                存储桶检查失败: {bucketsError}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">现有存储桶</h3>
                  {buckets.length === 0 ? (
                    <p className="text-yellow-600 dark:text-yellow-400">未找到任何存储桶</p>
                  ) : (
                    <ul className="space-y-1">
                      {buckets.map(bucket => (
                        <li key={bucket.id} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {bucket.name} 
                          <span className="ml-2 text-xs text-gray-500">
                            ({bucket.public ? '公开' : '私有'})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">必要的存储桶</h3>
                  <ul className="space-y-1">
                    {requiredBuckets.map(bucketName => {
                      const exists = buckets.some(b => b.name === bucketName);
                      return (
                        <li key={bucketName} className="flex items-center">
                          {exists ? (
                            <span className="text-green-500 mr-2">✓</span>
                          ) : (
                            <span className="text-red-500 mr-2">✗</span>
                          )}
                          {bucketName}
                          {!exists && (
                            <span className="ml-2 text-xs text-red-500">
                              (缺失)
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                {!requiredBuckets.every(name => buckets.some(b => b.name === name)) && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
                    <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                      检测到缺少必要的存储桶，这可能会导致上传功能失败
                    </p>
                    <Link
                      href="/admin/storage"
                      className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      前往存储桶管理页面
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4">常见问题解决方案</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">400 错误</h3>
                <p className="text-gray-600 dark:text-gray-400 ml-4">
                  通常是因为请求格式不正确或表不存在。检查 SQL 查询和表名。
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">401 错误</h3>
                <p className="text-gray-600 dark:text-gray-400 ml-4">
                  API 密钥无效或已过期。检查环境变量中的 API 密钥。
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">表不存在错误</h3>
                <p className="text-gray-600 dark:text-gray-400 ml-4">
                  确保已正确创建数据库表。请在 Supabase 仪表板中检查。
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">存储桶不存在错误</h3>
                <p className="text-gray-600 dark:text-gray-400 ml-4">
                  确保已创建所有必要的存储桶。可以使用<Link href="/admin/storage" className="text-blue-600 hover:underline">存储桶管理</Link>页面进行创建。
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleRunChecks}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            运行连接检查
          </button>
        </div>
      )}
    </div>
  );
} 