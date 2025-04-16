-- 创建教程表（如果不存在）
-- 解决"教程表不存在"的错误问题

-- 创建教程表
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  duration VARCHAR(50),
  description TEXT,
  content TEXT,
  author VARCHAR(100),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  thumbnail VARCHAR(255),
  featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为tutorials表设置行级安全策略
ALTER TABLE IF EXISTS tutorials ENABLE ROW LEVEL SECURITY;

-- 删除所有可能已存在的策略，以避免"策略已存在"错误
DO $$ 
BEGIN
  -- 删除所有可能已存在的tutorials表策略
  DROP POLICY IF EXISTS "公开读取教程" ON tutorials;
  DROP POLICY IF EXISTS "作者可编辑自己的教程" ON tutorials;
  DROP POLICY IF EXISTS "作者可删除自己的教程" ON tutorials;
  DROP POLICY IF EXISTS "已登录用户可创建教程" ON tutorials;
  DROP POLICY IF EXISTS "管理员可完全控制教程" ON tutorials;

  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误，继续执行
    RAISE NOTICE '删除策略时出现错误，继续执行';
END $$;

-- 创建新的访问策略
CREATE POLICY "公开读取教程" ON tutorials 
  FOR SELECT USING (true);

CREATE POLICY "作者可编辑自己的教程" ON tutorials 
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "作者可删除自己的教程" ON tutorials 
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "已登录用户可创建教程" ON tutorials 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "管理员可完全控制教程" ON tutorials 
  USING ((SELECT is_admin FROM profiles WHERE profiles.id = auth.uid()));

-- 创建教程评论表（如果不存在）
CREATE TABLE IF NOT EXISTS tutorial_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为tutorial_comments表设置行级安全策略
ALTER TABLE IF EXISTS tutorial_comments ENABLE ROW LEVEL SECURITY;

-- 删除所有可能已存在的评论表策略
DO $$ 
BEGIN
  -- 删除所有可能已存在的tutorial_comments表策略
  DROP POLICY IF EXISTS "公开读取教程评论" ON tutorial_comments;
  DROP POLICY IF EXISTS "作者可编辑自己的教程评论" ON tutorial_comments;
  DROP POLICY IF EXISTS "作者可删除自己的教程评论" ON tutorial_comments;
  DROP POLICY IF EXISTS "已登录用户可创建教程评论" ON tutorial_comments;
  DROP POLICY IF EXISTS "管理员可完全控制教程评论" ON tutorial_comments;

  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误，继续执行
    RAISE NOTICE '删除评论策略时出现错误，继续执行';
END $$;

-- 创建新的评论表访问策略
CREATE POLICY "公开读取教程评论" ON tutorial_comments 
  FOR SELECT USING (true);

CREATE POLICY "作者可编辑自己的教程评论" ON tutorial_comments 
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "作者可删除自己的教程评论" ON tutorial_comments 
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "已登录用户可创建教程评论" ON tutorial_comments 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "管理员可完全控制教程评论" ON tutorial_comments 
  USING ((SELECT is_admin FROM profiles WHERE profiles.id = auth.uid()));

-- 创建自动更新教程浏览量的函数
CREATE OR REPLACE FUNCTION increment_tutorial_views(tutorial_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tutorials
  SET views = views + 1
  WHERE id = tutorial_id;
END;
$$ LANGUAGE plpgsql;

/* 
以下是帮助性代码示例，执行前请替换为实际值或单独执行

-- 检查当前用户是否有适当权限
-- SELECT auth.uid(), (SELECT is_admin FROM profiles WHERE id = auth.uid());

-- 如果需要设置管理员权限，执行：
-- UPDATE profiles
-- SET is_admin = true
-- WHERE id = '实际用户ID';  -- 替换为实际UUID

-- 检查profiles表是否存在并包含您的账户
-- SELECT * FROM profiles WHERE id = auth.uid();

-- 如果不存在，创建您的用户档案
-- INSERT INTO profiles (id, username, is_admin)
-- VALUES (auth.uid(), '您的用户名', true);
*/ 