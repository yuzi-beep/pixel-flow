/**
 * POST /api/posts
 * 创建新文章（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义请求体的类型
const bodySchema = z.object({
    title: z.string().min(1).max(500),
    content: z.string().min(1),
    author: z.string().max(100).optional(),
    status: z.enum(['draft', 'published']).default('draft'),
    tags: z.array(z.string()).default([])
})

export type CreatePostBody = z.input<typeof bodySchema>

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

    const { title, content, author, status, tags } = result.data

    // 创建文章
    const { data, error } = await client
        .from('posts')
        .insert({
            title,
            content,
            author: author || user.email || null,
            status,
            published_at: status === 'published' ? new Date().toISOString() : null,
            tags
        })
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
