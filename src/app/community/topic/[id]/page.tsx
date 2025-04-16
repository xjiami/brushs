'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@context/SupabaseContext';
import { getSupabaseClient } from '../../../../../src/lib/supabase-client';
import { notFound } from 'next/navigation';
import { User } from '@supabase/supabase-js';
// import { toast } from 'react-hot-toast';
// import { Heart, Reply, MessageSquare, AlertCircle, MessageCircle, ThumbsUp, Flag, Edit, Trash2 } from 'lucide-react';

// Example topics
const EXAMPLE_TOPICS = [
  {
    id: '1',
    title: 'Best Watercolor Brushes for Beginners',
    category: 'watercolor',
    content: `<p>I'm just starting with digital watercolor and looking for brush recommendations. Which watercolor brushes from the marketplace would you recommend for someone just starting out?</p><p>I've tried a few free ones but not getting the effects I want. Are premium brushes worth the investment?</p>`,
    author: 'ArtisticNewbie',
    date: '2023-06-15T08:30:00Z',
    viewCount: 245,
    replyCount: 8,
    likes: 17
  },
  {
    id: '2',
    title: 'How to Organize Your Brushes Effectively',
    category: 'organization',
    content: `<p>I've accumulated hundreds of brushes over the years and my brush library is a mess! How do you all organize your brushes?</p><p>Do you use sets, categories, or some other system? Would love to see screenshots of your organization systems!</p>`,
    author: 'OrganizedChaos',
    date: '2023-06-10T14:22:00Z',
    viewCount: 187,
    replyCount: 12,
    likes: 24
  },
  {
    id: '3',
    title: 'Creating Custom Texture Brushes - Tutorial',
    category: 'customization',
    content: `<p>After many requests, I've created a detailed guide on how I make my custom texture brushes:</p><p>1. Start with a high-resolution photo of the texture</p><p>2. Process in Photoshop to remove unwanted patterns</p><p>3. Adjust contrast and levels</p><p>4. Import to Procreate and customize brush settings</p><p>I've attached screenshots of each step. Let me know if you have questions!</p>`,
    author: 'TextureMaster',
    date: '2023-06-05T19:45:00Z',
    viewCount: 342,
    replyCount: 16,
    likes: 53
  },
  {
    id: '4',
    title: 'Technical Issue: Brush Lag with Large Canvas',
    category: 'technical',
    content: `<p>I'm experiencing significant lag when using certain brushes on a large canvas (16000x16000px). Has anyone else encountered this issue?</p><p>My iPad is the latest Pro model with M2 chip, so I'm surprised to see performance problems. Any suggestions for settings that might help?</p>`,
    author: 'SpeedSeeker',
    date: '2023-06-02T10:15:00Z',
    viewCount: 97,
    replyCount: 5,
    likes: 3
  },
  {
    id: '5',
    title: 'Share Your Favorite Portrait Brushes',
    category: 'portrait',
    content: `<p>Let's create a resource list of the best brushes for portrait work!</p><p>My current favorites are:</p><p>- Soft Airbrush for skin blending</p><p>- Textured Charcoal for hair</p><p>- Fine Detail Pen for eyes</p><p>What are yours? Please share with examples if possible!</p>`,
    author: 'PortraitPro',
    date: '2023-05-28T16:33:00Z',
    viewCount: 276,
    replyCount: 24,
    likes: 37
  }
];

// Example comments
const EXAMPLE_COMMENTS = [
  {
    id: '101',
    topicId: '1',
    author: 'WatercolorExpert',
    content: "For beginners, I'd recommend starting with the 'Watercolor Essentials' pack. It gives you a good variety without being overwhelming. The wet edge brushes are particularly good for learning how digital watercolor differs from traditional.",
    date: '2023-06-15T09:45:00Z',
    likes: 8
  },
  {
    id: '102',
    topicId: '1',
    author: 'DigitalArtist123',
    content: "Premium brushes are definitely worth it if you're serious about watercolor work. The free ones are good for basics, but the premium sets offer much better texture and blending capabilities. I'd recommend trying 'Realistic Watercolor Pro' - it's been a game changer for my work.",
    date: '2023-06-15T10:22:00Z',
    likes: 5
  },
  {
    id: '103',
    topicId: '1',
    author: 'BrushCollector',
    content: "Don't forget to check the free brush section of our community! There are some hidden gems there that rival premium brushes. I've uploaded a few watercolor brushes myself that you might find useful for learning.",
    date: '2023-06-15T11:14:00Z',
    likes: 3
  }
];

// Category definitions (translated to English)
const CATEGORIES = {
  'brushes': 'Brushes',
  'effects': 'Effects',
  'techniques': 'Techniques',
  'showcase': 'Showcase',
  'textures': 'Texture Creation',
  'calligraphy': 'Digital Calligraphy',
  'illustration': 'Illustration',
  'help': 'Help & Support',
  'general': 'General Discussion'
} as const;

type Category = keyof typeof CATEGORIES;

// Define interfaces for type safety
interface Comment {
  id: string;
  topicId?: string;
  topic_id?: string;
  author: string;
  content: string;
  date?: string;
  created_at?: string;
  likes: number;
  author_id?: string;
  isTopicAuthor?: boolean;
  is_offline?: boolean;
  authorAvatar?: string;
}

interface Topic {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  date?: string;
  created_at?: string;
  viewCount?: number;
  replyCount?: number;
  views?: number;
  reply_count?: number;
  likes?: number;
  author_id?: string;
  updated_at?: string;
}

export default function TopicDetailPage() {
  // 使用useParams钩子获取路由参数
  const params = useParams();
  const topicId = params.id as string;
  const router = useRouter();
  const { user, supabase } = useSupabase();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [relatedTopics, setRelatedTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<string[]>([]);

  // Get topic details
  useEffect(() => {
    const fetchTopicAndComments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!supabase) {
          setError('数据库连接未初始化，请稍后刷新页面重试');
          setIsLoading(false);
          return;
        }
        
        // Load topic data from the database
        const { data: topicData, error: topicError } = await supabase
          .from('topics')
          .select('*')
          .eq('id', topicId)
          .single();
        
        if (topicError) {
          console.error('Error fetching topic:', topicError);
          setError('无法加载主题数据，该主题可能不存在或已被删除');
          setIsLoading(false);
          return;
        }
        
        if (!topicData) {
          setError('主题不存在');
          setIsLoading(false);
          return;
        }
        
        // 获取作者信息
        let authorName = 'Unknown User';
        if (topicData.author_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, email')
            .eq('id', topicData.author_id)
            .single();
            
          if (profileData) {
            authorName = profileData.username || profileData.email?.split('@')[0] || 'Unknown User';
          }
        }
        
        // 设置主题数据，包含作者名称
        setTopic({
          ...topicData,
          author: authorName
        });
        
        // Load comments for this topic
        const { data: commentsData, error: commentsError } = await supabase
          .from('topic_replies')
          .select('*')
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });
        
        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
          // 仍然继续，只是没有评论
          setComments([]);
        } else {
          // 获取每条评论的作者信息
          const commentsWithAuthors = await Promise.all((commentsData || []).map(async comment => {
            let commentAuthor = 'Unknown User';
            if (comment.author_id) {
              try {
                const { data: authorData, error: authorError } = await supabase
                  .from('profiles')
                  .select('username, email')
                  .eq('id', comment.author_id)
                  .single();
                  
                if (!authorError && authorData) {
                  commentAuthor = authorData.username || authorData.email?.split('@')[0] || 'Unknown User';
                }
              } catch (error) {
                console.error('Error fetching comment author:', error);
              }
            }
            
            return {
              ...comment,
              author: commentAuthor,
              likes: 0 // 默认点赞数为0
            };
          }));
          
          setComments(commentsWithAuthors);
        }
        
        // Get related topics in the same category
        const { data: relatedData, error: relatedError } = await supabase
          .from('topics')
          .select('*')
          .eq('category', topicData.category)
          .neq('id', topicId)
          .limit(3);
        
        if (relatedError) {
          console.error('Error fetching related topics:', relatedError);
          setRelatedTopics([]);
        } else {
          // 获取相关主题的作者信息
          const relatedWithAuthors = await Promise.all((relatedData || []).map(async topic => {
            let topicAuthor = 'Unknown User';
            if (topic.author_id) {
              try {
                const { data: authorData, error: authorError } = await supabase
                  .from('profiles')
                  .select('username, email')
                  .eq('id', topic.author_id)
                  .single();
                  
                if (!authorError && authorData) {
                  topicAuthor = authorData.username || authorData.email?.split('@')[0] || 'Unknown User';
                }
              } catch (error) {
                console.error('Error fetching topic author:', error);
              }
            }
            
            return {
              ...topic,
              author: topicAuthor
            };
          }));
          
          setRelatedTopics(relatedWithAuthors);
        }
        
        // Increment view count
        await supabase
          .from('topics')
          .update({ views: (topicData.views || 0) + 1 })
          .eq('id', topicId);
        
      } catch (err) {
        console.error('Error in fetching data:', err);
        setError('加载数据时发生错误，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopicAndComments();
  }, [topicId, supabase]);

  // Format date for display
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      // toast.error('Please login to post a comment');
      alert('Please login to post a comment');
      return;
    }
    
    if (!comment.trim()) {
      // toast.error('Comment cannot be empty');
      alert('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First try to save to Supabase
      try {
        const commentData = {
          topic_id: topicId,
          content: comment,
          author_id: user.id,
        };
        
        const { data, error } = await supabase
          .from('topic_replies')
          .insert(commentData)
          .select('id, created_at');
          
        if (error) {
          console.error('Error posting comment:', error);
          throw error;
        }
        
        // Add new comment to the list
        const newComment = {
          id: data[0].id,
          content: comment,
          author: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Unknown User',
          author_id: user.id,
          created_at: data[0].created_at,
          likes: 0,
        };
        
        setComments([...comments, newComment]);
        setComment('');
        // toast.success('Comment posted successfully');
        alert('Comment posted successfully');
        
      } catch (saveError) {
        console.error('Error saving to Supabase:', saveError);
        
        // Offline mode - save to local storage
        const offlineCommentId = `offline-${Date.now()}`;
        const offlineComment = {
          id: offlineCommentId,
          content: comment,
          author: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Unknown User',
          author_id: user.id,
          created_at: new Date().toISOString(),
          likes: 0,
          is_offline: true
        };
        
        // Save to localStorage
        const topicKey = `offline_comments_${topicId}`;
        const existingComments = JSON.parse(localStorage.getItem(topicKey) || '[]');
        localStorage.setItem(topicKey, JSON.stringify([...existingComments, offlineComment]));
        
        // Add to UI
        setComments([...comments, offlineComment]);
        setComment('');
        // toast.warning('Network unavailable. Comment saved locally and will sync when connection is restored.');
        alert('Network unavailable. Comment saved locally and will sync when connection is restored.');
      }
    } catch (err) {
      console.error('Comment submission error:', err);
      // toast.error('Failed to post comment. Please try again later.');
      alert('Failed to post comment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {error}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            您查找的主题可能已被删除或暂时不可用。
          </p>
          <Link 
            href="/community" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            返回社区页面
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载主题数据...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            未找到主题
          </h2>
          <Link 
            href="/community" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            返回社区页面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back link */}
      <Link 
        href="/community" 
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
      >
        ← Back to Community
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content area */}
        <div className="lg:col-span-3">
          {/* Topic post */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs">
                  {CATEGORIES[(topic?.category || 'general') as Category]}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(topic.date)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{topic.title}</h1>
              <div className="prose dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: topic.content }} />
              
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 border-t pt-4 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <span>{topic.viewCount} views</span>
                  <span>{topic.replyCount} replies</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                  </button>
                  <button className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b">
              Comments ({comments.length})
            </h2>
            
            {/* Comment list */}
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map(comment => (
                  <div 
                    key={comment.id} 
                    className={`p-4 rounded-lg ${comment.is_offline ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-3">
                      <Image 
                        src={comment.authorAvatar || "/avatars/default.svg"} 
                        alt={comment.author} 
                        width={40} 
                        height={40} 
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.created_at || comment.date)}
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-line">{comment.content}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <button 
                            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
                            onClick={() => {
                              setComment(`@${comment.author} `);
                              document.getElementById('comment-input')?.focus();
                            }}
                          >
                            {/* <Reply size={16} /> */}
                            <span>↩</span>
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {comment.is_offline && (
                      <div className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                        {/* <AlertCircle size={14} /> */}
                        <span>⚠</span>
                        <span>Saved locally. Will sync when connection is restored.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                {/* <MessageSquare size={40} className="mx-auto mb-4 text-gray-300" /> */}
                <div className="mx-auto mb-4 text-gray-300 text-4xl">💬</div>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
            
            {/* Comment form */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Leave a Comment</h3>
              
              {user ? (
                <form onSubmit={handleSubmitComment}>
                  <div className="mb-4">
                    <textarea
                      id="comment-input"
                      className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      placeholder="Write your comment here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="mb-4">Please sign in to leave a comment</p>
                  <Link
                    href={`/login?redirect=/community/topic/${topicId}`}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Author info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Topic Author</h3>
            <div className="flex items-center gap-3 mb-3">
              <Image 
                src="/avatars/default.svg" 
                alt={topic.author}
                width={48} 
                height={48} 
                className="rounded-full"
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{topic.author}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member since {formatDate('2023-01-01')}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t dark:border-gray-700">
              <span>{EXAMPLE_TOPICS.filter(t => t.author === topic.author).length} topics</span>
              <span>{EXAMPLE_COMMENTS.filter(c => c.author === topic.author).length} replies</span>
            </div>
          </div>
          
          {/* Community stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Topics:</span>
                <span className="font-medium text-gray-900 dark:text-white">{EXAMPLE_TOPICS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Replies:</span>
                <span className="font-medium text-gray-900 dark:text-white">{EXAMPLE_COMMENTS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Active Users:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Set([...EXAMPLE_TOPICS.map(t => t.author), ...EXAMPLE_COMMENTS.map(c => c.author)]).size}
                </span>
              </div>
            </div>
          </div>
          
          {/* Related topics */}
          {relatedTopics.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Related Topics</h3>
              <div className="space-y-3">
                {relatedTopics.map(relTopic => (
                  <div key={relTopic.id} className="border-b pb-3 last:border-b-0 dark:border-gray-700">
                    <Link href={`/community/topic/${relTopic.id}`} className="block hover:text-blue-600 dark:hover:text-blue-400">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">{relTopic.title}</h4>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>{relTopic.replyCount} replies</span>
                        <span>{formatDate(relTopic.date)}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 