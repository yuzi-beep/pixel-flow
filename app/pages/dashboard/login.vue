<script setup lang="ts">
// SEO 元数据
useSeoMeta({
  title: '登录',
});

const { login, isAuthenticated, checkAuth } = useDashboardAuth();

// 如果已经登录，跳转到 dashboard
onMounted(async () => {
  const valid = await checkAuth();
  if (valid) {
    navigateTo("/dashboard");
  }
});

const secretKey = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  if (!secretKey.value.trim()) {
    errorMessage.value = "请输入密钥";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  const result = await login(secretKey.value);

  if (result.success) {
    navigateTo("/dashboard");
  } else {
    errorMessage.value = result.message || "登录失败";
  }

  isLoading.value = false;
};
</script>

<template>
  <DashboardLayout :show-sidebar="false">
    <div class="flex-1 flex items-center justify-center">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🔐</div>
          <h1 class="page-title mb-2">Dashboard</h1>
          <p class="text-caption">
            请输入管理密钥登录
          </p>
        </div>

        <!-- 登录表单 -->
        <div class="glass-card p-8">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- 密钥输入 -->
            <div>
              <label for="secret-key" class="form-label">
                管理密钥
              </label>
              <input
                id="secret-key"
                v-model="secretKey"
                type="password"
                placeholder="输入密钥..."
                class="input"
                :disabled="isLoading"
              />
            </div>

            <!-- 错误提示 -->
            <div v-if="errorMessage" class="error-message text-center">
              {{ errorMessage }}
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 btn-primary disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg
                v-if="isLoading"
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isLoading ? "验证中..." : "登录" }}
            </button>
          </form>

          <!-- 返回首页 -->
          <div class="mt-6 text-center">
            <NuxtLink to="/" class="link text-caption">
              ← 返回首页
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
