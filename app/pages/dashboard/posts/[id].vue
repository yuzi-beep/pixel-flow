<script setup lang="ts">
import type { Post } from "~/types/database.types";

const route = useRoute();
const postId = route.params.id as string;
const themeStore = useThemeStore();

// 判断是新建还是编辑模式
const isNewMode = computed(() => postId === "new");

// SEO 元数据
useSeoMeta({
  title: computed(() => (isNewMode.value ? "新建文章" : "编辑文章")),
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

// 编辑模式：获取文章数据
const {
  data: postResponse,
  status,
  error: fetchError,
} = await useFetch(`/api/posts/${postId}`, {
  query: { includeUnpublished: "true" },
  immediate: !isNewMode.value, // 新建模式不请求
});

// 计算属性
const originalPost = computed<Post | null>(() =>
  isNewMode.value ? null : (postResponse.value as any)?.data || null
);
const isLoadingPost = computed(
  () => !isNewMode.value && status.value === "pending"
);

// 表单数据
const form = ref({
  title: "",
  content: "",
  author: "",
  status: "draft" as "draft" | "published",
  tags: [] as string[],
});

const tagInput = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

// 预览模式: 'edit' | 'preview' | 'split'
const viewMode = ref<"edit" | "preview" | "split">("split");

// 编辑模式：初始化表单数据
watch(
  originalPost,
  (post) => {
    if (post) {
      form.value = {
        title: post.title,
        content: post.content,
        author: post.author || "",
        status: post.status,
        tags: post.tags || [],
      };
    }
  },
  { immediate: true }
);

// 处理获取错误
watch(
  fetchError,
  (error) => {
    if (error && !isNewMode.value) {
      errorMessage.value = (error as any).data?.statusMessage || "加载文章失败";
    }
  },
  { immediate: true }
);

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag);
    tagInput.value = "";
  }
};

// 删除标签
const removeTag = (index: number) => {
  form.value.tags.splice(index, 1);
};

// 提交表单
const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    errorMessage.value = "请输入标题";
    return;
  }
  if (!form.value.content.trim()) {
    errorMessage.value = "请输入内容";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    if (isNewMode.value) {
      // 新建文章
      const result = await $fetch("/api/posts", {
        method: "POST",
        headers: getAuthHeader(),
        body: {
          title: form.value.title,
          content: form.value.content,
          author: form.value.author || undefined,
          status: form.value.status,
          tags: form.value.tags,
        },
      });
      // 新建成功后跳转到编辑页面
      const newPostId = (result as any)?.data?.id;
      if (newPostId) {
        navigateTo(`/dashboard/posts/${newPostId}`);
      }
    } else {
      // 更新文章
      await $fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: {
          title: form.value.title,
          content: form.value.content,
          author: form.value.author || undefined,
          status: form.value.status,
          tags: form.value.tags,
        },
      });
      // 更新成功，保留在当前页面
    }
  } catch (error: any) {
    errorMessage.value =
      error.data?.statusMessage || (isNewMode.value ? "创建失败" : "更新失败");
  }

  isSubmitting.value = false;
};

// 页面标题和按钮文字
const pageTitle = computed(() => (isNewMode.value ? "写文章" : "编辑文章"));
const submitButtonText = computed(() => {
  if (isSubmitting.value) return "保存中...";
  return isNewMode.value ? "保存文章" : "更新文章";
});
</script>

<template>
  <DashboardLayout :show-sidebar="false">
    <!-- 顶部工具栏 -->
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <div class="flex items-center gap-4">
        <NuxtLink
          to="/dashboard/posts"
          class="text-theme-text-mute hover:text-theme-text transition-colors"
        >
          ← 返回
        </NuxtLink>
        <h1 class="card-title mb-0">
          {{ pageTitle }}
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <!-- 主题切换 -->
        <button
          @click="themeStore.toggleTheme()"
          class="p-2 rounded-lg hover:bg-theme-hover transition-colors text-theme-text-soft"
          title="切换主题"
        >
          <span class="text-lg dark:hidden">🌙</span>
          <span class="text-lg hidden dark:inline">☀️</span>
        </button>

        <!-- 视图模式切换 -->
        <div class="flex items-center bg-theme-bg-mute rounded-lg p-1">
          <button
            @click="viewMode = 'edit'"
            class="px-3 py-1.5 text-caption rounded-md transition-all"
            :class="
              viewMode === 'edit'
                ? 'bg-theme-bg shadow text-theme-text'
                : 'text-theme-text-mute hover:text-theme-text'
            "
          >
            编辑
          </button>
          <button
            @click="viewMode = 'split'"
            class="px-3 py-1.5 text-caption rounded-md transition-all"
            :class="
              viewMode === 'split'
                ? 'bg-theme-bg shadow text-theme-text'
                : 'text-theme-text-mute hover:text-theme-text'
            "
          >
            分屏
          </button>
          <button
            @click="viewMode = 'preview'"
            class="px-3 py-1.5 text-caption rounded-md transition-all"
            :class="
              viewMode === 'preview'
                ? 'bg-theme-bg shadow text-theme-text'
                : 'text-theme-text-mute hover:text-theme-text'
            "
          >
            预览
          </button>
        </div>

        <!-- 状态选择 -->
        <div class="flex items-center bg-theme-bg-mute rounded-lg p-1">
          <button
            @click="form.status = 'draft'"
            class="px-3 py-1.5 text-caption rounded-md transition-all"
            :class="
              form.status === 'draft'
                ? 'bg-theme-bg shadow text-theme-text'
                : 'text-theme-text-mute hover:text-theme-text'
            "
          >
            草稿
          </button>
          <button
            @click="form.status = 'published'"
            class="px-3 py-1.5 text-caption rounded-md transition-all"
            :class="
              form.status === 'published'
                ? 'bg-theme-bg shadow text-theme-text'
                : 'text-theme-text-mute hover:text-theme-text'
            "
          >
            发布
          </button>
        </div>

        <!-- 保存按钮 -->
        <button
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="btn-primary text-caption"
        >
          {{ submitButtonText }}
        </button>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message mb-4 shrink-0">
      {{ errorMessage }}
    </div>

    <!-- 主编辑区域 -->
    <div class="flex-1 flex gap-4 min-h-0">
      <!-- 左侧编辑器面板 -->
      <GlassCard
        padding="p-0"
        rounded="rounded-xl"
        class="flex flex-col overflow-hidden transition-all"
        :class="
          viewMode === 'preview'
            ? 'hidden'
            : viewMode === 'split'
            ? 'w-1/2'
            : 'flex-1'
        "
      >
        <!-- 编辑器头部 -->
        <div class="p-4 border-b border-theme-border space-y-3 shrink-0">
          <!-- 标题输入 -->
          <input
            v-model="form.title"
            type="text"
            placeholder="输入文章标题..."
            class="w-full page-title text-xl border-none bg-transparent outline-none placeholder-theme-text-mute mb-0"
          />

          <!-- 作者和标签 -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-caption">作者:</span>
              <input
                v-model="form.author"
                type="text"
                placeholder="可选"
                class="w-24 px-2 py-1 bg-transparent rounded text-theme-text placeholder-theme-text-mute border border-theme-border outline-none text-caption focus:border-accent"
              />
            </div>

            <div class="flex items-center gap-2 flex-1 min-w-0">
              <span class="text-caption shrink-0">标签:</span>
              <div class="flex items-center gap-1 flex-wrap flex-1 min-w-0">
                <span
                  v-for="(tag, index) in form.tags"
                  :key="tag"
                  class="badge px-2 py-0.5 flex items-center gap-1 shrink-0"
                >
                  #{{ tag }}
                  <button
                    type="button"
                    @click="removeTag(index)"
                    class="hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
                <input
                  v-model="tagInput"
                  type="text"
                  placeholder="添加标签..."
                  @keydown.enter.prevent="addTag"
                  class="w-20 px-2 py-0.5 bg-transparent rounded text-theme-text placeholder-theme-text-mute border border-theme-border outline-none text-tiny focus:border-accent flex-shrink-0"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 内容编辑区 -->
        <div class="flex-1 p-4 min-h-0">
          <textarea
            v-model="form.content"
            placeholder="使用 Markdown 编写文章内容..."
            class="w-full h-full resize-none bg-transparent border-none outline-none text-theme-text placeholder-theme-text-mute text-mono leading-relaxed"
          ></textarea>
        </div>
      </GlassCard>

      <!-- 右侧预览面板 -->
      <GlassCard
        padding="p-0"
        rounded="rounded-xl"
        class="flex flex-col overflow-hidden transition-all"
        :class="
          viewMode === 'edit'
            ? 'hidden'
            : viewMode === 'split'
            ? 'w-1/2'
            : 'flex-1'
        "
      >
        <!-- 预览头部 -->
        <div class="p-4 border-b border-theme-border flex-shrink-0">
          <div class="flex items-center gap-2 text-caption">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            预览
          </div>
        </div>

        <!-- 预览内容区 -->
        <div class="flex-1 p-6 overflow-auto min-h-0">
          <!-- 预览标题 -->
          <h1 v-if="form.title" class="page-title mb-4">
            {{ form.title }}
          </h1>
          <div v-else class="page-title text-theme-text-mute mb-4 italic">
            无标题
          </div>

          <!-- 预览元信息 -->
          <div
            v-if="form.author || form.tags.length"
            class="flex items-center gap-3 mb-6 text-caption"
          >
            <span v-if="form.author">{{ form.author }}</span>
            <div v-if="form.tags.length" class="flex items-center gap-1">
              <span v-for="tag in form.tags" :key="tag" class="text-accent"
                >#{{ tag }}</span
              >
            </div>
          </div>

          <!-- Markdown 内容预览 -->
          <MarkdownPreview v-if="form.content" :content="form.content" />
          <div v-else class="text-caption italic">
            开始编写内容后预览将显示在这里...
          </div>
        </div>
      </GlassCard>
    </div>
  </DashboardLayout>
</template>
