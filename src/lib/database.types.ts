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
      diseases: {
        Row: {
          id: string
          name: string
          type: 'physical' | 'mental'
          medication: string
          therapy: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'physical' | 'mental'
          medication: string
          therapy?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'physical' | 'mental'
          medication?: string
          therapy?: string
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          image_url: string
          author: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          image_url: string
          author: string
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          image_url?: string
          author?: string
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      blog_tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      blog_posts_tags: {
        Row: {
          post_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          post_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          post_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
  }
}