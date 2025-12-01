// 主题插件 - 初始化主题、加载状态和布局
export default defineNuxtPlugin((nuxtApp) => {
    const themeStore = useThemeStore()

    // ==================== 主题初始化 ====================
    if (import.meta.client) {
        // 从 localStorage 读取主题设置
        const savedTheme = localStorage.getItem('theme')
        themeStore.isDarkTheme = savedTheme === 'dark'

        const htmlEl = document.documentElement

        // 监听主题变化，同步到 DOM 和 localStorage
        watch(() => themeStore.isDarkTheme, (newValue) => {
            htmlEl.classList.toggle('dark', newValue)
            localStorage.setItem('theme', newValue ? 'dark' : 'light')
        }, { immediate: true })
    }

    // ==================== 加载状态钩子 ====================
    nuxtApp.hook('page:loading:start', () => {
        themeStore.startLoading()
        console.log('Page loading started')
    })

    nuxtApp.hook('page:loading:end', () => {

        console.log('Page loading ended');
    });

    nuxtApp.hook('page:transition:finish', () => {
        themeStore.stopLoading()
        console.log('Page loading finished')
    })

    if (import.meta.client) {
        nuxtApp.hook('app:mounted', () => {
            themeStore.loadingCounter = 0
        })
    }
})