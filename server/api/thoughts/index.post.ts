/**
 * POST /api/thoughts
 * 创建碎碎念（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义请求体的类型
const bodySchema = z.object({
    content: z.string().min(1),
    images: z.array(z.string().url()).default([])
})

export type CreateThoughtBody = z.input<typeof bodySchema>

export default defineEventHandler(async (event) => {
    // 验证用户身份
    await verifyDashboardAuth(event)

    const client = await serverSupabaseClient<Database>(event)

    // 验证请求体
    const body = await readBody(event)
    const result = bodySchema.safeParse(body)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body',
            data: result.error.flatten()
        })
    }

    const { content, images } = result.data

    // 创建碎碎念
    const { data, error } = await client
        .from('thoughts')
        .insert({ content, images })
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true, data }
})
