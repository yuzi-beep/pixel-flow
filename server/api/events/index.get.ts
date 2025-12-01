/**
 * GET /api/events
 * 获取事件列表
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义查询参数的类型
const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    tag: z.string().optional()
})

export type EventsQueryParams = z.input<typeof querySchema>

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)

    // 验证查询参数
    const query = getQuery(event)
    const result = querySchema.safeParse(query)

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid query parameters',
            data: result.error.flatten()
        })
    }

    const { page, limit, tag } = result.data

    // 构建查询
    let supabaseQuery = client
        .from('events')
        .select('*', { count: 'exact' })
        .order('event_date', { ascending: false })

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
        pagination: { page, limit, total, totalPages }
    }
})
