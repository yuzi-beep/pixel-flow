/**
 * GET /api/thoughts
 * 获取碎碎念列表
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义查询参数的类型
const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
})

export type ThoughtsQueryParams = z.input<typeof querySchema>

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

    const { page, limit } = result.data

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await client
        .from('thoughts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

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
