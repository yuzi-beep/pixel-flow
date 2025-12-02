<script setup lang="ts">
const route = useRoute();
const themeStore = useThemeStore();
const { logout } = useDashboardAuth();

const menuItems = [
  { name: "概览", path: "/dashboard", icon: "📊" },
  { name: "文章管理", path: "/dashboard/posts", icon: "📝" },
  { name: "碎碎念", path: "/dashboard/thoughts", icon: "💭" },
  { name: "事件管理", path: "/dashboard/events", icon: "📅" },
];

const isActive = (path: string) => {
  if (path === "/dashboard") {
    return route.path === "/dashboard";
  }
  return route.path.startsWith(path);
};
</script>

<template>
  <aside class="w-56 shrink-0 flex flex-col gap-4">
    <!-- Logo -->
    <GlassCard>
      <NuxtLink to="/" class="flex flex-col">
        <div class="card-title tracking-wider mb-0">
          PixelFlow
        </div>
        <div class="text-tiny tracking-wide">
          Dashboard
        </div>
      </NuxtLink>
    </GlassCard>

    <!-- 导航菜单 -->
    <GlassCard padding="p-3" class="flex-1 flex flex-col gap-1">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-xl nav-link"
        :class="
          isActive(item.path)
            ? 'bg-accent text-white shadow-lg shadow-accent/25 hover:text-white'
            : 'hover:bg-theme-hover'
        "
      >
        <span class="text-lg">{{ item.icon }}</span>
        <span>{{ item.name }}</span>
      </NuxtLink>

      <!-- 底部操作区 -->
      <div class="mt-auto pt-3 border-t border-theme-border-soft flex flex-col gap-1">
        <!-- 暗黑模式切换 -->
        <button
          @click="themeStore.toggleTheme()"
          class="flex items-center gap-3 px-4 py-3 rounded-xl nav-link hover:bg-theme-hover w-full"
        >
          <span class="text-lg dark:hidden">🌙</span>
          <span class="text-lg hidden dark:inline">☀️</span>
          <span class="dark:hidden">切换暗色</span>
          <span class="hidden dark:inline">切换亮色</span>
        </button>

        <!-- 退出登录 -->
        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-4 py-3 rounded-xl nav-link text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
        >
          <span class="text-lg">🚪</span>
          <span>退出登录</span>
        </button>
      </div>
    </GlassCard>
  </aside>
</template>
