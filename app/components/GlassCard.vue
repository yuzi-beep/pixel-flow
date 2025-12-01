<script setup lang="ts">
const props = defineProps<{
  padding?: string
  bgLight?: string
  bgDark?: string
  borderLight?: string
  borderDark?: string
  rounded?: string
  blur?: boolean
  shadow?: boolean
}>()

// 计算背景色
const bgClasses = computed(() => {
  const light = props.bgLight || 'bg-white/70'
  const dark = props.bgDark || 'dark:bg-gray-800/70'
  return `${light} ${dark}`
})

// 计算边框色
const borderClasses = computed(() => {
  const light = props.borderLight || 'border-gray-200/50'
  const dark = props.borderDark || 'dark:border-gray-700/50'
  return `border ${light} ${dark}`
})

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
      bgClasses,
      borderClasses,
      roundedClass,
      blurClass,
      shadowClass,
      padding ?? 'p-4',
      'shadow-md'
    ]"
  >
    <slot />
  </div>
</template>
