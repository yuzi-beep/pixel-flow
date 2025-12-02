<script setup lang="ts">
withDefaults(defineProps<{ showSidebar?: boolean }>(), { showSidebar: true });
</script>

<template>
  <div
    class="h-svh flex flex-col bg-gradient-dashboard transition-all duration-300"
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
