# Procreate 笔刷资源网站本地测试指南

本文档提供在本地设置和测试 Procreate 笔刷资源网站的详细步骤。

## 前提条件

- Node.js (建议 v16+)
- npm 或 yarn
- Supabase 账号 (https://supabase.com)

## 1. 设置 Supabase

1. 登录 Supabase 并创建一个新项目
2. 获取项目 URL 和 Anon Key（可在项目设置 > API 中找到）
3. 使用项目中提供的初始化脚本设置数据库：
   - 在 Supabase SQL 编辑器中运行 `scripts/init-database.sql` 文件中的脚本以创建必要的表结构和初始数据

## 2. 环境设置

1. 确保 `.env.local` 文件中包含正确的 Supabase 凭据：

```
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=你的_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_SUPABASE_ANON_KEY

# Paddle支付系统配置（本地测试可忽略）
NEXT_PUBLIC_PADDLE_VENDOR_ID=your-paddle-vendor-id
NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
```

## 3. 安装依赖

```bash
npm install
```

## 4. 运行开发服务器

```bash
npm run dev
```

这将在 http://localhost:3000 启动应用程序。

## 5. 创建管理员账户

1. 在应用程序中注册一个新账户（使用电子邮件如 admin@example.com）
2. 返回 Supabase 控制台
3. 在 SQL 编辑器中运行以下命令将该用户设置为管理员：

```sql
UPDATE profiles
SET is_admin = true
WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

## 6. 生成测试数据

项目包含一个脚本，可以快速生成测试笔刷数据：

```bash
# 安装脚本依赖
npm install dotenv @supabase/supabase-js

# 运行测试数据生成脚本
node scripts/generate-test-data.js
```

注意：必须先创建一个管理员账户，脚本才能正常工作，因为测试数据会与该管理员账户关联。

## 7. 测试核心功能

可以测试的功能包括：

1. **浏览页面**：筛选和搜索笔刷
2. **分类页面**：查看不同分类
3. **登录和注册**：测试用户身份验证
4. **管理面板**：管理笔刷、分类和用户
   - 添加新笔刷
   - 编辑现有笔刷
   - 标记特色笔刷
   - 删除笔刷

## 8. 测试 Supabase 存储

要测试文件上传功能，您需要在 Supabase 中设置存储桶：

1. 在 Supabase 控制台中，转到"存储"部分
2. 创建三个存储桶：
   - `brush-previews`：用于笔刷预览图
   - `brush-files`：用于笔刷文件
   - `brush-gallery`：用于笔刷画廊图片
3. 为每个存储桶设置适当的权限，可以使用以下的存储桶策略：

```sql
-- 示例存储桶策略
CREATE POLICY "允许公开访问笔刷预览" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'brush-previews');

CREATE POLICY "允许管理员上传笔刷预览" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'brush-previews' AND 
  (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
);

-- 为其他存储桶设置类似策略
```

## 9. 手动添加测试笔刷

除了使用生成脚本外，也可以通过管理面板手动添加测试笔刷：

1. 登录为管理员
2. 访问管理面板（`/admin`）
3. 点击"添加新笔刷"
4. 填写笔刷信息并上传测试图片和文件

## 常见问题

**Q: 为什么我不能登录管理面板？**  
A: 确保您的用户在 `profiles` 表中的 `is_admin` 字段设置为 `true`。

**Q: 生成测试数据脚本失败？**  
A: 检查以下几点：
- 确保您已创建并设置了管理员账户
- 验证 `.env.local` 文件中的 Supabase 凭据正确
- 确认数据库表已使用 `init-database.sql` 脚本正确创建

**Q: 上传文件失败？**  
A: 检查是否正确设置了 Supabase 存储桶和权限。

**Q: API 错误和数据获取问题？**  
A: 确认 Supabase URL 和 Anon Key 是否正确，以及数据库表是否已正确创建。 