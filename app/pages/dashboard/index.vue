<script setup lang="ts">
// SEO 元数据
useSeoMeta({
  title: "Dashboard",
});

// 使用统计接口获取数据
const { data: statsRes, status: statsStatus } = await useFetch("/api/stats");

// 计算统计数据
const stats = computed(() => ({
  posts: (statsRes.value as any)?.data?.posts || 0,
  thoughts: (statsRes.value as any)?.data?.thoughts || 0,
  events: (statsRes.value as any)?.data?.events || 0,
}));

// 统计卡片配置
const statCards = computed(() => [
  { to: '/dashboard/posts', icon: '📝', value: stats.value.posts, label: '篇文章' },
  { to: '/dashboard/thoughts', icon: '💭', value: stats.value.thoughts, label: '条碎碎念' },
  { to: '/dashboard/events', icon: '📅', value: stats.value.events, label: '个事件' },
]);

// 快捷操作配置
const quickActions = [
  { to: '/dashboard/posts/new', icon: '✍️', label: '写文章' },
  { to: '/dashboard/thoughts', icon: '💬', label: '发碎碎念' },
  { to: '/dashboard/events', icon: '🎯', label: '添加事件' },
  { to: '/', icon: '🌐', label: '查看网站', external: true },
];
</script>

<template>
  <DashboardLayout>
    <div class="flex-1 overflow-y-auto pr-2">
      <!-- 欢迎信息 -->
      <div class="mb-8">
        <h1 class="page-title mb-2">欢迎回来 👋</h1>
        <p class="text-caption">管理你的博客内容</p>
      </div>
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <NuxtLink v-for="card in statCards" :key="card.to" :to="card.to">
          <div
            class="glass-card p-6 transition-all"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-accent/10"
              >
                {{ card.icon }}
              </div>
              <div>
                <div class="page-title text-3xl mb-0">{{ card.value }}</div>
                <div class="text-caption">{{ card.label }}</div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
      <!-- 快捷操作 -->
      <div class="glass-card p-6">
        <h3 class="card-title">快捷操作</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            :target="action.external ? '_blank' : undefined"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-theme-border transition-all hover:border-accent hover:bg-accent/10"
          >
            <span class="text-3xl">{{ action.icon }}</span>
            <span class="text-caption">{{ action.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
