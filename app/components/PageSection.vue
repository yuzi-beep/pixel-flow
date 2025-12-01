<script setup lang="ts">
const modelValue = defineModel<number>();

const props = withDefaults(
  defineProps<{
    index: number;
    totalPages?: number;
  }>(),
  {
    totalPages: 10,
  }
);

// 当 modelValue 大于当前页面的 index 时隐藏
const isHide = computed(() =>
  modelValue.value ? modelValue.value > props.index : false
);

// z-index 根据页面索引计算，索引越小层级越高
const zIndex = computed(() => props.totalPages - props.index + 10);
</script>

<template>
  <template v-if="modelValue">
    <div class="page-section" :class="{ hide: isHide }" :style="{ zIndex }">
      <slot />
    </div>
  </template>
</template>

<style scoped lang="scss">
.page-section {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: top 1s ease-in-out;

  &.hide {
    top: -100%;
  }
}
</style>
