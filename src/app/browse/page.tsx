'use client';

import { useState, useEffect, useRef, useCallback, Suspense, useMemo } from 'react';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import BrushCard from '../../../components/BrushCard';
import AdvancedSearch from '../../../components/AdvancedSearch';
import { getBrushes, getCategories } from '../../../src/lib/supabase-client';
import { PaginationGroup } from '../../../components/common/PageButton';

// Number of items per page
const ITEMS_PER_PAGE = 12;

// Common brush tags for demonstration
const BRUSH_TAGS = [
  'Watercolor', 'Sketch', 'Ink', 'Texture', 'Portrait', 
  'Calligraphy', 'Painting', 'Abstract', 'Concept Art', 'Comic'
];

export default function BrowsePage() {
  const urlSearchParams = useSearchParams();
  
  const category = urlSearchParams.get('category') || undefined;
  const free = urlSearchParams.get('free') || undefined;
  const sort = urlSearchParams.get('sort') || 'latest';
  const q = urlSearchParams.get('q') || '';
  const page = urlSearchParams.get('page') || '1';
  const tags = urlSearchParams.get('tags') || undefined;
  const compatibility = urlSearchParams.get('compatibility') || undefined;
  const minPrice = urlSearchParams.get('minPrice') || undefined;
  const maxPrice = urlSearchParams.get('maxPrice') || undefined;
  const minRating = urlSearchParams.get('minRating') || undefined;
  
  // 使用useMemo来缓存派生值，避免每次渲染时重新计算
  const queryParams = useMemo(() => {
    const currentPage = parseInt(page, 10) || 1;
    const pageSize = 12;
    const offset = (currentPage - 1) * pageSize;
    
    let sortBy = 'created_at';
    if (sort === 'downloads') sortBy = 'download_count';
    else if (sort === 'name') sortBy = 'title';
    else if (sort === 'rating') sortBy = 'average_rating';
    
    const isFree = free === 'true' ? true : free === 'false' ? false : null;
    
    // Parse additional filter parameters
    const tagsList = tags ? tags.split(',') : [];
    const compatibilityList = compatibility ? compatibility.split(',') : [];
    const minPriceValue = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceValue = maxPrice ? parseFloat(maxPrice) : undefined;
    const minRatingValue = minRating ? parseInt(minRating) : undefined;
    
    return {
      currentPage,
      pageSize,
      offset,
      sortBy,
      isFree,
      tagsList,
      compatibilityList,
      minPriceValue,
      maxPriceValue,
      minRatingValue
    };
  }, [category, free, sort, q, page, tags, compatibility, minPrice, maxPrice, minRating]);
  
  // 使用状态管理数据
  const [brushes, setBrushes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 获取数据的副作用 - 使用urlSearchParams.toString()作为依赖项
  const searchParamsString = urlSearchParams.toString();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取笔刷数据
        const brushData = await getBrushes({
          category: category as any,
          isFree: queryParams.isFree as any,
          sortBy: queryParams.sortBy,
          searchQuery: q,
          limit: queryParams.pageSize,
          offset: queryParams.offset,
          tags: queryParams.tagsList as any,
          compatibility: queryParams.compatibilityList as any,
          minPrice: queryParams.minPriceValue as any,
          maxPrice: queryParams.maxPriceValue as any,
          minRating: queryParams.minRatingValue as any
        });
        
        // 获取分类数据
        const categoryData = await getCategories();
        
        setBrushes(Array.isArray(brushData) ? brushData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error('获取数据出错:', error);
        // 设置空数组作为默认值
        setBrushes([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [searchParamsString, queryParams]); // 只依赖于URL参数的字符串表示和缓存的查询参数
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Browse Brushes</h1>
        
        {/* Advanced Search Component */}
        <AdvancedSearch tags={BRUSH_TAGS} />
        
        {/* Categories Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link 
            href="/browse" 
            className={`px-4 py-2 rounded-full text-sm ${!category ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm ${category === cat.slug ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
            
        {/* Basic Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Price Filter */}
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300 mr-2">Price:</span>
            <Link 
              href={`/browse?category=${category || ''}&sort=${sort || ''}&q=${q || ''}`} 
              className={`px-3 py-1 rounded-md text-sm ${!free ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              All
            </Link>
            <Link 
              href={`/browse?category=${category || ''}&free=true&sort=${sort || ''}&q=${q || ''}`} 
              className={`px-3 py-1 rounded-md text-sm ml-2 ${free === 'true' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Free
            </Link>
            <Link 
              href={`/browse?category=${category || ''}&free=false&sort=${sort || ''}&q=${q || ''}`} 
              className={`px-3 py-1 rounded-md text-sm ml-2 ${free === 'false' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Paid
            </Link>
          </div>
            
          {/* Sort Options */}
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300 mr-2">Sort by:</span>
            <Link 
              href={`/browse?category=${category || ''}&free=${free || ''}&q=${q || ''}&sort=latest`} 
              className={`px-3 py-1 rounded-md text-sm ${sort === 'latest' || !sort ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Latest
            </Link>
            <Link 
              href={`/browse?category=${category || ''}&free=${free || ''}&q=${q || ''}&sort=downloads`} 
              className={`px-3 py-1 rounded-md text-sm ml-2 ${sort === 'downloads' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Downloads
            </Link>
            <Link 
              href={`/browse?category=${category || ''}&free=${free || ''}&q=${q || ''}&sort=name`} 
              className={`px-3 py-1 rounded-md text-sm ml-2 ${sort === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Name
            </Link>
            <Link 
              href={`/browse?category=${category || ''}&free=${free || ''}&q=${q || ''}&sort=rating`} 
              className={`px-3 py-1 rounded-md text-sm ml-2 ${sort === 'rating' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Rating
            </Link>
          </div>
        </div>
      </div>
      
      {/* Brush Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="ml-3 text-gray-600 dark:text-gray-400">Loading brushes...</p>
        </div>
      ) : brushes.length > 0 ? (
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
                
                {/* Rating Display */}
                {brush.average_rating > 0 && (
                  <div className="mt-2 flex items-center">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(brush.average_rating)
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({brush.rating_count || 0})
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No matching brushes found</p>
        </div>
      )}
      
      {/* Pagination */}
      <div className="mt-8">
        {brushes.length > 0 && (
          <PaginationGroup
            currentPage={queryParams.currentPage}
            totalPages={Math.ceil(brushes.length * 3 / ITEMS_PER_PAGE)} // 假设总页数是当前数据的3倍
            basePath="/browse"
            queryParams={{
              ...(category ? { category } : {}),
              ...(free ? { free } : {}),
              ...(sort ? { sort } : {}),
              ...(q ? { q } : {}),
              ...(tags ? { tags } : {}),
              ...(compatibility ? { compatibility } : {}),
              ...(minPrice ? { minPrice } : {}),
              ...(maxPrice ? { maxPrice } : {}),
              ...(minRating ? { minRating } : {})
            }}
            variant="outline"
            size="md"
          />
        )}
      </div>
    </div>
  );
} 