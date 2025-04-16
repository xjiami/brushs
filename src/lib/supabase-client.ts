'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 在文件中靠前位置添加类型定义
interface DashboardStats {
  totalBrushes: number;
  totalDownloads: number;
  totalUsers: number;
  newUsersLastWeek: number;
  topBrushes: Array<{id: string; title: string; preview_image_url: string; download_count: number}>;
  topCategories: Array<{category_id: string; count: number; name?: string}>;
  downloadsTrend: Array<{date: string; count: number}>;
  userGrowth: Array<{date: string; count: number}>;
}

// 添加全局类型声明
declare global {
  interface Window {
    __SUPABASE_INSTANCE: SupabaseClient | null;
    __SUPABASE_CREATION_COUNT: number;
  }
}

// 全局单例实例 - 使用全局变量确保整个应用只有一个实例
let globalSupabaseInstance: SupabaseClient | null = null;

// 添加实例创建计数器
let instanceCreationAttempt = 0;

// 添加类型定义
export interface SaveCategoryParams {
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  image?: File;
}

export interface SaveCategoryResult {
  success: boolean;
  message: string;
  category: any;
}

/**
 * 获取 Supabase 客户端实例的单例工厂函数
 * 确保整个应用中只创建一个实例，解决多实例问题
 */
export function getSupabaseClient(): SupabaseClient {
  // 增加计数
  instanceCreationAttempt++;
  
  // 严格的浏览器环境检测
  if (typeof window === 'undefined') {
    console.warn('[Supabase] 尝试在服务器端创建 Supabase 客户端，这可能导致问题');
    // 为了不抛出错误，在服务器端会为每个请求创建新实例，但这不会影响客户端的单例模式
  } else {
    // 客户端环境 - 使用 window 对象存储实例
    if (window.__SUPABASE_INSTANCE) {
      if (instanceCreationAttempt > 1) {
        console.log(`[Supabase] 重用现有实例 (调用次数: ${instanceCreationAttempt})`);
      }
      return window.__SUPABASE_INSTANCE;
    }
    
    // 跟踪创建次数
    if (!window.__SUPABASE_CREATION_COUNT) {
      window.__SUPABASE_CREATION_COUNT = 1;
    } else {
      window.__SUPABASE_CREATION_COUNT++;
      console.warn(`[Supabase] 警告: 创建了第 ${window.__SUPABASE_CREATION_COUNT} 个实例。应使用 useSupabase() 钩子获取实例。`);
    }
  }
  
  // 如果已经有实例，直接返回
  if (globalSupabaseInstance) {
    return globalSupabaseInstance;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase] 错误: 缺少 Supabase 环境变量', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    });
    throw new Error('缺少 Supabase 环境变量。请确保已设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  try {
    console.log('[Supabase] 创建新的 Supabase 客户端实例');
    globalSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    
    // 在浏览器环境中，保存到 window 对象
    if (typeof window !== 'undefined') {
      window.__SUPABASE_INSTANCE = globalSupabaseInstance;
    }
    
    return globalSupabaseInstance;
  } catch (error) {
    console.error('[Supabase] 创建客户端实例失败:', error);
    throw error;
  }
}

// 身份验证相关函数
export async function signUp(email: string, password: string, username: string) {
  const supabase = getSupabaseClient();
  
  // 注册新用户，禁用邮箱确认
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: {
        username: username
      }
    }
  });
  
  if (authError) throw authError;
  
  // 如果注册成功，则更新用户的个人资料
  if (authData?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: authData.user.id, 
          username,
          created_at: new Date(),
          subscription_status: 'free'
        }
      ]);
    
    if (profileError) throw profileError;
  }
  
  return authData;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  // 如果登录成功，检查用户是否是管理员，并更新用户元数据
  if (data?.user) {
    try {
      // 从profiles表获取是否是管理员
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();
      
      // 如果是管理员，更新用户元数据
      if (profile?.is_admin) {
        await supabase.auth.updateUser({
          data: { is_admin: true }
        });
      }
      
      // 特殊管理员账号
      if (data.user.email === 'xjiami2@gmail.com' || data.user.email === 'admin.test@gmail.com') {
        await supabase.auth.updateUser({
          data: { is_admin: true }
        });
      }
    } catch (err) {
      console.error('更新用户元数据失败:', err);
    }
  }
  
  return {
    user: data?.user || null,
    session: data?.session || null,
    error: error
  };
}

// 添加第三方登录函数
export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
}

export async function signInWithGithub() {
  const supabase = getSupabaseClient();
  return supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
}

export async function signOut() {
  const supabase = getSupabaseClient();
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) throw error;
}

// 用户相关函数
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error) throw error;
  return data.user;
}

export async function getUserProfile(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// 笔刷相关函数
export async function getBrushes({ 
  category = null, 
  isFree = null, 
  sortBy = 'created_at', 
  searchQuery = '',
  limit = 50,
  offset = 0,
  tags = [],
  compatibility = [],
  minPrice = undefined,
  maxPrice = undefined,
  minRating = undefined
} = {}) {
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('brushes')
      .select('*, categories!inner(*)')
      .order(sortBy, { ascending: sortBy === 'title' ? true : false });
    
    // Apply filters
    if (category) {
      // Join with categories and filter by slug
      query = query.eq('categories.slug', category);
    }
    
    if (isFree !== null) {
      query = query.eq('is_free', isFree);
    }
    
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Apply advanced filters if provided
    if (tags && tags.length > 0) {
      // Filter by tags (assumes tags are stored in a 'tags' column as an array)
      // Alternatively, if tags are in a separate table, use a different approach
      query = query.contains('tags', tags);
    }

    if (compatibility && compatibility.length > 0) {
      // Filter by compatibility (assumes compatibility is stored in a column)
      query = query.overlaps('compatibility', compatibility);
    }

    if (minPrice !== undefined) {
      // Only apply to paid brushes
      query = query.or(`is_free.eq.false,and(price.gte.${minPrice})`);
    }

    if (maxPrice !== undefined) {
      // Only apply to paid brushes
      query = query.or(`is_free.eq.true,and(price.lte.${maxPrice})`);
    }

    if (minRating !== undefined) {
      query = query.gte('average_rating', minRating);
    }
    
    // Apply pagination
    if (limit) {
      query = query.limit(limit);
    }
    
    if (offset) {
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching brushes:', error);
    return [];
  }
}

export async function getBrushById(id: string) {
  const supabase = getSupabaseClient();
  
  try {
    console.log('getBrushById: 开始获取笔刷数据，ID:', id);
    
    // 获取笔刷基本信息
    const { data: brush, error: brushError } = await supabase
      .from('brushes')
      .select(`
        *,
        categories(*),
        creator:profiles(*)
      `)
      .eq('id', id)
      .single();
    
    if (brushError) {
      console.error('getBrushById: 获取笔刷基本信息出错:', brushError);
      throw brushError;
    }
    
    if (!brush) {
      console.error('getBrushById: 未找到笔刷数据，ID:', id);
      return null;
    }
    
    console.log('getBrushById: 获取到笔刷基本数据:', brush);
    
    try {
      // 获取笔刷图片
      const { data: brushImages, error: imagesError } = await supabase
        .from('brush_images')
        .select('id, image_url, display_order')
        .eq('brush_id', id)
        .order('display_order', { ascending: true });
        
      if (imagesError) {
        console.warn('getBrushById: 获取笔刷图片出错，但继续执行:', imagesError);
      }
      
      // 获取评分信息
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('score')
        .eq('brush_id', id);
      
      if (ratingsError) {
        console.warn('getBrushById: 获取评分信息出错，但继续执行:', ratingsError);
      }
      
      // 计算平均评分
      let averageRating = 0;
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, curr) => acc + curr.score, 0);
        averageRating = sum / ratingsData.length;
      }
      
      // 获取相关笔刷（同类别）
      const { data: relatedBrushes, error: relatedError } = await supabase
        .from('brushes')
        .select('id, title, preview_image_url')
        .eq('category_id', brush.category_id)
        .neq('id', id)
        .limit(4);
      
      if (relatedError) {
        console.warn('getBrushById: 获取相关笔刷出错，但继续执行:', relatedError);
      }
      
      const result = {
        ...brush,
        brush_images: brushImages || [],
        gallery_images: brushImages ? brushImages.map(img => img.image_url) : [],
        ratings: {
          average: averageRating.toFixed(1),
          count: ratingsData?.length || 0
        },
        relatedBrushes: relatedBrushes || []
      };
      
      console.log('getBrushById: 返回完整笔刷数据');
      return result;
    } catch (err) {
      console.error('getBrushById: 处理额外数据时出错，但返回基本笔刷数据:', err);
      // 发生错误时，仍然返回基本笔刷数据
      return brush;
    }
  } catch (err) {
    console.error('getBrushById: 获取笔刷数据失败:', err);
    throw err;
  }
}

// 类别相关函数
export async function getCategories() {
  const supabase = getSupabaseClient();
  
  try {
    // 获取所有分类
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (categoriesError) throw categoriesError;
    
    // 如果没有分类，直接返回空数组
    if (!categories || categories.length === 0) {
      return [];
    }
    
    let categoriesWithCounts = [...categories];
    
    try {
      // 获取每个分类的笔刷数量 - 使用SQL查询进行分组统计
      const { data: brushCounts, error: countsError } = await supabase
        .rpc('get_brush_counts_by_category');
      
      if (countsError) {
        console.error('获取分类笔刷数量失败:', countsError);
      } else if (brushCounts) {
        // 将笔刷数量信息添加到分类数据中
        categoriesWithCounts = categories.map(category => {
          const countInfo = brushCounts.find((item: { category_id: string; count: number }) => 
            item.category_id === category.id
          );
          return {
            ...category,
            brush_count: countInfo ? countInfo.count : 0
          };
        });
      }
    } catch (err) {
      console.warn('获取笔刷数量时出错，将使用默认值0:', err);
      // 出错时仍然返回分类，但笔刷数设为0
      categoriesWithCounts = categories.map(category => ({
        ...category,
        brush_count: 0
      }));
    }
    
    return categoriesWithCounts;
  } catch (error) {
    console.error('获取分类数据失败:', error);
    throw error;
  }
}

export async function getCategoryBySlug(slug: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data;
}

// 订阅相关函数
export async function getUserSubscription(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 是"没有找到结果"的错误代码
  return data;
}

// 下载相关函数
export async function recordDownload(brushId: string, userId: string) {
  const supabase = getSupabaseClient();
  
  // 检查是否已有下载记录
  const { data: existingRecord, error: checkError } = await supabase
    .from('brush_downloads')
    .select('id')
    .eq('brush_id', brushId)
    .eq('user_id', userId)
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') throw checkError;
  
  // 如果已有记录，仅更新下载日期
  if (existingRecord) {
    const { error: updateError } = await supabase
      .from('brush_downloads')
      .update({ download_date: new Date() })
      .eq('id', existingRecord.id);
    
    if (updateError) throw updateError;
  } else {
    // 否则创建新记录
    const { error: insertError } = await supabase
      .from('brush_downloads')
      .insert([
        { 
          brush_id: brushId, 
          user_id: userId,
          download_date: new Date(),
          ip_address: '127.0.0.1' // 实际应用中应该获取真实IP
        }
      ]);
    
    if (insertError) throw insertError;
    
    // 更新笔刷的下载计数
    const { error: updateError } = await supabase.rpc('increment_download_count', {
      brush_id: brushId
    });
    
    if (updateError) throw updateError;
  }
}

// 获取用户下载记录
export async function getUserDownloads(userId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('brush_downloads')
    .select(`
      id, 
      download_date,
      brushes (
        id, 
        title, 
        preview_image_url,
        is_free,
        price
      )
    `)
    .eq('user_id', userId)
    .order('download_date', { ascending: false });
  
  if (error) throw error;
  return data;
}

// 评论和评分
export async function addComment(brushId: string, userId: string, content: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('comments')
    .insert([
      { 
        brush_id: brushId, 
        user_id: userId,
        content,
        created_at: new Date()
      }
    ]);
  
  if (error) throw error;
}

export async function getComments(brushId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles(username, avatar_url)
    `)
    .eq('brush_id', brushId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addRating(brushId: string, userId: string, score: number) {
  if (score < 1 || score > 5) {
    throw new Error('评分必须在1到5之间');
  }
  
  const supabase = getSupabaseClient();
  
  // 检查用户是否已评分
  const { data: existingRating, error: checkError } = await supabase
    .from('ratings')
    .select('id')
    .eq('brush_id', brushId)
    .eq('user_id', userId)
    .single();
  
  if (checkError && checkError.code !== 'PGRST116') throw checkError;
  
  if (existingRating) {
    // 更新已有评分
    const { error: updateError } = await supabase
      .from('ratings')
      .update({ score, created_at: new Date() })
      .eq('id', existingRating.id);
    
    if (updateError) throw updateError;
  } else {
    // 添加新评分
    const { error: insertError } = await supabase
      .from('ratings')
      .insert([
        { 
          brush_id: brushId, 
          user_id: userId,
          score,
          created_at: new Date()
        }
      ]);
    
    if (insertError) throw insertError;
  }
}

// 获取订阅计划
export async function getSubscriptionPlans() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('monthly_price', { ascending: true });
  
  if (error) throw error;
  return data;
}

// 发起订阅购买
export async function initiateSubscription(planId: string, billingCycle: 'monthly' | 'yearly') {
  // 实际应用中，这里应该是与Paddle API交互的代码
  // 目前仅作为示例返回一个模拟的checkout URL
  return {
    success: true,
    checkoutUrl: `https://checkout.paddle.com/checkout/custom?product=${planId}&billing_cycle=${billingCycle}`,
    error: null
  };
}

// 取消订阅
export async function cancelSubscription(subscriptionId: string) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }
  
  // 检查订阅是否属于当前用户
  const { data: subscription, error: checkError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('user_id', user.id)
    .single();
  
  if (checkError) {
    throw checkError;
  }
  
  if (!subscription) {
    throw new Error('找不到订阅信息或您无权操作此订阅');
  }
  
  // 在实际实现中，这里应该调用支付平台API取消订阅
  // 例如：await cancelPaddleSubscription(subscription.paddle_subscription_id);
  
  // 更新订阅状态为已取消
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', subscriptionId);
  
  if (updateError) {
    throw updateError;
  }
  
  return true;
}

// 管理员功能：保存笔刷（新建或更新）
export async function saveBrush(brushData: any, previewImage?: File, brushFile?: File, galleryImages?: File[]) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }
  
  // 检查用户是否为管理员
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  if (profileError) throw profileError;
  
  if (!profile?.is_admin) {
    throw new Error('您没有管理员权限');
  }

  // 处理文件上传
  let previewImageUrl = brushData.preview_image_url;
  let brushFileUrl = brushData.file_url || brushData.downloadUrl; // 添加对直接输入URL的支持
  const galleryImageUrls: string[] = [...(brushData.gallery_images || [])];
  
  try {
    // 1. 上传预览图
    if (previewImage) {
      // 为文件生成唯一文件名
      const fileExt = previewImage.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('brush-previews')
        .upload(fileName, previewImage);
      
      if (uploadError) throw uploadError;
      
      // 获取公共URL
      const { data: urlData } = supabase.storage
        .from('brush-previews')
        .getPublicUrl(fileName);
      
      previewImageUrl = urlData.publicUrl;
    }
    
    // 2. 上传笔刷文件
    if (brushFile) {
      const fileExt = brushFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('brush-files')
        .upload(fileName, brushFile);
      
      if (uploadError) throw uploadError;
      
      // 获取公共URL
      const { data: urlData } = supabase.storage
        .from('brush-files')
        .getPublicUrl(fileName);
      
      brushFileUrl = urlData.publicUrl;
    }
    
    // 3. 上传画廊图片
    if (galleryImages && galleryImages.length > 0) {
      for (const image of galleryImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brush-gallery')
          .upload(fileName, image);
        
        if (uploadError) throw uploadError;
        
        // 获取公共URL
        const { data: urlData } = supabase.storage
          .from('brush-gallery')
          .getPublicUrl(fileName);
        
        galleryImageUrls.push(urlData.publicUrl);
      }
    }
    
    // 4. 保存笔刷数据
    const brushDataToSave = {
      title: brushData.title,
      description: brushData.description,
      long_description: brushData.longDescription,
      preview_image_url: previewImageUrl,
      file_url: brushFileUrl,
      category_id: brushData.category,
      creator_id: user.id,
      price: brushData.isFree ? 0 : parseFloat(brushData.price),
      is_free: brushData.isFree,
      is_featured: brushData.isFeatured,
      compatibility: brushData.compatibility,
      tags: brushData.tags ? brushData.tags.split(',').map((tag: string) => tag.trim()) : [],
      file_size: brushFile ? `${Math.round(brushFile.size / 1024)} KB` : brushData.fileSize || '未知',
      updated_at: new Date()
    };
    
    let result;
    
    if (brushData.id) {
      // 更新现有笔刷
      const { data, error } = await supabase
        .from('brushes')
        .update(brushDataToSave)
        .eq('id', brushData.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
      
      // 处理画廊图片 - 对于更新操作，先删除指定的图片，然后添加新图片
      if (brushData.galleryImagesToDelete && brushData.galleryImagesToDelete.length > 0) {
        // 删除指定的画廊图片
        const { error: deleteError } = await supabase
          .from('brush_images')
          .delete()
          .in('id', brushData.galleryImagesToDelete);
        
        if (deleteError) throw deleteError;
      }
    } else {
      // 创建新笔刷
      const { data, error } = await supabase
        .from('brushes')
        .insert([{
          ...brushDataToSave,
          created_at: new Date(),
          download_count: 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    // 5. 保存画廊图片
    if (galleryImageUrls.length > 0) {
      const galleryImagesToSave = galleryImageUrls.map((url, index) => ({
        brush_id: result.id,
        image_url: url,
        display_order: index
      }));
      
      const { error: galleryError } = await supabase
        .from('brush_images')
        .insert(galleryImagesToSave);
      
      if (galleryError) throw galleryError;
    }
    
    return result;
  } catch (error) {
    console.error('保存笔刷时出错:', error);
    throw error;
  }
}

// 管理员功能：删除笔刷
export async function deleteBrush(brushId: string) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('用户未登录');
  }
  
  // 检查用户是否为管理员
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  if (profileError) throw profileError;
  
  if (!profile?.is_admin) {
    throw new Error('您没有管理员权限');
  }
  
  try {
    // 1. 删除相关的画廊图片
    const { error: imagesError } = await supabase
      .from('brush_images')
      .delete()
      .eq('brush_id', brushId);
    
    if (imagesError) throw imagesError;
    
    // 2. 删除相关的评分
    const { error: ratingsError } = await supabase
      .from('ratings')
      .delete()
      .eq('brush_id', brushId);
    
    if (ratingsError) throw ratingsError;
    
    // 3. 删除相关的评论
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('brush_id', brushId);
    
    if (commentsError) throw commentsError;
    
    // 4. 删除相关的下载记录
    const { error: downloadsError } = await supabase
      .from('brush_downloads')
      .delete()
      .eq('brush_id', brushId);
    
    if (downloadsError) throw downloadsError;
    
    // 5. 最后删除笔刷本身
    const { error: brushError } = await supabase
      .from('brushes')
      .delete()
      .eq('id', brushId);
    
    if (brushError) throw brushError;
    
    // 注意：这个实现中不会从存储中删除文件
    // 在正式生产环境中，应该添加代码从Storage中删除文件
    
    return true;
  } catch (error) {
    console.error('删除笔刷时出错:', error);
    throw error;
  }
}

// 仪表盘统计数据相关函数
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseClient();
  const stats: DashboardStats = {
    totalBrushes: 0,
    totalDownloads: 0,
    totalUsers: 0,
    newUsersLastWeek: 0,
    topBrushes: [],
    topCategories: [],
    downloadsTrend: [],
    userGrowth: []
  };
  
  try {
    // 获取笔刷总数
    const { count: brushCount, error: brushError } = await supabase
      .from('brushes')
      .select('*', { count: 'exact', head: true });
      
    if (!brushError) {
      stats.totalBrushes = brushCount || 0;
    }
    
    // 获取下载总数
    const { count: downloadCount, error: downloadError } = await supabase
      .from('brush_downloads')
      .select('*', { count: 'exact', head: true });
      
    if (!downloadError) {
      stats.totalDownloads = downloadCount || 0;
    }
    
    // 获取用户总数
    const { count: userCount, error: userError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (!userError) {
      stats.totalUsers = userCount || 0;
    }
    
    // 获取最近一周新增用户数
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { count: newUserCount, error: newUserError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());
      
    if (!newUserError) {
      stats.newUsersLastWeek = newUserCount || 0;
    }
    
    // 获取最受欢迎的笔刷（按下载量）
    const { data: topBrushesData, error: topBrushesError } = await supabase
      .from('brushes')
      .select('id, title, preview_image_url, download_count')
      .order('download_count', { ascending: false })
      .limit(5);
      
    if (!topBrushesError && topBrushesData) {
      stats.topBrushes = topBrushesData;
    }
    
    // 获取最受欢迎的分类（按笔刷数量）
    const { data: topCategoriesData, error: topCategoriesError } = await supabase
      .rpc('get_brush_counts_by_category');
      
    if (!topCategoriesError && topCategoriesData) {
      // 按笔刷数量降序排序
      const sortedCategories = [...topCategoriesData].sort((a, b) => b.count - a.count).slice(0, 5);
      
      // 获取分类名称
      const categoryIds = sortedCategories.map(c => c.category_id);
      const { data: categoryNames, error: namesError } = await supabase
        .from('categories')
        .select('id, name')
        .in('id', categoryIds);
      
      if (!namesError && categoryNames) {
        stats.topCategories = sortedCategories.map(cat => {
          const categoryInfo = categoryNames.find(c => c.id === cat.category_id);
          return {
            ...cat,
            name: categoryInfo?.name || '未知分类'
          };
        });
      }
    }
    
    // 获取过去30天的下载趋势
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: downloadsData, error: downloadsError } = await supabase
      .from('brush_downloads')
      .select('download_date')
      .gte('download_date', thirtyDaysAgo.toISOString());
      
    if (!downloadsError && downloadsData) {
      // 按日期分组统计
      const downloadsByDate: Record<string, number> = {};
      
      // 初始化过去30天的日期
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        downloadsByDate[dateString] = 0;
      }
      
      // 填充实际数据
      downloadsData.forEach(download => {
        const dateString = new Date(download.download_date).toISOString().split('T')[0];
        if (downloadsByDate[dateString] !== undefined) {
          downloadsByDate[dateString]++;
        }
      });
      
      // 转换为数组格式
      stats.downloadsTrend = Object.entries(downloadsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
    
    // 获取过去30天的用户增长趋势
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());
      
    if (!usersError && usersData) {
      // 按日期分组统计
      const usersByDate: Record<string, number> = {};
      
      // 初始化过去30天的日期
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
        usersByDate[dateString] = 0;
      }
      
      // 填充实际数据
      usersData.forEach(user => {
        const dateString = new Date(user.created_at).toISOString().split('T')[0];
        if (usersByDate[dateString] !== undefined) {
          usersByDate[dateString]++;
        }
      });
      
      // 转换为数组格式
      stats.userGrowth = Object.entries(usersByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
  } catch (error) {
    console.error('获取仪表盘统计数据失败:', error);
  }
  
  return stats;
}

// 管理员功能：保存分类（新建或更新）
export async function saveCategory(
  params: SaveCategoryParams, 
  imageFile?: File
): Promise<SaveCategoryResult> {
  console.log('开始保存类别...');
  
  const supabase = getSupabaseClient();
  
  // 检查用户是否登录
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    console.error('获取会话失败或用户未登录:', sessionError);
    return {
      success: false,
      message: '请先登录',
      category: null,
    };
  }
  
  // 检查用户是否是管理员
  const isAdmin = await checkIsAdmin(session.user.id);
  
  if (!isAdmin) {
    console.error('用户不是管理员:', session.user.id);
    return {
      success: false,
      message: '没有足够的权限执行此操作',
      category: null,
    };
  }
  
  try {
    // 生成唯一ID
    const id = Date.now().toString();
    
    let imagePath = null;
    
    // 如果有图片，上传到存储
    if (imageFile) {
      // 确保文件类型是图片
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(imageFile.type)) {
        return {
          success: false,
          message: '不支持的图片格式，请上传JPG, PNG或GIF格式的图片',
          category: null,
        };
      }
      
      // 检查文件大小，限制为2MB
      if (imageFile.size > 2 * 1024 * 1024) {
        return {
          success: false,
          message: '图片大小超过限制，请上传小于2MB的图片',
          category: null,
        };
      }

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 10);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `cat_${timestamp}_${randomId}.${fileExt}`;
      const filePath = `category-images/${fileName}`;
      
      // 先检查category-images存储桶是否存在
      console.log('检查category-images存储桶是否存在...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('获取存储桶列表失败:', bucketsError);
        return {
          success: false,
          message: `获取存储桶列表失败: ${bucketsError.message}`,
          category: null,
        };
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'category-images') || false;
      
      // 如果存储桶不存在，尝试创建它
      if (!bucketExists) {
        console.log('category-images存储桶不存在，尝试创建...');
        const { error: createBucketError } = await supabase.storage.createBucket('category-images', { 
          public: true 
        });
        
        if (createBucketError) {
          console.error('创建category-images存储桶失败:', createBucketError);
          return {
            success: false,
            message: `无法创建必要的存储桶: ${createBucketError.message}`,
            category: null,
          };
        }
        
        console.log('成功创建category-images存储桶');
      }
      
      // 上传图片
      console.log(`开始上传图片到 ${filePath}...`);
      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        console.error('上传图片失败:', uploadError);
        return {
          success: false,
          message: `上传图片失败: ${uploadError.message}`,
          category: null,
        };
      }
      
      console.log('图片上传成功，获取公共URL...');
      
      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(fileName);
      
      imagePath = publicUrl;
      console.log('获取到的图片公共URL:', imagePath);
    }
    
    // 创建类别记录
    console.log('创建类别记录...');
    const { data: category, error: insertError } = await supabase
      .from('categories')
      .insert([
        {
          name: params.name,
          slug: params.slug || slugify(params.name),
          description: params.description,
          display_order: params.displayOrder || 0,
          image_url: imagePath,
        },
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('插入类别记录失败:', insertError);
      return {
        success: false,
        message: `保存类别失败: ${insertError.message}`,
        category: null,
      };
    }
    
    console.log('类别保存成功:', category);
    return {
      success: true,
      message: '类别保存成功',
      category,
    };
  } catch (error) {
    console.error('保存类别时出错:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '保存类别时发生未知错误',
      category: null,
    };
  }
}

// 添加辅助函数
export async function checkIsAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  // 先检查session中的用户元数据
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.user_metadata?.is_admin === true || 
      session?.user?.email === 'xjiami2@gmail.com' || 
      session?.user?.email === 'admin.test@gmail.com') {
    return true;
  }
  
  // 如果元数据中没有管理员标志，则检查数据库
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error('获取用户资料出错:', profileError);
    return false;
  }
  
  return profile?.is_admin === true;
}

// 添加slugify函数
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // 将空格替换为连字符
    .replace(/[^\w\-]+/g, '') // 删除非单词字符
    .replace(/\-\-+/g, '-')   // 替换多个连字符为单个连字符
    .replace(/^-+/, '')       // 删除开头的连字符
    .replace(/-+$/, '');      // 删除结尾的连字符
}

// 诊断函数 - 用于检查 Supabase 连接状态
export async function checkSupabaseConnection() {
  try {
    const supabase = getSupabaseClient();
    console.log('[Supabase] 连接检查开始');

    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('[Supabase] 环境变量:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl?.substring(0, 15) + '...'
    });

    // 检查会话
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    console.log('[Supabase] 会话状态:', {
      hasSession: !!sessionData?.session,
      hasUser: !!sessionData?.session?.user,
      error: sessionError?.message || null
    });

    // 尝试一个简单的数据库查询
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
        
      console.log('[Supabase] 数据库连接:', {
        success: !error,
        error: error?.message || null,
        hint: error?.hint || null,
        code: error?.code || null
      });
      
      if (error?.code === '42P01') {
        console.log('[Supabase] 错误: profiles 表不存在。请检查数据库架构。');
      }
    } catch (dbError) {
      console.error('[Supabase] 数据库查询错误:', dbError);
    }

    return { success: true };
  } catch (error) {
    console.error('[Supabase] 连接检查失败:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
} 