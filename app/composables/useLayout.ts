// 布局 Composable - 封装布局相关逻辑
export const useLayout = () => {
    const themeStore = useThemeStore()
    const route = useRoute()

    /** 导航栏模式
     * 0: 首页使用大号导航栏（全屏宽度）
     * 1: 普通页面使用小号导航栏（受限宽度）
     * 2: Dashboard 页面隐藏顶部导航栏 */
    const navbarMode = computed<number>(() => {
        if (route.path.startsWith('/dashboard'))
            return 2;
        if (route.path === '/')
            return 0;
        return 1;
    })

    // 全屏模式使用最大值，其他页面使用 store 中的宽度
    const contentMaxWidth = computed(() => {
        if (navbarMode.value === 0 || navbarMode.value === 2) {
            return Number.MAX_VALUE;
        }
        return themeStore.contentMaxWidth
    })

    return {
        contentMaxWidth,
        navbarMode
    }
}
