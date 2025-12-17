// Common types for the Finiclasse Marketing Dashboard

export interface Campaign {
  id: string
  title: string
  status: "draft" | "active" | "completed" | "archived"
  platforms: Platform[]
  reach?: number
  engagement?: number
  createdAt: Date
  updatedAt: Date
}

export interface ContentPost {
  id: string
  title: string
  content: string
  platform: Platform
  scheduledFor?: Date
  publishedAt?: Date
  status: "draft" | "scheduled" | "published"
  campaign?: Campaign
}

export interface MediaAsset {
  id: string
  name: string
  type: "image" | "video" | "document"
  url: string
  size: number
  mimeType: string
  uploadedAt: Date
  tags?: string[]
}

export interface KnowledgeArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type Platform = "instagram" | "facebook" | "linkedin" | "youtube" | "twitter"

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
}
