'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../../context/SupabaseContext';

// 模拟下载数据，实际项目中应该从Supabase获取
const mockDownloads = [
  {
    id: '1',
    brush_id: '1',
    download_date: '2023-12-01',
    brushes: {
      id: '1',
      title: '水彩效果笔刷套装',
      preview_image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    }
  },
  {
    id: '2',
    brush_id: '2',
    download_date: '2023-11-15',
    brushes: {
      id: '2',
      title: '素描铅笔套装',
      preview_image_url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    }
  },
  {
    id: '3',
    brush_id: '3',
    download_date: '2023-10-28',
    brushes: {
      id: '3',
      title: '油画质感笔刷集',
      preview_image_url: 'https://images.unsplash.com/photo-1579965342575-16428a7c8881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    }
  },
];

export default function DownloadsPage() {
  const { user, isLoading, getUserDownloads } = useSupabase();
  const router = useRouter();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      fetchDownloads();
    }
  }, [user, isLoading, router]);
  
  const fetchDownloads = async () => {
    try {
      setPageLoading(true);
      
      const { data, error } = await getUserDownloads();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setDownloads(data);
      } else {
        // 如果没有数据或数组为空，使用模拟数据
        setDownloads(mockDownloads);
      }
    } catch (error) {
      console.error('获取下载记录时出错:', error);
      setError('获取下载记录时出错。请刷新页面重试。');
      
      // 错误时使用模拟数据
      setDownloads(mockDownloads);
    } finally {
      setPageLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status">
            <span className="visually-hidden">加载中...</span>
          </div>
          <p className="mt-2">加载下载记录...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">我的下载</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {downloads.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            暂无下载记录
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            您尚未下载任何笔刷。浏览我们的笔刷库，开始您的创作之旅。
          </p>
          <Link href="/browse" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">
            浏览笔刷
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              最近下载的笔刷
            </h2>
          </div>
          
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {downloads.map((download) => (
              <li key={download.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-32 sm:h-24 sm:w-32 rounded-md overflow-hidden mb-4 sm:mb-0">
                    <Image
                      src={download.brushes.preview_image_url}
                      alt={download.brushes.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="sm:ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        <Link href={`/brushes/${download.brushes.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {download.brushes.title}
                        </Link>
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(download.download_date)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      下载日期: {formatDate(download.download_date)}
                    </p>
                    <div className="mt-4 flex items-center">
                      <Link 
                        href={`/brushes/${download.brushes.id}`} 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        查看详情
                      </Link>
                      <span className="mx-2 text-gray-300 dark:text-gray-600">|</span>
                      <Link 
                        href={`/brushes/${download.brushes.id}?download=true`} 
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        重新下载
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 