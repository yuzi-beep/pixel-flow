-- ==================== 创建 posts 表 ====================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}'
);

-- ==================== 创建 thoughts 表（碎碎念） ====================
CREATE TABLE IF NOT EXISTS public.thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 创建 events 表（事件/时间线） ====================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  color VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 创建索引 ====================
-- posts 表索引
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);

-- thoughts 表索引
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON public.thoughts(created_at DESC);

-- events 表索引
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);

-- ==================== 初始数据 ====================
-- 初始文章
INSERT INTO public.posts (title, content, author, status, published_at, tags) VALUES
(
  '欢迎来到我的博客',
  '# 欢迎来到 PixelFlow

这是我的第一篇博客文章！

## 关于这个博客

这个博客使用 **Nuxt 3** + **Supabase** 构建，是一个现代化的全栈个人博客系统。

### 技术栈

- 🚀 **Nuxt 3** - Vue 3 的全栈框架
- 🗄️ **Supabase** - 开源的 Firebase 替代品
- 🎨 **Tailwind CSS** - 实用优先的 CSS 框架
- 📝 **TypeScript** - 类型安全的 JavaScript

### 功能特点

1. 文章管理
2. 碎碎念（类似微博）
3. 时间线事件
4. 暗色模式支持
5. 响应式设计

感谢你的访问，希望你能在这里找到有价值的内容！',
  'Yuzi',
  'published',
  NOW(),
  ARRAY['博客', '技术', 'Nuxt', 'Vue']
);

-- 初始碎碎念
INSERT INTO public.thoughts (content, images) VALUES
(
  '博客终于上线了！🎉 经过一段时间的开发和调试，终于把这个小站搭建完成。使用了 Nuxt 3 和 Supabase，整体开发体验非常棒。接下来会慢慢完善内容，记录学习和生活的点滴。',
  ARRAY[]::TEXT[]
);

-- 初始事件
INSERT INTO public.events (title, description, event_date, tags, color) VALUES
(
  '博客正式上线',
  '经过精心设计和开发，个人博客 PixelFlow 正式上线！这是一个全新的开始，期待在这里记录更多精彩内容。',
  CURRENT_DATE,
  ARRAY['里程碑', '博客'],
  '#3B82F6'
);