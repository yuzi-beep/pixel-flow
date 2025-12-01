// Supabase 自动生成的数据库类型
// 可以通过 supabase gen types typescript 命令生成

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            posts: {
                Row: {
                    id: string
                    title: string
                    content: string
                    author: string | null
                    status: 'draft' | 'published'
                    created_at: string
                    updated_at: string
                    published_at: string | null
                    view_count: number
                    tags: string[]
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    author?: string | null
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                    published_at?: string | null
                    view_count?: number
                    tags?: string[]
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    author?: string | null
                    status?: 'draft' | 'published'
                    created_at?: string
                    updated_at?: string
                    published_at?: string | null
                    view_count?: number
                    tags?: string[]
                }
                Relationships: []
            }
            thoughts: {
                Row: {
                    id: string
                    content: string
                    images: string[]
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    content: string
                    images?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    content?: string
                    images?: string[]
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            events: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    event_date: string
                    tags: string[]
                    color: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    event_date: string
                    tags?: string[]
                    color?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    event_date?: string
                    tags?: string[]
                    color?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// 文章类型（用于前端展示）
export interface Post {
    id: string
    title: string
    content: string
    author: string | null
    status: 'draft' | 'published'
    created_at: string
    updated_at: string
    published_at: string | null
    view_count: number
    tags: string[]
}

// 文章列表项（简化版，用于列表展示）
export interface PostListItem {
    id: string
    title: string
    created_at: string
    published_at: string | null
    tags: string[]
}

// 碎碎念类型
export interface Thought {
    id: string
    content: string
    images: string[]
    created_at: string
    updated_at: string
}

// 事件类型
export interface Event {
    id: string
    title: string
    description: string | null
    event_date: string
    tags: string[]
    color: string | null
    created_at: string
    updated_at: string
}
