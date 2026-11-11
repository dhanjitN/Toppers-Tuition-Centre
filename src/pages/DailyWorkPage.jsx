import { useState } from 'react'

function formatWorkDate(value) {
  if (typeof value !== 'string') return value
  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value)
  if (!match) return value

  const [, day, month, year] = match
  return new Date(Number(year), Number(month) - 1, Number(day))
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function normalizeWorkDate(value) {
  if (typeof value !== 'string') return ''
  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value)
  if (!match) return ''

  const [, day, month, year] = match
  return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
}

export default function DailyWorkPage({ title, items, contentKey }) {
  const [selectedGrade, setSelectedGrade] = useState('all')
  const today = new Date()
  const todayKey = [
    String(today.getDate()).padStart(2, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    today.getFullYear(),
  ].join('-')
  const todayItems = items.filter((item) => normalizeWorkDate(item.date) === todayKey)
  const gradeOptions = [...new Set(todayItems.map(({ grade }) => grade))].sort((a, b) => a - b)
  const visibleItems = todayItems.filter((item) => selectedGrade === 'all' || item.grade === Number(selectedGrade))

  return (
    <section className="daily-work-page" aria-labelledby="daily-work-title">
      <div className="daily-work-heading">
        <div>
          <p className="eyebrow">YOUR DAILY LEARNING</p>
          <h1 id="daily-work-title">{title}</h1>
        </div>
        <label className="grade-filter">
          <span>Grade</span>
          <select
            value={selectedGrade}
            onChange={(event) => setSelectedGrade(event.target.value)}
            aria-label={`Filter ${title.toLowerCase()} by grade`}
          >
            <option value="all">All grades</option>
            {gradeOptions.map((grade) => <option value={grade} key={grade}>Grade {grade}</option>)}
          </select>
        </label>
      </div>
      {visibleItems.length > 0 ? (
        <div className="daily-work-list">
          {visibleItems.map((item, index) => (
            <article
              className="daily-work-card"
              key={`${item.date}-${item.grade}-${index}`}
            >
              <div className="daily-work-card-meta">
                <time>{formatWorkDate(item.date)}</time>
                <span className="daily-work-grade">Grade {item.grade}</span>
              </div>
              <p>{item[contentKey]}</p>
            </article>
          ))}
        </div>
      ) : (
        <p className="schedule-empty">No {title.toLowerCase()} events scheduled for today.</p>
      )}
    </section>
  )
}
