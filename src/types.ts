export interface API {
  id: number
  name: string
  description: string
  category: string
  url: string
  method: string
  auth: string
  rateLimit: string
  icon: string
  headers?: Record<string, string>
  docsUrl?: string
}

export interface ResponseMeta {
  type: string
  status: number
  size: string
  contentType: string
  url: string
}

export interface CorsProxy {
  name: string
  url: string
}
