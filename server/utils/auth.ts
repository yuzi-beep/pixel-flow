/**服务端认证工具
 * 验证 Dashboard Token */
import { createHash } from 'crypto'
import type { H3Event } from 'h3'

/**
 * 验证请求中的 Dashboard Token
 * @param event H3 事件对象
 * @throws 如果验证失败，抛出 401 错误
 */
export const verifyDashboardAuth = async (event: H3Event): Promise<void> => {
    // 从 Authorization header 获取 token
    const authHeader = getHeader(event, 'Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Missing or invalid authorization header'
        })
    }

    const tokenPart = authHeader.substring(7) // 去掉 'Bearer ' 前缀
    
    // 解析 token 和 timestamp
    let token: string
    let timestamp: number
    
    try {
        const decoded = JSON.parse(atob(tokenPart))
        token = decoded.token
        timestamp = decoded.timestamp
    } catch {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid token format'
        })
    }

    if (!token || !timestamp) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid token data'
        })
    }

    const secretKey = process.env.DASHBOARD_SECRET_KEY

    if (!secretKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Dashboard secret key not configured'
        })
    }

    // 验证 token 是否过期（7天有效期）
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    if (Date.now() - timestamp > maxAge) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token expired'
        })
    }

    // 重新计算 token 并验证
    const tokenData = `${secretKey}:${timestamp}`
    const expectedToken = createHash('sha256').update(tokenData).digest('hex')

    if (token !== expectedToken) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid token'
        })
    }
}
