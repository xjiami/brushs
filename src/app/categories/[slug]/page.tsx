'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getCategoryBySlug, getBrushes } from '@/lib/supabase-client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Category } from '@/types/category';

export default function CategoryDetailPage() {
  // 使用客户端路由钩子
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<any>(null);
  const [brushes, setBrushes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 获取分类信息
        const categoryData = await getCategoryBySlug(slug);
        setCategory(categoryData);
        
        // 这是修复的关键部分 - 正确使用slug参数
        // getBrushes函数需要category作为string, 而不是null
        const brushesData = await getBrushes({ 
          category: slug 
        });
        
        console.log('Category data:', categoryData);
        console.log('Brushes data:', brushesData);
        
        setBrushes(brushesData);
      } catch (err) {
        console.error('Failed to load category data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [slug]);
  
  // 加载状态
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 mb-6">
          <p>Error loading category data, please try again later</p>
        </div>
        <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline">
          Return to all categories
        </Link>
      </div>
    );
  }
  
  // 内容展示
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/categories" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
          ← Back to all categories
        </Link>
        
        <div className="flex flex-col md:flex-row items-start gap-6">
          {category?.image_url && (
            <div className="w-full md:w-1/4 rounded-lg overflow-hidden">
              <Image 
                src={category.image_url} 
                alt={category.name} 
                width={300} 
                height={300}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{category?.name}</h1>
            
            {category?.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-4">{category.description}</p>
            )}
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {brushes.length} brushes in this category
            </div>
          </div>
        </div>
      </div>
      
      {brushes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {brushes.map((brush) => (
            <Link 
              href={`/brushes/${brush.id}`} 
              key={brush.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image 
                  src={brush.preview_image_url || '/images/placeholder.jpg'} 
                  alt={brush.title}
                  fill
                  className="object-cover"
                />
                {brush.is_free && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Free</span>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">{brush.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{brush.description}</p>
                
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {brush.download_count} downloads
                  </span>
                  {!brush.is_free && (
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      ${brush.price?.toFixed(2) || '--'}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No brushes available in this category</p>
        </div>
      )}
    </div>
  );
} 