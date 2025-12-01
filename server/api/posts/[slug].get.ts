/**
 * GET /api/posts/:id
 * 获取单篇文章
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义路由参数的类型
const paramsSchema = z.object({
    id: z.string().uuid()
})

// 定义查询参数
const querySchema = z.object({
    includeUnpublished: z.enum(['true', 'false']).optional()
})

export type PostParams = z.infer<typeof paramsSchema>

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'slug')
    const result = paramsSchema.safeParse({ id })

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid post ID',
            data: result.error.flatten()
        })
    }

    // 解析查询参数
    const query = getQuery(event)
    const queryResult = querySchema.safeParse(query)
    const includeUnpublished = queryResult.success && queryResult.data.includeUnpublished === 'true'

    const client = await serverSupabaseClient<Database>(event)

    // 获取文章
    let supabaseQuery = client
        .from('posts')
        .select('*')
        .eq('id', result.data.id)

    // 如果不包含未发布的文章，则只获取已发布的
    if (!includeUnpublished) {
        supabaseQuery = supabaseQuery.eq('status', 'published')
    }

    const { data, error } = await supabaseQuery.single()

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

    // 仅对已发布的文章增加浏览量（异步执行，不等待结果）
    if (data.status === 'published') {
        client
            .from('posts')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id)
            .then(() => { /* ignore */ })
    }

    return { data }
})
