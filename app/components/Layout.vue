<script setup lang="ts">
const themeStore = useThemeStore();
const {
  isAuthenticated,
  isLoading: authLoading,
  logout,
  initAuth,
} = useDashboardAuth();

// 0 = 全屏模式 (首页)
// 1 = 受限宽度模式 (其他页面)
const mode = defineModel<number>("mode", { default: 0 });

const navItems = [
  { name: "文章", path: "/posts" },
  { name: "碎碎念", path: "/thoughts" },
  { name: "事件", path: "/events" },
];
// 用户菜单展开状态
const showUserMenu = ref(false);
// 滚动容器 ref
const scrollContainerRef = ref<HTMLElement>();

// 初始化检查认证状态
onMounted(() => {
  initAuth();
});

// 暴露滚动容器给父组件
defineExpose({
  scrollContainer: scrollContainerRef,
});
</script>

<template>
  <div class="h-svh flex flex-col transition-colors duration-300 bg-theme-bg">
    <!-- Navbar -->
    <nav
      class="z-50 top-0 left-0 mx-auto"
      :class="mode ? ['w-3xl sticky'] : ['w-full fixed']"
    >
      <!-- Content Container -->
      <div class="relative w-full">
        <div
          class="mx-auto transition-all duration-500 ease-in-out flex"
          :class="mode ? 'w-3xl px-6 py-3' : 'w-full px-8 py-4'"
        >
          <!-- Navbar Main -->
          <div
            class="flex-1 flex items-center justify-between transition-all duration-500"
          >
            <!-- Logo -->
            <NuxtLink to="/" class="flex flex-col">
              <div
                class="tracking-wider transition-all duration-500 text-xl font-black"
                :class="mode ? 'text-2xl' : 'card-title text-lg mb-0'"
              >
                YuBubbles
              </div>
              <Transition name="fade">
                <div class="text-tiny tracking-wide ml-0.5">Yuzi写东西的地方</div>
              </Transition>
            </NuxtLink>

            <!-- Nav Items - Right aligned -->
            <div class="flex items-center gap-6">
              <NuxtLink
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="nav-link relative group"
              >
                {{ item.name }}
                <span
                  class="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full bg-theme-text-mute"
                ></span>
              </NuxtLink>
              <!-- Dark Mode Toggle -->
              <button
                @click="themeStore.toggleTheme()"
                class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 text-theme-text-soft hover:text-theme-text hover:bg-theme-hover"
              >
                <!-- Moon icon (show when in light mode, click to go dark) -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 block dark:hidden"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <!-- Sun icon (show when in dark mode, click to go light) -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-5 h-5 hidden dark:block"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </button>

              <!-- User Menu(Show when authenticated and not loading) -->
              <div v-if="isAuthenticated && !authLoading" class="relative">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 text-theme-text-soft hover:text-theme-text hover:bg-theme-hover"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <Transition name="menu">
                  <div
                    v-if="showUserMenu"
                    class="absolute right-0 mt-2 w-48 py-2 bg-theme-bg-soft rounded-xl shadow-lg border border-theme-border z-50"
                    @click="showUserMenu = !showUserMenu"
                  >
                    <NuxtLink
                      to="/dashboard"
                      class="block px-4 py-2 nav-link hover:bg-theme-hover"
                    >
                      📊 仪表盘
                    </NuxtLink>
                    <NuxtLink
                      to="/dashboard/posts"
                      class="block px-4 py-2 nav-link hover:bg-theme-hover"
                    >
                      📝 文章管理
                    </NuxtLink>
                    <NuxtLink
                      to="/dashboard/thoughts"
                      class="block px-4 py-2 nav-link hover:bg-theme-hover"
                    >
                      💭 碎碎念
                    </NuxtLink>
                    <NuxtLink
                      to="/dashboard/events"
                      class="block px-4 py-2 nav-link hover:bg-theme-hover"
                    >
                      📅 事件管理
                    </NuxtLink>
                    <div class="my-1 h-px bg-theme-divider"></div>
                    <button
                      @click="logout"
                      class="block w-full text-left px-4 py-2 nav-link text-red-600 dark:text-red-400 hover:bg-theme-hover"
                    >
                      🚪 退出登录
                    </button>
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
        <!-- Bottom Divider -->
        <div
          class="h-px w-full transition-all duration-500 bg-theme-divider"
          :class="mode ? 'opacity-100' : 'opacity-0'"
        />
      </div>
    </nav>

    <div
      ref="scrollContainerRef"
      class="flex flex-col mx-auto transition-all duration-500 ease-in-out overflow-y-auto"
      :class="mode ? ['w-3xl px-6 py-3'] : ['w-full']"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
