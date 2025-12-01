/**
 * POST /api/auth/validate
 * 验证 token 是否有效
 */
import { z } from 'zod'
import { createHash } from 'crypto'

const bodySchema = z.object({
    token: z.string().min(1),
    timestamp: z.number()
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const result = bodySchema.safeParse(body)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body'
        })
    }

    const { token, timestamp } = result.data
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

    return { success: true, valid: true }
})
