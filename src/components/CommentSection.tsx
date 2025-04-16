'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { addComment, getComments } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  brush_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

interface CommentSectionProps {
  brushId: string;
}

const CommentSection = ({ brushId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const commentsData = await getComments(brushId);
        setComments(commentsData || []);
      } catch (err: any) {
        console.error('Failed to retrieve comments:', err);
        setError(err.message || 'Error retrieving comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [brushId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!user) {
      setError('Please login to comment');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await addComment(brushId, user.id, newComment);

      // 创建新评论对象并添加到列表
      const newCommentObject: Comment = {
        id: new Date().getTime().toString(), // 临时ID，实际应由服务器生成
        brush_id: brushId,
        user_id: user.id,
        content: newComment,
        created_at: new Date().toISOString(),
        user: {
          username: profile?.username || user.email?.split('@')[0] || 'User',
          avatar_url: profile?.avatar_url
        }
      };
      
      setComments([newCommentObject, ...comments]);
      setNewComment('');
    } catch (err: any) {
      console.error('Failed to submit comment:', err);
      setError(err.message || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Comments</h2>
      
      {/* 评论输入框 */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="mb-2">
          <textarea
            placeholder={user ? "Write your comment..." : "Please login to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user || isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
          />
        </div>
        
        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!user || isSubmitting || !newComment.trim()}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              !user || isSubmitting || !newComment.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Post Comment'}
          </button>
        </div>
      </form>
      
      {/* 评论列表 */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
              <div className="flex items-start">
                <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                  <Image
                    src={comment.user?.avatar_url || '/images/default-avatar.png'}
                    alt={comment.user?.username || 'User'}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {comment.user?.username || 'User'}
                    </h4>
                    <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection; 