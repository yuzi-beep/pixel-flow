/**
 * DELETE /api/events/:id
 * 删除事件（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义路由参数的类型
const paramsSchema = z.object({
    id: z.string().uuid()
})

export type DeleteEventParams = z.infer<typeof paramsSchema>

export default defineEventHandler(async (event) => {
    // 验证用户身份
    await verifyDashboardAuth(event)

    // 验证路由参数
    const id = getRouterParam(event, 'id')
    const result = paramsSchema.safeParse({ id })

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid event ID',
            data: result.error.flatten()
        })
    }

    const client = await serverSupabaseClient<Database>(event)

    // 删除事件
    const { error } = await client
        .from('events')
        .delete()
        .eq('id', result.data.id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true }
})
