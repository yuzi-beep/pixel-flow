<script setup lang="ts">
// SEO 元数据
useSeoMeta({
  title: "Dashboard",
});

const { isAuthenticated, isLoading, checkAuth } = useDashboardAuth();

// 检查认证状态
onMounted(async () => {
  const valid = await checkAuth();
  if (!valid) {
    navigateTo("/dashboard/login");
  }
});

// 使用统计接口获取数据
const { data: statsRes, status: statsStatus } = await useFetch("/api/stats");

// 计算统计数据
const stats = computed(() => ({
  posts: (statsRes.value as any)?.data?.posts || 0,
  thoughts: (statsRes.value as any)?.data?.thoughts || 0,
  events: (statsRes.value as any)?.data?.events || 0,
}));
</script>

<template>
  <DashboardLayout>
    <div class="flex-1 overflow-y-auto pr-2">
      <!-- 欢迎信息 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">欢迎回来 👋</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2 transition-colors">管理你的博客内容</p>
      </div>
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <NuxtLink to="/dashboard/posts">
          <GlassCard
            padding="p-6"
            class="hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center text-2xl"
              >
                📝
              </div>
              <div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{{ stats.posts }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  篇文章
                </div>
              </div>
            </div>
          </GlassCard>
        </NuxtLink>
        <NuxtLink to="/dashboard/thoughts">
          <GlassCard
            padding="p-6"
            class="hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center text-2xl"
              >
                💭
              </div>
              <div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{{ stats.thoughts }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  条碎碎念
                </div>
              </div>
            </div>
          </GlassCard>
        </NuxtLink>
        <NuxtLink to="/dashboard/events">
          <GlassCard
            padding="p-6"
            class="hover:shadow-lg hover:border-green-300 dark:hover:border-green-700 transition-all"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center text-2xl"
              >
                📅
              </div>
              <div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white transition-colors">{{ stats.events }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                  个事件
                </div>
              </div>
            </div>
          </GlassCard>
        </NuxtLink>
      </div>
      <!-- 快捷操作 -->
      <GlassCard padding="p-6">
        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white transition-colors">快捷操作</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NuxtLink
            to="/dashboard/posts/new"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
          >
            <span class="text-3xl">✍️</span>
            <span class="text-sm text-gray-600 dark:text-gray-400 transition-colors">写文章</span>
          </NuxtLink>
          <NuxtLink
            to="/dashboard/thoughts"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
          >
            <span class="text-3xl">💬</span>
            <span class="text-sm text-gray-600 dark:text-gray-400 transition-colors"
              >发碎碎念</span
            >
          </NuxtLink>
          <NuxtLink
            to="/dashboard/events"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
          >
            <span class="text-3xl">🎯</span>
            <span class="text-sm text-gray-600 dark:text-gray-400 transition-colors"
              >添加事件</span
            >
          </NuxtLink>
          <NuxtLink
            to="/"
            target="_blank"
            class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <span class="text-3xl">🌐</span>
            <span class="text-sm text-gray-600 dark:text-gray-400 transition-colors"
              >查看网站</span
            >
          </NuxtLink>
        </div>
      </GlassCard>
    </div>
  </DashboardLayout>
</template>
