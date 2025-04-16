import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

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
  return (
    <Link href={`/brushes/${id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isFeatured && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md">
              精选
            </span>
          )}
          {isFree ? (
            <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
              免费
            </span>
          ) : (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
              ¥{price}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 truncate">{title}</h3>
          <p className="text-sm text-gray-600 mb-2 truncate">{category}</p>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>下载: {downloadCount}</span>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              查看详情
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BrushCard; 