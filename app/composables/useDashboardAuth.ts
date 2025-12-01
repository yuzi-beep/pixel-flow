// Dashboard 认证 Composable - 使用全局状态
const globalAuthState = {
    isAuthenticated: ref(false),
    isLoading: ref(true),
    isChecked: ref(false) // 标记是否已经检查过认证状态
}

export const useDashboardAuth = () => {
    const { isAuthenticated, isLoading, isChecked } = globalAuthState

    // 加密存储的 key
    const STORAGE_KEY = 'dashboard_auth'

    // 简单的加密/解密（使用 Base64 + 反转，生产环境可使用更强的加密）
    const encrypt = (data: string): string => {
        return btoa(data.split('').reverse().join(''))
    }

    const decrypt = (data: string): string => {
        try {
            return atob(data).split('').reverse().join('')
        } catch {
            return ''
        }
    }

    // 保存认证信息
    const saveAuth = (token: string, timestamp: number) => {
        const data = JSON.stringify({ token, timestamp })
        localStorage.setItem(STORAGE_KEY, encrypt(data))
    }

    // 获取认证信息
    const getAuth = (): { token: string; timestamp: number } | null => {
        const encrypted = localStorage.getItem(STORAGE_KEY)
        if (!encrypted) return null

        try {
            const decrypted = decrypt(encrypted)
            return JSON.parse(decrypted)
        } catch {
            return null
        }
    }

    // 获取 Authorization header 用于 API 请求
    const getAuthHeader = (): Record<string, string> => {
        const auth = getAuth()
        if (!auth) return {}
        // 将 token 和 timestamp 编码为 Base64 字符串
        const tokenData = btoa(JSON.stringify(auth))
        return { Authorization: `Bearer ${tokenData}` }
    }

    // 清除认证信息
    const clearAuth = () => {
        localStorage.removeItem(STORAGE_KEY)
        isAuthenticated.value = false
    }

    // 验证密钥并登录
    const login = async (key: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await $fetch('/api/auth/verify', {
                method: 'POST',
                body: { key }
            })

            if (response.success) {
                saveAuth(response.token, response.timestamp)
                isAuthenticated.value = true
                return { success: true }
            }

            return { success: false, message: '验证失败' }
        } catch (error: any) {
            return {
                success: false,
                message: error.data?.statusMessage || '密钥错误'
            }
        }
    }

    // 登出
    const logout = () => {
        clearAuth()
        navigateTo('/dashboard/login')
    }

    // 检查认证状态
    const checkAuth = async (force = false): Promise<boolean> => {
        // 如果已经检查过且不强制刷新，直接返回当前状态
        if (isChecked.value && !force) {
            return isAuthenticated.value
        }

        isLoading.value = true

        const auth = getAuth()
        if (!auth) {
            isAuthenticated.value = false
            isLoading.value = false
            isChecked.value = true
            return false
        }

        try {
            const response = await $fetch('/api/auth/validate', {
                method: 'POST',
                body: auth
            })

            isAuthenticated.value = response.valid
            isLoading.value = false
            isChecked.value = true
            return response.valid
        } catch {
            clearAuth()
            isLoading.value = false
            isChecked.value = true
            return false
        }
    }

    // 初始化检查（仅在客户端执行一次）
    const initAuth = async () => {
        if (import.meta.client && !isChecked.value) {
            await checkAuth()
        }
    }

    return {
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
        initAuth,
        getAuthHeader
    }
}
