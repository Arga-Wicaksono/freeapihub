import { useState, useEffect } from 'react'
import type { API, ResponseMeta } from '../types'
import { CORS_PROXIES } from '../data/apis'
import SyntaxHighlight from './SyntaxHighlight'
import CsvTable from './CsvTable'

// Type for API test results
type ApiResult = Record<string, unknown> | { _raw?: string; _html?: string; _xml?: string; _csv?: string; _svg?: string; _text?: string } | null

interface TestPanelProps {
  selectedAPI: API
  setSelectedAPI: (api: API | null) => void
  result: ApiResult
  responseMeta: ResponseMeta | null
  loading: boolean
  error: string
  toast: string
  proxyIndex: number
  setProxyIndex: (index: number) => void
  testAPI: (api: API) => void
  copyToClipboard: (text: string) => Promise<void>
  requestStartTime: number
  panelRef: React.Ref<HTMLDivElement>
  showToast: (msg: string) => void
}

function extractImageUrls(data: unknown, depth = 0): string[] {
  if (depth > 5) return []
  const urls: string[] = []

  if (typeof data === 'string') {
    if (/^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|bmp|svg)(\?.*)?$/i.test(data)) {
      urls.push(data)
    }
    return urls
  }

  if (Array.isArray(data)) {
    const strUrls = data.filter((v): v is string => typeof v === 'string' && /^https?:\/\//.test(v))
    if (strUrls.length > 0) {
      return strUrls.slice(0, 10)
    }
    for (const item of data) {
      urls.push(...extractImageUrls(item, depth + 1))
    }
    return urls.slice(0, 10)
  }

  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    const imageFields = ['url', 'image', 'image_url', 'src', 'link', 'file', 'poster', 'thumbnail', 'banner', 'cover', 'avatar', 'icon_url', 'display_url', 'media_url']
    for (const field of imageFields) {
      if (typeof obj[field] === 'string' && /^https?:\/\//.test(obj[field] as string)) {
        urls.push(obj[field] as string)
      }
    }
    for (const key of Object.keys(obj)) {
      if (Array.isArray(obj[key])) {
        urls.push(...extractImageUrls(obj[key], depth + 1))
      }
    }
    if (depth < 2) {
      for (const val of Object.values(obj)) {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          urls.push(...extractImageUrls(val, depth + 1))
        }
      }
    }
  }

  return [...new Set(urls)].slice(0, 10)
}

export default function TestPanel({
  selectedAPI,
  setSelectedAPI,
  result,
  responseMeta,
  loading,
  error,
  proxyIndex,
  setProxyIndex,
  testAPI,
  copyToClipboard,
  requestStartTime,
  panelRef,
  showToast,
}: TestPanelProps) {

  const [finalResponseTime, setFinalResponseTime] = useState<number | null>(null)

  // Lock in response time once loading finishes
  useEffect(() => {
    if (!loading && requestStartTime > 0) {
      setFinalResponseTime(Math.round(performance.now() - requestStartTime))
    }
    if (loading) setFinalResponseTime(null)
  }, [loading, requestStartTime])

  const handleShare = async () => {
    const shareData = {
      title: `${selectedAPI.name} — API Hub`,
      text: `Test ${selectedAPI.name}: ${selectedAPI.description}`,
      url: selectedAPI.url
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (e) { if ((e as DOMException).name !== 'AbortError') showToast('Sharing failed') }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        showToast('Link copied to clipboard!')
      } catch { showToast('Failed to copy') }
    }
  }
  const generateCurl = () => {
    let cmd = `curl -X ${selectedAPI.method} "${selectedAPI.url}"`
    if (selectedAPI.headers) {
      for (const [key, value] of Object.entries(selectedAPI.headers)) {
        cmd += ` \\\n  -H "${key}: ${value}"`
      }
    }
    return cmd
  }

  const imageUrls = responseMeta?.type === 'json' && result && typeof result === 'object' && !('_html' in result) && !('_text' in result) ? extractImageUrls(result) : []

  const responseTime = finalResponseTime

  return (
    <div
      className="test-panel-overlay"
      onClick={() => setSelectedAPI(null)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="test-panel"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}>
        <div className="container">
          <div className="test-panel-header">
            <h2>
              <span>{selectedAPI.icon}</span>
              {selectedAPI.name}
            </h2>
            <div className="test-panel-header-actions">
              {selectedAPI.docsUrl && (
                <a
                  className="btn btn-ghost"
                  href={selectedAPI.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View documentation"
                >
                  📄 Docs
                </a>
              )}
            <button
              className="close-btn"
              onClick={() => setSelectedAPI(null)}
              aria-label="Close"
            >
              ×
            </button>
            </div>
          </div>

          <div className="test-url-bar">
            <select value={selectedAPI.method} disabled>
              <option>{selectedAPI.method}</option>
            </select>
            <input
              type="text"
              value={selectedAPI.url}
              onChange={(e) => setSelectedAPI({ ...selectedAPI, url: e.target.value })}
            />
          </div>

          <div className="proxy-selector">
            <label htmlFor="cors-proxy">CORS Proxy:</label>
            <select
              id="cors-proxy"
              value={proxyIndex}
              onChange={(e) => setProxyIndex(Number(e.target.value))}
            >
              {CORS_PROXIES.map((proxy, i) => (
                <option key={i} value={i}>{proxy.name}</option>
              ))}
            </select>
          </div>

          <button
            className="test-btn"
            onClick={() => testAPI(selectedAPI)}
            disabled={loading}
          >
              {loading ? 'Sending...' : 'Send Request'}
          </button>

          {loading && (
            <div className="loading" style={{ padding: '1.5rem 0' }}>
              <div className="loading-dots">
                <span className="loading-dot" />
                <span className="loading-dot" />
                <span className="loading-dot" />
              </div>
              <span className="loading-text">Waiting for response…</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button className="btn retry-btn" onClick={() => testAPI(selectedAPI)}>
                🔄 Retry
              </button>
            </div>
          )}

          {result && responseMeta && (
            <div className="result-section">
              <div className="result-header">
                <div className="result-status">
                  <span className={`status-dot ${responseMeta.status < 400 ? 'success' : 'error'}`}></span>
                  <span className="result-badge">{responseMeta.type.toUpperCase()}</span>
                  <span className="result-info">{responseMeta.status} {responseMeta.contentType}</span>
                  {responseMeta.size && <span className="result-info">{responseMeta.size}</span>}
                  {responseMeta.status < 300 && responseTime !== null && (
                    <span className="result-time">{responseTime}ms</span>
                  )}
                </div>
                <div className="result-actions">
                  {responseMeta.type === 'json' && (
                    <button className="btn" onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}>
                      📋 Copy JSON
                    </button>
                  )}
                  <button className="btn" onClick={() => copyToClipboard(generateCurl())}>
                    📋 Copy cURL
                  </button>
                  <button className="btn" onClick={handleShare}>
                    🔗 Share
                  </button>
                  {typeof result === 'object' && result !== null && ('_text' in result || '_xml' in result || '_csv' in result) && (
                    <button className="btn" onClick={() => copyToClipboard((result as Record<string, string>)._text || (result as Record<string, string>)._xml || (result as Record<string, string>)._csv || '')}>
                      📋 Copy
                    </button>
                  )}
                  {(responseMeta.type === 'image' || responseMeta.type === 'svg') && (
                    <a className="btn" href={responseMeta.url} target="_blank" rel="noreferrer">🔗 Open Image</a>
                  )}
                  {responseMeta.type === 'pdf' && (
                    <a className="btn" href={responseMeta.url} target="_blank" rel="noreferrer">🔗 Open PDF</a>
                  )}
                  {responseMeta.type === 'html' && (
                    <a className="btn" href={responseMeta.url} target="_blank" rel="noreferrer">🔗 Open Page</a>
                  )}
                  {responseMeta.type === 'video' && (
                    <a className="btn" href={responseMeta.url} target="_blank" rel="noreferrer">🔗 Open Video</a>
                  )}
                </div>
              </div>
              <div className="result-content">
                {responseMeta.type === 'json' && (
                  <pre className="result-json"><SyntaxHighlight data={result} depth={0} /></pre>
                )}

                {imageUrls.length > 0 && (
                  <div className="result-json-images">
                    <div className="result-json-images-header">
                      <span>🖼️ Image Preview{imageUrls.length > 1 ? ` (${imageUrls.length})` : ''}</span>
                    </div>
                    <div className="result-json-images-grid">
                      {imageUrls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="result-json-image-card">
                          <img
                            src={url}
                            alt={`${selectedAPI.name} response ${i + 1}`}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                              const card = (e.target as HTMLImageElement).closest('.result-json-image-card')
                              if (card) (card as HTMLElement).classList.add('image-failed')
                            }}
                          />
                          <span className="result-json-image-link">Open in new tab ↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {(responseMeta.type === 'image' || responseMeta.type === 'svg') && (
                  <div className="result-media result-image-wrapper">
                    <img src={responseMeta.url} alt={`${selectedAPI.name} response`} className="result-image" />
                  </div>
                )}

                {responseMeta.type === 'video' && (
                  <div className="result-media">
                    <video controls className="result-video" preload="metadata">
                      <source src={responseMeta.url} />
                      Your browser does not support video.
                    </video>
                  </div>
                )}

                {responseMeta.type === 'audio' && (
                  <div className="result-media">
                    <audio controls className="result-audio" preload="metadata">
                      <source src={responseMeta.url} />
                      Your browser does not support audio.
                    </audio>
                  </div>
                )}

                {responseMeta.type === 'pdf' && (
                  <div className="result-media">
                    <iframe src={responseMeta.url} className="result-pdf" title="PDF viewer" />
                  </div>
                )}

                {typeof result === 'object' && result !== null && '_html' in result && (
                  <div className="result-media">
                    <div className="result-html-bar"><span>📄 HTML Preview</span></div>
                    <iframe
                      srcDoc={(result as { _html: string })._html}
                      className="result-iframe"
                      sandbox="allow-same-origin"
                      title="HTML preview"
                    />
                  </div>
                )}

                {typeof result === 'object' && result !== null && '_xml' in result && (
                  <pre className="result-code"><code className="lang-xml">{(result as { _xml: string })._xml}</code></pre>
                )}

                {typeof result === 'object' && result !== null && '_csv' in result && <CsvTable csv={(result as { _csv: string })._csv} />}

                {/* SVG rendered in sandboxed iframe to prevent XSS */}
                {responseMeta.type === 'svg' && typeof result === 'object' && result !== null && !('_raw' in result) && (
                  <div className="result-media">
                    <div className="result-html-bar"><span>🖼️ SVG Preview</span></div>
                    <iframe
                      srcDoc={(result as { _svg?: string })._svg || ''}
                      className="result-iframe"
                      sandbox=""
                      title="SVG preview"
                    />
                  </div>
                )}

                {typeof result === 'object' && result !== null && '_text' in result && (
                  <pre className="result-code"><code>{(result as { _text: string })._text}</code></pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
