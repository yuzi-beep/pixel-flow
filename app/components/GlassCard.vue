<script setup lang="ts">
const props = defineProps<{
  padding?: string
  rounded?: string
  blur?: boolean
  shadow?: boolean
}>()

// 计算圆角
const roundedClass = computed(() => props.rounded || 'rounded-2xl')

// 计算模糊效果
const blurClass = computed(() => props.blur !== false ? 'backdrop-blur-sm' : '')

// 计算阴影
const shadowClass = computed(() => props.shadow !== false ? 'shadow-md' : '')
</script>

<template>
  <div
    :class="[
      'bg-theme-bg-glass border border-theme-border-soft transition-colors duration-300',
      roundedClass,
      blurClass,
      shadowClass,
      padding ?? 'p-4',
    ]"
  >
    <slot />
  </div>
</template>
