/**
 * PUT /api/thoughts/:id
 * 更新碎碎念（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

const paramsSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    content: z.string().min(1).optional(),
    images: z.array(z.string().url()).optional()
})

export type UpdateThoughtBody = z.input<typeof bodySchema>

export default defineEventHandler(async (event) => {
    // 验证用户身份
    await verifyDashboardAuth(event)

    const id = getRouterParam(event, 'id')
    const paramsResult = paramsSchema.safeParse({ id })

    if (!paramsResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid thought ID',
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

    // 更新碎碎念
    const { data, error } = await client
        .from('thoughts')
        .update(bodyResult.data)
        .eq('id', paramsResult.data.id)
        .select()
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            throw createError({
                statusCode: 404,
                statusMessage: 'Thought not found'
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true, data }
})
