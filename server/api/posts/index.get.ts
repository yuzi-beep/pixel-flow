/**
 * GET /api/posts
 * 获取文章列表
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义查询参数的类型
const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    tag: z.string().optional(),
    status: z.enum(['all', 'published', 'draft']).default('published')
})

// 导出类型供前端使用
export type PostsQueryParams = z.input<typeof querySchema>

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)

    // 验证并解析查询参数
    const query = getQuery(event)
    const result = querySchema.safeParse(query)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid query parameters',
            data: result.error.message
        })
    }

    const { page, limit, tag, status } = result.data
    let supabaseQuery = client
        .from('posts')
        .select('id, title, author, status, created_at, updated_at, published_at, view_count, tags', { count: 'exact' })
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

    // 默认只返回已发布的文章
    if (status !== 'all')
        supabaseQuery = supabaseQuery.eq('status', 'published')

    // 按标签过滤
    if (tag)
        supabaseQuery = supabaseQuery.contains('tags', [tag])

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    supabaseQuery = supabaseQuery.range(from, to)

    const { data, error, count } = await supabaseQuery

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return {
        data: data || [],
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    }
})
