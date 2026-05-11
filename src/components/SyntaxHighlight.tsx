const MAX_DEPTH = 12

type SyntaxData = string | number | boolean | null | undefined | SyntaxData[] | { [key: string]: SyntaxData } | Record<string, unknown>

export default function SyntaxHighlight({ data, depth = 0 }: { data: SyntaxData; depth?: number }) {
  if (depth > MAX_DEPTH) {
    return <span className="syn-str">..."max depth reached"</span>
  }
  if (data === null) return <span className="syn-null">null</span>
  if (typeof data === 'boolean') return <span className="syn-bool">{String(data)}</span>
  if (typeof data === 'number') return <span className="syn-num">{String(data)}</span>
  if (typeof data === 'string') {
    const isUrl = /^https?:\/\//.test(data)
    if (isUrl) {
      return <span className="syn-url">"{data}"</span>
    }
    return <span className="syn-str">"{data}"</span>
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <span>[]</span>
    const items = data.map((item, i) => (
      <span key={i} className="syn-line">
        {'  '.repeat(depth + 1)}
        <SyntaxHighlight data={item} depth={depth + 1} />
        {i < data.length - 1 && <span className="syn-comma">,</span>}
      </span>
    ))
    return (
      <>
        <span className="syn-bracket">[</span>
        <br />
        {items}
        <br />
        {'  '.repeat(depth)}<span className="syn-bracket">]</span>
      </>
    )
  }
  if (typeof data === 'object') {
    const entries = Object.entries(data)
    if (entries.length === 0) return <span>{'{}'}</span>
    const items = entries.map(([key, val], i) => (
      <span key={key} className="syn-line">
        {'  '.repeat(depth + 1)}
        <span className="syn-key">"{key}"</span>
        <span className="syn-colon">: </span>
        <SyntaxHighlight data={val as SyntaxData} depth={depth + 1} />
        {i < entries.length - 1 && <span className="syn-comma">,</span>}
      </span>
    ))
    return (
      <>
        <span className="syn-bracket">{'{'}</span>
        <br />
        {items}
        <br />
        {'  '.repeat(depth)}<span className="syn-bracket">{'}'}</span>
      </>
    )
  }
  return <span>{String(data)}</span>
}
