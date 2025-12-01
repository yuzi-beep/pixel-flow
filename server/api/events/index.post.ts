/**
 * POST /api/events
 * 创建事件（需要鉴权）
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

// 定义请求体的类型
const bodySchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    tags: z.array(z.string()).default([]),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional()
})

export type CreateEventBody = z.input<typeof bodySchema>

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

    const { title, description, event_date, tags, color } = result.data

    // 创建事件
    const { data, error } = await client
        .from('events')
        .insert({
            title,
            description: description || null,
            event_date,
            tags,
            color: color || null
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
