export function detectType(ct: string | null, url: string): string {
  if (ct?.includes('application/json')) return 'json'
  if (ct?.includes('image/svg')) return 'svg'
  if (ct?.includes('image/')) return 'image'
  if (ct?.includes('video/')) return 'video'
  if (ct?.includes('audio/')) return 'audio'
  if (ct?.includes('application/pdf')) return 'pdf'
  if (ct?.includes('text/html')) return 'html'
  if (ct?.includes('text/xml') || ct?.includes('application/xml')) return 'xml'
  if (ct?.includes('text/csv')) return 'csv'
  // URL-based fallback
  const u = url.toLowerCase()
  if (/\.(png|jpg|jpeg|gif|webp|bmp|ico)(\?|$)/.test(u)) return 'image'
  if (/\.(mp4|webm|ogg|mov)(\?|$)/.test(u)) return 'video'
  if (/\.(mp3|wav|flac|aac|ogg)(\?|$)/.test(u)) return 'audio'
  if (/\.(pdf)(\?|$)/.test(u)) return 'pdf'
  if (/\.(svg)(\?|$)/.test(u)) return 'svg'
  return 'text'
}

export function formatBytes(b: number): string {
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}
