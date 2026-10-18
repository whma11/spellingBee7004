import { todayKey } from '../lib/storage'

function lastDays(n) {
  const days = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    days.push(todayKey(date))
  }
  return days
}

export default function TrendChart({ history }) {
  const days = lastDays(14)
  const points = days.map((day) => {
    const row = history[day] || { correct: 0, incorrect: 0 }
    return { day, ...row, total: row.correct + row.incorrect }
  })
  const max = Math.max(4, ...points.map((p) => p.total))
  const width = 560
  const height = 180
  const pad = 28

  const x = (i) => pad + (i * (width - pad * 2)) / (points.length - 1)
  const y = (value) => height - pad - (value / max) * (height - pad * 2)

  const line = (key) =>
    points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`)
      .join(' ')

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full min-w-[320px]"
        role="img"
        aria-label="Daily correct and incorrect counts for the last 14 days"
      >
        <rect x="0" y="0" width={width} height={height} rx="16" fill="#fffdf6" />
        {[0, 0.5, 1].map((t) => {
          const value = max * t
          return (
            <g key={t}>
              <line
                x1={pad}
                x2={width - pad}
                y1={y(value)}
                y2={y(value)}
                stroke="#ead9a8"
                strokeDasharray="4 6"
              />
              <text x="8" y={y(value) + 4} fontSize="10" fill="#6b7280">
                {Math.round(value)}
              </text>
            </g>
          )
        })}
        <path d={line('correct')} fill="none" stroke="#15803d" strokeWidth="3" />
        <path d={line('incorrect')} fill="none" stroke="#b45309" strokeWidth="3" />
        {points.map((p, i) => (
          <text
            key={p.day}
            x={x(i)}
            y={height - 8}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
          >
            {p.day.slice(5)}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex gap-4 text-xs font-medium text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-4 rounded bg-green-700" /> Correct
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-4 rounded bg-amber-700" /> Incorrect
        </span>
      </div>
    </div>
  )
}
