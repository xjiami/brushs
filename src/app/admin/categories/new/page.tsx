'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { saveCategory } from '@/lib/supabase-client';

export default function NewCategoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showBucketFix, setShowBucketFix] = useState(false);
  const [fixingBucket, setFixingBucket] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
    image: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 当名称改变时，自动生成slug
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFormData(prev => ({
      ...prev,
      image: files[0]
    }));
    
    // 创建预览URL
    const objectUrl = URL.createObjectURL(files[0]);
    setPreviewUrl(objectUrl);
  };

  const createMissingBucket = async () => {
    try {
      setFixingBucket(true);
      
      // 使用新的简化API来创建category-images存储桶
      const response = await fetch('/admin/api/storage/create-category-bucket', {
        method: 'GET'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '创建存储桶失败');
      }
      
      if (result.success) {
        if (result.created) {
          setShowBucketFix(false);
          setError(prev => prev + '\n\n存储桶已成功创建，请重试上传。');
        } else {
          // 存储桶已存在但可能有其他问题
          setError(prev => prev + '\n\n存储桶已存在，但可能没有正确配置。请联系管理员检查bucket权限设置。');
        }
      } else {
        throw new Error(result.message || '操作未成功完成');
      }
    } catch (err) {
      setError(prev => prev + '\n\n' + (err instanceof Error ? err.message : '修复存储桶失败'));
    } finally {
      setFixingBucket(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSaveSuccess(false);
    setShowBucketFix(false);

    try {
      // 基本表单验证
      if (!formData.name || !formData.slug) {
        throw new Error('请填写分类名称和标识');
      }

      if (formData.slug !== formData.slug.toLowerCase()) {
        throw new Error('URL标识必须全部为小写字母');
      }

      if (/[^a-z0-9\-]/.test(formData.slug)) {
        throw new Error('URL标识只能包含小写字母、数字和连字符');
      }

      if (!formData.description) {
        throw new Error('请填写分类描述');
      }

      // 调用API保存分类
      console.log('开始保存分类...');
      
      // 可选图片上传
      const imageToUpload = formData.image;
      if (!imageToUpload) {
        console.log('未选择图片，将使用默认图片');
      }

      // 尝试保存
      const result = await saveCategory(
        {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          displayOrder: formData.displayOrder
        },
        imageToUpload || undefined
      );
      
      console.log('分类保存成功:', result);
      setSaveSuccess(true);
      
      // 延迟跳转，给用户展示成功消息
      setTimeout(() => {
        router.push('/admin?tab=categories');
      }, 1500);
      
    } catch (err) {
      console.error('创建分类失败:', err);
      let errorMessage = '创建分类失败';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // 检查是否为存储桶不存在错误
        if (errorMessage.includes('Bucket not found') || 
            errorMessage.includes('category-images') || 
            errorMessage.includes('存储桶') || 
            errorMessage.includes('bucket')) {
          setShowBucketFix(true);
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
        
        // 检查字符串错误
        if (errorMessage.includes('Bucket not found') || 
            errorMessage.includes('category-images') || 
            errorMessage.includes('存储桶') || 
            errorMessage.includes('bucket')) {
          setShowBucketFix(true);
        }
      } else {
        errorMessage = '创建分类失败，请检查网络连接或联系管理员';
      }
      
      setError(errorMessage);
      // 滚动到页面顶部以显示错误信息
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">添加新分类</h1>
        <Link
          href="/admin?tab=categories"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          返回分类管理
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
          <p className="whitespace-pre-line">{error}</p>
          
          {showBucketFix && (
            <div className="mt-4 border-t border-red-200 dark:border-red-700 pt-4">
              <h4 className="font-medium mb-2">检测到可能是存储桶不存在的问题</h4>
              <p className="mb-2">这通常是因为 category-images 存储桶未创建导致的。</p>
              <button
                onClick={createMissingBucket}
                disabled={fixingBucket}
                className={`px-4 py-2 rounded-md text-white ${fixingBucket ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {fixingBucket ? '正在修复...' : '自动创建缺失的存储桶'}
              </button>
              <Link
                href="/admin/storage"
                className="ml-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                前往存储桶管理
              </Link>
            </div>
          )}
        </div>
      )}
      
      {saveSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-300">
          分类创建成功！正在跳转...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            分类名称 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL标识 *
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 sm:text-sm">
              /browse?category=
            </span>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="block w-full rounded-none rounded-r-md border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            URL友好的标识，只能包含小写字母、数字和连字符
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            分类描述 *
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="简单描述这个分类包含的笔刷类型和用途"
            required
          />
        </div>

        <div>
          <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            显示顺序
          </label>
          <input
            type="number"
            id="displayOrder"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            min="0"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            数字越小显示越靠前，可留空（默认为0）
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            分类图片 *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            {previewUrl ? (
              <div className="space-y-2">
                <div className="relative h-40 w-full mx-auto">
                  <Image
                    src={previewUrl}
                    alt="分类预览图"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl('');
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="text-sm text-red-600 hover:text-red-500"
                  >
                    移除图片
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label
                    htmlFor="image"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 focus-within:outline-none"
                  >
                    <span>上传图片</span>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">或拖放图片到此处</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  推荐尺寸: 800 x 480像素. PNG, JPG, GIF 最大 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin?tab=categories"
            className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? '正在保存...' : '保存分类'}
          </button>
        </div>
      </form>
    </div>
  );
} 