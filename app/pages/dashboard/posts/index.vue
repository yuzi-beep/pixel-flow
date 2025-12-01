<script setup lang="ts">
import type { Post } from "~/types/database.types";

// SEO 元数据
useSeoMeta({
  title: "文章管理",
});

const {
  isAuthenticated,
  isLoading: authLoading,
  checkAuth,
  getAuthHeader,
} = useDashboardAuth();

// 检查认证状态
onMounted(async () => {
  const valid = await checkAuth();
  if (!valid) {
    navigateTo("/dashboard/login");
  }
});

// 分页状态
const currentPage = ref(1);

// 使用 useFetch 获取文章列表
const {
  data: postsResponse,
  status,
  refresh: refreshPosts,
} = await useFetch("/api/posts", {
  query: {
    page: currentPage,
    limit: 10,
    status: "all",
  },
  watch: [currentPage],
});

// 计算属性
const posts = computed<Post[]>(() => (postsResponse.value as any)?.data || []);
const totalPages = computed(
  () => (postsResponse.value as any)?.pagination?.totalPages || 1
);
const total = computed(
  () => (postsResponse.value as any)?.pagination?.total || 0
);
const isLoading = computed(() => status.value === "pending");

// 删除文章
const deletePost = async (id: string) => {
  if (!confirm("确定要删除这篇文章吗？")) return;

  try {
    await $fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    await refreshPosts();
  } catch (error) {
    alert("删除失败");
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN");
};
</script>

<template>
  <DashboardLayout>
    <!-- 标题栏 - 固定 -->
    <div class="flex justify-between items-center mb-6 flex-shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">文章管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm transition-colors">
          共 {{ total }} 篇文章
        </p>
      </div>
      <NuxtLink
        to="/dashboard/posts/new"
        class="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/25"
      >
        <span>✍️</span>
        写文章
      </NuxtLink>
    </div>
    <!-- 列表区域 - 可滚动 -->
    <div class="flex-1 overflow-y-auto pr-2 min-h-0">
      <!-- 文章列表 -->
      <GlassCard padding="p-0" class="overflow-hidden">
        <div v-if="posts.length === 0" class="p-12 text-center">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-gray-500 dark:text-gray-400 mb-4 transition-colors">暂无文章</p>
          <NuxtLink
            to="/dashboard/posts/new"
            class="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            写第一篇文章
          </NuxtLink>
        </div>

        <table v-else class="w-full">
          <thead class="bg-gray-50/50 dark:bg-gray-900/50">
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                标题
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                状态
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                浏览
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                创建时间
              </th>
              <th
                class="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="post in posts"
              :key="post.id"
              class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900 dark:text-white transition-colors">{{ post.title }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                  <span v-for="tag in post.tags" :key="tag" class="mr-2"
                    >#{{ tag }}</span
                  >
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 text-xs rounded-full font-medium"
                  :class="
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                  "
                >
                  {{ post.status === "published" ? "已发布" : "草稿" }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                {{ post.view_count || 0 }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                {{ formatDate(post.created_at) }}
              </td>
              <td class="px-6 py-4 text-right space-x-3">
                <NuxtLink
                  :to="`/posts/${post.id}`"
                  target="_blank"
                  class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  查看
                </NuxtLink>
                <NuxtLink
                  :to="`/dashboard/posts/${post.id}`"
                  class="text-blue-500 hover:text-blue-700 transition-colors"
                >
                  编辑
                </NuxtLink>
                <button
                  @click="deletePost(post.id)"
                  class="text-red-500 hover:text-red-700 transition-colors"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div
          v-if="totalPages > 1"
          class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2"
        >
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            class="px-4 py-2 rounded-xl transition-colors"
            :class="
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            "
          >
            {{ page }}
          </button>
        </div>
      </GlassCard>
    </div>
  </DashboardLayout>
</template>
