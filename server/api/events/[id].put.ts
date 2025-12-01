/**
 * PUT /api/events/:id
 * 更新事件（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

const paramsSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    tags: z.array(z.string()).optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional()
})

export type UpdateEventBody = z.input<typeof bodySchema>

export default defineEventHandler(async (event) => {
    // 验证用户身份
    await verifyDashboardAuth(event)

    const id = getRouterParam(event, 'id')
    const paramsResult = paramsSchema.safeParse({ id })

    if (!paramsResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid event ID',
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

    // 更新事件
    const { data, error } = await client
        .from('events')
        .update(bodyResult.data)
        .eq('id', paramsResult.data.id)
        .select()
        .single()

    if (error) {
        if (error.code === 'PGRST116') {
            throw createError({
                statusCode: 404,
                statusMessage: 'Event not found'
            })
        }
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { success: true, data }
})
