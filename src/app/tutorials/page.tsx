'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../../context/SupabaseContext';

// Tutorial sample data
const TUTORIALS = [
  {
    id: 1,
    title: 'Watercolor Techniques for Beginners',
    category: 'watercolor',
    difficulty: 'beginner',
    duration: '15 minutes',
    author: 'Jane Smith',
    thumbnail: '',
    description: 'Learn the basics of creating beautiful watercolor effects with Procreate brushes.',
    featured: true
  },
  {
    id: 2,
    title: 'Creating Custom Textures',
    category: 'texture',
    difficulty: 'intermediate',
    duration: '20 minutes',
    author: 'Mike Johnson',
    thumbnail: '',
    description: 'Discover how to make your own texture brushes for unique effects in your digital art.'
  },
  {
    id: 3,
    title: 'Advanced Inking Techniques',
    category: 'inking',
    difficulty: 'advanced',
    duration: '30 minutes',
    author: 'Sarah Lee',
    thumbnail: '',
    description: 'Master professional inking methods for comics and illustrations.'
  },
  {
    id: 4,
    title: 'Portrait Drawing Essentials',
    category: 'portrait',
    difficulty: 'intermediate',
    duration: '45 minutes',
    author: 'David Brown',
    thumbnail: '',
    description: 'Essential techniques for capturing lifelike portraits in Procreate.'
  },
  {
    id: 5,
    title: 'Calligraphy & Lettering Basics',
    category: 'calligraphy',
    difficulty: 'beginner',
    duration: '25 minutes',
    author: 'Michelle Chen',
    thumbnail: '',
    description: 'Get started with digital calligraphy and beautiful lettering designs.'
  },
  {
    id: 6,
    title: 'Creating & Customizing Brushes',
    category: 'customization',
    difficulty: 'intermediate',
    duration: '35 minutes',
    author: 'Robert Taylor',
    thumbnail: '',
    description: 'Learn to create your own custom brushes from scratch in Procreate.',
    featured: true
  },
  {
    id: 7,
    title: 'Digital Landscape Painting',
    category: 'landscape',
    difficulty: 'intermediate',
    duration: '40 minutes',
    author: 'Emma Wilson',
    thumbnail: '',
    description: 'Create stunning landscape art using advanced Procreate techniques.'
  },
  {
    id: 8,
    title: 'Animation Fundamentals',
    category: 'animation',
    difficulty: 'advanced',
    duration: '50 minutes',
    author: 'James Kim',
    thumbnail: '',
    description: 'Get started with creating simple animations using Procreate\'s animation tools.',
    featured: true
  }
];

// Category filters
const CATEGORIES = [
  { id: 'all', name: 'All Categories' },
  { id: 'watercolor', name: 'Watercolor' },
  { id: 'texture', name: 'Texture' },
  { id: 'inking', name: 'Inking' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'calligraphy', name: 'Calligraphy' },
  { id: 'customization', name: 'Customization' },
  { id: 'landscape', name: 'Landscape' },
  { id: 'animation', name: 'Animation' }
];

// 定义教程接口
interface Tutorial {
  id: string | number;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  description: string;
  author: string;
  author_id?: string;
  thumbnail?: string;
  content?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
  views?: number;
}

// Difficulty level filters
const DIFFICULTIES = [
  { id: 'all', name: 'All Levels' },
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
];

// 教程卡片组件
const TutorialCard = ({ 
  tutorial, 
  onEdit, 
  onDelete, 
  canEdit 
}: { 
  tutorial: Tutorial; 
  onEdit: () => void; 
  onDelete: () => void; 
  canEdit: boolean;
}) => {
  // 添加缩略图URL生成逻辑
  const thumbnailUrl = tutorial.thumbnail || generateThumbnailUrl(tutorial.category);
  
  // 生成主题颜色CSS样式
  const categoryColor = getCategoryColor(tutorial.category);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
      <div className="relative">
        <div className="relative aspect-video">
          <Image 
            src={thumbnailUrl} 
            alt={tutorial.title}
            fill
            className="object-cover"
            onError={(e) => {
              console.log('缩略图加载失败，使用备用图像');
              const target = e.target as HTMLImageElement;
              target.src = generateThumbnailUrl(tutorial.category);
            }}
          />
        </div>
        {tutorial.featured && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            Featured
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center text-white mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-opacity-80 ${categoryColor}`}>
              {CATEGORIES.find(c => c.id === tutorial.category)?.name || tutorial.category}
            </span>
            <span className="mx-2 text-xs">•</span>
            <span className="text-xs font-medium">
              {DIFFICULTIES.find(d => d.id === tutorial.difficulty)?.name || tutorial.difficulty}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white line-clamp-2">{tutorial.title}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">{tutorial.description}</p>
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div>
            <span>{tutorial.duration}</span>
            <span className="mx-2">•</span>
            <span>by {tutorial.author}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {tutorial.views || 0}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Link 
            href={`/tutorials/${String(tutorial.id)}`}
            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
          >
            View Tutorial
          </Link>
          
          {canEdit && (
            <div className="flex space-x-2 ml-2">
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 辅助函数：获取类别对应的CSS颜色类
const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'watercolor': return 'bg-blue-600';
    case 'texture': return 'bg-green-600';
    case 'inking': return 'bg-indigo-600';
    case 'portrait': return 'bg-pink-600';
    case 'calligraphy': return 'bg-purple-600';
    case 'customization': return 'bg-amber-600';
    case 'landscape': return 'bg-emerald-600';
    case 'animation': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
};

// 修改缩略图生成函数，使其更可靠
const generateThumbnailUrl = (category: string) => {
  // 使用Base64编码的SVG作为缩略图，完全避免外部依赖
  const colorMap: Record<string, string> = {
    'watercolor': '3B82F6', // 蓝色
    'texture': '10B981',    // 绿色
    'inking': '6366F1',     // 靛蓝色
    'portrait': 'EC4899',   // 粉色
    'calligraphy': '8B5CF6', // 紫色
    'customization': 'F59E0B', // 琥珀色
    'landscape': '059669',   // 深绿色
    'animation': 'DC2626',   // 红色
    'pencil': '6B7280',     // 灰色
    'charcoal': '111827',   // 黑色
    'pastel': 'F472B6'      // 淡粉色
  };
  
  // 获取类别对应的颜色，如果没有设置则使用默认颜色
  const color = colorMap[category] || '3B82F6';
  
  // 生成内部SVG数据URL，完全避免外部请求
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23${color}'/%3E%3Ctext x='300' y='200' font-family='Arial' font-size='32' text-anchor='middle' fill='white'%3E${category}%3C/text%3E%3C/svg%3E`;
};

export default function TutorialsPage() {
  const router = useRouter();
  const { user, supabase } = useSupabase();
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDifficulty, setActiveDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCreatingTutorial, setIsCreatingTutorial] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  );
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    category: 'watercolor',
    difficulty: 'beginner',
    duration: '',
    description: '',
    featured: false
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'watercolor',
    difficulty: 'beginner',
    duration: '',
    description: '',
    featured: false
  });
  
  // Check if user is admin
  useEffect(() => {
    if (user) {
      const isUserAdmin = 
        user.user_metadata?.is_admin === true || 
        user.email === 'xjiami2@gmail.com';
      setIsAdmin(isUserAdmin);
    } else {
      setIsAdmin(false);
    }
  }, [user]);
  
  // 在useEffect中添加从Supabase获取教程数据的函数
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching tutorials from database...', new Date().toISOString());
        console.log('刷新触发器值:', refreshTrigger);
        
        // 输出supabase连接状态
        console.log('Supabase client:', supabase ? '已连接' : '未连接');
        
        if (!supabase) {
          console.warn('Supabase客户端未连接');
          setIsLoading(false);
          return;
        }
        
        // 去掉检查表是否存在的步骤，直接获取数据
        console.log('直接尝试获取教程数据...');
        const { data, error } = await supabase
          .from('tutorials')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching tutorials:', error);
          console.error('错误详情:', JSON.stringify(error));
          setIsLoading(false);
          return;
        }
        
          // 如果获取成功，使用从数据库获取的数据
          console.log('Tutorials loaded from database:', data);
        console.log('教程数量:', data?.length || 0);
        
        if (data && data.length > 0) {
          console.log('使用数据库中的教程数据');
          setTutorials(data);
        } else {
          console.log('数据库中没有教程数据');
          setTutorials([]);
        }
      } catch (err) {
        console.error('Error:', err);
        alert('获取教程数据时发生错误: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorials();
  }, [supabase, refreshTrigger]);
  
  // Filter tutorials based on filter conditions and search query
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = activeCategory === 'all' || tutorial.category === activeCategory;
    const matchesDifficulty = activeDifficulty === 'all' || tutorial.difficulty === activeDifficulty;
    const matchesSearch = searchQuery === '' || 
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });
  
  // Featured tutorials
  const featuredTutorials = tutorials.filter(tutorial => tutorial.featured);
  
  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      console.log('网络已连接，尝试同步离线数据...');
      setNetworkStatus('online');
      syncOfflineTutorials();
    };
    
    const handleOffline = () => {
      console.log('网络连接断开，切换至离线模式');
      setNetworkStatus('offline');
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, [user, supabase]);

  // 组件挂载时尝试同步离线数据
  useEffect(() => {
    if (networkStatus === 'online' && user && supabase) {
      syncOfflineTutorials();
    }
  }, [user, supabase, networkStatus]);

  // 同步离线数据到服务器
  const syncOfflineTutorials = async () => {
    if (!user || !supabase || networkStatus === 'offline' || isSyncing) {
      return;
    }
    
    try {
      setIsSyncing(true);
      
      // 读取本地存储的离线教程
      const offlineTutorials = JSON.parse(localStorage.getItem('offline_tutorials') || '[]');
      
      if (offlineTutorials.length === 0) {
        setIsSyncing(false);
        return;
      }
      
      console.log(`开始同步 ${offlineTutorials.length} 个离线教程...`);
      
      // 按照创建和更新分类
      const newTutorials = offlineTutorials.filter((t: any) => t.is_offline && !t.is_offline_update);
      const updatedTutorials = offlineTutorials.filter((t: any) => t.is_offline_update);
      
      let successCount = 0;
      
      // 处理新教程
      for (const tutorial of newTutorials) {
        try {
          // 移除离线标记和临时ID
          const { is_offline, id, ...tutorialData } = tutorial;
          
          const { error } = await supabase
        .from('tutorials')
            .insert([tutorialData])
        .select();
      
          if (!error) {
            successCount++;
          } else {
            console.error('同步新教程失败:', error);
          }
        } catch (err) {
          console.error('同步新教程过程中出错:', err);
        }
      }
      
      // 处理更新的教程
      for (const tutorial of updatedTutorials) {
        try {
          // 移除离线标记和其他临时数据
          const { is_offline_update, offline_id, ...updateData } = tutorial;
          
          const { error } = await supabase
            .from('tutorials')
            .update(updateData)
            .eq('id', offline_id)
            .select();
          
          if (!error) {
            successCount++;
          } else {
            console.error('同步教程更新失败:', error);
          }
    } catch (err) {
          console.error('同步教程更新过程中出错:', err);
        }
      }
      
      // 清除已同步的数据
      if (successCount > 0) {
        localStorage.removeItem('offline_tutorials');
        console.log(`成功同步 ${successCount}/${offlineTutorials.length} 个教程`);
        
        // 如果有成功同步的教程，刷新数据
        setRefreshTrigger(prev => prev + 1);
        
        // 通知用户
        alert(`已成功将 ${successCount} 个离线教程同步到服务器。`);
      }
    } catch (error) {
      console.error('同步离线教程失败:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Start editing a tutorial
  const startEditTutorial = (tutorial: any) => {
    setEditingTutorial(tutorial.id as string);
    setEditFormData({
      title: tutorial.title,
      category: tutorial.category,
      difficulty: tutorial.difficulty,
      duration: tutorial.duration,
      description: tutorial.description,
      featured: tutorial.featured
    });
  };
  
  // 修改handleEditTutorial函数，使其与Supabase交互
  const handleEditTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('您必须登录才能编辑教程');
      return;
    }
    
    try {
      const tutorialToUpdate = tutorials.find(t => t.id === editingTutorial) as Tutorial;
      
      if (!tutorialToUpdate) {
        console.error('找不到教程');
        return;
      }
      
      // 检查是否是管理员或作者
      const isAdmin = user.user_metadata?.is_admin === true || 
                      user.email === 'xjiami2@gmail.com' || 
                      user.email === 'admin.test@gmail.com';
      // 安全地检查作者身份
      const isAuthor = tutorialToUpdate.author_id ? 
                      user.id === tutorialToUpdate.author_id : 
                      user.email?.split('@')[0] === tutorialToUpdate.author;
      
      if (!isAdmin && !isAuthor) {
        alert('您没有权限编辑此教程');
        console.error('权限被拒绝：用户没有权限编辑此教程');
        return;
      }
      
      // 准备数据
      const updatedData = {
        title: editFormData.title,
        category: editFormData.category,
        difficulty: editFormData.difficulty,
        duration: editFormData.duration,
        description: editFormData.description,
        featured: editFormData.featured,
        updated_at: new Date().toISOString()
      };
      
      console.log('正在更新教程数据...', updatedData);
      
      // 更新数据库
      const { data, error } = await supabase
        .from('tutorials')
        .update(updatedData)
        .eq('id', editingTutorial)
        .select();
      
      if (error) {
        console.error('更新教程时出错:', error);
        console.error('错误详情:', JSON.stringify(error));
        alert('更新教程失败。请重试。\n错误：' + error.message);
        return;
      }
      
      console.log('教程更新成功:', data);
      
      // 更新本地状态
      setTutorials(tutorials.map(tutorial => {
        if (tutorial.id === editingTutorial) {
          return { ...tutorial, ...updatedData };
        }
        return tutorial;
      }));
      
      setEditingTutorial(null);
      
      // 显示成功消息
      alert('教程更新成功！');
      
      // 触发刷新
      console.log('触发刷新...');
      setRefreshTrigger(prev => {
        console.log('旧触发器值:', prev, '新触发器值:', prev + 1);
        return prev + 1;
      });
    } catch (err) {
      console.error('错误:', err);
      alert('发生意外错误：' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  // 修改handleDeleteTutorial函数，使其与Supabase交互
  const handleDeleteTutorial = async (id: any) => {
    if (!user) {
      alert('您必须登录才能删除教程');
      return;
    }
    
    try {
      const tutorialToDelete = tutorials.find(t => t.id === id) as Tutorial;
      
      if (!tutorialToDelete) {
        console.error('找不到教程');
        return;
      }
      
      // 检查是否是管理员或作者
      const isAdmin = user.user_metadata?.is_admin === true || 
                     user.email === 'xjiami2@gmail.com' || 
                     user.email === 'admin.test@gmail.com';
      const isAuthor = tutorialToDelete.author_id ? 
                      user.id === tutorialToDelete.author_id : 
                      user.email?.split('@')[0] === tutorialToDelete.author;
      
      if (!isAdmin && !isAuthor) {
        alert('您没有权限删除此教程');
        console.error('权限被拒绝：用户没有权限删除此教程');
        return;
      }
      
      console.log('正在删除教程:', id);
      
      // 从Supabase数据库删除
      const { error } = await supabase
        .from('tutorials')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('删除教程时出错:', error);
        console.error('错误详情:', JSON.stringify(error));
        alert('删除教程失败。请重试。\n错误：' + error.message);
        return;
      }
      
      console.log('教程删除成功');
      
      // 更新本地状态
      setTutorials(tutorials.filter(tutorial => tutorial.id !== id));
      setShowDeleteConfirm(null);
      
      // 显示成功消息
      alert('教程已成功删除！');
      
      // 触发刷新
      console.log('触发刷新...');
      setRefreshTrigger(prev => {
        console.log('旧触发器值:', prev, '新触发器值:', prev + 1);
        return prev + 1;
      });
    } catch (err) {
      console.error('错误:', err);
      alert('发生意外错误：' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const handleUpdateTutorial = async (
    tutorial: Tutorial, 
    updatedTutorial: Partial<Tutorial>, 
    closeModal?: () => void
  ) => {
    try {
      console.log('正在更新教程，原始数据:', tutorial);
      console.log('更新后的数据:', updatedTutorial);
      
      // 验证必填字段
      if (!updatedTutorial.title || !updatedTutorial.category || !updatedTutorial.difficulty) {
        console.error('更新教程失败: 缺少必填字段');
        throw new Error('标题、类别和难度为必填项');
      }
      
      if (!supabase) {
        console.error('Supabase客户端未初始化');
        throw new Error('Supabase客户端未初始化');
      }
      
      // 清理数据，确保格式正确
      const cleanData = {
        ...updatedTutorial,
        title: updatedTutorial.title.trim(),
        category: updatedTutorial.category.trim(),
        difficulty: updatedTutorial.difficulty.trim(),
        duration: updatedTutorial.duration?.trim() || '',
        description: updatedTutorial.description?.trim() || '',
        updated_at: new Date().toISOString() // 强制更新时间戳
      };
      
      console.log('准备更新到数据库的数据:', cleanData);
      console.log('教程ID:', tutorial.id);

      // 添加重试逻辑
      let retryCount = 0;
      const maxRetries = 3;
      let data: any[] | null = null;
      let error: any = null;

      while (retryCount < maxRetries) {
        try {
          const result = await supabase
            .from('tutorials')
            .update(cleanData)
            .eq('id', tutorial.id)
            .select();
          
          data = result.data;
          error = result.error;
          
          if (!error) break; // 如果没有错误，跳出重试循环
          
          console.warn(`更新教程尝试 ${retryCount + 1}/${maxRetries} 失败:`, error);
          retryCount++;
          
          // 简单延迟重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (retryError) {
          console.error(`更新教程尝试 ${retryCount + 1}/${maxRetries} 出现异常:`, retryError);
          retryCount++;
          
          // 简单延迟重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (error) {
        console.error('更新教程时发生错误:', error);
        console.error('错误详情:', JSON.stringify(error));
        
        // 离线模式：如果数据库更新失败，保存到本地存储
        try {
          const offlineTutorials = JSON.parse(localStorage.getItem('offline_tutorials') || '[]');
          const offlineUpdatedTutorial = {
            ...tutorial,
            ...cleanData,
            offline_id: tutorial.id,
            updated_at: new Date().toISOString(),
            is_offline_update: true
          };
          
          // 查找是否已有该教程的离线版本
          const existingIndex = offlineTutorials.findIndex((t: any) => t.offline_id === tutorial.id);
          
          if (existingIndex >= 0) {
            // 更新现有离线教程
            offlineTutorials[existingIndex] = offlineUpdatedTutorial;
          } else {
            // 添加新的离线教程
            offlineTutorials.push(offlineUpdatedTutorial);
          }
          
          localStorage.setItem('offline_tutorials', JSON.stringify(offlineTutorials));
          console.log('教程已离线保存:', offlineUpdatedTutorial);
          
          // 提醒用户
          alert('网络连接不可用，教程已在本地保存，将在网络恢复后自动同步。');
          
          // 更新本地状态以显示离线版本
          setTutorials(tutorials.map(t => t.id === tutorial.id ? offlineUpdatedTutorial : t));
          
          // 关闭模态框
          if (closeModal) closeModal();
          
          return;
        } catch (localStorageError) {
          console.error('保存到本地存储失败:', localStorageError);
          throw error;
        }
      }
      
      console.log('教程更新成功，服务器返回:', data);
      
      // 更新本地状态
      setTutorials(tutorials.map(t => t.id === tutorial.id ? (data?.[0] || {...tutorial, ...cleanData}) : t));
      
      // 重置表单
      setEditingTutorial(null);
      setShowDeleteConfirm(null);
      
      // 关闭模态框
      if (closeModal) closeModal();
      
      // 显示成功消息
      alert('教程更新成功！');
      
      // 触发刷新
      console.log('触发刷新...');
      setRefreshTrigger(prev => {
        const newValue = prev + 1;
        console.log('旧触发器值:', prev, '新触发器值:', newValue);
        return newValue;
      });
    } catch (error: unknown) {
      console.error('更新教程失败:', (error as Error).message);
      alert(`更新失败: ${(error as Error).message}`);
    }
  };
  
  // 修改handleCreateTutorial函数，将新教程保存到数据库
  const handleCreateTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('开始创建教程...');
    
    if (!user) {
      alert('您必须登录才能创建教程');
      return;
    }
    
    // 检查是否是管理员
    const isAdmin = user.user_metadata?.is_admin === true || 
                    user.email === 'xjiami2@gmail.com' || 
                    user.email === 'admin.test@gmail.com';
    
    if (!isAdmin) {
      alert('您没有权限创建教程，只有管理员才能创建教程');
      console.error('权限被拒绝：用户没有管理员权限');
      return;
    }
    
    // 生成SVG缩略图URL
    const svgThumbnail = generateThumbnailUrl(newTutorial.category);
    
    // 创建新教程对象
    const newTutorialData = {
      title: newTutorial.title.trim(),
      category: newTutorial.category,
      difficulty: newTutorial.difficulty,
      duration: newTutorial.duration.trim(),
      description: newTutorial.description.trim(),
      author: user?.user_metadata?.username || user?.email?.split('@')[0] || 'Admin User',
      author_id: user?.id,
      // 直接使用SVG数据URL作为缩略图，完全避免外部依赖
      thumbnail: svgThumbnail,
      content: newTutorial.description.trim(),
      featured: newTutorial.featured,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('准备保存教程数据:', newTutorial.title);
    
    try {
      if (!supabase) {
        throw new Error('Supabase客户端未初始化');
      }
      
      // 添加重试逻辑
      let retryCount = 0;
      const maxRetries = 3;
      let data: any[] | null = null;
      let error: any = null;

      while (retryCount < maxRetries) {
        try {
          console.log(`正在向数据库插入数据...尝试 ${retryCount + 1}/${maxRetries}`);
          const result = await supabase
            .from('tutorials')
            .insert([newTutorialData])
            .select();
          
          data = result.data;
          error = result.error;
          
          if (!error) break; // 如果没有错误，跳出重试循环
          
          console.warn(`创建教程尝试 ${retryCount + 1}/${maxRetries} 失败:`, error);
          retryCount++;
          
          // 简单延迟重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (retryError) {
          console.error(`创建教程尝试 ${retryCount + 1}/${maxRetries} 出现异常:`, retryError);
          retryCount++;
          
          // 简单延迟重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (error) {
        console.error('创建教程时出错:', error);
        console.error('错误详情:', JSON.stringify(error));
        
        // 离线模式：如果数据库创建失败，保存到本地存储
        try {
          const offlineTutorials = JSON.parse(localStorage.getItem('offline_tutorials') || '[]');
          const offlineNewTutorial = {
            ...newTutorialData,
            id: `offline-${Date.now()}`,
            is_offline: true
          };
          
          // 添加新的离线教程
          offlineTutorials.push(offlineNewTutorial);
          localStorage.setItem('offline_tutorials', JSON.stringify(offlineTutorials));
          console.log('教程已离线保存:', offlineNewTutorial);
          
          // 提醒用户
          alert('网络连接不可用，教程已在本地保存，将在网络恢复后自动同步。');
          
          // 更新本地状态以显示离线版本
          setTutorials([offlineNewTutorial, ...tutorials]);
          
          // 重置表单
          setNewTutorial({
            title: '',
            category: 'watercolor',
            difficulty: 'beginner',
            duration: '',
            description: '',
            featured: false
          });
          setIsCreatingTutorial(false);
          return;
        } catch (localStorageError) {
          console.error('保存到本地存储失败:', localStorageError);
          alert('保存教程失败。请重试。\n错误: ' + error.message);
          return;
        }
      }
      
      console.log('教程创建成功:', data);
      
      // 更新本地状态
      setTutorials([...(data || []), ...tutorials]);
      
      // 重置表单
      setNewTutorial({
        title: '',
        category: 'watercolor',
        difficulty: 'beginner',
        duration: '',
        description: '',
        featured: false
      });
      setIsCreatingTutorial(false);
      
      // 显示成功消息
      alert('教程创建成功！');
      
      // 触发刷新
      console.log('触发刷新...');
      setRefreshTrigger(prev => {
        const newValue = prev + 1;
        console.log('旧触发器值:', prev, '新触发器值:', newValue);
        return newValue;
      });
    } catch (err) {
      console.error('错误:', err);
      alert('发生意外错误: ' + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Procreate Brush Tutorials</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Learn how to use different types of brushes through our comprehensive tutorials and guides.
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsCreatingTutorial(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Tutorial
          </button>
        )}
      </div>
      
      {/* New tutorial form */}
      {isCreatingTutorial && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Tutorial</h2>
            <button
              onClick={() => setIsCreatingTutorial(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleCreateTutorial}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newTutorial.title}
                onChange={(e) => setNewTutorial({...newTutorial, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
                placeholder="Tutorial title"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={newTutorial.category}
                  onChange={(e) => setNewTutorial({...newTutorial, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={newTutorial.difficulty}
                  onChange={(e) => setNewTutorial({...newTutorial, difficulty: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {DIFFICULTIES.filter(d => d.id !== 'all').map((difficulty) => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  value={newTutorial.duration}
                  onChange={(e) => setNewTutorial({...newTutorial, duration: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder="e.g. 15 minutes"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={newTutorial.description}
                onChange={(e) => setNewTutorial({...newTutorial, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white h-32"
                required
                placeholder="Enter tutorial description"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={newTutorial.featured}
                  onChange={(e) => setNewTutorial({...newTutorial, featured: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Feature this tutorial
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsCreatingTutorial(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Tutorial
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit tutorial form */}
      {editingTutorial && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Tutorial</h2>
            <button
              onClick={() => setEditingTutorial(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleEditTutorial}>
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
                placeholder="Tutorial title"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="editCategory"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="editDifficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  id="editDifficulty"
                  value={editFormData.difficulty}
                  onChange={(e) => setEditFormData({...editFormData, difficulty: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {DIFFICULTIES.filter(d => d.id !== 'all').map((difficulty) => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="editDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  id="editDuration"
                  value={editFormData.duration}
                  onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  placeholder="e.g. 15 minutes"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="editDescription"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white h-32"
                required
                placeholder="Enter tutorial description"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editFeatured"
                  checked={editFormData.featured}
                  onChange={(e) => setEditFormData({...editFormData, featured: e.target.checked})}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="editFeatured" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Feature this tutorial
                </label>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setEditingTutorial(null)}
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
      
      {/* Featured tutorials */}
      {featuredTutorials.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Featured Tutorials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredTutorials.map(tutorial => (
              <TutorialCard 
                key={tutorial.id} 
                tutorial={tutorial} 
                onEdit={() => startEditTutorial(tutorial)} 
                onDelete={() => setShowDeleteConfirm(tutorial.id as string)} 
                canEdit={!!(isAdmin || (user && user.id === tutorial.author_id))} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Category filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 py-1 text-xs rounded-md ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Difficulty filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map(difficulty => (
                <button
                  key={difficulty.id}
                  onClick={() => setActiveDifficulty(difficulty.id)}
                  className={`px-3 py-1 text-xs rounded-md ${
                    activeDifficulty === difficulty.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {difficulty.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search box */}
          <div className="w-full md:w-auto md:min-w-[250px] space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutorials..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
      
      {/* Tutorial grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
            <p className="ml-3 text-gray-600 dark:text-gray-400">加载教程数据中...</p>
          </div>
        ) : filteredTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutorials.map((tutorial) => (
              <TutorialCard 
                key={tutorial.id} 
                tutorial={tutorial} 
                onEdit={() => startEditTutorial(tutorial)} 
                onDelete={() => setShowDeleteConfirm(tutorial.id as string)} 
                canEdit={!!(isAdmin || (user && user.id === tutorial.author_id))} 
              />
            ))}
            </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {searchQuery ? '没有找到匹配的教程' : '此分类或难度下暂无教程'}
            </p>
                  {isAdmin && (
                      <button
                onClick={() => setIsCreatingTutorial(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                创建第一个教程
                      </button>
            )}
                    </div>
                  )}
      </div>
      
      {/* Newsletter subscription */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Get the Latest Tutorial Updates</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Subscribe to our newsletter to receive the latest tutorials, tips, and resources.
          </p>
        </div>
        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Subscribe
          </button>
        </form>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this tutorial? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTutorial(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 