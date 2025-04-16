# Procreate 笔刷资源网站

这是一个基于 [Next.js](https://nextjs.org) 构建的 Procreate 笔刷资源分享和下载平台。该平台支持笔刷的展示、分类浏览、搜索筛选、用户登录注册以及管理员后台管理等功能，通过 Supabase 提供后端服务和数据存储。

## 功能特点

- 🖌️ **丰富的笔刷资源**: 支持多种分类的 Procreate 笔刷资源展示和下载
- 🔍 **强大的搜索功能**: 按分类、标签、价格等多维度筛选笔刷
- 👤 **用户账户系统**: 用户注册、登录、个人资料管理
- 💵 **订阅计划**: 支持免费和付费订阅计划，提供不同级别的下载权限
- 🛠️ **管理员后台**: 完整的笔刷、分类、用户管理功能
- 📊 **数据统计**: 笔刷下载次数、评分等数据展示
- 📱 **响应式设计**: 适配桌面和移动设备的界面设计

## 环境配置

### 必要的环境变量

项目需要以下环境变量才能正常工作：

1. 在项目根目录创建 `.env` 文件，添加以下内容：

```
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=你的supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase匿名密钥

# 其他配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

2. 替换上述变量值为你的实际Supabase项目信息
   - 登录Supabase管理面板: https://supabase.com
   - 在项目设置中找到API部分，复制URL和anon key

### 数据库设置

1. 登录到Supabase管理面板
2. 进入SQL编辑器，创建新查询
3. 运行 `scripts/create_tutorials_table.sql` 脚本设置教程表
4. 运行 `scripts/set_admin_permissions.sql` 脚本设置管理员权限

## 快速开始

1. 安装依赖:
```bash
npm install
```

2. 配置环境变量（按上述说明）

3. 启动开发服务器:
```bash
npm run dev
```

4. 访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 常见问题

### 教程或其他内容无法保存
- 确保已正确设置环境变量
- 检查Supabase连接是否正常
- 查看浏览器控制台是否有错误信息
- 确保已运行数据库脚本创建必要的表

### 管理员权限问题
- 使用 `scripts/set_admin_permissions.sql` 脚本设置管理员权限
- 确认当前用户在profiles表中有is_admin=true设置

## 技术栈

- **前端**: Next.js, React, TailwindCSS, TypeScript
- **后端**: Supabase (Auth, Database, Storage)
- **部署**: Vercel (推荐)

## 许可证
本项目采用 [MIT 许可证](./LICENSE)。
