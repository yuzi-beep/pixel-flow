<script setup lang="ts">
withDefaults(defineProps<{ showSidebar?: boolean }>(), { showSidebar: true });

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
  <div
    class="flex w-svw h-svh flex-col bg-gradient-dashboard transition-all duration-300"
  >
    <div class="flex h-full w-full gap-6 px-8 py-6 min-h-0">
      <!-- DashboardSidebar -->
      <aside v-if="showSidebar" class="w-56 shrink-0 flex flex-col gap-4">
        <!-- Logo -->
        <div class="glass-card">
          <NuxtLink to="/" class="flex flex-col">
            <div class="card-title tracking-wider mb-0">
              YuBubbles
            </div>
            <div class="text-tiny tracking-wide">
              Dashboard
            </div>
          </NuxtLink>
        </div>

        <!-- Menu -->
        <div class="glass-card flex-1 flex flex-col gap-1">
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

          <!-- Bottom Actions -->
          <div class="mt-auto pt-3 border-t border-theme-border-soft flex flex-col gap-1">
            <!-- Dark Mode Toggle -->
            <button
              @click="themeStore.toggleTheme()"
              class="flex items-center gap-3 px-4 py-3 rounded-xl nav-link hover:bg-theme-hover w-full"
            >
              <span class="text-lg dark:hidden">🌙</span>
              <span class="text-lg hidden dark:inline">☀️</span>
              <span class="dark:hidden">切换暗色</span>
              <span class="hidden dark:inline">切换亮色</span>
            </button>

            <!-- Logout -->
            <button
              @click="logout"
              class="flex items-center gap-3 px-4 py-3 rounded-xl nav-link text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
            >
              <span class="text-lg">🚪</span>
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 min-w-0 min-h-0 flex flex-col">
        <slot />
      </main>
    </div>
  </div>
</template>
