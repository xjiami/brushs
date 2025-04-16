import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function POST() {
  try {
    // 获取Supabase客户端
    const supabase = getSupabaseClient();
    
    // 检查用户是否已登录
    const { data: { session } } = await supabase.auth.getSession();
    
    // 在开发环境中，即使没有登录也允许创建存储桶
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session && !isDevelopment) {
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      );
    }
    
    // 在开发环境中跳过管理员检查
    let isAdmin = isDevelopment;
    
    if (!isDevelopment && session) {
      // 检查用户是否为管理员
      isAdmin = session.user?.user_metadata?.is_admin === true || 
        session.user?.email === 'xjiami2@gmail.com' || 
        session.user?.email === 'admin.test@gmail.com';
        
      if (!isAdmin) {
        // 如果元数据中没有管理员标志，则检查数据库
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        if (profileError || !profile?.is_admin) {
          return NextResponse.json(
            { error: '没有管理员权限' },
            { status: 403 }
          );
        }
      }
    }
    
    // 获取现有存储桶
    const { data: existingBuckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json(
        { error: `获取存储桶列表失败: ${bucketsError.message}` },
        { status: 500 }
      );
    }
    
    // 必需的存储桶
    const requiredBuckets = ['brush-files', 'brush-previews', 'brush-gallery', 'avatars', 'category-images'];
    
    // 找出缺少的存储桶
    const existingBucketNames = existingBuckets?.map(b => b.name) || [];
    const missingBuckets = requiredBuckets.filter(name => !existingBucketNames.includes(name));
    
    if (missingBuckets.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: '所有必需的存储桶都已存在', 
        created: [] 
      });
    }
    
    // 创建缺少的存储桶
    const createdBuckets = [];
    const failedBuckets = [];
    
    for (const bucketName of missingBuckets) {
      try {
        // 创建公开存储桶
        const { error } = await supabase.storage.createBucket(bucketName, { public: true });
        
        if (error) {
          failedBuckets.push({ 
            name: bucketName, 
            error: error.message 
          });
        } else {
          createdBuckets.push(bucketName);
        }
      } catch (err) {
        failedBuckets.push({ 
          name: bucketName, 
          error: err instanceof Error ? err.message : '未知错误' 
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      created: createdBuckets,
      failed: failedBuckets,
      message: createdBuckets.length > 0 
        ? `成功创建 ${createdBuckets.length} 个存储桶`
        : '无法创建任何存储桶'
    });
    
  } catch (error) {
    console.error('修复存储桶出错:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : '修复存储桶时出错',
        success: false
      },
      { status: 500 }
    );
  }
}

// 获取存储桶状态
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    
    // 检查用户是否已登录
    const { data: { session } } = await supabase.auth.getSession();
    
    // 在开发环境中，即使没有登录也允许查看存储桶状态
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!session && !isDevelopment) {
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      );
    }
    
    // 获取存储桶
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json(
        { error: `获取存储桶列表失败: ${bucketsError.message}` },
        { status: 500 }
      );
    }
    
    // 必需的存储桶
    const requiredBuckets = ['brush-files', 'brush-previews', 'brush-gallery', 'avatars', 'category-images'];
    
    // 检查存储桶状态
    const bucketStatus = requiredBuckets.map(name => {
      const bucket = buckets?.find(b => b.name === name);
      return {
        name,
        exists: !!bucket,
        public: bucket?.public || false,
        id: bucket?.id,
        created_at: bucket?.created_at
      };
    });
    
    const missingCount = bucketStatus.filter(b => !b.exists).length;
    
    return NextResponse.json({
      buckets: bucketStatus,
      all_exist: missingCount === 0,
      missing_count: missingCount
    });
    
  } catch (error) {
    console.error('获取存储桶状态出错:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取存储桶状态时出错' },
      { status: 500 }
    );
  }
} 