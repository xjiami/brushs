-- 创建表结构（如果不存在）

-- 创建类别表
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 创建用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  username text NOT NULL,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  is_admin boolean DEFAULT false,
  subscription_status text DEFAULT 'free',
  subscription_expiry timestamp with time zone
);

-- 创建笔刷表
CREATE TABLE IF NOT EXISTS brushes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  long_description text,
  preview_image_url text,
  file_url text,
  category_id uuid REFERENCES categories(id),
  creator_id uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  download_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_free boolean DEFAULT true,
  price numeric DEFAULT 0,
  file_size text,
  compatibility text,
  tags text[]
);

-- 创建笔刷图片表
CREATE TABLE IF NOT EXISTS brush_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brush_id uuid REFERENCES brushes(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0
);

-- 创建评分表
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brush_id uuid REFERENCES brushes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at timestamp with time zone DEFAULT now()
);

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brush_id uuid REFERENCES brushes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 创建笔刷下载表
CREATE TABLE IF NOT EXISTS brush_downloads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brush_id uuid REFERENCES brushes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  download_date timestamp with time zone DEFAULT now(),
  ip_address text
);

-- 创建订阅计划表
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  monthly_price numeric NOT NULL,
  yearly_price numeric NOT NULL,
  features text[],
  is_active boolean DEFAULT true
);

-- 创建用户订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id),
  plan_id uuid REFERENCES subscription_plans(id),
  status text DEFAULT 'active',
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  billing_period text CHECK (billing_period IN ('monthly', 'yearly')),
  cancelled_at timestamp with time zone,
  paddle_subscription_id text
);

-- 创建用于获取每个分类下笔刷数量的函数
CREATE OR REPLACE FUNCTION get_brush_counts_by_category()
RETURNS TABLE(category_id uuid, count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT b.category_id, COUNT(b.id)
  FROM brushes b
  GROUP BY b.category_id;
END;
$$ LANGUAGE plpgsql;

-- 创建用于增加笔刷下载计数的函数
CREATE OR REPLACE FUNCTION increment_download_count(brush_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE brushes
  SET download_count = download_count + 1
  WHERE id = brush_id;
END;
$$ LANGUAGE plpgsql;

-- 插入测试数据

-- 插入分类
INSERT INTO categories (name, slug, description, display_order) VALUES
('水彩', 'watercolor', '各种水彩画效果的笔刷，模拟真实的水彩画风格', 1),
('素描', 'sketch', '适合线稿和素描的各种铅笔和炭笔效果', 2),
('油画', 'oil-painting', '油画风格的笔刷，呈现出厚涂质感', 3),
('纹理', 'texture', '各种纹理笔刷，用于添加丰富的表面细节', 4),
('插画', 'illustration', '专为数字插画优化的笔刷系列', 5),
('概念艺术', 'concept-art', '概念艺术和环境设计专用笔刷', 6),
('漫画', 'comic', '专为漫画和卡通设计的勾线和上色笔刷', 7),
('书法', 'calligraphy', '各种书法和手写效果的笔刷', 8)
ON CONFLICT (slug) DO NOTHING;

-- 创建测试管理员用户（需要先通过UI注册此电子邮件，然后运行此脚本更新为管理员）
UPDATE profiles
SET is_admin = true
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@example.com');

-- 插入笔刷订阅计划
INSERT INTO subscription_plans (name, description, monthly_price, yearly_price, features) VALUES
('免费计划', '基础功能和有限下载', 0, 0, ARRAY['访问免费笔刷', '浏览所有笔刷预览', '参与社区讨论']),
('专业计划', '适合专业创作者的全功能计划', 9.99, 99.99, ARRAY['无限下载所有笔刷', '优先获取新资源', '高级技术支持', '下载高分辨率笔刷', '获取专属教程']),
('团队计划', '多用户访问的高级计划', 29.99, 299.99, ARRAY['支持5个用户账号', '所有专业版特权', '团队共享功能', '专属客户经理', '品牌定制笔刷'])
ON CONFLICT DO NOTHING; 