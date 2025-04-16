# Procreate 笔刷资源网站

这是一个专注于提供高质量Procreate笔刷资源的网站，允许用户浏览、下载和使用各种笔刷。

## 功能概述

### 已完成功能

- **用户认证**
  - 注册/登录/重置密码
  - 使用Supabase进行用户认证和管理
  - 用户个人资料管理

- **笔刷功能**
  - 笔刷浏览与筛选（分类、免费/付费、排序等）
  - 笔刷详情展示
  - 笔刷下载功能（免费/付费）
  - 笔刷评论系统
  - 笔刷评分系统

- **订阅功能**
  - 不同级别的订阅计划展示
  - 使用Paddle实现支付集成
  - 订阅管理功能
  - 通过Webhook处理Paddle支付回调

- **其他功能**
  - 响应式设计，适配不同设备
  - 深色/浅色主题支持
  - 用户下载记录管理

### 计划功能

- **内容管理系统**
  - 管理员面板完善
  - 笔刷管理（增删改查）
  - 用户管理
  - 数据统计分析

- **社交功能**
  - 用户收藏功能
  - 社区分享
  - 创作者展示页面

- **高级功能**
  - 智能笔刷推荐
  - 相似笔刷查找
  - AI辅助创作工具

## 技术栈

- **前端**：Next.js, React, TypeScript, Tailwind CSS
- **后端**：Next.js API 路由
- **数据库**：Supabase (PostgreSQL)
- **认证**：Supabase Auth
- **支付**：Paddle
- **部署**：Vercel

## 本地开发

1. 克隆仓库
   ```
   git clone <repository-url>
   cd procreate-brush-website
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 创建`.env.local`文件，并添加以下环境变量:
   ```
   # Supabase配置
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Paddle支付系统配置
   NEXT_PUBLIC_PADDLE_VENDOR_ID=your-paddle-vendor-id
   NEXT_PUBLIC_PADDLE_ENVIRONMENT=sandbox
   ```

4. 启动开发服务器
   ```
   npm run dev
   ```

## 数据库结构

- **users**: 用户表
- **profiles**: 用户资料表
- **brushes**: 笔刷信息表
- **categories**: 笔刷分类表
- **brush_downloads**: 笔刷下载记录表
- **comments**: 笔刷评论表
- **ratings**: 笔刷评分表
- **user_subscriptions**: 用户订阅记录表

## 贡献

欢迎通过Issues和Pull Requests贡献代码。

## 许可

MIT License 