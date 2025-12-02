<script setup lang="ts">
const themeStore = useThemeStore();
</script>

<template>
  <Teleport to="body">
    <Transition name="loader">
      <div
        v-if="themeStore.isLoading"
        class="fixed inset-0 z-999 flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#0a0a0f]"
      >
        <div class="loading-content">
          <div
            class="text-xl font-bold tracking-[0.5em] animate-pulse text-gray-800 dark:text-white"
          >
            LOADING
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
// 进入动画
.loader-enter-active {
  transition: opacity 0.3s ease-out;

  .loading-content {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  }
}

// 离开动画 - 更流畅的淡出效果
.loader-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  .loading-content {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      filter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// 进入前的状态
.loader-enter-from {
  opacity: 0;

  .loading-content {
    opacity: 0;
    transform: scale(0.95);
  }
}

// 离开后的状态 - 向上淡出并模糊
.loader-leave-to {
  opacity: 0;

  .loading-content {
    opacity: 0;
    transform: translateY(-20px) scale(1.02);
    filter: blur(8px);
  }
}
</style>
