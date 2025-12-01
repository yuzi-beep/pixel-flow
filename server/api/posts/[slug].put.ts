/**
 * PUT /api/posts/:id
 * 更新文章（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义路由参数的类型
const paramsSchema = z.object({
    id: z.string().uuid()
})

// 定义请求体的类型
const bodySchema = z.object({
    title: z.string().min(1).max(500).optional(),
    content: z.string().min(1).optional(),
    author: z.string().max(100).optional(),
    status: z.enum(['draft', 'published']).optional(),
    tags: z.array(z.string()).optional()
})

export type UpdatePostParams = z.infer<typeof paramsSchema>
export type UpdatePostBody = z.input<typeof bodySchema>

export default defineEventHandler(async (event) => {
    // 验证用户身份
    await verifyDashboardAuth(event)

    // 验证路由参数
    const id = getRouterParam(event, 'slug')
    const paramsResult = paramsSchema.safeParse({ id })

    if (!paramsResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid post ID',
            data: paramsResult.error.flatten()
        })
    }

    const client = await serverSupabaseClient<Database>(event)

    // 验证请求体
    const body = await readBody(event)
    const bodyResult = bodySchema.safeParse(body)

    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid request body',
            data: bodyResult.error.flatten()
        })
    }

    // 构建更新对象
    const updateData: Record<string, any> = { ...bodyResult.data }

    // 如果状态变为已发布，设置发布时间
    if (updateData.status === 'published') {
        updateData.published_at = new Date().toISOString()
    }

    // 更新文章
    const { data, error } = await client
        .from('posts')
        .update(updateData)
        .eq('id', paramsResult.data.id)
        .select()
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            throw createError({
                statusCode: 404,
                statusMessage: 'Post not found'
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true, data }
})
