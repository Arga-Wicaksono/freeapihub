import { useState, useEffect, useRef, useCallback } from 'react'

export interface HistoryEntry {
  id: string
  timestamp: number
  apiId: number
  apiName: string
  apiIcon: string
  method: string
  url: string
  status: number
  responseTime: number
  contentType: string
  size: string
  error?: string
}

const HISTORY_KEY = 'apiHubResponseHistory'
const MAX_HISTORY = 100

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)))
  } catch { /* quota exceeded */ }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  const history = loadHistory()
  const newEntry: HistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  history.unshift(newEntry)
  saveHistory(history)
  return newEntry
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

interface HistoryPanelProps {
  onSelectEntry: (entry: HistoryEntry) => void
  onClose: () => void
  panelRef: React.Ref<HTMLDivElement>
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - ts

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export default function HistoryPanel({ onSelectEntry, onClose, panelRef }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [filter, setFilter] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  // Poll history every 2s for real-time updates
  const refreshInterval = useRef<ReturnType<typeof setInterval>>()
  useEffect(() => {
    const refresh = () => setHistory(loadHistory())
    refresh() // initial load
    refreshInterval.current = setInterval(refresh, 2000)
    return () => { if (refreshInterval.current) clearInterval(refreshInterval.current) }
  }, [])

  const filtered = filter
    ? history.filter(h =>
        h.apiName.toLowerCase().includes(filter.toLowerCase()) ||
        h.url.toLowerCase().includes(filter.toLowerCase())
      )
    : history

  const handleClear = useCallback(() => {
    if (history.length === 0) return
    if (!window.confirm('Delete all response history? This cannot be undone.')) return
    clearHistory()
    setHistory([])
  }, [history.length])

  return (
    <div className="history-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Response history">
      <div className="history-panel" ref={panelRef} onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <h2>📋 Response History</h2>
          <div className="history-header-actions">
            {history.length > 0 && (
              <button className="btn btn-ghost" onClick={handleClear} style={{ fontSize: '0.75rem', color: 'var(--error)' }}>
                Clear All
              </button>
            )}
            <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
          </div>
        </div>

        <div className="history-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Filter history..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter response history"
          />
        </div>

        <div className="history-stats">
          {history.length > 0 ? (
            <span>{filtered.length} of {history.length} entries</span>
          ) : (
            <span>No history yet</span>
          )}
        </div>

        <div className="history-list" ref={listRef}>
          {filtered.length === 0 && history.length === 0 && (
            <div className="history-empty">
              <p>Test some APIs and your results will appear here.</p>
            </div>
          )}
          {filtered.length === 0 && history.length > 0 && (
            <div className="history-empty">
              <p>No entries match your filter.</p>
            </div>
          )}
          {filtered.map((entry) => (
            <button
              key={entry.id}
              className="history-item"
              onClick={() => onSelectEntry(entry)}
              aria-label={`${entry.apiName} — ${entry.status}`}
            >
              <div className="history-item-left">
                <span className="history-item-icon">{entry.apiIcon}</span>
                <div className="history-item-info">
                  <span className="history-item-name">{entry.apiName}</span>
                  <span className="history-item-url">{entry.url}</span>
                </div>
              </div>
              <div className="history-item-right">
                {entry.error ? (
                  <span className="history-item-status error">ERR</span>
                ) : (
                  <span className={`history-item-status ${entry.status < 400 ? 'success' : 'error'}`}>
                    {entry.status}
                  </span>
                )}
                <span className="history-item-time">{entry.responseTime}ms</span>
                <span className="history-item-date">{formatTime(entry.timestamp)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
