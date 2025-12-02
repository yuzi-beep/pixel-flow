<script setup lang="ts">
import type { Thought } from "~/types/database.types";

// SEO 元数据
useSeoMeta({
  title: "碎碎念",
});

// 从 API 获取碎碎念列表
const { data: thoughtsResponse } = await useFetch("/api/thoughts");

// 响应式数据
const thoughts = ref<Thought[]>([]);
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

// 初始化数据
watchEffect(() => {
  if (thoughtsResponse.value) {
    thoughts.value = (thoughtsResponse.value.data || []) as Thought[];
    pagination.value = thoughtsResponse.value.pagination || pagination.value;
  }
});

// 加载更多
const loadMore = async () => {
  const nextPage = pagination.value.page + 1;
  const { data } = await useFetch(`/api/thoughts?page=${nextPage}`);
  if (data.value) {
    thoughts.value = [...thoughts.value, ...(data.value.data as Thought[])];
    pagination.value = data.value.pagination;
  }
};

// 格式化相对时间
const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
</script>

<template>
  <PageWrapper>
    <!-- 页面标题 -->
    <h1 class="page-title">碎碎念</h1>
    <p class="page-subtitle opacity-60">
      Yuzi 发牢骚的小角落，共 {{ pagination.total }} 条内容。
    </p>

    <!-- 碎碎念列表 -->
    <div
      v-if="thoughts.length > 0"
      class="divide-y divide-theme-divider"
    >
      <div
        v-for="(thought, index) in thoughts"
        :key="thought.id"
        class="py-6 first:pt-0"
      >
        <!-- 头部信息：编号和时间 -->
        <div class="flex items-center gap-3 mb-3 text-sm">
          <span class="font-mono text-accent font-semibold"
            >#{{ pagination.total - index }}</span
          >
          <span class="text-theme-text-mute"
            >发布于 {{ formatRelativeTime(thought.created_at) }}</span
          >
        </div>

        <!-- 内容 - 使用 Markdown 渲染 -->
        <div class="mb-4">
          <MarkdownPreview :content="thought.content" />
        </div>

        <!-- 图片展示 - 单独显示在内容下方 -->
        <div
          v-if="thought.images && thought.images.length > 0"
          class="grid gap-3 mt-4"
          :class="{
            'grid-cols-1 max-w-md': thought.images.length === 1,
            'grid-cols-2 max-w-xl': thought.images.length === 2,
            'grid-cols-3': thought.images.length >= 3,
          }"
        >
          <img
            v-for="(img, idx) in thought.images"
            :key="idx"
            :src="img"
            :alt="`图片 ${idx + 1}`"
            class="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all duration-300 shadow-sm"
          />
        </div>
        <hr
          v-if="index != thoughts.length - 1"
          class="divider"
        />
      </div>
    </div>
    <!-- 无内容时的提示 -->
    <div v-else class="text-center py-20">
      <div class="text-6xl mb-6">💭</div>
      <p class="text-lg text-theme-text-mute">
        暂无碎碎念，敬请期待...
      </p>
    </div>

    <!-- 加载更多 -->
    <div
      v-if="pagination.page < pagination.totalPages"
      class="text-center mt-12"
    >
      <button
        @click="loadMore"
        class="btn-secondary px-6 py-3 rounded-full border border-theme-border"
      >
        加载更多
      </button>
    </div>
  </PageWrapper>
</template>
