'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../../context/SupabaseContext';

// Forum categories examples
const FORUM_CATEGORIES = [
  { id: 'general', name: 'General Discussion', description: 'General topics about Procreate and digital art' },
  { id: 'tutorials', name: 'Tutorials & Tips', description: 'Share and request Procreate tutorials and techniques' },
  { id: 'brushes', name: 'Brush Discussion', description: 'Discuss and share experiences with different brushes' },
  { id: 'showcase', name: 'Showcase', description: 'Show off your artwork created with Procreate' },
  { id: 'technical', name: 'Technical Support', description: 'Get help and answers for technical issues' },
];

// Sample forum topics (backup only)
const SAMPLE_TOPICS = [
  {
    id: '1',
    title: 'Best Brushes for Concept Art?',
    author: 'Artist X',
    author_id: 'sample-user-1',
    category: 'brushes',
    replies: 24,
    views: 513,
    last_activity: '2023-11-29T14:23:00Z',
    is_pinned: true,
  },
  {
    id: '2',
    title: 'How to Create Watercolor Effects',
    author: 'Watercolor Lover',
    author_id: 'sample-user-2',
    category: 'tutorials',
    replies: 15,
    views: 342,
    last_activity: '2023-11-28T09:45:00Z',
  },
  {
    id: '3',
    title: 'Share Your Character Design Process',
    author: 'Character Artist',
    author_id: 'sample-user-3',
    category: 'showcase',
    replies: 32,
    views: 721,
    last_activity: '2023-11-27T22:10:00Z',
  },
  {
    id: '4',
    title: 'Procreate Crashing on iPad Pro',
    author: 'Tech Help',
    author_id: 'sample-user-4',
    category: 'technical',
    replies: 8,
    views: 156,
    last_activity: '2023-11-26T16:35:00Z',
  },
  {
    id: '5',
    title: 'Introduce Yourself: Share Your Art Journey',
    author: 'Community Admin',
    author_id: 'admin-user',
    category: 'general',
    replies: 45,
    views: 890,
    last_activity: '2023-11-25T11:20:00Z',
    is_pinned: true,
  },
];

// Add or update this interface definition at the top of the file
interface Topic {
  id: string;
  title: string;
  content?: string;
  category: string;
  author: string;
  author_id: string;
  replies: number;
  views: number;
  last_activity: string;
  is_pinned?: boolean;
  is_offline?: boolean;
}

export default function CommunityPage() {
  const router = useRouter();
  const { user, supabase } = useSupabase();
  const [activeCategory, setActiveCategory] = useState('all');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', category: 'general', content: '' });
  
  // New state variables for topic management
  const [editingTopic, setEditingTopic] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ title: '', category: 'general', content: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load topics from Supabase database
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        
        if (!supabase) {
          console.error('Supabase客户端未初始化');
          setIsLoading(false);
          return;
        }
        
        // 直接从数据库获取数据，不再使用离线数据作为备选
        const { data, error } = await supabase
          .from('topics')
          .select(`
            id, 
            title, 
            content, 
            category, 
            author_id, 
            created_at, 
            updated_at, 
            reply_count, 
            views
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching topics:', error);
          setIsLoading(false);
          return;
        }
        
        console.log('Topics data fetched successfully:', data);
        
        // Get username for each topic
        const topicsWithAuthors = await Promise.all(data.map(async topic => {
          let authorName = 'Unknown User';
          
          // Try to get author information
          if (topic.author_id) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('username, email')
              .eq('id', topic.author_id)
              .single();
            
            if (profiles) {
              authorName = profiles.username || profiles.email?.split('@')[0] || 'Unknown User';
            }
          }
          
          return {
            id: topic.id,
            title: topic.title,
            content: topic.content,
            category: topic.category,
            author: authorName,
            author_id: topic.author_id,
            replies: topic.reply_count || 0,
            views: topic.views || 0,
            last_activity: topic.updated_at || topic.created_at
          };
        }));

        setTopics(topicsWithAuthors);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [supabase, refreshTrigger]);

  // Filter topics by active category
  const filteredTopics = activeCategory === 'all'
    ? topics
    : topics.filter(topic => topic.category === activeCategory);
  
  // Sort topics, pinned first, then by most recent activity
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
  });
  
  // Modify handleCreateTopic to save data to Supabase
  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login before creating a topic');
      return;
    }
    
    try {
      // Prepare data to save
      const topicData = {
        title: newTopic.title,
        content: newTopic.content,
        category: newTopic.category,
        author_id: user.id,
        reply_count: 0,
        views: 0
      };
      
      // Try to save to Supabase
      try {
        const { data, error } = await supabase
          .from('topics')
          .insert(topicData)
          .select('id, created_at');
        
        if (error) {
          console.error('Error creating topic:', error);
          throw error;
        }
        
        // Update local state
        const newTopicData = {
          id: data[0].id,
          title: newTopic.title,
          content: newTopic.content,
          category: newTopic.category,
          author: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Unknown User',
          author_id: user.id,
          replies: 0,
          views: 0,
          last_activity: data[0].created_at
        };
        
        setTopics([newTopicData, ...topics]);
        setNewTopic({ title: '', content: '', category: 'general' });
        setIsCreatingTopic(false);
        
        // 触发刷新
        setRefreshTrigger(prev => prev + 1);
      } catch (saveError) {
        console.error('Error saving to Supabase:', saveError);
        
        // Offline mode: save to local storage
        const offlineTopicId = `offline-${Date.now()}`;
        const offlineTopic = {
          id: offlineTopicId,
          title: newTopic.title,
          content: newTopic.content,
          category: newTopic.category,
          author: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Unknown User',
          author_id: user.id,
          replies: 0,
          views: 0,
          last_activity: new Date().toISOString(),
          is_offline: true
        };
        
        // Save to localStorage
        const existingTopics = JSON.parse(localStorage.getItem('offline_topics') || '[]');
        localStorage.setItem('offline_topics', JSON.stringify([offlineTopic, ...existingTopics]));
        
        // Update local state
        setTopics([offlineTopic, ...topics]);
        setNewTopic({ title: '', content: '', category: 'general' });
        setIsCreatingTopic(false);
        
        alert('Network connection unavailable. Topic has been saved locally and will sync automatically when network is restored.');
      }
    } catch (err) {
      console.error('Error in create topic process:', err);
      alert('Failed to create topic. Please try again later.');
    }
  };

  // Start editing a topic
  const startEditTopic = (topic: any) => {
    setEditingTopic(topic.id);
    setEditFormData({
      title: topic.title,
      category: topic.category,
      content: topic.content || ''
    });
  };

  // Modify handleEditTopic function to update data in Supabase
  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to edit topics');
      return;
    }
    
    try {
      const topicToUpdate = topics.find(t => t.id === editingTopic);
      
      if (!topicToUpdate) {
        console.error('Topic not found');
        return;
      }
      
      // Ensure user is author or admin
      if (topicToUpdate.author_id !== user.id && !user.user_metadata?.is_admin) {
        alert('You are not authorized to edit this topic');
        return;
      }
      
      const updatedData = {
        title: editFormData.title,
        category: editFormData.category,
        content: editFormData.content,
        updated_at: new Date().toISOString()
      };
      
      // Update Supabase data
      const { data, error } = await supabase
        .from('topics')
        .update(updatedData)
        .eq('id', editingTopic)
        .select();
      
      if (error) {
        console.error('Error updating topic:', error);
        alert('Failed to update topic. Please try again.');
        return;
      }
      
      console.log('Topic updated successfully:', data);
      
      // Update local state
      setTopics(topics.map(topic => {
        if (topic.id === editingTopic) {
          return {
            ...topic,
            title: editFormData.title,
            category: editFormData.category,
            content: editFormData.content,
            last_activity: new Date().toISOString()
          };
        }
        return topic;
      }));
      
      setEditingTopic(null);
      
      // 触发刷新
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error:', err);
      alert('An unexpected error occurred.');
    }
  };

  // Modify handleDeleteTopic function to delete data from Supabase
  const handleDeleteTopic = async (id: string) => {
    if (!user) {
      alert('You must be logged in to delete topics');
      return;
    }
    
    try {
      const topicToDelete = topics.find(t => t.id === id);
      
      if (!topicToDelete) {
        console.error('Topic not found');
        return;
      }
      
      // Ensure user is author or admin
      if (topicToDelete.author_id !== user.id && !user.user_metadata?.is_admin) {
        alert('You are not authorized to delete this topic');
        return;
      }
      
      // Delete from Supabase
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting topic:', error);
        alert('Failed to delete topic. Please try again.');
        return;
      }
      
      // Update local state
      setTopics(topics.filter(topic => topic.id !== id));
      setShowDeleteConfirm(null);
      
      // 触发刷新
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error:', err);
      alert('An unexpected error occurred.');
    }
  };
  
  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user is the author of a topic
  const isTopicAuthor = (topic: any) => {
    return user && (
      user.id === topic.author_id ||
      user.user_metadata?.is_admin === true
    );
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Forum</h1>
        
        <button
          onClick={() => user ? setIsCreatingTopic(true) : router.push('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Topic
        </button>
      </div>
      
      {/* Category navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Categories
          </button>
          
          {FORUM_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* New topic form */}
      {isCreatingTopic && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Topic</h2>
            <button
              onClick={() => setIsCreatingTopic(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleCreateTopic}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newTopic.title}
                onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
                placeholder="Topic title"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category"
                value={newTopic.category}
                onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {FORUM_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                id="content"
                value={newTopic.content}
                onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white h-32"
                required
                placeholder="Share your thoughts or questions..."
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsCreatingTopic(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Topic
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit topic form */}
      {editingTopic && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Topic</h2>
            <button
              onClick={() => setEditingTopic(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleEditTopic}>
            <div className="mb-4">
              <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="editTitle"
                value={editFormData.title}
                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
                placeholder="Topic title"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="editCategory"
                value={editFormData.category}
                onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {FORUM_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="editContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                id="editContent"
                value={editFormData.content}
                onChange={(e) => setEditFormData({...editFormData, content: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white h-32"
                required
                placeholder="Share your thoughts or questions..."
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setEditingTopic(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Topic list */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载主题数据中...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Replies</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {sortedTopics.map((topic) => {
                const category = FORUM_CATEGORIES.find(c => c.id === topic.category);
                
                return (
                  <tr key={topic.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {topic.is_pinned && (
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15.707 6.293a1 1 0 0 1 0 1.414L12.414 11l3.293 3.293a1 1 0 0 1-1.414 1.414L10 12.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L8.586 11 5.293 7.707a1 1 0 0 1 1.414-1.414L10 9.586l3.293-3.293a1 1 0 0 1 1.414 0Z" />
                          </svg>
                        )}
                        <Link href={`/community/topic/${topic.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          {topic.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {category?.name || topic.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{topic.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{topic.replies}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{topic.views}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(topic.last_activity)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {isTopicAuthor(topic) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditTopic(topic)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(topic.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          {/* Delete confirmation */}
                          {showDeleteConfirm === topic.id && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                  Are you sure you want to delete this topic? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-3">
                                  <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTopic(topic.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {!isLoading && sortedTopics.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">此分类下暂无主题。</p>
          <button
            onClick={() => user ? setIsCreatingTopic(true) : router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            成为第一个创建主题的用户
          </button>
        </div>
      )}
      
      {/* Category info */}
      {activeCategory !== 'all' && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {FORUM_CATEGORIES.find(c => c.id === activeCategory)?.name || 'Category'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {FORUM_CATEGORIES.find(c => c.id === activeCategory)?.description || 'No description available.'}
          </p>
        </div>
      )}
    </div>
  );
} 