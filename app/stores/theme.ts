// 主题 Store - 管理主题、加载状态和布局
export const useThemeStore = defineStore('theme', () => {
    // ==================== 主题相关 ====================
    const isDarkTheme = ref(false)

    const toggleTheme = () => {
        isDarkTheme.value = !isDarkTheme.value
    }

    // ==================== 加载状态相关 ====================
    const loadingCounter = ref(1)
    const isLoading = computed(() => loadingCounter.value > 0)

    const startLoading = () => {
        loadingCounter.value = 1
    }

    const stopLoading = () => {
        loadingCounter.value = 0
    }

    return {
        // 主题
        isDarkTheme,
        toggleTheme,
        // 加载
        loadingCounter,
        isLoading,
        startLoading,
        stopLoading
    }
})
