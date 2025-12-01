<script setup lang="ts">
import type { Event } from "~/types/database.types";

// SEO 元数据
useSeoMeta({
  title: "事件管理",
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

// 使用 useFetch 获取事件列表
const {
  data: eventsResponse,
  status,
  refresh: refreshEvents,
} = await useFetch("/api/events", {
  query: {
    page: currentPage,
    limit: 20,
  },
  watch: [currentPage],
});

// 计算属性
const events = computed<Event[]>(
  () => (eventsResponse.value as any)?.data || []
);
const totalPages = computed(
  () => (eventsResponse.value as any)?.pagination?.totalPages || 1
);
const total = computed(
  () => (eventsResponse.value as any)?.pagination?.total || 0
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
  title: "",
  description: "",
  event_date: "",
  tags: [] as string[],
  color: "#3B82F6",
});
const tagInput = ref("");

// 预设颜色
const presetColors = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // yellow
  "#EF4444", // red
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6B7280", // gray
];

// 打开添加对话框
const openAddModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  form.value = {
    title: "",
    description: "",
    event_date: "",
    tags: [],
    color: "#3B82F6",
  };
  tagInput.value = "";
  errorMessage.value = "";
  showModal.value = true;
};

// 打开编辑对话框
const openEditModal = (event: Event) => {
  isEditMode.value = true;
  editingId.value = event.id;
  form.value = {
    title: event.title,
    description: event.description || "",
    event_date: event.event_date,
    tags: event.tags || [],
    color: event.color || "#3B82F6",
  };
  tagInput.value = "";
  errorMessage.value = "";
  showModal.value = true;
};

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
  if (!form.value.event_date) {
    errorMessage.value = "请选择日期";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    if (isEditMode.value && editingId.value) {
      // 编辑模式
      await $fetch(`/api/events/${editingId.value}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: {
          title: form.value.title,
          description: form.value.description || undefined,
          event_date: form.value.event_date,
          tags: form.value.tags,
          color: form.value.color,
        },
      });
    } else {
      // 添加模式
      await $fetch("/api/events", {
        method: "POST",
        headers: getAuthHeader(),
        body: {
          title: form.value.title,
          description: form.value.description || undefined,
          event_date: form.value.event_date,
          tags: form.value.tags,
          color: form.value.color,
        },
      });
    }
    showModal.value = false;
    await refreshEvents();
  } catch (error: any) {
    errorMessage.value =
      error.data?.statusMessage || (isEditMode.value ? "更新失败" : "创建失败");
  }

  isSubmitting.value = false;
};

// 删除事件
const deleteEvent = async (id: string) => {
  if (!confirm("确定要删除这个事件吗？")) return;

  try {
    await $fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });
    await refreshEvents();
  } catch (error) {
    alert("删除失败");
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<template>
  <DashboardLayout>
    <!-- 标题栏 - 固定 -->
    <div class="flex justify-between items-center mb-6 flex-shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white transition-colors">事件管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          共 {{ total }} 个事件
        </p>
      </div>
      <button
        @click="openAddModal"
        class="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-green-500/25"
      >
        <span>🎯</span>
        添加事件
      </button>
    </div>

    <!-- 列表区域 - 可滚动 -->
    <div class="flex-1 overflow-y-auto pr-2 min-h-0">
      <!-- 列表 -->
      <GlassCard v-if="events.length" padding="p-0" class="overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50/50 dark:bg-gray-900/50">
            <tr>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                日期
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                标题
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                描述
              </th>
              <th
                class="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors"
              >
                标签
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
              v-for="event in events"
              :key="event.id"
              class="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    v-if="event.color"
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: event.color }"
                  ></span>
                  <span class="text-sm text-gray-700 dark:text-gray-300 transition-colors">{{
                    formatDate(event.event_date)
                  }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-medium text-gray-900 dark:text-white transition-colors">{{ event.title }}</span>
              </td>
              <td class="px-6 py-4">
                <div v-if="event.description" class="text-sm">
                  <MarkdownPreview :content="event.description" />
                </div>
                <span v-else class="text-sm text-gray-500 dark:text-gray-400 transition-colors">-</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in event.tags"
                    :key="tag"
                    class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs transition-colors"
                  >
                    {{ tag }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-right space-x-3">
                <button
                  @click="openEditModal(event)"
                  class="text-blue-500 hover:text-blue-700 text-sm transition-colors"
                >
                  编辑
                </button>
                <button
                  @click="deleteEvent(event.id)"
                  class="text-red-500 hover:text-red-700 text-sm transition-colors"
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
          class="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700"
        >
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            class="px-4 py-2 rounded-xl transition-colors"
            :class="
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            "
          >
            {{ page }}
          </button>
        </div>
      </GlassCard>
      <!-- 空状态 -->
      <GlassCard v-else padding="py-12" class="text-center">
        <div class="text-6xl mb-4">📅</div>
        <p class="text-gray-500 dark:text-gray-400 mb-4">还没有事件</p>
        <button
          @click="openAddModal"
          class="inline-block px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
        >
          添加第一个事件
        </button>
      </GlassCard>
    </div>

    <!-- 添加/编辑事件对话框 -->
    <Modal
      :show="showModal"
      :title="isEditMode ? '编辑事件' : '添加事件'"
      size="md"
      @close="showModal = false"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 标题 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            标题 *
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="事件标题"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        <!-- 日期 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            日期 *
          </label>
          <input
            v-model="form.event_date"
            type="date"
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        <!-- 描述 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            描述（可选）
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="事件描述..."
            class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
          ></textarea>
        </div>

        <!-- 颜色 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            颜色
          </label>
          <div class="flex items-center gap-2">
            <div
              v-for="color in presetColors"
              :key="color"
              @click="form.color = color"
              class="w-8 h-8 rounded-full cursor-pointer ring-2 ring-offset-2 transition-all"
              :class="
                form.color === color ? 'ring-gray-400' : 'ring-transparent'
              "
              :style="{ backgroundColor: color }"
            ></div>
            <input
              v-model="form.color"
              type="color"
              class="w-8 h-8 rounded-full cursor-pointer border-0"
            />
          </div>
        </div>

        <!-- 标签 -->
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            标签
          </label>
          <div class="flex gap-2 mb-2">
            <input
              v-model="tagInput"
              type="text"
              placeholder="输入标签后按回车"
              @keydown.enter.prevent="addTag"
              class="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              @click="addTag"
              class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              添加
            </button>
          </div>
          <div v-if="form.tags.length" class="flex flex-wrap gap-2">
            <span
              v-for="(tag, index) in form.tags"
              :key="tag"
              class="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-sm flex items-center gap-1 transition-colors"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(index)"
                class="hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </span>
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
            class="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            {{
              isSubmitting
                ? isEditMode
                  ? "更新中..."
                  : "添加中..."
                : isEditMode
                ? "更新"
                : "添加"
            }}
          </button>
        </div>
      </template>
    </Modal>
  </DashboardLayout>
</template>
