/**
 * DELETE /api/thoughts/:id
 * 删除碎碎念（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义路由参数的类型
const paramsSchema = z.object({
    id: z.string().uuid()
})

export type DeleteThoughtParams = z.infer<typeof paramsSchema>

export default defineEventHandler(async (event) => {
    // 验证用户身份
    await verifyDashboardAuth(event)

    // 验证路由参数
    const id = getRouterParam(event, 'id')
    const result = paramsSchema.safeParse({ id })

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid thought ID',
            data: result.error.flatten()
        })
    }

    const client = await serverSupabaseClient<Database>(event)

    // 删除碎碎念
    const { error } = await client
        .from('thoughts')
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
