#!/usr/bin/env node

/**
 * 此脚本用于生成测试笔刷数据并上传到Supabase
 * 使用方法: node scripts/generate-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 加载环境变量
dotenv.config({ path: '.env.local' });

// 验证环境变量
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('错误: 缺少 Supabase 环境变量。请确保在 .env.local 文件中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// 初始化 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 示例数据
const sampleBrushes = [
  {
    title: '水彩效果套装',
    description: '专业水彩笔刷套装，包含20种不同的水彩效果，适合数字绘画和插画创作。',
    long_description: '这套水彩笔刷套装包含20种精心制作的笔刷，完美模拟真实水彩效果。适合各种数字绘画和插画创作，无论是风景、人物还是抽象作品。\n\n特点：\n- 高分辨率笔刷\n- 压感响应\n- 自然水彩效果\n- 适合各种绘画风格',
    category_slug: 'watercolor',
    is_featured: true,
    is_free: false,
    price: 28.99,
    compatibility: 'Procreate 5+',
    tags: ['水彩', '绘画', '艺术', '插画'],
    preview_image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    file_size: '15 MB',
    gallery_images: [
      'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579965342575-16428a7c8881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: '素描铅笔套装',
    description: '高品质素描铅笔套装，模拟真实铅笔质感，包含多种硬度和纹理选项。',
    long_description: '这套素描笔刷集提供最真实的数字铅笔体验，包含从2H到8B的完整硬度范围，以及多种特殊纹理笔刷。\n\n特点：\n- 精确的铅笔质感\n- 多种硬度选项\n- 自然磨损效果\n- 适合细节绘制',
    category_slug: 'sketch',
    is_featured: true,
    is_free: true,
    price: 0,
    compatibility: 'Procreate 5+',
    tags: ['素描', '铅笔', '写实', '绘画'],
    preview_image_url: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    file_size: '8 MB',
    gallery_images: [
      'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: '油画质感笔刷集',
    description: '专业油画笔刷集，完美模拟真实油画效果，适合创作逼真的数字油画作品。',
    long_description: '这套高级油画笔刷集让您能够在iPad上创作出惊人的油画效果。从精细的细节刷到粗犷的肌理刷，这套笔刷集满足您所有的创作需求。\n\n特点：\n- 多种油画笔触\n- 丰富的质感和肌理\n- 精确的色彩混合\n- 专业画家设计',
    category_slug: 'oil-painting',
    is_featured: true,
    is_free: false,
    price: 35.99,
    compatibility: 'Procreate 5+',
    tags: ['油画', '肌理', '艺术', '专业'],
    preview_image_url: 'https://images.unsplash.com/photo-1579965342575-16428a7c8881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    file_size: '18 MB',
    gallery_images: [
      'https://images.unsplash.com/photo-1579965342575-16428a7c8881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    title: '纹理笔刷合集',
    description: '丰富的纹理笔刷合集，包括布料、皮革、木材、金属等多种材质效果。',
    long_description: '这个纹理笔刷合集包含50多种精心制作的纹理效果，可以轻松为您的作品添加真实的材质感。从粗糙的石材到光滑的金属，从天然的木纹到复杂的织物，这套笔刷覆盖了您创作中可能需要的所有纹理类型。\n\n特点：\n- 高分辨率无缝纹理\n- 可调节的纹理强度\n- 逼真的材质模拟\n- 适合环境和产品设计',
    category_slug: 'texture',
    is_featured: false,
    is_free: false,
    price: 24.99,
    compatibility: 'Procreate 5+',
    tags: ['纹理', '材质', '设计', '真实感'],
    preview_image_url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    file_size: '22 MB',
    gallery_images: [
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567225591450-06036b3392a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ]
  }
];

async function main() {
  console.log('开始生成测试数据...');

  try {
    // 检查管理员用户
    console.log('检查是否有管理员用户...');
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('is_admin', true)
      .limit(1);

    if (adminError) {
      throw new Error(`查询管理员用户出错: ${adminError.message}`);
    }

    if (!adminUsers || adminUsers.length === 0) {
      throw new Error('未找到管理员用户。请先创建一个管理员用户，然后再运行此脚本。');
    }

    const adminId = adminUsers[0].id;
    console.log(`使用管理员用户: ${adminUsers[0].username} (${adminId})`);

    // 为每个示例笔刷添加数据
    for (const brush of sampleBrushes) {
      console.log(`添加笔刷: ${brush.title}`);

      // 1. 获取分类ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', brush.category_slug)
        .single();

      if (categoryError) {
        console.warn(`未找到分类 ${brush.category_slug}，跳过此笔刷`);
        continue;
      }

      const categoryId = categoryData.id;

      // 2. 插入笔刷数据
      const { data: brushData, error: brushError } = await supabase
        .from('brushes')
        .insert([
          {
            title: brush.title,
            description: brush.description,
            long_description: brush.long_description,
            preview_image_url: brush.preview_image_url,
            category_id: categoryId,
            creator_id: adminId,
            is_featured: brush.is_featured,
            is_free: brush.is_free,
            price: brush.price,
            compatibility: brush.compatibility,
            tags: brush.tags,
            file_size: brush.file_size,
            created_at: new Date(),
            download_count: Math.floor(Math.random() * 500) // 随机下载次数
          }
        ])
        .select()
        .single();

      if (brushError) {
        console.error(`添加笔刷 ${brush.title} 出错:`, brushError);
        continue;
      }

      // 3. 添加画廊图片
      if (brush.gallery_images && brush.gallery_images.length > 0) {
        const galleryImages = brush.gallery_images.map((imageUrl, index) => ({
          brush_id: brushData.id,
          image_url: imageUrl,
          display_order: index
        }));

        const { error: galleryError } = await supabase
          .from('brush_images')
          .insert(galleryImages);

        if (galleryError) {
          console.error(`为笔刷 ${brush.title} 添加画廊图片出错:`, galleryError);
        }
      }

      console.log(`成功添加笔刷: ${brush.title} (ID: ${brushData.id})`);
    }

    console.log('测试数据生成完成！');
  } catch (error) {
    console.error('生成测试数据时出错:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 