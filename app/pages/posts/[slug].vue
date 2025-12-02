<script setup lang="ts">
import type { Post } from "~/types/database.types";
import { marked } from "marked";

const route = useRoute();

// 获取文章 id - 使用非响应式值，避免路由变化时重新请求
const id = route.params.slug as string;

// 从 API 获取文章内容
const { data: postResponse } = await useFetch(`/api/posts/${id}`);

// 提取文章数据
const post = computed<Post | null>(
  () => postResponse.value?.data as Post | null
);

// 将 Markdown 内容转换为 HTML
const renderedContent = computed(() => {
  if (!post.value?.content) return "";
  return marked(post.value.content);
});

// SEO 元数据
useSeoMeta({
  title: () => post.value?.title || "文章",
  description: () => post.value?.content?.substring(0, 150) || "",
});

// 格式化完整日期
const formatFullDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
};

// PageWrapper 组件 ref
const pageWrapperRef = ref<{ scrollContainer: HTMLElement | null } | null>(
  null
);

// 回到顶部
const scrollToTop = () => {
  pageWrapperRef.value?.scrollContainer?.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
</script>

<template>
  <PageWrapper ref="pageWrapperRef">
    <article v-if="post">
      <!-- 返回按钮 -->
      <NuxtLink
        to="/posts"
        class="inline-flex items-center gap-2 mb-8 text-sm link"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回文章列表
      </NuxtLink>
      <!-- 文章头部 -->
      <header>
        <!-- 标题 -->
        <h1 class="text-3xl md:text-4xl font-bold leading-tight mb-4 text-theme-text">
          {{ post.title }}
        </h1>

        <!-- 文章元信息 -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-theme-text-mute">
          <!-- 作者 -->
          <span v-if="post.author" class="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
            {{ post.author }}
          </span>

          <!-- 日期 -->
          <span v-if="post.created_at" class="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {{ formatFullDate(post.created_at) }}
          </span>
        </div>

        <!-- 标签 -->
        <div
          v-if="post.tags && post.tags.length"
          class="flex flex-wrap gap-2 mt-4"
        >
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="badge"
          >
            #{{ tag }}
          </span>
        </div>
      </header>
      <!-- 分隔线 -->
      <hr class="divider" />
      <!-- 文章内容 -->
      <MarkdownPreview :content="post.content"></MarkdownPreview>
      <!-- 分隔线 -->
      <hr class="divider" />
      <!-- 文章底部 -->
      <footer class="border-t border-theme-border">
        <div class="flex justify-between items-center">
          <NuxtLink
            to="/posts"
            class="inline-flex items-center gap-2 btn-secondary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            返回列表
          </NuxtLink>

          <!-- 回到顶部 -->
          <button
            @click="scrollToTop"
            class="inline-flex items-center gap-2 btn-secondary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
            回到顶部
          </button>
        </div>
      </footer>
    </article>
    <!-- 文章未找到 -->
    <div v-else class="py-20 text-center">
      <h1 class="text-2xl font-bold mb-4 text-theme-text">
        文章未找到
      </h1>
      <p class="text-theme-text-mute mb-8">
        抱歉，您访问的文章不存在或已被删除。
      </p>
      <NuxtLink
        to="/posts"
        class="btn-primary inline-flex items-center gap-2 px-6 py-3"
      >
        返回文章列表
      </NuxtLink>
    </div>
  </PageWrapper>
</template>

<style scoped lang="scss"></style>
