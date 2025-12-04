// Dashboard 路由守卫中间件
export default defineNuxtRouteMiddleware(async (to, from) => {
    // 只在客户端执行
    if (import.meta.server) return

    // 如果是登录页面，不需要验证
    if (to.path === '/dashboard/login') {
        return
    }

    // 只保护 /dashboard 路径
    if (!to.path.startsWith('/dashboard')) {
        return
    }

    const { checkAuth, isAuthenticated } = useDashboardAuth()

    // 检查认证状态
    const isValid = await checkAuth()

    if (!isValid) {
        // 未认证，跳转到登录页
        return navigateTo('/dashboard/login')
    }
})
