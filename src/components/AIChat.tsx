import { useState, useRef, useCallback, useEffect } from 'react'
import { allAPIs } from '../data/apis'
import type { API } from '../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
  apis?: API[]
}

const SUGGESTIONS = [
  'Weather data APIs?',
  'Random image generators',
  'Free crypto price APIs',
  'APIs with no rate limit',
  'Show me food & recipe APIs',
  'Compare exchange rate APIs',
]

function searchAPIs(query: string): API[] {
  const q = query.toLowerCase()
  const terms = q.replace(/[?!.,;:'"()\-_]/g, '').split(/[\s,]+/).filter(Boolean)
  if (terms.length === 0) return []

  const scored = allAPIs.map(api => {
    const searchStr = `${api.name} ${api.description} ${api.category} ${api.auth} ${api.rateLimit}`.toLowerCase()
    let score = 0
    for (const t of terms) {
      if (searchStr.includes(t)) score++
    }
    return { api, score }
  })

  const threshold = Math.max(1, Math.ceil(terms.length * 0.5))
  return scored
    .filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map(s => s.api)
}

function generateResponse(query: string, results: API[]): string {
  const q = query.toLowerCase()

  if (results.length === 0) {
    return `No APIs found matching "${query}". Try different keywords like "weather", "image", "crypto", "music", or browse categories.`
  }

  const wantsExample = /example|code|fetch|curl|snippet|how to use/i.test(q)
  const wantsCompare = /compar|vs|versus/i.test(q)
  const wantsFree = /free|no.key|no.auth|without auth/i.test(q)
  const wantsUnlimited = /unlimited|no.limit|without limit/i.test(q)

  if (wantsFree) {
    const freeApis = results.filter(a => a.auth === 'None')
    if (freeApis.length > 0) {
      let resp = `Found **${freeApis.length} free APIs** (no authentication required):\n\n`
      freeApis.slice(0, 6).forEach(api => {
        resp += `**${api.icon} ${api.name}** — ${api.description}\n  \`${api.method} ${api.url}\`\n\n`
      })
      return resp
    }
  }

  if (wantsUnlimited) {
    const unlimited = results.filter(a => a.rateLimit === 'Unlimited')
    if (unlimited.length > 0) {
      let resp = `Found **${unlimited.length} APIs** with unlimited rate limits:\n\n`
      unlimited.slice(0, 6).forEach(api => {
        resp += `**${api.icon} ${api.name}** — ${api.description} (${api.category})\n  \`${api.method} ${api.url}\`\n\n`
      })
      return resp
    }
  }

  if (wantsExample && results.length > 0) {
    const api = results[0]
    const curlCmd = api.headers
      ? `curl -X ${api.method} "${api.url}" \\\n  -H "${Object.entries(api.headers)[0].join(': ')}"`
      : `curl -X ${api.method} "${api.url}"`

    return (
      `Here's how to use **${api.icon} ${api.name}**:\n\n` +
      `**Description:** ${api.description}\n` +
      `**Category:** ${api.category} | **Auth:** ${api.auth} | **Rate Limit:** ${api.rateLimit}\n\n` +
      `**cURL:**\n\`\`\`bash\n${curlCmd}\n\`\`\`\n\n` +
      `**JavaScript (fetch):**\n\`\`\`javascript\nfetch('${api.url}'${api.headers ? `,\n  { headers: ${JSON.stringify(api.headers)} }` : ''})\n  .then(res => res.json())\n  .then(data => console.log(data));\n\`\`\`\n\n` +
      `**Python (requests):**\n\`\`\`python\nimport requests\nres = requests.get('${api.url}'${api.headers ? `,\n  headers=${JSON.stringify(api.headers)}` : ''})\nprint(res.json())\n\`\`\``
    )
  }

  if (wantsCompare && results.length >= 2) {
    let resp = `Here's a comparison of ${results.length} matching APIs:\n\n`
    results.slice(0, 5).forEach(api => {
      resp += `| ${api.icon} ${api.name} | ${api.category} | ${api.auth} | ${api.rateLimit} |\n`
      resp += `|---|---|---|---|\n`
      resp += `| \`${api.method} ${api.url}\` | ${api.description} ||\n\n`
    })
    resp += `Click on any API card above to test it live in your browser!`
    return resp
  }

  let resp = `Found **${results.length} API${results.length !== 1 ? 's' : ''}** matching "${query}":\n\n`
  results.slice(0, 8).forEach(api => {
    resp += `**${api.icon} ${api.name}** — ${api.description}\n`
    resp += `  \`${api.method} ${api.url}\` | ${api.category} | Auth: ${api.auth} | ${api.rateLimit}\n\n`
  })
  if (results.length > 8) {
    resp += `...and ${results.length - 8} more. Use filters to narrow down.`
  }
  return resp
}

// HTML-escape to prevent XSS, then apply safe markdown transforms
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function formatMarkdown(text: string): string {
  // First escape all HTML to prevent XSS
  const escaped = escapeHtml(text)
  // Then apply safe markdown transforms on the escaped text
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="ai-code-block"><code>$2</code></pre>')
    .replace(/\n/g, '<br/>')
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `I'm your **API Hub AI** — I know all ${allAPIs.length}+ APIs in the catalog.\n\nAsk me anything:\n• "Weather data APIs"\n• "Show me a code example for Dog CEO"\n• "Compare free exchange rate APIs"\n• "APIs with unlimited rate limits"\n• "Random image generators"`
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(() => {
    if (!input.trim()) return

    const userMsg = input.trim()
    setInput('')

    const results = searchAPIs(userMsg)
    const response = generateResponse(userMsg, results)

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: response, apis: results }
    ])
  }, [input])

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-messages" role="log" aria-live="polite">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-msg ai-msg-${msg.role}`}>
            <div className="ai-msg-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
            <div className="ai-msg-bubble">
              <div
                className="ai-msg-content"
                dangerouslySetInnerHTML={{
                  __html: formatMarkdown(msg.content)
                }}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="ai-chat-suggestions">
        {messages.length <= 1 && SUGGESTIONS.map((s, i) => (
          <button key={i} className="ai-suggestion" onClick={() => { setInput(s) }}>
            {s}
          </button>
        ))}
      </div>
      <div className="ai-chat-input">
        <span className="ai-input-icon">💬</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder="Ask about any API... (e.g. 'weather APIs', 'code example for dog images')"
          aria-label="Ask about APIs"
        />
        <button className="btn btn-primary ai-send-btn" onClick={sendMessage} disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}
