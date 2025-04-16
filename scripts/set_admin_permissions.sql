-- 用于设置用户权限的SQL脚本
-- 此脚本包含帮助确保用户有适当权限创建教程的命令

-- 1. 检查当前登录用户ID（如果已登录）
SELECT auth.uid() AS current_user_id;

-- 2. 检查profiles表中当前用户信息
SELECT id, username, is_admin 
FROM profiles 
WHERE id = auth.uid();

-- 3. 将当前用户设置为管理员（需要已登录）
UPDATE profiles
SET is_admin = true
WHERE id = auth.uid();

-- 4. 查看所有管理员用户
SELECT id, username, is_admin
FROM profiles
WHERE is_admin = true;

-- 注意：如果需要为特定用户设置管理员权限，请使用实际的UUID
-- 例如: UPDATE profiles SET is_admin = true WHERE id = '00000000-0000-0000-0000-000000000000';

-- 5. 验证RLS策略是否正确设置
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'tutorials';

-- 6. 测试插入权限（仅用于测试，可选择执行）
/*
INSERT INTO tutorials (
  title, 
  category, 
  difficulty, 
  duration, 
  description, 
  author, 
  thumbnail, 
  content
)
VALUES (
  '测试教程', 
  'watercolor', 
  'beginner', 
  '10分钟', 
  '测试描述', 
  '测试作者', 
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100" height="100" fill="blue"/%3E%3C/svg%3E', 
  '测试内容'
);
*/ 