-- 初始化Procreate笔刷网站数据库结构
-- 在Supabase SQL编辑器中执行此脚本

-- 创建分类表
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户资料表，与auth.users关联
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100),
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建笔刷表
CREATE TABLE IF NOT EXISTS brushes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  preview_image_url TEXT,
  file_url TEXT,
  file_size VARCHAR(50),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  is_free BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) DEFAULT 0,
  compatibility VARCHAR(100),
  download_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建笔刷图片表
CREATE TABLE IF NOT EXISTS brush_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brush_id UUID REFERENCES brushes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建评分表
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brush_id UUID REFERENCES brushes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (brush_id, user_id)
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brush_id UUID REFERENCES brushes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建下载记录表
CREATE TABLE IF NOT EXISTS brush_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brush_id UUID REFERENCES brushes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  download_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  payment_id VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建函数：获取分类笔刷数量
CREATE OR REPLACE FUNCTION get_brush_count_by_category(category_id UUID)
RETURNS INTEGER AS $$
DECLARE
  brush_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO brush_count FROM brushes WHERE brushes.category_id = get_brush_count_by_category.category_id;
  RETURN brush_count;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：增加笔刷下载次数
CREATE OR REPLACE FUNCTION increment_brush_download_count(brush_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE brushes 
  SET download_count = download_count + 1 
  WHERE id = increment_brush_download_count.brush_id
  RETURNING download_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- 设置RLS策略
-- 笔刷表的RLS策略
ALTER TABLE brushes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公开读取笔刷数据" ON brushes
  FOR SELECT USING (true);

CREATE POLICY "管理员可完全控制笔刷" ON brushes
  USING (
    (SELECT is_admin FROM profiles WHERE profiles.id = auth.uid())
  );

-- 分类表的RLS策略
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公开读取分类" ON categories
  FOR SELECT USING (true);

CREATE POLICY "管理员可完全控制分类" ON categories
  USING (
    (SELECT is_admin FROM profiles WHERE profiles.id = auth.uid())
  );

-- 初始测试数据
-- 插入分类数据
INSERT INTO categories (name, slug, description, display_order)
VALUES 
  ('水彩', 'watercolor', '水彩笔刷集合，适合创建柔软、流动的水彩效果', 1),
  ('素描', 'sketch', '精细的素描笔刷，适合绘制细节和线条作品', 2),
  ('油画', 'oil-painting', '丰富质感的油画笔刷，模拟真实油画效果', 3),
  ('纹理', 'texture', '各种材质纹理笔刷，适合添加真实质感', 4),
  ('插画', 'illustration', '各种风格的插画笔刷，适合创建独特插图', 5),
  ('字体与排版', 'typography', '用于创建独特字体效果的笔刷集合', 6),
  ('自然元素', 'nature', '创建自然元素如云朵、树叶、草地等的笔刷', 7),
  ('专业效果', 'effects', '用于创建特殊效果如光影、粒子等的笔刷', 8);

-- 插入订阅计划数据
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features, is_popular)
VALUES 
  ('免费计划', 'free', 0, 0, ARRAY['下载免费笔刷', '每月5次下载限制', '基础客户支持'], FALSE),
  ('创作者计划', 'creator', 9.99, 99.99, ARRAY['无限下载所有笔刷', '优先获取新笔刷', '无广告体验', '高级客户支持', '定制笔刷请求'], TRUE),
  ('专业计划', 'professional', 19.99, 199.99, ARRAY['无限下载所有笔刷', '优先获取新笔刷', '无广告体验', '24/7专属客户支持', '定制笔刷请求', '商业用途许可', '批量下载工具'], FALSE); 