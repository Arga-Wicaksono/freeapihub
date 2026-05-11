import { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react'
import './App.css'
import type { API, ResponseMeta } from './types'
import { allAPIs, categories, CORS_PROXIES } from './data/apis'
import { quickPicks, editorChoiceIds, type QuickPick } from './data/quickPicks'
import { detectType, formatBytes } from './utils/helpers'
import { useApiStatus } from './hooks/useApiStatus'
import { setupFocusTrap } from './hooks/useFocusTrap'
import HistoryPanel, { addHistoryEntry } from './components/HistoryPanel'

// Code splitting: lazy load heavy components
const TestPanel = lazy(() => import('./components/TestPanel'))
const AIChat = lazy(() => import('./components/AIChat'))

// Type for API test results
type ApiResult = Record<string, unknown> | { _raw?: string; _html?: string; _xml?: string; _csv?: string; _text?: string } | null

const REQUEST_TIMEOUT = 15000 // 15 seconds

// Status bar component
function StatusBar({ up, down, checked, total }: { up: number; down: number; checked: number; total: number }) {
  if (checked === 0) return null
  const pct = Math.round((up / checked) * 100)
  return (
    <div className="status-bar" role="status" aria-label="API health overview">
      <div className="status-bar-inner">
        <div className="status-bar-track">
          <div className="status-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="status-bar-stats">
          <span className="status-stat status-stat-up">{up} up</span>
          <span className="status-stat status-stat-down">{down} down</span>
          <span className="status-stat status-stat-pct">{pct}% uptime</span>
          <span className="status-stat status-stat-checked">{checked}/{total} checked</span>
        </div>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const cls = status === 'up' ? 'status-dot-up'
    : status === 'down' ? 'status-dot-down'
    : status === 'checking' ? 'status-dot-checking'
    : 'status-dot-unknown'
  return <span className={`status-indicator ${cls}`} title={status === 'up' ? 'Online' : status === 'down' ? 'Offline' : status === 'checking' ? 'Checking...' : 'Not checked'} />
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('apiHubDarkMode')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [authFilter, setAuthFilter] = useState('all')
  const [rateFilter, setRateFilter] = useState('all')
  const [selectedAPI, setSelectedAPI] = useState<API | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [result, setResult] = useState<ApiResult>(null)
  const [responseMeta, setResponseMeta] = useState<ResponseMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [proxyIndex, setProxyIndex] = useState(0)
  const [showSubmit, setShowSubmit] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [view, setView] = useState<'explore' | 'ai'>('explore')
  const [browseMode, setBrowseMode] = useState<'guided' | 'explore'>(() => {
    return (localStorage.getItem('apiHubBrowseMode') as 'guided' | 'explore') || 'guided'
  })
  const [selectedPick, setSelectedPick] = useState<QuickPick | null>(null)

  const [requestStartTime, setRequestStartTime] = useState(0)
  const [onboardStep, setOnboardStep] = useState(() => {
    if (localStorage.getItem('apiHubOnboarded')) return 0
    return 1
  })
  const onboardSearchRef = useRef<HTMLDivElement>(null)
  const onboardCardRef = useRef<HTMLDivElement>(null)
  const onboardAiRef = useRef<HTMLButtonElement>(null)
  const proxyIndexRef = useRef(proxyIndex)
  const testPanelRef = useRef<HTMLDivElement>(null)
  const submitFormRef = useRef<HTMLDivElement>(null)
  const historyPanelRef = useRef<HTMLDivElement>(null)

  // Focus traps (deferred so refs are populated)
  useEffect(() => {
    // Delay 1 tick to ensure lazy-loaded panel DOM is ready
    const t = requestAnimationFrame(() => {
      return setupFocusTrap(testPanelRef.current, !!selectedAPI)
    })
    return () => cancelAnimationFrame(t)
  }, [selectedAPI])
  useEffect(() => {
    return setupFocusTrap(submitFormRef.current, showSubmit)
  }, [showSubmit])
  useEffect(() => {
    return setupFocusTrap(historyPanelRef.current, showHistory)
  }, [showHistory])

  // API status checking
  const { getStatus, upCount, downCount, checkedCount, total: statusTotal } = useApiStatus(allAPIs)

  useEffect(() => {
    proxyIndexRef.current = proxyIndex
  }, [proxyIndex])

  useEffect(() => {
    const saved = localStorage.getItem('apiHubFavorites')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('apiHubFavorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    document.body.classList.toggle('light', !darkMode)
    localStorage.setItem('apiHubDarkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('apiHubBrowseMode', browseMode)
  }, [browseMode])

  useEffect(() => {
    if (selectedAPI) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedAPI])

  const dismissOnboarding = useCallback(() => {
    localStorage.setItem('apiHubOnboarded', 'true')
    setOnboardStep(0)
  }, [])

  useEffect(() => {
    if (onboardStep === 0) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissOnboarding()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onboardStep, dismissOnboarding])

  // Unique values for filters
  const authOptions = useMemo(() => {
    const set = new Set(allAPIs.map(a => a.auth))
    return ['all', ...Array.from(set)]
  }, [])

  const rateOptions = useMemo(() => {
    const set = new Set(allAPIs.map(a => a.rateLimit))
    return ['all', ...Array.from(set).sort()]
  }, [])

  // Filter APIs
  // APIs shown when a Quick Pick is selected — category-based with pin ordering
  const pickAPIs = useMemo(() => {
    if (!selectedPick) return []
    // Gather APIs from the pick's category (+ optional secondary categories)
    const matchCats = [selectedPick.category, ...(selectedPick.categories || [])]
    const catAPIs = allAPIs.filter(api => matchCats.includes(api.category))
    if (catAPIs.length === 0) return []
    // Sort: pinned IDs first, then rest
    const pinSet = new Set(selectedPick.pinIds || [])
    const pinned = catAPIs.filter(api => pinSet.has(api.id))
    const rest = catAPIs.filter(api => !pinSet.has(api.id))
    return [...pinned, ...rest]
  }, [selectedPick])

  const filteredAPIs = useMemo(() => {
    return allAPIs.filter(api => {
      const matchesSearch = !search ||
        api.name.toLowerCase().includes(search.toLowerCase()) ||
        api.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || api.category === category
      const matchesAuth = authFilter === 'all' || api.auth === authFilter
      const matchesRate = rateFilter === 'all' || api.rateLimit === rateFilter
      return matchesSearch && matchesCategory && matchesAuth && matchesRate
    })
  }, [search, category, authFilter, rateFilter])



  const categoryCounts = useMemo(() => {
    return allAPIs.reduce((acc, api) => {
      acc[api.category] = (acc[api.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [])

  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = setTimeout(() => setToast(''), 2500)
  }, [])

  const handleShareApi = useCallback(async (api: API) => {
    const shareData = {
      title: `${api.name} — API Hub`,
      text: `Test ${api.name}: ${api.description}`,
      url: api.url
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch (e) { if ((e as DOMException).name !== 'AbortError') showToast('Sharing failed') }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        showToast('Link copied to clipboard!')
      } catch { showToast('Failed to copy') }
    }
  }, [showToast])

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
    showToast('Favorite updated!')
  }, [showToast])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('Copied!')
    } catch {
      showToast('Failed to copy')
    }
  }, [showToast])

  const testAPI = useCallback(async (api: API) => {
    setSelectedAPI(api)
    setLoading(true)
    setError('')
    setResult(null)
    setResponseMeta(null)
    const startTime = performance.now()
    setRequestStartTime(startTime)

    // Check offline state
    if (!navigator.onLine) {
      setError('You are offline. Please check your internet connection.')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      let fetchUrl = api.url
      const proxy = CORS_PROXIES[proxyIndexRef.current]
      if (proxy.url) {
        fetchUrl = proxy.url + encodeURIComponent(api.url)
      }

      const fetchOptions: RequestInit = { signal: controller.signal }
      if (api.headers) {
        fetchOptions.headers = api.headers
      }
      const response = await fetch(fetchUrl, fetchOptions)
      clearTimeout(timeoutId)

      const contentType = response.headers.get('content-type') || ''
      const contentLength = response.headers.get('content-length')
      const size = contentLength ? formatBytes(parseInt(contentLength)) : ''
      const detectedType = detectType(contentType, fetchUrl)
      const imageSrc = detectedType === 'image' || detectedType === 'svg' ? fetchUrl : ''

      setResponseMeta({
        type: detectedType,
        status: response.status,
        size,
        contentType,
        url: imageSrc || fetchUrl,
      })

      // Record response time
      const elapsed = Math.round(performance.now() - startTime)
      addHistoryEntry({
        apiId: api.id,
        apiName: api.name,
        apiIcon: api.icon,
        method: api.method,
        url: api.url,
        status: response.status,
        responseTime: elapsed,
        contentType,
        size,
      })

      if (detectedType === 'json') {
        const data = await response.json()
        setResult(data)
      } else if (detectedType === 'svg') {
        const text = await response.text()
        setResult({ _svg: text })
      } else if (detectedType === 'image') {
        setResult({ _raw: 'binary' })
      } else if (detectedType === 'video' || detectedType === 'audio' || detectedType === 'pdf') {
        setResult({ _raw: 'binary' })
      } else if (detectedType === 'html') {
        const text = await response.text()
        setResult({ _html: text })
      } else if (detectedType === 'xml') {
        const text = await response.text()
        setResult({ _xml: text })
      } else if (detectedType === 'csv') {
        const text = await response.text()
        setResult({ _csv: text })
      } else {
        const text = await response.text()
        try {
          setResult(JSON.parse(text))
        } catch {
          setResult({ _text: text })
        }
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      const error = err as Error
      const elapsed = Math.round(performance.now() - startTime)

      // Record failed requests in history too
      addHistoryEntry({
        apiId: api.id,
        apiName: api.name,
        apiIcon: api.icon,
        method: api.method,
        url: api.url,
        status: 0,
        responseTime: elapsed,
        contentType: '',
        size: '',
        error: error.name === 'AbortError'
          ? `Timeout after ${REQUEST_TIMEOUT / 1000}s`
          : error.message || 'Request failed',
      })

      if (error.name === 'AbortError') {
        setError(`Request timed out after ${REQUEST_TIMEOUT / 1000}s. Try again or enable a CORS proxy.`)
      } else if (!navigator.onLine) {
        setError('Network disconnected during request. Please check your connection.')
      } else if (proxyIndexRef.current === 0) {
        setError(error.message || 'Failed to fetch. Try enabling CORS proxy.')
      } else {
        setError(error.message || 'Failed to fetch with proxy too. Try a different proxy.')
      }
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'Escape') {
        if (showSubmit) { setShowSubmit(false); return }
        setSelectedAPI(null)
      }
      if (e.key === 't' && selectedAPI) testAPI(selectedAPI)
      if (e.key === 'r' && selectedAPI) testAPI(selectedAPI)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedAPI, testAPI, showSubmit])

  return (
    <div className="app">
      <div className="bg-glow" />
      <div className="bg-grid" />

      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <a href="/" className="logo">
            <img src="/favicon.png" alt="API Hub logo" className="logo-icon" style={{ borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
            <span className="logo-text-gradient">API Hub</span>
          </a>
          <div className="header-actions">
            <button className="btn btn-icon" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme" title="Toggle theme">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="btn" onClick={() => setShowSubmit(true)} aria-label="Submit API">
              + Submit
            </button>
            <button className="btn btn-icon" onClick={() => setShowHistory(true)} aria-label="Response history" title="Response History">
              📋
            </button>
            <a className="btn" href="https://www.producthunt.com/posts/api-hub" target="_blank" rel="noreferrer" aria-label="Product Hunt">
              PH
            </a>
            <a className="btn" href="https://github.com/Arga-Wicaksono/freeapihub" target="_blank" rel="noreferrer" aria-label="GitHub repository">
              GitHub
            </a>
          </div>
        </div>
        {/* View Toggle */}
        <div className="view-toggle container" role="tablist">
          <button className={`view-tab ${view === 'explore' ? 'active' : ''}`} onClick={() => setView('explore')} role="tab" aria-selected={view === 'explore'} aria-label="Explore APIs">
            🔍 Explore APIs
          </button>
          <button className={`view-tab ${view === 'ai' ? 'active' : ''}`} onClick={() => setView('ai')} role="tab" aria-selected={view === 'ai'} aria-label="AI Assistant" ref={onboardAiRef}>
            🤖 AI Assistant
          </button>
          <div className="view-tab-right">
            <div className="view-tab-apis-json">
              <a href="/apis.json" target="_blank" rel="noreferrer" className="view-tab-link" aria-label="Machine-readable API catalog">
                /apis.json
              </a>
            </div>
            {view === 'explore' && (
              <div className="browse-mode-toggle" role="radiogroup" aria-label="Browse mode">
                <button
                  className={`browse-mode-btn ${browseMode === 'guided' ? 'active' : ''}`}
                  onClick={() => { setBrowseMode('guided'); setSelectedPick(null); setSearch(''); }}
                  role="radio"
                  aria-checked={browseMode === 'guided'}
                  title="Guided: curated picks, fewer choices"
                >
                  ✨ Guided
                </button>
                <button
                  className={`browse-mode-btn ${browseMode === 'explore' ? 'active' : ''}`}
                  onClick={() => { setBrowseMode('explore'); setSelectedPick(null); setSearch(''); }}
                  role="radio"
                  aria-checked={browseMode === 'explore'}
                  title="Explore: all APIs with full filters"
                >
                  🗂️ Explore All
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        {view === 'ai' ? (
          <Suspense fallback={
            <div className="loading" style={{ minHeight: '50vh' }}>
              <div className="spinner" />
              <span className="loading-text">Loading AI Assistant...</span>
            </div>
          }>
            <AIChat />
          </Suspense>
        ) : (
          <>
        {/* Hero */}
        <section className="hero">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Open Source &middot; Free Forever
          </div>
          <h1>The Developer's<br /><span>API Playground</span></h1>
          <p>
            {browseMode === 'guided'
              ? 'Not sure where to start? We picked the best APIs for common use cases. No paralysis — just action.'
              : `Explore, test, and integrate ${allAPIs.length}+ curated public APIs directly from your browser. No API keys required.`
            }
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">{allAPIs.length}+</span>
              <span className="hero-stat-label">APIs</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">{categories.length - 1}</span>
              <span className="hero-stat-label">Categories</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">0</span>
              <span className="hero-stat-label">API Keys</span>
            </div>
          </div>

          {/* Search */}
          <div className="search-box" ref={onboardSearchRef}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search APIs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedPick(null); }}
              aria-label="Search APIs"
            />
            {search && (
              <button
                className="search-clear-btn"
                onClick={() => { setSearch(''); setSelectedPick(null); }}
                aria-label="Clear search"
                type="button"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Picks (Guided mode only, no search & no pick selected) */}
          {browseMode === 'guided' && !search && !selectedPick && category === 'All' && (
            <div className="quick-picks-section">
              <h2 className="quick-picks-title">What are you building?</h2>
              <p className="quick-picks-subtitle">Pick a use case — we'll show you the best APIs for it</p>
              <div className="quick-picks-grid">
                {quickPicks.map((pick) => (
                  <button
                    key={pick.title}
                    className="quick-pick-card"
                    onClick={() => {
                      setCategory('All')
                      setSearch('')
                      setSelectedPick(pick)
                    }}
                  >
                    <span className="quick-pick-icon">{pick.icon}</span>
                    <div className="quick-pick-info">
                      <strong>{pick.title}</strong>
                      <span>{pick.description}</span>
                    </div>
                    <span className="quick-pick-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Pick Result Header (breadcrumb back button) */}
          {selectedPick && (
            <div className="pick-result-header">
              <button className="pick-back-btn" onClick={() => setSelectedPick(null)}>
                ← Back to picks
              </button>
              <div className="pick-result-info">
                <span className="pick-result-icon">{selectedPick.icon}</span>
                <div>
                  <strong>{selectedPick.title}</strong>
                  <span className="pick-result-desc">{selectedPick.description}</span>
                </div>
              </div>
            </div>
          )}

          {/* Categories — hidden in Guided mode when no pick selected & no search */}
          {!(browseMode === 'guided' && !selectedPick && !search && category === 'All') && (
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
                {cat !== 'All' && <span className="count"> ({categoryCounts[cat]})</span>}
              </button>
            ))}
          </div>
          )}

          {/* Extra Filters — hidden in guided mode unless search active */}
          {(browseMode === 'explore' || search) && (
            <div className="extra-filters">
              <select
                className="filter-select"
                value={authFilter}
                onChange={(e) => setAuthFilter(e.target.value)}
                aria-label="Filter by authentication"
              >
                <option value="all">All Auth Types</option>
                {authOptions.filter(o => o !== 'all').map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <select
                className="filter-select"
                value={rateFilter}
                onChange={(e) => setRateFilter(e.target.value)}
                aria-label="Filter by rate limit"
              >
                <option value="all">All Rate Limits</option>
                {rateOptions.filter(o => o !== 'all').map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Status Bar */}
        <StatusBar up={upCount} down={downCount} checked={checkedCount} total={statusTotal} />

        {/* Results count — hidden in Guided mode when no pick selected & no search & category All */}
        {!(browseMode === 'guided' && !selectedPick && !search && category === 'All') && (
        <div className="results-info" role="status">
          <span>
            {selectedPick
              ? `${pickAPIs.length} API${pickAPIs.length !== 1 ? 's' : ''} for ${selectedPick.title}`
              : `${filteredAPIs.length} API${filteredAPIs.length !== 1 ? 's' : ''} found`
            }
          </span>
          {(search || category !== 'All' || authFilter !== 'all' || rateFilter !== 'all' || selectedPick) && (
            <button className="btn btn-ghost clear-filters-btn" onClick={() => { setSearch(''); setCategory('All'); setAuthFilter('all'); setRateFilter('all'); setSelectedPick(null); }}>
              Clear filters
            </button>
          )}
        </div>
        )}

        {/* API Grid — Quick Pick: filtered by IDs, Explore: flat list */}
        {/* In Guided mode with no pick selected, only Quick Pick cards are shown above — no grid here */}
        {!(browseMode === 'guided' && !selectedPick && !search && category === 'All') && (
        <>
        {selectedPick ? (
          <>
            <div className="api-grid" role="list">
              {pickAPIs.map(api => {
                const status = getStatus(api.id)
                return (
                  <div key={api.id} className="api-card" onClick={() => testAPI(api)} tabIndex={0} role="listitem" aria-label={`${api.name}: ${api.description}`}>
                    {editorChoiceIds.has(api.id) && <div className="editor-choice-badge" title="Editor's Choice — recommended for this category">Editor's Choice</div>}
                    <div className="api-card-header">
                      <span className="api-card-icon">{api.icon}</span>
                      <div className="api-card-title">
                        <h3>{api.name} <StatusDot status={status} /></h3>
                        <p>{api.description}</p>
                      </div>
                      <button
                        className={`favorite-btn ${favorites.includes(api.id) ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(api.id); }}
                        aria-label={favorites.includes(api.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.includes(api.id) ? '⭐' : '☆'}
                      </button>
                      <button
                        className="favorite-btn share-btn"
                        onClick={(e) => { e.stopPropagation(); handleShareApi(api); }}
                        aria-label="Share this API"
                      >
                        🔗
                      </button>
                      {api.docsUrl && (
                        <a
                          className="favorite-btn docs-btn"
                          href={api.docsUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View API documentation"
                          title={api.docsUrl}
                        >
                          📄
                        </a>
                      )}
                    </div>
                    <div className="api-card-meta">
                      <span className={`method-tag ${api.method.toLowerCase()}`}>{api.method}</span>
                      <span className="category-tag">{api.category}</span>
                      {api.auth !== 'None' && (
                        <span className="auth-tag">{api.auth}</span>
                      )}
                      <span className="rate-tag">{api.rateLimit}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {pickAPIs.length === 0 && (
              <div className="empty-state">
                <p>No APIs found for this use case.</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="api-grid" role="list" ref={onboardCardRef}>
              {filteredAPIs.map(api => {
                const status = getStatus(api.id)
                return (
                  <div key={api.id} className="api-card" onClick={() => testAPI(api)} tabIndex={0} role="listitem" aria-label={`${api.name}: ${api.description}`}>
                    {editorChoiceIds.has(api.id) && <div className="editor-choice-badge" title="Editor's Choice — recommended for this category">Editor's Choice</div>}
                    <div className="api-card-header">
                      <span className="api-card-icon">{api.icon}</span>
                      <div className="api-card-title">
                        <h3>{api.name} <StatusDot status={status} /></h3>
                        <p>{api.description}</p>
                      </div>
                      <button
                        className={`favorite-btn ${favorites.includes(api.id) ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(api.id); }}
                        aria-label={favorites.includes(api.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorites.includes(api.id) ? '⭐' : '☆'}
                      </button>
                      <button
                        className="favorite-btn share-btn"
                        onClick={(e) => { e.stopPropagation(); handleShareApi(api); }}
                        aria-label="Share this API"
                      >
                        🔗
                      </button>
                      {api.docsUrl && (
                        <a
                          className="favorite-btn docs-btn"
                          href={api.docsUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View API documentation"
                          title={api.docsUrl}
                        >
                          📄
                        </a>
                      )}
                    </div>
                    <div className="api-card-meta">
                      <span className={`method-tag ${api.method.toLowerCase()}`}>{api.method}</span>
                      <span className="category-tag">{api.category}</span>
                      {api.auth !== 'None' && (
                        <span className="auth-tag">{api.auth}</span>
                      )}
                      <span className="rate-tag">{api.rateLimit}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredAPIs.length === 0 && (
              <div className="empty-state">
                <p>No APIs found matching your search.</p>
              </div>
            )}
          </>
        )}
        </>
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-left">
            <img src="/favicon.png" alt="" className="footer-logo" width="24" height="24" />
            <span className="footer-brand">API Hub</span>
            <span className="footer-copy">v3.0</span>
          </div>
          <div className="footer-links">
            <button className="footer-link-btn" onClick={() => setShowSubmit(true)}>Submit API</button>
            <a href="https://github.com/Arga-Wicaksono/freeapihub" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://github.com/Arga-Wicaksono/freeapihub/issues" target="_blank" rel="noreferrer">Report Bug</a>
          </div>
        </div>
      </footer>

      {/* Keyboard Hint */}
      <div className="keyboard-hint">
        <span><kbd>T</kbd> / <kbd>R</kbd> Test API</span>
        <span><kbd>Esc</kbd> Close</span>
      </div>

      {/* Test Panel Modal (lazy loaded) */}
      {selectedAPI && (
        <Suspense fallback={
          <div className="test-panel-overlay" role="dialog" aria-modal="true">
            <div className="test-panel">
              <div className="container">
                <div className="loading" style={{ padding: '3rem' }}>
                  <div className="spinner" />
                  <span className="loading-text">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        }>
          <TestPanel
            panelRef={testPanelRef}
            selectedAPI={selectedAPI}
            setSelectedAPI={setSelectedAPI}
            result={result}
            responseMeta={responseMeta}
            loading={loading}
            error={error}
            toast={toast}
            proxyIndex={proxyIndex}
            setProxyIndex={setProxyIndex}
            testAPI={testAPI}
            copyToClipboard={copyToClipboard}
            requestStartTime={requestStartTime}
            showToast={showToast}
          />
        </Suspense>
      )}

      {/* Submit Form Modal */}
      {showSubmit && (
        <SubmitForm onClose={() => setShowSubmit(false)} onToast={showToast} submitRef={submitFormRef} />
      )}

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          panelRef={historyPanelRef}
          onSelectEntry={(entry) => {
            const api = allAPIs.find(a => a.id === entry.apiId)
            if (api) {
              setShowHistory(false)
              testAPI(api)
            }
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Toast */}
      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}

      {/* Onboarding Overlay */}
      {onboardStep > 0 && (
        <div className="onboarding-overlay" onClick={dismissOnboarding}>
          {onboardStep === 1 && onboardSearchRef.current && (
            <OnboardingTooltip
              step={1}
              total={3}
              title="Search APIs"
              description="Search 300+ APIs by name, category, or keyword"
              anchorEl={onboardSearchRef.current}
              onNext={() => setOnboardStep(2)}
              onDismiss={dismissOnboarding}
            />
          )}
          {onboardStep === 2 && onboardCardRef.current && (
            <OnboardingTooltip
              step={2}
              total={3}
              title="Test Any API"
              description="Click any API card to test it instantly"
              anchorEl={onboardCardRef.current}
              onNext={() => setOnboardStep(3)}
              onDismiss={dismissOnboarding}
            />
          )}
          {onboardStep === 3 && onboardAiRef.current && (
            <OnboardingTooltip
              step={3}
              total={3}
              title="AI Assistant"
              description="Or ask our AI Assistant to find APIs for you"
              anchorEl={onboardAiRef.current}
              onNext={dismissOnboarding}
              onDismiss={dismissOnboarding}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ── Onboarding Tooltip ── */
function OnboardingTooltip({ step, total, title, description, anchorEl, onNext, onDismiss }: {
  step: number
  total: number
  title: string
  description: string
  anchorEl: HTMLElement
  onNext: () => void
  onDismiss: () => void
}) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const isLast = step === total

  useEffect(() => {
    if (!tooltipRef.current || !anchorEl) return
    const rect = anchorEl.getBoundingClientRect()
    const tooltip = tooltipRef.current
    const tooltipRect = tooltip.getBoundingClientRect()

    let top: number
    if (step === 1) {
      top = rect.bottom + 12
    } else if (step === 2) {
      top = Math.max(12, rect.top - tooltipRect.height - 12)
    } else {
      top = rect.bottom + 12
    }
    const left = Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipRect.width / 2, window.innerWidth - tooltipRect.width - 16))

    tooltip.style.top = `${top}px`
    tooltip.style.left = `${left}px`
  }, [anchorEl, step])

  return (
    <div
      className="onboarding-tooltip"
      ref={tooltipRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="onboarding-tooltip-title">{title}</div>
      <div className="onboarding-tooltip-desc">{description}</div>
      <div className="onboarding-tooltip-footer">
        <span className="onboarding-tooltip-step">{step}/{total}</span>
        <button
          className="onboarding-tooltip-btn"
          onClick={isLast ? onDismiss : onNext}
        >
          {isLast ? 'Got it!' : 'Next'}
        </button>
      </div>
    </div>
  )
}

function SubmitForm({ onClose, onToast, submitRef }: { onClose: () => void; onToast: (msg: string) => void; submitRef: React.Ref<HTMLDivElement> }) {
  const apiCategories = categories.filter(c => c !== 'All')
  const [form, setForm] = useState({
    name: '',
    url: '',
    description: '',
    category: apiCategories[0] || 'Developer',
    method: 'GET',
    auth: 'None',
    rateLimit: 'Unlimited',
    icon: '🔌',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.url.trim()) return

    const title = encodeURIComponent(`New API: ${form.name}`)
    const body = encodeURIComponent(
      `**API Name:** ${form.name}\n` +
      `**URL:** ${form.url}\n` +
      `**Description:** ${form.description}\n` +
      `**Category:** ${form.category}\n` +
      `**Method:** ${form.method}\n` +
      `**Auth:** ${form.auth}\n` +
      `**Rate Limit:** ${form.rateLimit}\n` +
      `**Icon:** ${form.icon}\n\n` +
      `*Submitted via API Hub submit form*`
    )
    const issueUrl = `https://github.com/Arga-Wicaksono/freeapihub/issues/new?title=${title}&body=${body}&labels=enhancement`

    window.open(issueUrl, '_blank', 'noopener,noreferrer')
    onToast('Opening GitHub issue...')
    onClose()
  }

  const iconOptions = ['🔌', '🌐', '🛠️', '🔧', '📦', '🚀', '🎨', '📊', '🔑', '🔒', '💡', '⚡', '🎮', '🎵', '📰', '🐱', '🌍', '💰', '🍕', '👹']

  return (
    <div className="submit-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Submit a new API">
      <div className="submit-form" ref={submitRef} onClick={(e) => e.stopPropagation()}>
        <div className="submit-header">
          <h2>Submit a New API</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <p className="submit-desc">
          Submit a free public API. Opens a GitHub issue with details pre-filled.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-compact-grid">
            {/* Left column: required fields */}
            <div className="form-compact-col">
              <div className="form-group">
                <label htmlFor="api-name">API Name *</label>
                <input id="api-name" type="text" placeholder="e.g. Dog API" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label htmlFor="api-url">Endpoint URL *</label>
                <input id="api-url" type="url" placeholder="https://api.example.com/v1/data" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
              </div>
              <div className="form-group">
                <label htmlFor="api-desc">Description</label>
                <input id="api-desc" type="text" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            {/* Right column: options + icon */}
            <div className="form-compact-col">
              <div className="form-row-compact">
                <div className="form-group">
                  <label htmlFor="api-category">Category</label>
                  <select id="api-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {apiCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="api-method">Method</label>
                  <select id="api-method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                  </select>
                </div>
              </div>
              <div className="form-row-compact">
                <div className="form-group">
                  <label htmlFor="api-auth">Auth</label>
                  <select id="api-auth" value={form.auth} onChange={(e) => setForm({ ...form, auth: e.target.value })}>
                    <option>None</option><option>API Key</option><option>OAuth</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="api-rate">Rate Limit</label>
                  <input id="api-rate" type="text" placeholder="Unlimited" value={form.rateLimit} onChange={(e) => setForm({ ...form, rateLimit: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Icon</label>
                <div className="icon-picker">
                  {iconOptions.map(icon => (
                    <button key={icon} type="button" className={`icon-option ${form.icon === icon ? 'active' : ''}`} onClick={() => setForm({ ...form, icon })}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button type="submit" className="btn btn-primary submit-btn" disabled={!form.name.trim() || !form.url.trim()}>
            Submit API
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
