'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { saveBrush, getCategories } from '@/lib/supabase-client';

export default function NewBrushPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    category: '',
    price: '0',
    isFree: true,
    isFeatured: false,
    compatibility: 'Procreate 5+',
    tags: '',
    file: null as File | null,
    previewImage: null as File | null,
    galleryImages: [] as File[],
    downloadUrl: '',
    fileSize: ''
  });

  // 获取分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('加载分类数据失败:', err);
        setError('加载分类数据失败，请刷新页面重试');
      }
    };
    
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
      
      // 如果是免费选项，自动设置价格为0
      if (name === 'isFree' && target.checked) {
        setFormData(prev => ({
          ...prev,
          price: '0'
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fieldName === 'previewImage') {
      setFormData(prev => ({
        ...prev,
        previewImage: files[0]
      }));
      
      // 创建预览URL
      const objectUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(objectUrl);
    } else if (fieldName === 'file') {
      setFormData(prev => ({
        ...prev,
        file: files[0]
      }));
    } else if (fieldName === 'galleryImages') {
      // 多个图片
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...fileArray]
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('开始提交笔刷数据...');
      
      // 基本表单验证
      if (!formData.title || !formData.description || !formData.category) {
        throw new Error('请填写标题、描述和选择分类');
      }

      if (!formData.isFree && (parseFloat(formData.price) <= 0)) {
        throw new Error('付费笔刷的价格必须大于0');
      }

      if (!formData.previewImage) {
        throw new Error('请上传预览图');
      }

      // 检查文件或下载链接至少有一个
      if (!formData.file && !formData.downloadUrl) {
        throw new Error('请上传笔刷文件或提供下载链接');
      }

      // 调用Supabase API保存笔刷数据
      const brushDataToSave = {
        title: formData.title,
        description: formData.description,
        longDescription: formData.longDescription,
        category: formData.category,
        price: formData.price,
        isFree: formData.isFree,
        isFeatured: formData.isFeatured,
        compatibility: formData.compatibility,
        tags: formData.tags,
        downloadUrl: formData.downloadUrl,
        fileSize: formData.fileSize
      };
      
      console.log('准备提交以下数据到saveBrush函数:', brushDataToSave);
      console.log('预览图文件:', formData.previewImage?.name);
      console.log('笔刷文件:', formData.file?.name);
      console.log('笔刷下载链接:', formData.downloadUrl);
      console.log('画廊图片数量:', formData.galleryImages.length);
      
      try {
        const result = await saveBrush(
          brushDataToSave,
          formData.previewImage || undefined,
          formData.file || undefined,
          formData.galleryImages.length > 0 ? formData.galleryImages : undefined
        );
        
        console.log('saveBrush函数返回结果:', result);
        
        // 成功后跳转到管理页面
        console.log('保存成功，准备跳转到管理页面');
        router.push('/admin');
      } catch (submitError) {
        console.error('调用saveBrush函数出错:', submitError);
        throw submitError;
      }
    } catch (err) {
      console.error('创建笔刷失败:', err);
      setError(err instanceof Error ? err.message : '创建笔刷失败，请重试');
      window.scrollTo(0, 0); // 滚动到顶部显示错误
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">添加新笔刷</h1>
        <Link
          href="/admin"
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          返回管理面板
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧: 基本信息 */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                笔刷名称 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                简短描述 *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="简单描述这个笔刷套装的特点和用途"
                required
              />
            </div>

            <div>
              <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                详细描述
              </label>
              <textarea
                id="longDescription"
                name="longDescription"
                rows={6}
                value={formData.longDescription}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="详细介绍笔刷的特点、使用技巧和适用场景"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分类 *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                required
              >
                <option value="">选择分类</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标签（用逗号分隔）
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="例如：水彩,艺术,笔触"
              />
            </div>

            <div>
              <label htmlFor="compatibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                兼容性
              </label>
              <input
                type="text"
                id="compatibility"
                name="compatibility"
                value={formData.compatibility}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="例如：Procreate 5+"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="isFree"
                  name="isFree"
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isFree" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  免费笔刷
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="isFeatured"
                  name="isFeatured"
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  推荐笔刷
                </label>
              </div>
            </div>

            {!formData.isFree && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  价格 (¥)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  required={!formData.isFree}
                />
              </div>
            )}
          </div>

          {/* 右侧: 文件上传 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                预览图 *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                {previewUrl ? (
                  <div className="space-y-2">
                    <div className="relative h-40 w-40 mx-auto">
                      <Image
                        src={previewUrl}
                        alt="预览图"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl('');
                          setFormData(prev => ({ ...prev, previewImage: null }));
                        }}
                        className="text-sm text-red-600 hover:text-red-500"
                      >
                        移除
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
                        htmlFor="previewImage"
                        className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 focus-within:outline-none"
                      >
                        <span>上传图片</span>
                        <input
                          id="previewImage"
                          name="previewImage"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={e => handleFileChange(e, 'previewImage')}
                        />
                      </label>
                      <p className="pl-1">或拖放图片到此处</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF 最大 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                笔刷文件 或 下载链接 *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
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
                      htmlFor="file"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 focus-within:outline-none"
                    >
                      <span>上传笔刷文件</span>
                      <input
                        id="file"
                        name="file"
                        type="file"
                        accept=".brush,.brushset"
                        className="sr-only"
                        onChange={e => handleFileChange(e, 'file')}
                      />
                    </label>
                    <p className="pl-1">或拖放文件到此处</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Procreate笔刷文件 (.brush, .brushset)
                  </p>
                  {formData.file && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-2">
                      已选择: {formData.file.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <label htmlFor="downloadUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  或者直接输入下载链接：
                </label>
                <input
                  type="text"
                  id="downloadUrl"
                  name="downloadUrl"
                  value={formData.downloadUrl}
                  onChange={handleChange}
                  placeholder="例如: https://example.com/brush.brushset"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              
              <div className="mt-2">
                <label htmlFor="fileSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  文件大小（如果使用下载链接）：
                </label>
                <input
                  type="text"
                  id="fileSize"
                  name="fileSize"
                  value={formData.fileSize}
                  onChange={handleChange}
                  placeholder="例如: 2.5 MB"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                画廊图片 (可选)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
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
                      htmlFor="galleryImages"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 focus-within:outline-none"
                    >
                      <span>上传示例作品</span>
                      <input
                        id="galleryImages"
                        name="galleryImages"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={e => handleFileChange(e, 'galleryImages')}
                      />
                    </label>
                    <p className="pl-1">或拖放图片到此处</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF 最大 5MB/张
                  </p>
                </div>
              </div>
              
              {formData.galleryImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {formData.galleryImages.map((image, index) => (
                    <div key={index} className="relative h-20 bg-gray-100 dark:bg-gray-700 rounded">
                      <div className="absolute top-0 right-0 z-10">
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="bg-red-100 text-red-600 hover:bg-red-200 p-1 rounded-full"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="h-full w-full overflow-hidden rounded">
                        <Image
                          src={URL.createObjectURL(image)}
                          alt={`Gallery image ${index + 1}`}
                          width={80}
                          height={80}
                          style={{ width: '100%', height: '100%' }}
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/admin"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? '保存中...' : '保存笔刷'}
          </button>
        </div>
      </form>
    </div>
  );
} 