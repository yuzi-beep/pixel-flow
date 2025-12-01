<script setup lang="ts">
import type { PostListItem } from "~/types/database.types";

// SEO 元数据
useSeoMeta({
  title: '文章',
});

// 从 API 获取文章列表
const { data: postsResponse } = await useFetch("/api/posts");

// 提取文章数据
const posts = computed(
  () => (postsResponse.value?.data || []) as PostListItem[]
);

// 计算文章总数
const totalPosts = computed(() => posts.value.length);

// 按年份分组文章
const groupedPosts = computed(() => {
  if (!posts.value.length) return {};

  const groups: Record<string, PostListItem[]> = {};

  posts.value.forEach((post) => {
    const dateStr = post.published_at || post.created_at;
    const date = new Date(dateStr);
    const year = date.getFullYear().toString();

    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(post);
  });

  // 对每个年份内的文章按日期降序排序
  Object.keys(groups).forEach((year) => {
    groups[year]?.sort((a, b) => {
      const dateA = a.published_at || a.created_at;
      const dateB = b.published_at || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  });

  return groups;
});

// 年份降序排列
const sortedYears = computed(() =>
  Object.keys(groupedPosts.value).sort((a, b) => Number(b) - Number(a))
);

// 格式化日期为 MM.DD 格式
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
};
</script>

<template>
  <PageWrapper>
    <!-- 页面标题 -->
    <h1 class="text-4xl font-bold mb-4 transition-colors duration-300">文章</h1>
    <p class="text-base opacity-60 mb-12 transition-colors duration-300">
      共 {{ totalPosts }} 篇文章，按年份分组展示。
    </p>

    <!-- 按年份分组的文章列表 -->
    <div v-if="Object.keys(groupedPosts).length > 0" class="space-y-12">
      <section v-for="year in sortedYears" :key="year">
        <!-- 年份标题 -->
        <h2
          class="text-2xl font-bold mb-6 flex items-center gap-2 transition-colors duration-300"
        >
          {{ year }}
          <span class="text-base font-normal opacity-50"
            >({{ groupedPosts[year]?.length }})</span
          >
        </h2>

        <!-- 该年份的文章列表 -->
        <div class="space-y-0">
          <NuxtLink
            v-for="post in groupedPosts[year]"
            :key="post.id"
            :to="`/posts/${post.id}`"
            class="group flex items-center py-3 border-l-2 pl-6 transition-all duration-300 hover:border-l-blue-500 border-l-gray-200 dark:border-l-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
          >
            <!-- 日期 -->
            <span
              class="text-sm w-16 flex-shrink-0 opacity-50 group-hover:opacity-80 transition-all duration-300"
            >
              {{ formatDate(post.published_at || post.created_at) }}
            </span>

            <!-- 标题 -->
            <span
              class="flex-1 mx-4 group-hover:text-blue-500 transition-all duration-300 truncate"
            >
              {{ post.title }}
            </span>
          </NuxtLink>
        </div>
      </section>
    </div>

    <!-- 无文章时的提示 -->
    <div v-else class="text-center py-20">
      <p class="text-lg opacity-70">暂无文章，敬请期待...</p>
    </div>
  </PageWrapper>
</template>
