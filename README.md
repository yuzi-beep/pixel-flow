# PixelFlow

一个基于 **Nuxt 4** + **Supabase** 构建的现代化全栈个人博客系统。

## ✨ 功能特点

- 📝 **文章管理** - 支持 Markdown 编辑、草稿/发布状态、标签分类
- 💭 **碎碎念** - 类似微博的短内容发布，支持图片
- 📅 **时间线** - 记录重要事件和里程碑
- 🌓 **暗色模式** - 自动适应系统主题偏好
- 📱 **响应式设计** - 完美支持桌面端和移动端
- 🔐 **后台管理** - 安全的仪表盘管理系统

## 🛠️ 技术栈

| 技术                                          | 说明                                    |
| --------------------------------------------- | --------------------------------------- |
| [Nuxt 3](https://nuxt.com/)                   | Vue 3 全栈框架                          |
| [Supabase](https://supabase.com/)             | 开源的 Firebase 替代品（数据库 + 认证） |
| [Tailwind CSS](https://tailwindcss.com/)      | 实用优先的 CSS 框架                     |
| [Pinia](https://pinia.vuejs.org/)             | Vue 状态管理                            |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript                   |
| [Bun](https://bun.sh/)                        | 高性能 JavaScript 运行时和包管理器      |
---

## 🚀 部署指南

### 方式一：Vercel 一键部署（推荐）

点击下方按钮，即可将本项目一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hoooosi/pixel-flow&env=SUPABASE_URL,SUPABASE_KEY,SUPABASE_SECRET_KEY&envDescription=Supabase%20项目配置&envLink=https://supabase.com/dashboard/project/_/settings/api&project-name=pixel-flow&repository-name=pixel-flow)

#### 部署步骤：

1. **点击上方按钮** → 跳转到 Vercel 部署页面
2. **授权 GitHub** → 允许 Vercel 访问你的 GitHub 账户
3. **创建仓库** → Vercel 会自动 Fork 本项目到你的 GitHub
4. **配置环境变量** → 填入 Supabase 相关配置（见下方说明）
5. **点击 Deploy** → 等待部署完成

#### 环境变量配置：

| 变量名                | 说明                      | 获取方式                         |
| --------------------- | ------------------------- | -------------------------------- |
| `SUPABASE_URL`        | Supabase 项目 URL         | Supabase 控制台 → Settings → API |
| `SUPABASE_KEY`        | Supabase 公开 anon key    | Supabase 控制台 → Settings → API |
| `SUPABASE_SECRET_KEY` | Supabase service_role key | Supabase 控制台 → Settings → API |

---

### 方式二：本地部署

#### 前置要求

- [Bun](https://bun.sh/) >= 1.0（推荐）或 Node.js >= 18
- [Git](https://git-scm.com/)
- [Supabase](https://supabase.com/) 账户和项目

#### 第一步：克隆项目

```bash
git clone https://github.com/hoooosi/pixel-flow.git
cd pixel-flow
```

#### 第二步：安装依赖

```bash
# 使用 Bun（推荐）
bun install

# 或使用 npm
npm install

# 或使用 pnpm
pnpm install
```

#### 第三步：配置 Supabase

##### 3.1 创建 Supabase 项目

1. 访问 [Supabase 控制台](https://supabase.com/dashboard)
2. 点击 **New Project** 创建新项目
3. 填写项目名称，设置数据库密码，选择服务器区域
4. 等待项目初始化完成

##### 3.2 创建数据库表

1. 在 Supabase 控制台中，进入 **SQL Editor**
2. 复制 `supabase/table.sql` 文件中的内容
3. 粘贴到 SQL 编辑器中，点击 **Run** 执行

```sql
-- 这将创建以下表：
-- posts     - 文章表
-- thoughts  - 碎碎念表
-- events    - 事件/时间线表
```

##### 3.3 获取 API 密钥

1. 进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_KEY`
   - **service_role secret** → `SUPABASE_SECRET_KEY`

#### 第四步：配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# 复制示例文件（如果存在）
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：

```env
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
```

#### 第五步：启动开发服务器

```bash
# 使用 Bun
bun run dev

# 或使用 npm
npm run dev
```

启动成功后，访问 [http://localhost:3000](http://localhost:3000) 查看项目。

#### 第六步：构建生产版本

```bash
# 构建
bun run build

# 预览生产版本
bun run preview
```

---

## 📁 项目结构

```
pixel-flow/
├── app/                    # Nuxt 应用目录
│   ├── assets/            # 静态资源（样式、图片）
│   ├── components/        # Vue 组件
│   ├── composables/       # 组合式函数
│   ├── pages/             # 页面路由
│   ├── plugins/           # Nuxt 插件
│   ├── stores/            # Pinia 状态管理
│   └── types/             # TypeScript 类型定义
├── public/                # 公共静态文件
├── server/                # 服务端代码
│   ├── api/              # API 路由
│   └── utils/            # 服务端工具函数
├── supabase/             # Supabase 配置
│   └── table.sql         # 数据库表结构
├── nuxt.config.ts        # Nuxt 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── package.json          # 项目依赖
```

---

## 🔧 可用脚本

| 命令               | 说明           |
| ------------------ | -------------- |
| `bun run dev`      | 启动开发服务器 |
| `bun run build`    | 构建生产版本   |
| `bun run preview`  | 预览生产版本   |
| `bun run generate` | 生成静态站点   |

---

## 📝 后台管理

访问 `/dashboard/login` 进入后台管理系统，你可以：

- 📝 管理文章（发布、编辑、删除）
- 💭 管理碎碎念
- 📅 管理时间线事件
- 📊 查看站点统计

---

## 📄 许可证

[MIT License](LICENSE)
