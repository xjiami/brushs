'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getBrushById, recordDownload } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import CommentSection from '@/components/CommentSection';
import RatingComponent from '@/components/RatingComponent';
import { useSupabase } from '../../../../context/SupabaseContext';

interface Brush {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  imageUrl?: string;
  preview_image_url?: string;
  main_image?: string;
  category: string;
  category_id: string;
  creator_id: string;
  creator_name: string;
  is_featured: boolean;
  is_free: boolean;
  price?: number;
  download_count: number;
  file_size?: string;
  compatibility?: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  average_rating?: number;
  rating_count?: number;
  gallery_images?: string[];
  download_url?: string;
  file_url?: string;
  related_brushes?: RelatedBrush[];
  related_brush_ids?: string[];
}

interface RelatedBrush {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  preview_image_url?: string;
  main_image?: string;
}

export default function BrushDetailPage() {
  // 使用useParams钩子获取路由参数
  const params = useParams();
  const brushId = params.id as string;
  const router = useRouter();
  const { user, profile } = useAuth();
  const { supabase } = useSupabase();
  const [brush, setBrush] = useState<Brush | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBrush = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        console.log('Fetching brush data, ID:', brushId);
        
        // 直接调用getBrushById函数
        const brushData = await getBrushById(brushId);
        
        console.log('Retrieved brush data:', brushData);
        
        if (brushData) {
          // 处理数据
          const processedBrushData: Brush = {
            ...brushData,
            // 确保主图片路径一致
            main_image: brushData.main_image || brushData.preview_image_url || brushData.imageUrl
          };
          setBrush(processedBrushData);
          
          // 设置初始选中的图片
          const mainImage = processedBrushData.main_image || processedBrushData.preview_image_url || processedBrushData.imageUrl;
          if (mainImage) {
            setSelectedImage(mainImage);
          }
        } else {
          console.error('Brush data is empty');
          setError('Brush data not found');
        }
      } catch (err: any) {
        console.error('Failed to retrieve brush data:', err);
        setError(err.message || 'Error retrieving brush data');
      } finally {
        setIsLoading(false);
      }
    };

    if (brushId) {
      fetchBrush();
    }
  }, [brushId]);

  const handleDownload = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!brush) {
      alert('Error loading brush data, please refresh the page and try again');
      return;
    }

    // 检查是否为免费笔刷或用户是否已订阅
    const isPaidUser = profile?.subscription_status === 'active' || profile?.subscription_status === 'premium';
    const canDownload = brush.is_free || isPaidUser;
    
    if (!canDownload) {
      // 未订阅用户引导至订阅页面
      router.push('/plans');
      return;
    }

    try {
      // 检查是否有下载链接
      const downloadLink = brush.download_url || brush.file_url;
      if (downloadLink) {
        // 记录下载
        if (user.id) {
          try {
            await recordDownload(brushId, user.id);
          } catch (err) {
            console.error('Failed to record download, but download will continue:', err);
          }
        }
        
        // 直接在新标签页打开下载链接，无需确认
        window.open(downloadLink, '_blank');
      } else {
        throw new Error('Download link unavailable');
      }
    } catch (err) {
      console.error('Error during download:', err);
      alert('Invalid download link, please contact customer service for assistance');
    }
  };

  const handleRatingChange = (newAverage: number, newTotal: number) => {
    if (brush) {
      setBrush({
        ...brush,
        average_rating: newAverage,
        rating_count: newTotal
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !brush) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Brush Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Sorry, the brush you requested does not exist or has been removed.
        </p>
        <Link
          href="/browse"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          Browse All Brushes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 笔刷标题和基本信息 */}
      <div>
        <Link
          href="/browse"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center mb-4"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Browse
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{brush?.title}</h1>
        <div className="flex items-center mt-2 flex-wrap gap-2">
          {brush?.category && (
            <Link
              href={`/browse?category=${brush.category}`}
              className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm font-medium"
            >
              {brush.category}
            </Link>
          )}
          {brush?.creator_name && (
            <span className="text-gray-500 dark:text-gray-400 text-sm mx-2">
              Creator:
              <Link href={`/creators/${brush.creator_id}`} className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                {brush.creator_name}
              </Link>
            </span>
          )}
          {brush?.average_rating && (
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                {brush.average_rating} ({brush.rating_count || 0} ratings)
              </span>
            </div>
          )}
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Downloads: {brush?.download_count?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      {/* 笔刷图片和详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧图片展示 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative h-80 sm:h-96 md:h-[500px] w-full rounded-xl overflow-hidden">
            <Image
              src={selectedImage || '/images/placeholder.jpg'}
              alt={brush?.title || 'Brush image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          {/* 图片缩略图选择器 */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedImage(brush?.main_image || '')}
              className={`relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                selectedImage === brush?.main_image ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <Image
                src={brush?.main_image || '/images/placeholder.jpg'}
                alt="Main image"
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
            {brush?.gallery_images?.map((img: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                  selectedImage === img ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <Image
                  src={img}
                  alt={`Example image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 右侧信息和下载 */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
            <div className="mb-4">
              {brush?.is_free ? (
                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full">
                  Free
                </span>
              ) : (
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">¥{brush?.price?.toFixed(2) || '0.00'}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">or with Premium Subscription</span>
                </div>
              )}
            </div>
            
            {/* 根据用户类型和笔刷类型显示不同的下载选项 */}
            {!user ? (
              // 未登录用户
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Login to Download
              </button>
            ) : brush?.is_free ? (
              // 免费笔刷：所有用户都可以下载，并直接显示下载链接
              <div>
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Download
                </button>
                
                {(brush?.download_url || brush?.file_url) && (
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Download Link:</p>
                    <a 
                      href={brush.download_url || brush.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 dark:text-blue-400 break-all hover:underline"
                    >
                      {brush.download_url || brush.file_url}
                    </a>
                  </div>
                )}
                
                {/* 免费用户提示升级 */}
                {user && !(profile?.subscription_status === 'active' || profile?.subscription_status === 'premium') && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                          Upgrade to Premium
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Premium users get access to more features and brush resources.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : profile?.subscription_status === 'active' || profile?.subscription_status === 'premium' ? (
              // 付费笔刷，付费用户：显示下载按钮，并且可以显示下载链接
              <div>
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-2"
                >
                  Download
                </button>
                {(brush?.download_url || brush?.file_url) && (
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Download Link:</p>
                    <a 
                      href={brush.download_url || brush.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-600 dark:text-blue-400 break-all hover:underline"
                    >
                      {brush.download_url || brush.file_url}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              // 付费笔刷，免费用户：显示订阅按钮和提示信息
              <div>
                <Link
                  href="/plans"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Subscribe to Download
                </Link>
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">This brush requires subscription</p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                        Become a premium user to download all premium brush resources.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>File Size:</span>
                <span className="font-medium">{brush?.file_size || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span>Compatibility:</span>
                <span className="font-medium">{brush?.compatibility || 'Procreate 5.0+'}</span>
              </div>
              <div className="flex justify-between">
                <span>Release Date:</span>
                <span className="font-medium">{brush?.created_at ? new Date(brush.created_at).toLocaleDateString('en-US') : 'Unknown'}</span>
              </div>
              {brush?.updated_at && (
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium">{new Date(brush.updated_at).toLocaleDateString('en-US')}</span>
                </div>
              )}
            </div>
            
            {/* 评分组件 */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Rate this Brush</h3>
              <RatingComponent 
                brushId={brushId} 
                initialRating={brush?.average_rating || 0}
                totalRatings={brush?.rating_count || 0}
                onRatingChange={handleRatingChange}
              />
            </div>
          </div>
          
          {brush?.tags && brush?.tags.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {brush.tags.map((tag: string, index: number) => (
                  <Link
                    key={index}
                    href={`/browse?tag=${tag}`}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 详细描述 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Brush Description</h2>
        <div className="prose dark:prose-invert max-w-none">
          {brush?.long_description ? (
            brush.long_description.split('\n\n').map((paragraph: string, index: number) => (
              <p key={index} className="mb-4 text-gray-700 dark:text-gray-300">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="mb-4 text-gray-700 dark:text-gray-300">{brush?.description}</p>
          )}
        </div>
      </div>

      {/* 相关笔刷 - 这部分需要实现获取相关笔刷数据的功能 */}
      {brush?.related_brush_ids && brush?.related_brush_ids.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Related Brushes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {brush?.related_brushes?.map((relatedBrush: any) => (
              <Link
                key={relatedBrush.id}
                href={`/brushes/${relatedBrush.id}`}
                className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={relatedBrush.imageUrl || relatedBrush.main_image || relatedBrush.preview_image_url || '/images/placeholder.jpg'}
                    alt={relatedBrush.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {relatedBrush.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {relatedBrush.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 评论部分 */}
      {brush && <CommentSection brushId={brush.id} />}

      {/* 登录提示模态框 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Login Required</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please login or subscribe to download this brush.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/plans"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Subscribe
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-center font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 