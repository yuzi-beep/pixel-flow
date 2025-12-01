<script setup lang="ts">
const { contentMaxWidth, navbarMode } = useLayout();

// navbarMode 0 = 全屏模式 (首页、Dashboard)
// navbarMode 1 = 受限宽度模式 (其他页面)
const isFullScreen = computed(() => navbarMode.value === 0);

// 滚动容器 ref
const scrollContainerRef = ref<HTMLElement | null>(null);

// 暴露滚动容器给父组件
defineExpose({
  scrollContainer: scrollContainerRef
});
</script>

<template>
  <div
    class="h-[100svh] pt-[75px] flex flex-col transition-colors duration-300"
  >
    <div
      ref="scrollContainerRef"
      class="flex-1 mx-auto transition-all duration-500 ease-in-out py-6 overflow-y-auto"
      :class="isFullScreen ? 'px-8' : 'px-6'"
      :style="
        isFullScreen
          ? { maxWidth: '1400px', width: '100%' }
          : { maxWidth: `${contentMaxWidth}px`, width: '100%' }
      "
    >
      <slot />
    </div>
  </div>
</template>
