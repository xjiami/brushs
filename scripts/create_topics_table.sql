-- 创建社区主题表（如果不存在）
-- 解决"错误：42P07：关系'主题'已存在"问题
-- 该SQL脚本使用IF NOT EXISTS语句避免重复创建表

-- 创建主题表（只有当它不存在时才创建）
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50) NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reply_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE
);

-- 为topics表设置行级安全策略
ALTER TABLE IF EXISTS topics ENABLE ROW LEVEL SECURITY;

-- 创建访问策略
DO $$ 
BEGIN
  -- 删除可能已存在的策略以避免冲突
  BEGIN
    DROP POLICY IF EXISTS "公开读取主题" ON topics;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "作者可编辑自己的主题" ON topics;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "管理员可完全控制主题" ON topics;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误
  END;
END $$;

-- 创建新的访问策略
CREATE POLICY "公开读取主题" ON topics 
  FOR SELECT USING (true);

CREATE POLICY "作者可编辑自己的主题" ON topics 
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "作者可删除自己的主题" ON topics 
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "已登录用户可创建主题" ON topics 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "管理员可完全控制主题" ON topics 
  USING ((SELECT is_admin FROM profiles WHERE profiles.id = auth.uid()));

-- 创建回复表（如果不存在）
CREATE TABLE IF NOT EXISTS topic_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为topic_replies表设置行级安全策略
ALTER TABLE IF EXISTS topic_replies ENABLE ROW LEVEL SECURITY;

-- 创建回复表访问策略
DO $$ 
BEGIN
  -- 删除可能已存在的策略以避免冲突
  BEGIN
    DROP POLICY IF EXISTS "公开读取回复" ON topic_replies;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "作者可编辑自己的回复" ON topic_replies;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "管理员可完全控制回复" ON topic_replies;
  EXCEPTION WHEN OTHERS THEN
    -- 忽略错误
  END;
END $$;

-- 创建新的回复表访问策略
CREATE POLICY "公开读取回复" ON topic_replies 
  FOR SELECT USING (true);

CREATE POLICY "作者可编辑自己的回复" ON topic_replies 
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "作者可删除自己的回复" ON topic_replies 
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "已登录用户可创建回复" ON topic_replies 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "管理员可完全控制回复" ON topic_replies 
  USING ((SELECT is_admin FROM profiles WHERE profiles.id = auth.uid()));

-- 创建自动更新topics表回复计数的触发器函数
CREATE OR REPLACE FUNCTION update_topic_reply_count() 
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE topics 
    SET reply_count = reply_count + 1 
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE topics 
    SET reply_count = reply_count - 1 
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器（如果不存在）
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_topic_reply_count_trigger ON topic_replies;
  CREATE TRIGGER update_topic_reply_count_trigger
  AFTER INSERT OR DELETE ON topic_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_reply_count();
EXCEPTION WHEN OTHERS THEN
  -- 忽略错误，触发器可能已存在
END $$;

-- 创建自动更新views计数的函数
CREATE OR REPLACE FUNCTION increment_topic_views(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE topics
  SET views = views + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql; 