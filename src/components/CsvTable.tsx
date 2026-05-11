export default function CsvTable({ csv }: { csv: string }) {
  const lines = csv.trim().split('\n')
  if (lines.length === 0) return <pre className="result-code"><code>{csv}</code></pre>

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1, 21).map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue }
      current += ch
    }
    values.push(current.trim())
    return values
  })

  return (
    <div className="csv-table-wrapper">
      <table className="csv-table">
        <thead>
          <tr>
            {headers.map((h, i) => <th key={i}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {headers.map((_, j) => (
                <td key={j}>{row[j] || ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {lines.length > 21 && (
        <div className="csv-more">... {lines.length - 21} more rows</div>
      )}
    </div>
  )
}
