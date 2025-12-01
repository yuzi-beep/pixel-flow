/**
 * GET /api/thoughts/:id
 * 获取单条碎碎念
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { z } from 'zod'

const paramsSchema = z.object({
    id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
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

    const { data, error } = await client
        .from('thoughts')
        .select('*')
        .eq('id', result.data.id)
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
