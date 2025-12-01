/**
 * POST /api/auth/verify
 * 验证 Dashboard 密钥
 */
import { z } from 'zod'
import { createHash } from 'crypto'

const bodySchema = z.object({
    key: z.string().min(1)
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const result = bodySchema.safeParse(body)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body',
            data: result.error.flatten()
        })
    }

    const { key } = result.data
    const secretKey = process.env.DASHBOARD_SECRET_KEY

    if (!secretKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Dashboard secret key not configured'
        })
    }

    // 验证密钥
    if (key !== secretKey) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Invalid secret key'
        })
    }

    // 生成加密的 token（使用密钥 + 时间戳的哈希）
    const timestamp = Date.now()
    const tokenData = `${secretKey}:${timestamp}`
    const token = createHash('sha256').update(tokenData).digest('hex')

    return {
        success: true,
        token,
        timestamp
    }
})
