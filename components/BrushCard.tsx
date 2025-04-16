'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';

// 模糊占位符数据URL（灰色渐变背景）
const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2YzZjRmNiIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNncmFkKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgLz48L3N2Zz4=';

// 错误占位符图片（简单的灰色背景与图像图标）
const errorPlaceholderURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGZpbGw9IiNlNWU3ZWIiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIC8+PHBhdGggZD0iTTggMTRzMS41LTUgNi01IDYgNSA2IDVtLTExLTQgMi44NjQtMi44NjRhMiAyIDAgMCAxIDIuODI4IDBMMjAgMTJtLTUtNCAyIDJtLTEtMS0yIDJNOCA4bDIgMiIgc3Ryb2tlPSIjOWNhM2FmIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

interface BrushCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  isFree: boolean;
  downloadCount: number;
  price?: number;
}

const BrushCard: FC<BrushCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  category,
  isFeatured,
  isFree,
  downloadCount,
  price = 0,
}) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href={`/brushes/${id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48 w-full">
          <Image
            src={imageError ? errorPlaceholderURL : imageUrl}
            alt={title}
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={blurDataURL}
            quality={80}
            className="object-cover transition-opacity duration-300 group-hover:opacity-90"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={handleImageError}
          />
          {isFeatured && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md">
              Featured
            </span>
          )}
          {isFree ? (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
              Free
            </span>
          ) : (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
              ¥{price}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 truncate">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">{category}</p>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-3 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
            <span>Downloads: {downloadCount}</span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BrushCard; 