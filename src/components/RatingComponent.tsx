'use client';

import { useState } from 'react';
import { addRating } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';

interface RatingComponentProps {
  brushId: string;
  initialRating?: number;
  totalRatings?: number;
  onRatingChange?: (newAverage: number, newTotal: number) => void;
}

const RatingComponent = ({ 
  brushId, 
  initialRating = 0, 
  totalRatings = 0,
  onRatingChange 
}: RatingComponentProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const handleRating = async (value: number) => {
    if (!user) {
      setError('Please login to rate');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await addRating(brushId, user.id, value);
      
      setRating(value);
      setSuccess('Rating submitted successfully!');
      
      // 计算新的平均评分
      if (onRatingChange) {
        // 简单计算新平均值：(旧平均值 * 旧总数 + 新评分) / (旧总数 + 1)
        const newTotal = totalRatings + 1;
        const newAverage = ((initialRating * totalRatings) + value) / newTotal;
        onRatingChange(newAverage, newTotal);
      }
    } catch (err: any) {
      console.error('评分提交失败:', err);
      setError(err.message || '评分提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center mb-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            disabled={isSubmitting}
            onClick={() => handleRating(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl px-1 focus:outline-none transition-colors duration-200"
            aria-label={`${value} stars`}
          >
            <span className={`${
              (hoverRating || rating) >= value
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}>
              ★
            </span>
          </button>
        ))}
        
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
          {rating ? `Your rating: ${rating} stars` : 'Click to rate'}
        </span>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
      )}
      
      {success && (
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">{success}</p>
      )}
      
      {!user && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Login</a>
          {' '}to rate
        </p>
      )}
    </div>
  );
};

export default RatingComponent; 