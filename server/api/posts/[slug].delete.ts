/**
 * DELETE /api/posts/:id
 * 删除文章（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义路由参数的类型
const paramsSchema = z.object({
    id: z.string().uuid()
})

export type DeletePostParams = z.infer<typeof paramsSchema>

export default defineEventHandler(async (event) => {
    // 验证用户身份
    await verifyDashboardAuth(event)

    // 验证路由参数
    const id = getRouterParam(event, 'slug')
    const result = paramsSchema.safeParse({ id })

    if (!result.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid post ID',
            data: result.error.flatten()
        })
    }

    const client = await serverSupabaseClient<Database>(event)

    // 删除文章
    const { error } = await client
        .from('posts')
        .delete()
        .eq('id', result.data.id)

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true, message: 'Post deleted successfully' }
})
