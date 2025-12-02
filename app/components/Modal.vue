<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
}>();

const emit = defineEmits<{
  close: [];
}>();

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit("close");
  }
};

// 按 ESC 关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.show) {
    emit("close");
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-100 flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- 背景遮罩 -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- 对话框 -->
        <div
          class="relative bg-theme-bg-soft rounded-2xl shadow-2xl w-full overflow-hidden"
          :class="sizeClasses[size || 'md']"
        >
          <!-- 头部 -->
          <div
            v-if="title || $slots.header"
            class="flex items-center justify-between px-6 py-4 border-b border-theme-border"
          >
            <slot name="header">
              <h3 class="card-title mb-0">
                {{ title }}
              </h3>
            </slot>
            <button
              @click="emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-theme-text-mute hover:text-theme-text hover:bg-theme-hover transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- 内容 -->
          <div class="p-6 max-h-[70vh] overflow-y-auto">
            <slot />
          </div>

          <!-- 底部 -->
          <div
            v-if="$slots.footer"
            class="px-6 py-4 border-t border-theme-border bg-theme-bg-mute"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div:last-child,
.modal-leave-to > div:last-child {
  transform: scale(0.95);
  opacity: 0;
}
</style>
