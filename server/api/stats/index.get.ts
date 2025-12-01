/**
 * GET /api/stats
 * 获取统计信息
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient<Database>(event)

    // 并行获取各项统计数据
    const [postsResult, thoughtsResult, eventsResult] = await Promise.all([
        client.from('posts').select('id', { count: 'exact', head: true }),
        client.from('thoughts').select('id', { count: 'exact', head: true }),
        client.from('events').select('id', { count: 'exact', head: true })
    ])

    return {
        success: true,
        data: {
            posts: postsResult.count || 0,
            thoughts: thoughtsResult.count || 0,
            events: eventsResult.count || 0
        }
    }
})
