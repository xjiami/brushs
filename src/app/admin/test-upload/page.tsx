'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function TestUploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [showStorageHelp, setShowStorageHelp] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setFile(files[0]);
  };

  const testBucket = async (bucketName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = getSupabaseClient();
      const testResult: any = { bucket: bucketName, status: 'testing' };
      
      // 1. 检查是否已登录
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        testResult.status = 'error';
        testResult.message = '用户未登录';
        return testResult;
      }
      
      // 2. 检查存储桶是否存在
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        testResult.status = 'error';
        testResult.message = `列出存储桶失败: ${bucketsError.message}`;
        return testResult;
      }
      
      const bucketExists = buckets.some(b => b.name === bucketName);
      if (!bucketExists) {
        testResult.status = 'error';
        testResult.message = `存储桶 ${bucketName} 不存在`;
        // 设置标志以显示存储桶帮助
        setShowStorageHelp(true);
        return testResult;
      }
      
      testResult.bucketExists = true;
      
      // 3. 如果提供了文件，尝试上传
      if (file) {
        const fileName = `test-${Date.now()}.${file.name.split('.').pop()}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, { upsert: true });
        
        if (uploadError) {
          testResult.status = 'error';
          testResult.message = `上传到 ${bucketName} 失败: ${uploadError.message}`;
          testResult.uploadError = uploadError;
          return testResult;
        }
        
        testResult.uploaded = true;
        testResult.fileName = fileName;
        
        // 获取URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
          
        testResult.url = urlData.publicUrl;
      }
      
      testResult.status = 'success';
      return testResult;
    } catch (err) {
      const testResult: any = { bucket: bucketName, status: 'error' };
      testResult.message = err instanceof Error ? err.message : '未知错误';
      return testResult;
    }
  };

  const handleTestBuckets = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setShowStorageHelp(false);
    
    try {
      // 测试所有相关存储桶，移除public桶
      const bucketsToTest = ['brush-previews', 'brush-files', 'brush-gallery', 'avatars', 'category-images'];
      
      const results = [];
      for (const bucket of bucketsToTest) {
        const result = await testBucket(bucket);
        results.push(result);
      }
      
      setResults(results);
    } catch (err) {
      console.error('测试过程中出错:', err);
      setError(err instanceof Error ? err.message : '测试过程中出错');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Supabase 存储桶测试</h1>
      
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">此页面用于测试各个存储桶的权限设置，帮助诊断上传问题。</p>
      </div>
      
      {showStorageHelp && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-lg font-medium text-blue-800 mb-2">存储桶不存在</h3>
          <p className="text-blue-700 mb-2">
            检测到一个或多个必要的存储桶不存在。这是导致上传失败的常见原因。
          </p>
          <p className="text-blue-700 mb-2">
            作为管理员，您可以使用存储桶管理页面创建所需的存储桶。
          </p>
          <Link 
            href="/admin/storage" 
            className="inline-block mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            前往存储桶管理
          </Link>
        </div>
      )}
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">测试文件 (可选)</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="mt-1 text-sm text-gray-500">选择一个文件进行上传测试</p>
        </div>
        
        <button
          onClick={handleTestBuckets}
          disabled={isLoading}
          className={`px-4 py-2 ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md`}
        >
          {isLoading ? '测试中...' : '测试所有存储桶'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">测试结果</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-md border ${
                  result.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <h3 className="font-medium">存储桶: {result.bucket}</h3>
                <p className="text-sm">
                  状态: {result.status === 'success' ? '✅ 成功' : '❌ 失败'}
                </p>
                {result.message && (
                  <p className="text-sm mt-1">{result.message}</p>
                )}
                {result.uploaded && (
                  <div className="mt-2">
                    <p className="text-sm">文件已上传: {result.fileName}</p>
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      查看文件
                    </a>
                  </div>
                )}
                {result.uploadError && (
                  <details className="mt-2">
                    <summary className="text-sm cursor-pointer">查看详细错误</summary>
                    <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                      {JSON.stringify(result.uploadError, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 