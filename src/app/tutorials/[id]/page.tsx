'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '../../../../context/SupabaseContext';
import React from 'react';

// 定义Tutorial接口
interface Tutorial {
  id: string | number;
  title: string;
  category: string;
  difficulty: string;
  duration?: string;
  description?: string;
  content?: string;
  author?: string;
  author_id?: string;
  thumbnail?: string;
  videoUrl?: string;
  featured?: boolean;
  views?: number;
  created_at?: string;
  updated_at?: string;
  relatedTutorials?: number[];
}

// 添加或修改relatedTutorials的类型定义
type RelatedTutorial = {
  id: string | number;
  title: string;
  category: string;
  difficulty?: string;
  duration?: string;
  thumbnail?: string;
};

// 定义Comment类型
interface Comment {
  id: string;
  tutorial_id: string;
  content: string;
  author: string;
  author_id: string | null;
  authorAvatar?: string;
  created_at: string;
  likes: number;
  is_local?: boolean;
}

// 教程示例数据与主页面相同
const TUTORIALS = [
  {
    id: 1,
    title: 'Getting Started with Procreate Watercolor Brushes',
    category: 'watercolor',
    difficulty: 'beginner',
    duration: '15 minutes',
    author: 'Emily Zhang',
    thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"%3E%3Crect width="600" height="400" fill="%233B82F6"/%3E%3Ctext x="50%" y="50%" font-size="24" text-anchor="middle" fill="white"%3EWatercolor Tutorial%3C/text%3E%3C/svg%3E',
    description: 'Learn the basics of using watercolor brushes in Procreate to create stunning digital paintings.',
    content: `
      <h2>Introduction to Watercolor in Procreate</h2>
      <p>Procreate offers amazing watercolor brushes that can help you create stunning digital paintings. In this tutorial, we'll explore the basics of using these brushes effectively.</p>
      
      <h2>Getting Started</h2>
      <p>First, make sure you have the latest version of Procreate installed on your iPad. Then, navigate to the brush library and locate the 'Watercolor' brush set.</p>
      
      <h2>Basic Techniques</h2>
      <p>We'll cover the following techniques in this tutorial:</p>
      <ul>
        <li>Creating transparent washes</li>
        <li>Building up layers for depth</li>
        <li>Creating texture with specialized brushes</li>
        <li>Blending colors naturally</li>
      </ul>
      
      <h2>Step-by-Step Demo</h2>
      <p>Follow along as we create a simple watercolor landscape using these techniques.</p>
      
      <h2>Advanced Tips</h2>
      <p>Finally, we'll share some professional tips for getting the most realistic watercolor effects in your digital art.</p>
    `,
    featured: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // 示例视频URL
    relatedTutorials: [2, 5, 7] // 相关教程IDs
  },
  {
    id: 2,
    title: 'Creating Realistic Textures with Custom Brushes',
    category: 'texture',
    difficulty: 'intermediate',
    duration: '25 minutes',
    author: 'Michael Chen',
    thumbnail: 'https://via.placeholder.com/600x400/10B981/FFFFFF?text=Texture+Tutorial',
    description: 'Explore techniques for creating realistic textures using specialized texture brushes.',
    content: `
      <h2>Introduction to Textures in Digital Art</h2>
      <p>Textures add depth and realism to your digital artwork. In this tutorial, we'll explore various techniques for creating realistic textures in Procreate.</p>
      
      <h2>Understanding Brush Settings</h2>
      <p>We'll dive into the brush settings that affect texture creation, including spacing, scatter, and texture source.</p>
      
      <h2>Common Textures</h2>
      <p>Learn how to create these common textures:</p>
      <ul>
        <li>Wood grain</li>
        <li>Rough stone</li>
        <li>Fabric weaves</li>
        <li>Metal surfaces</li>
      </ul>
      
      <h2>Creating Custom Texture Brushes</h2>
      <p>Follow along as we create custom texture brushes that you can use in your own projects.</p>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    relatedTutorials: [6, 3, 1]
  },
  {
    id: 3,
    title: 'Character Design Workflow Using Inking Brushes',
    category: 'inking',
    difficulty: 'intermediate',
    duration: '40 minutes',
    author: 'Jason Liu',
    thumbnail: 'https://via.placeholder.com/600x400/6366F1/FFFFFF?text=Inking+Tutorial',
    description: 'Complete workflow for character design using Procreate\'s inking brush series.',
    content: `
      <h2>Character Design Fundamentals</h2>
      <p>In this tutorial, we'll walk through a complete character design workflow using Procreate's inking brushes.</p>
      
      <h2>Brush Selection</h2>
      <p>We'll explore the various inking brushes available in Procreate and when to use each one.</p>
      
      <h2>Sketching Phase</h2>
      <p>Starting with a rough sketch, we'll develop our character concept using gesture lines and basic shapes.</p>
      
      <h2>Inking Techniques</h2>
      <p>Learn professional inking techniques including:</p>
      <ul>
        <li>Line weight variation</li>
        <li>Hatching and cross-hatching</li>
        <li>Creating smooth curves</li>
        <li>Adding small details</li>
      </ul>
      
      <h2>Final Touches</h2>
      <p>Complete your character design with shadows, highlights, and finishing details.</p>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    relatedTutorials: [4, 6, 8]
  },
  {
    id: 4,
    title: 'Advanced Portrait Techniques',
    category: 'portrait',
    difficulty: 'advanced',
    duration: '60 minutes',
    author: 'Nancy Wang',
    thumbnail: 'https://via.placeholder.com/600x400/EC4899/FFFFFF?text=Portrait+Tutorial',
    description: 'Master advanced techniques for creating realistic digital portraits in Procreate.',
    content: `
      <h2>Advanced Portrait Creation</h2>
      <p>This tutorial covers advanced techniques for creating photorealistic portraits in Procreate.</p>
      
      <h2>Face Structure and Anatomy</h2>
      <p>We'll begin with understanding facial anatomy and proportions as the foundation for realistic portraits.</p>
      
      <h2>Skin Rendering Techniques</h2>
      <p>Learn sophisticated methods for rendering realistic skin textures, including:</p>
      <ul>
        <li>Layering translucent skin tones</li>
        <li>Creating pore details</li>
        <li>Rendering subsurface scattering effects</li>
        <li>Handling different skin types</li>
      </ul>
      
      <h2>Eyes and Expressions</h2>
      <p>Master the techniques for creating lifelike eyes and capturing subtle expressions.</p>
      
      <h2>Hair Rendering</h2>
      <p>Explore advanced methods for creating realistic hair textures and flow.</p>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    relatedTutorials: [3, 7, 5]
  },
  {
    id: 5,
    title: 'Digital Calligraphy for Beginners',
    category: 'calligraphy',
    difficulty: 'beginner',
    duration: '20 minutes',
    author: 'Jenny Lin',
    thumbnail: 'https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=Calligraphy+Tutorial',
    description: 'Learn the basics of digital calligraphy using Procreate\'s specialized brushes.',
    content: `
      <h2>Introduction to Digital Calligraphy</h2>
      <p>Digital calligraphy combines traditional lettering art with the advantages of digital tools. In this beginner-friendly tutorial, we'll explore the basics using Procreate.</p>
      
      <h2>Selecting Your Brushes</h2>
      <p>We'll explore the calligraphy brushes available in Procreate and how to customize them for your style.</p>
      
      <h2>Basic Strokes</h2>
      <p>Learn the fundamental strokes that form the basis of calligraphy:</p>
      <ul>
        <li>Downstrokes and upstrokes</li>
        <li>Thin and thick lines</li>
        <li>Creating curves and loops</li>
        <li>Basic flourishes</li>
      </ul>
      
      <h2>Creating Your First Word</h2>
      <p>Follow along as we create a simple calligraphy piece, putting together the strokes you've learned.</p>
      
      <h2>Tips for Practice</h2>
      <p>Discover effective ways to practice and improve your digital calligraphy skills.</p>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    relatedTutorials: [1, 6, 8]
  },
  {
    id: 6,
    title: 'Creating Custom Brushes from Scratch',
    category: 'customization',
    difficulty: 'advanced',
    duration: '45 minutes',
    author: 'Alex Zhao',
    thumbnail: 'https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Custom+Brushes',
    description: 'Learn how to create your own custom brushes in Procreate to achieve unique artistic effects.',
    content: `
      <h2>Custom Brush Creation Fundamentals</h2>
      <p>In this advanced tutorial, you'll learn how to create custom brushes from scratch in Procreate.</p>
      
      <h2>Understanding Brush Settings</h2>
      <p>We'll explore all the brush settings in detail, including:</p>
      <ul>
        <li>Shape source and grain source</li>
        <li>Spacing and scatter settings</li>
        <li>Dynamics and Apple Pencil settings</li>
        <li>Wet mix and color dynamics</li>
      </ul>
      
      <h2>Creating Texture Sources</h2>
      <p>Learn how to create and optimize your own texture sources for brushes.</p>
      
      <h2>Brush Types</h2>
      <p>We'll create several types of custom brushes, including:</p>
      <ul>
        <li>Textured painting brushes</li>
        <li>Pattern stamps</li>
        <li>Special effect brushes</li>
        <li>Realistic media emulation</li>
      </ul>
      
      <h2>Importing and Sharing</h2>
      <p>Learn how to import brushes from other sources and share your custom creations.</p>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    relatedTutorials: [2, 7, 3]
  },
  {
    id: 7,
    title: 'Landscape Painting Masterclass',
    category: 'landscape',
    difficulty: 'intermediate',
    duration: '50 minutes',
    author: 'Jessica Xu',
    thumbnail: 'https://via.placeholder.com/600x400/059669/FFFFFF?text=Landscape+Tutorial',
    description: 'A comprehensive guide to creating stunning digital landscape paintings in Procreate.',
    content: `
      <h2>Digital Landscape Painting</h2>
      <p>This comprehensive tutorial will guide you through creating beautiful landscape paintings in Procreate.</p>
      
      <h2>Composition Basics</h2>
      <p>Learn essential composition techniques for creating balanced and engaging landscape scenes.</p>
      
      <h2>Color and Light</h2>
      <p>Master the use of color and light to create mood and atmosphere in your landscapes:</p>
      <ul>
        <li>Creating convincing sunlight effects</li>
        <li>Working with natural color palettes</li>
        <li>Atmospheric perspective techniques</li>
        <li>Time of day variations</li>
      </ul>
      
      <h2>Landscape Elements</h2>
      <p>Learn techniques for rendering specific landscape elements:</p>
      <ul>
        <li>Skies and clouds</li>
        <li>Mountains and terrain</li>
        <li>Water and reflections</li>
        <li>Trees and vegetation</li>
      </ul>
      
      <h2>Putting It All Together</h2>
      <p>Follow along as we create a complete landscape painting from start to finish.</p>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    relatedTutorials: [1, 4, 8]
  },
  {
    id: 8,
    title: 'Procreate Animation Basics',
    category: 'animation',
    difficulty: 'intermediate',
    duration: '35 minutes',
    author: 'Kevin Wu',
    thumbnail: 'https://via.placeholder.com/600x400/DC2626/FFFFFF?text=Animation+Tutorial',
    description: 'Get started with Procreate animation using specialized brushes and techniques.',
    content: `
      <h2>Animation in Procreate</h2>
      <p>Discover how to create animations using Procreate's powerful animation tools.</p>
      
      <h2>Animation Basics</h2>
      <p>We'll cover fundamental animation principles:</p>
      <ul>
        <li>Keyframes and frames</li>
        <li>Timing and spacing</li>
        <li>Squash and stretch</li>
        <li>Anticipation and follow-through</li>
      </ul>
      
      <h2>Animation Tools in Procreate</h2>
      <p>Learn how to use Procreate's Animation Assist and related tools effectively.</p>
      
      <h2>Creating a Simple Animation</h2>
      <p>Follow along as we create a simple bouncing ball animation to learn the basics.</p>
      
      <h2>Character Animation</h2>
      <p>Move on to character animation with a simple walk cycle example.</p>
      
      <h2>Exporting and Sharing</h2>
      <p>Learn how to export your animations in various formats and share them with the world.</p>
    `,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    relatedTutorials: [3, 5, 7]
  }
];

// Category names
const CATEGORIES = {
  'watercolor': 'Watercolor',
  'texture': 'Texture',
  'inking': 'Inking',
  'portrait': 'Portrait',
  'calligraphy': 'Calligraphy',
  'customization': 'Customization',
  'landscape': 'Landscape',
  'animation': 'Animation'
};

// Difficulty levels
const DIFFICULTIES = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced'
};

// 确保所有示例评论都包含author_id字段
const sampleLocalComments: Comment[] = [
  {
    id: 'sample1',
    tutorial_id: 'sample-tutorial-id', // 使用静态值代替组件内的变量
    author: '示例用户1',
    author_id: 'sample-user-1',
    authorAvatar: '/avatars/default.svg', // 使用静态头像路径
    content: '这个教程非常有帮助，谢谢分享！',
    created_at: new Date().toISOString(),
    likes: 5,
    is_local: true
  },
  {
    id: 'sample2',
    tutorial_id: 'sample-tutorial-id', // 使用静态值
    author: '示例用户2',
    author_id: 'sample-user-2',
    authorAvatar: '/avatars/default.svg', // 使用静态头像路径
    content: '我按照步骤做了，效果很好。强烈推荐给初学者！',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likes: 3,
    is_local: true
  },
  {
    id: 'sample3',
    tutorial_id: 'sample-tutorial-id', // 使用静态值
    author: '示例用户3',
    author_id: 'sample-user-3',
    authorAvatar: '/avatars/default.svg', // 使用静态头像路径
    content: '请问最后一步有什么技巧吗？我总是做不好那部分。',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    likes: 1,
    is_local: true
  }
];

export default function TutorialDetailPage() {
  // 使用useParams钩子获取路由参数
  const params = useParams();
  const tutorialId = params.id as string;
  const router = useRouter();
  const { user, supabase } = useSupabase();
  
  // 为示例使用创建一个本地状态
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [relatedTutorials, setRelatedTutorials] = useState<RelatedTutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState<number>(0);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  // 获取教程详情
  useEffect(() => {
    // 增加错误处理和日志记录
    const fetchTutorialDetails = async () => {
      setLoading(true);
      try {
        // 直接使用tutorialId作为字符串，而不是尝试转换为整数
        console.log('获取教程详情，ID:', tutorialId);
        
        if (!tutorialId) {
          console.error('教程ID不存在');
          setError('无效的教程ID');
          setLoading(false);
          return;
        }
        
        if (supabase) {
          // 从数据库获取教程详情
          try {
            const { data, error } = await supabase
              .from('tutorials')
              .select('*')
              .eq('id', tutorialId)
              .single();
              
            if (error) {
              console.error('获取教程详情失败:', error);
              throw error;
            }
            
            if (data) {
              console.log('获取到教程详情:', data);
              // 找到教程，设置状态
              setTutorial(data);
              
              // 获取相关教程
              try {
                const { data: relatedData, error: relatedError } = await supabase
                  .from('tutorials')
                  .select('*')
                  .eq('category', data.category)
                  .neq('id', tutorialId)
                  .limit(3);
                
                if (relatedError) {
                  console.error('获取相关教程失败:', relatedError);
                }
                
                if (relatedData) {
                  console.log('获取到相关教程:', relatedData.length);
                  setRelatedTutorials(relatedData);
                }
              } catch (relErr) {
                console.error('获取相关教程时出错:', relErr);
              }
              
              // 增加教程浏览量
              try {
                await supabase.rpc('increment_tutorial_views', { tutorial_id: tutorialId });
              } catch (viewError: any) {
                console.error('增加浏览量失败:', viewError);
              }
              
              // 获取评论
              try {
                const { data: commentsData, error: commentsError } = await supabase
                  .from('tutorial_comments')
                  .select('*')
                  .eq('tutorial_id', tutorialId)
                  .order('created_at', { ascending: false });
                  
                if (commentsError) {
                  console.error('获取评论失败:', commentsError);
                }
                
                if (commentsData) {
                  console.log('获取到评论:', commentsData.length);
                  setComments(commentsData.map(comment => ({
                    ...comment,
                    authorAvatar: generateAvatarSvg(comment.author?.[0] || 'A')
                  })));
                }
              } catch (commErr) {
                console.error('获取评论时出错:', commErr);
              }
            } else {
              // 没有找到教程，设置错误
              console.error('未找到教程，ID:', tutorialId);
              setError('找不到请求的教程');
              
              // 尝试从样本数据中查找
              fallbackToSampleData();
            }
          } catch (dbErr) {
            console.error('数据库操作失败:', dbErr);
            // 尝试从样本数据中查找
            fallbackToSampleData();
          }
        } else {
          // Supabase 客户端不可用，使用示例数据
          console.log('Supabase客户端不可用，使用示例数据');
          fallbackToSampleData();
        }
      } catch (err) {
        console.error('获取教程详情时出错:', err);
        setError('加载教程时出错');
        // 尝试从样本数据中查找
        fallbackToSampleData();
      } finally {
        setLoading(false);
      }
    };
    
    // 从示例数据中获取
    const fallbackToSampleData = () => {
      // 这里使用示例数据，查找ID匹配的教程
      console.log('尝试从示例数据中查找教程:', tutorialId);
      const sampleTutorial = TUTORIALS.find(t => String(t.id) === tutorialId);
      if (sampleTutorial) {
        console.log('在示例数据中找到教程');
        setTutorial(sampleTutorial as Tutorial);
        
        // 设置相关教程
        if (sampleTutorial.relatedTutorials) {
              const related = TUTORIALS.filter(t => 
            (sampleTutorial.relatedTutorials as number[]).includes(t.id as number)
          );
          setRelatedTutorials(related as RelatedTutorial[]);
        }
        
        // 使用示例评论
        setComments(sampleLocalComments);
        
        // 清除错误，因为我们找到了示例数据
        setError(null);
        } else {
        console.error('在示例数据中也找不到教程:', tutorialId);
        setError('找不到请求的教程(示例数据)');
      }
    };
    
    fetchTutorialDetails();
  }, [tutorialId, supabase, router]);

  // 生成安全的缩略图URL (内联SVG)
  const generateSafeThumbnailUrl = (category: string) => {
    // 使用Base64编码的SVG作为缩略图，避免外部依赖
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
    
    // 生成内联SVG数据URL (简化版本，避免复杂编码问题)
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23${color}'/%3E%3C/svg%3E`;
  };

  // 格式化日期
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

  // 修复评论提交函数
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setSubmittingComment(true);
    
    try {
      // 获取用户名，从user_metadata或email中获取
      const username = user.user_metadata?.username || user.email?.split('@')[0] || '匿名用户';
      
      // 保存评论内容到临时变量，避免清空输入框后丢失内容
      const commentContent = newComment.trim();
      
      // 创建一个临时评论显示在UI上
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        tutorial_id: tutorialId || '',
        content: commentContent,
        author: username,
        author_id: user.id || '',  // 使用空字符串而不是null作为默认值
        created_at: new Date().toISOString(),
        likes: 0,
        is_local: true,
        // 确保有一个默认头像
        authorAvatar: generateAvatarSvg(username && username.length > 0 ? username[0] : 'A')
      };

      // 立即更新UI显示，不等待网络请求
      setComments([tempComment, ...comments]);
      setNewComment(''); // 清空输入

      // 保存到数据库 - 使用保存的评论内容
      if (supabase && user) {
        console.log('正在保存评论到数据库...');
        console.log('教程ID:', tutorialId); // 调试教程ID
        
        try {
          // 检查tutorial_comments表是否存在
          const { error: tableCheckError } = await supabase
            .from('tutorial_comments')
            .select('id')
            .limit(1);
            
          if (tableCheckError) {
            console.error('tutorial_comments表可能不存在:', tableCheckError);
            throw new Error('评论表不存在，请先运行setup-tutorials.sql脚本');
          }
          
          // 尝试保存评论
          const { data, error } = await supabase
            .from('tutorial_comments')
            .insert({
              tutorial_id: tutorialId,
              content: commentContent,
              author: username,
              author_id: user.id || null
              // 移除其他可能导致问题的字段，只保留必要字段
            })
            .select();
            
          if (error) {
            console.error('保存评论失败:', error);
            console.error('错误详情:', JSON.stringify(error, null, 2));
            // 从UI中移除临时评论
            setComments(comments.filter(c => c.id !== tempComment.id));
            alert('评论保存失败，请重试。错误: ' + error.message);
          } else if (data && data.length > 0) {
            console.log('评论保存成功:', data[0]);
            // 成功保存，用服务器返回的数据更新本地状态
            const savedComment = data[0] as Comment;
            // 添加头像信息
            savedComment.authorAvatar = generateAvatarSvg(
              savedComment.author && savedComment.author.length > 0 
                ? savedComment.author[0] 
                : 'A'
            );
            
            // 替换临时评论
            setComments(prevComments => 
              prevComments.map(c => 
                c.id === tempComment.id ? savedComment : c
              )
            );
          }
        } catch (innerErr) {
          console.error('保存评论时发生异常:', innerErr);
          alert('保存评论时发生异常，请联系管理员。');
          // 从UI中移除临时评论
          setComments(prevComments => prevComments.filter(c => c.id !== tempComment.id));
        }
      }
    } catch (err) {
      console.error('提交评论时出错:', err);
      alert('评论提交失败，请重试。');
    } finally {
    setSubmittingComment(false);
    }
  };

  // 生成安全的头像SVG
  const generateAvatarSvg = (initial: string = 'A') => {
    // 随机背景颜色
    const bgColors = ['3B82F6', '10B981', 'EC4899', '8B5CF6', 'F59E0B', 'EF4444'];
    const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    
    // 处理初始字符，确保安全性
    let safeInitial = 'A';
    if (initial) {
      try {
        // 获取第一个字符并转大写
        safeInitial = String(initial).charAt(0).toUpperCase();
        
        // 对非ASCII字符(如中文)进行特殊处理
        if (safeInitial.charCodeAt(0) > 127) {
          // 使用默认头像图片
          return `/avatars/default.svg`;
        }
      } catch (e) {
        console.error('处理头像初始字符时出错:', e);
        safeInitial = 'A';
      }
    }
    
    // 返回Base64编码的内联SVG (仅用于ASCII字符)
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23${randomColor}'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' dominant-baseline='middle' fill='white'%3E${safeInitial}%3C/text%3E%3C/svg%3E`;
  };

  // 修改相关教程缩略图的生成方式
  const generateTutorialThumbnail = (category: string, title: string) => {
    const colorMap: Record<string, string> = {
      'watercolor': '3B82F6',
      'texture': '10B981',
      'inking': '6366F1',
      'portrait': 'EC4899',
      'calligraphy': '8B5CF6',
      'customization': 'F59E0B',
      'landscape': '059669',
      'animation': 'DC2626',
      'pencil': '6B7280',
      'charcoal': '111827',
      'pastel': 'F472B6'
    };
    
    const color = colorMap[category] || '3B82F6';
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, ' ').substring(0, 10);
    
    // 返回Base64编码的内联SVG
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23${color}'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' fill='white'%3E${safeTitle}%3C/text%3E%3C/svg%3E`;
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tutorial Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The tutorial you are looking for does not exist or has been deleted.
          </p>
          <Link href="/tutorials" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Tutorials
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载教程数据...</p>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tutorial Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The tutorial you are looking for does not exist or has been deleted.
          </p>
          <Link href="/tutorials" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Tutorials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 返回链接 */}
      <Link 
        href="/tutorials" 
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
      >
        ← Back to all tutorials
      </Link>
      
      {/* 教程标题和元数据 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-64 md:h-80">
          {tutorial.thumbnail ? (
          <Image
            src={tutorial.thumbnail}
            alt={tutorial.title}
            fill
            className="object-cover"
              onError={(e) => {
                // 图片加载失败时使用安全的内联SVG
                console.log('缩略图加载失败，使用备用图像');
                const target = e.target as HTMLImageElement;
                target.src = generateSafeThumbnailUrl(tutorial.category);
              }}
            />
          ) : (
            // 没有缩略图时显示一个纯色背景
            <div 
              className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: `#${tutorial.category === 'watercolor' ? '3B82F6' : '10B981'}` }}
            >
              {CATEGORIES[tutorial.category as keyof typeof CATEGORIES] || tutorial.category}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-600 rounded-full text-xs font-medium">
                {CATEGORIES[tutorial.category as keyof typeof CATEGORIES]}
              </span>
              <span className="px-2 py-1 bg-gray-700 rounded-full text-xs font-medium">
                {DIFFICULTIES[tutorial.difficulty as keyof typeof DIFFICULTIES]}
              </span>
              <span className="px-2 py-1 bg-gray-700 rounded-full text-xs font-medium">
                {tutorial.duration}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{tutorial.title}</h1>
            <p className="text-gray-200 mb-2">{tutorial.description}</p>
            <p className="text-sm text-gray-300">By {tutorial.author}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主要内容区 */}
        <div className="lg:col-span-2">
          {/* 视频教程 */}
          {tutorial.videoUrl && tutorial.videoUrl.startsWith('https://') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tutorial Video</h2>
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe 
                  src={tutorial.videoUrl} 
                  title={tutorial.title}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={(e) => {
                    console.error('视频加载失败:', e);
                    // 可以在此处添加视频加载失败的处理逻辑
                  }}
                ></iframe>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                If the video fails to load, please try refreshing the page or visit the video link directly
              </p>
            </div>
          )}
          
          {/* 教程内容 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tutorial Content</h2>
            {tutorial.content ? (
            <div 
              className="prose prose-blue max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: tutorial.content }}
            ></div>
            ) : (
              <div className="text-gray-600 dark:text-gray-300 italic">
                <p>No detailed content available for this tutorial.</p>
                <p className="mt-2">This may be a preview or work in progress tutorial.</p>
              </div>
            )}
          </div>
          
          {/* 评论区 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Comments ({comments.length})</h2>
            
            {/* 添加评论表单 */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <div className="mb-4">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Add a comment
                  </label>
                  <textarea
                    id="comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white h-24"
                    required
                    placeholder="Share your thoughts on this tutorial..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
                  >
                    {submittingComment ? 'Submitting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <p className="text-gray-600 dark:text-gray-300">
                  Please <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">log in</Link> to leave a comment.
                </p>
              </div>
            )}
            
            {/* 评论列表 */}
            {comments.length > 0 ? (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div 
                    key={comment.id}
                    className={`p-4 rounded-lg bg-white dark:bg-gray-800 mb-4 shadow-sm ${comment.is_local ? 'border-l-4 border-amber-500' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                        <Image
                        src={comment.authorAvatar || generateAvatarSvg(comment.author && comment.author.length > 0 ? comment.author[0] : 'A')}
                        alt={comment.author || 'Anonymous'} 
                          width={40}
                          height={40}
                        className="rounded-full"
                        />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{comment.author || 'Anonymous'}</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{comment.content}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <button className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          {comment.likes}
                        </button>
                        <button className="text-gray-500 dark:text-gray-400 text-sm hover:text-blue-600 dark:hover:text-blue-400">Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
        
        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          {/* 作者信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About the Author</h2>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {tutorial.author?.[0].toUpperCase() || 'A'}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{tutorial.author || '未知作者'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tutorial Creator</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              <p>An experienced digital artist specializing in Procreate tutorials and digital art techniques.</p>
            </div>
            <div className="mt-4">
              <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium">
                View More Tutorials
              </button>
            </div>
          </div>
          
          {/* 教程信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tutorial Information</h2>
            <ul className="space-y-3">
              <li className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <span className="font-medium text-gray-900 dark:text-white">{CATEGORIES[tutorial.category as keyof typeof CATEGORIES]}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                <span className="font-medium text-gray-900 dark:text-white">{DIFFICULTIES[tutorial.difficulty as keyof typeof DIFFICULTIES]}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">{tutorial.duration}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Published:</span>
                <span className="font-medium text-gray-900 dark:text-white">October 15, 2023</span>
              </li>
            </ul>
          </div>
          
          {/* 相关教程 */}
          {relatedTutorials.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Tutorials</h2>
              <div className="space-y-4">
                {relatedTutorials.map((relatedTutorial) => (
                  <Link 
                    key={relatedTutorial.id} 
                    href={`/tutorials/${String(relatedTutorial.id)}`}
                    className="block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-video">
                        <Image
                        src={relatedTutorial.thumbnail || generateTutorialThumbnail(relatedTutorial.category, relatedTutorial.title)}
                          alt={relatedTutorial.title}
                          fill
                          className="object-cover"
                        onError={(e) => {
                          console.error('相关教程缩略图加载失败');
                          const target = e.target as HTMLImageElement;
                          target.src = generateTutorialThumbnail(relatedTutorial.category, relatedTutorial.title);
                        }}
                        />
                      </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-1 line-clamp-2">
                        {relatedTutorial.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full">
                          {relatedTutorial.difficulty || 'beginner'}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{relatedTutorial.duration || '15 min'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Tutorials</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No related tutorials available for this topic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 