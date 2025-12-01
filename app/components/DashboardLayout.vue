<script setup lang="ts">
withDefaults(
  defineProps<{
    showSidebar?: boolean;
  }>(),
  {
    showSidebar: true,
  }
);
</script>

<template>
  <div
    class="h-[100svh] flex flex-col bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-gray-900 dark:via-[#0c0c14] dark:to-[#111827]"
  >
    <div class="flex-1 flex gap-6 px-8 py-6 min-h-0 mx-auto w-full">
      <!-- 左侧导航 -->
      <DashboardSidebar v-if="showSidebar" />

      <!-- 右侧内容区 - 内容自己负责滚动 -->
      <main class="flex-1 min-w-0 min-h-0 flex flex-col">
        <slot />
      </main>
    </div>
  </div>
</template>
