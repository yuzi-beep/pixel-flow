<script setup lang="ts">
import type { Thought } from "~/types/database.types";

// SEO 元数据
useSeoMeta({
  title: "碎碎念管理",
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

// 使用 useFetch 获取碎碎念列表
const {
  data: thoughtsResponse,
  status,
  refresh: refreshThoughts,
} = await useFetch("/api/thoughts", {
  query: {
    page: currentPage,
    limit: 20,
  },
  watch: [currentPage],
});

// 计算属性
const thoughts = computed<Thought[]>(
  () => (thoughtsResponse.value as any)?.data || []
);
const totalPages = computed(
  () => (thoughtsResponse.value as any)?.pagination?.totalPages || 1
);
const total = computed(
  () => (thoughtsResponse.value as any)?.pagination?.total || 0
);
const isLoading = computed(() => status.value === "pending");

// 对话框状态
const showModal = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");
const isEditMode = ref(false);
const editingId = ref<string | null>(null);

// 表单数据
const form = ref({
  content: "",
  images: [] as string[],
});
const imageUrl = ref("");

// 打开添加对话框
const openAddModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  form.value = { content: "", images: [] };
  imageUrl.value = "";
  errorMessage.value = "";
  showModal.value = true;
};

// 打开编辑对话框
const openEditModal = (thought: Thought) => {
  isEditMode.value = true;
  editingId.value = thought.id;
  form.value = {
    content: thought.content,
    images: thought.images || [],
  };
  imageUrl.value = "";
  errorMessage.value = "";
  showModal.value = true;
};

// 添加图片
const addImage = () => {
  const url = imageUrl.value.trim();
  if (url && !form.value.images.includes(url)) {
    form.value.images.push(url);
    imageUrl.value = "";
  }
};

// 删除图片
const removeImage = (index: number) => {
  form.value.images.splice(index, 1);
};

// 提交表单
const handleSubmit = async () => {
  if (!form.value.content.trim()) {
    errorMessage.value = "请输入内容";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    if (isEditMode.value && editingId.value) {
      // 编辑模式
      await $fetch(`/api/thoughts/${editingId.value}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: {
          content: form.value.content,
          images: form.value.images,
        },
      });
    } else {
      // 添加模式
      await $fetch("/api/thoughts", {
        method: "POST",
        headers: getAuthHeader(),
        body: {
          content: form.value.content,
          images: form.value.images,
        },
      });
    }
    showModal.value = false;
    await refreshThoughts();
  } catch (error: any) {
    errorMessage.value =
      error.data?.statusMessage || (isEditMode.value ? "更新失败" : "创建失败");
  }

  isSubmitting.value = false;
};

// 删除碎碎念
const deleteThought = async (id: string) => {
  if (!confirm("确定要删除这条碎碎念吗？")) return;

  try {
    await $fetch(`/api/thoughts/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    await refreshThoughts();
  } catch (error) {
    alert("删除失败");
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 截取内容
const truncateContent = (content: string, length: number = 200) => {
  if (content.length <= length) return content;
  return content.slice(0, length) + "...";
};
</script>

<template>
  <DashboardLayout>
    <!-- 标题栏 - 固定 -->
    <div class="flex justify-between items-center mb-6 flex-shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">碎碎念管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          共 {{ total }} 条碎碎念
        </p>
      </div>
      <button
        @click="openAddModal"
        class="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-purple-500/25"
      >
        <span>💬</span>
        发碎碎念
      </button>
    </div>

    <!-- 列表区域 - 可滚动 -->
    <div class="flex-1 overflow-y-auto pr-2 min-h-0">
      <!-- 列表 -->
      <div v-if="thoughts.length" class="space-y-4">
        <GlassCard v-for="thought in thoughts" :key="thought.id" padding="p-6">
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <div class="leading-relaxed">
                <MarkdownPreview :content="truncateContent(thought.content)" />
              </div>

              <!-- 图片预览 -->
              <div
                v-if="thought.images && thought.images.length"
                class="flex gap-2 mt-4"
              >
                <div
                  v-for="(img, idx) in thought.images.slice(0, 4)"
                  :key="idx"
                  class="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden"
                >
                  <img :src="img" class="w-full h-full object-cover" />
                </div>
                <div
                  v-if="thought.images.length > 4"
                  class="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
                >
                  +{{ thought.images.length - 4 }}
                </div>
              </div>

              <div class="text-sm text-gray-500 dark:text-gray-400 mt-4 transition-colors">
                {{ formatDate(thought.created_at) }}
              </div>
            </div>

            <button
              @click="deleteThought(thought.id)"
              class="text-red-500 hover:text-red-700 text-sm shrink-0 transition-colors"
            >
              删除
            </button>
            <button
              @click="openEditModal(thought)"
              class="text-blue-500 hover:text-blue-700 text-sm shrink-0 transition-colors"
            >
              编辑
            </button>
          </div>
        </GlassCard>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="flex justify-center gap-2 py-4">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            class="px-4 py-2 rounded-xl transition-colors"
            :class="
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            "
          >
            {{ page }}
          </button>
        </div>
      </div>
      <!-- 空状态 -->
      <GlassCard v-else padding="py-12" class="text-center">
        <div class="text-6xl mb-4">💭</div>
        <p class="text-gray-500 dark:text-gray-400 mb-4">还没有碎碎念</p>
        <button
          @click="openAddModal"
          class="inline-block px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors"
        >
          发一条碎碎念
        </button>
      </GlassCard>
    </div>

    <!-- 添加/编辑碎碎念对话框 -->
    <Modal
      :show="showModal"
      :title="isEditMode ? '编辑碎碎念' : '发碎碎念'"
      size="md"
      @close="showModal = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 内容 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            内容 *
          </label>
          <textarea
            v-model="form.content"
            rows="5"
            placeholder="说点什么..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
          ></textarea>
          <div class="text-right text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
            {{ form.content.length }} 字
          </div>
        </div>

        <!-- 图片 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            图片（可选）
          </label>
          <div class="flex gap-2 mb-3">
            <input
              v-model="imageUrl"
              type="url"
              placeholder="输入图片URL"
              @keydown.enter.prevent="addImage"
              class="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              @click="addImage"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              添加
            </button>
          </div>

          <!-- 图片预览 -->
          <div v-if="form.images.length" class="grid grid-cols-4 gap-2">
            <div
              v-for="(img, index) in form.images"
              :key="index"
              class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700"
            >
              <img :src="img" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="errorMessage"
          class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm"
        >
          {{ errorMessage }}
        </div>
      </form>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="showModal = false"
            class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            {{
              isSubmitting
                ? isEditMode
                  ? "更新中..."
                  : "发布中..."
                : isEditMode
                ? "更新"
                : "发布"
            }}
          </button>
        </div>
      </template>
    </Modal>
  </DashboardLayout>
</template>
