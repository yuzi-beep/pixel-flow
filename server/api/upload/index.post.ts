/**
 * POST /api/upload
 * 上传文件到 Supabase Storage
 */
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database.types'

// 支持的文件类型
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default defineEventHandler(async (event) => {
    // 验证用户身份
    await verifyDashboardAuth(event)

    const client = await serverSupabaseClient<Database>(event)

    // 解析 multipart 表单数据
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No file uploaded'
        })
    }

    const file = formData.find(f => f.name === 'file')
    if (!file || !file.data) {
        throw createError({
            statusCode: 400,
            statusMessage: 'File not found in form data'
        })
    }

    // 验证文件大小
    if (file.data.length > MAX_FILE_SIZE) {
        throw createError({
            statusCode: 400,
            statusMessage: `File size exceeds maximum allowed size (${MAX_FILE_SIZE / 1024 / 1024}MB)`
        })
    }

    // 获取文件信息
    const fileName = file.filename || `upload_${Date.now()}`
    const contentType = file.type || 'application/octet-stream'

    // 验证文件类型
    const isImage = ALLOWED_IMAGE_TYPES.includes(contentType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(contentType)

    if (!isImage && !isVideo) {
        throw createError({
            statusCode: 400,
            statusMessage: `File type not allowed. Allowed types: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}`
        })
    }

    // 确定存储桶
    const bucket = isImage ? 'images' : 'videos'

    // 生成唯一文件名
    const ext = fileName.split('.').pop() || ''
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
    const filePath = `uploads/${uniqueName}`

    // 上传到 Supabase Storage
    const { data, error } = await client.storage
        .from(bucket)
        .upload(filePath, file.data, {
            contentType,
            upsert: false
        })

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    // 获取公开 URL
    const { data: urlData } = client.storage
        .from(bucket)
        .getPublicUrl(filePath)

    return {
        success: true,
        url: urlData.publicUrl,
        path: data.path,
        bucket
    }
})
