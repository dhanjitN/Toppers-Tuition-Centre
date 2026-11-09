import { useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi'

const classesByWeekday = {
  0: [],
  1: [
    { time: '04:00 PM', end: '05:30 PM', subject: 'Mathematics', topic: 'Quadratic equations', tone: 'math' },
    { time: '06:00 PM', end: '07:30 PM', subject: 'Physics', topic: 'Electricity & circuits', tone: 'physics' },
  ],
  2: [
    { time: '04:30 PM', end: '06:00 PM', subject: 'Chemistry', topic: 'Chemical reactions', tone: 'chemistry' },
  ],
  3: [
    { time: '05:00 PM', end: '06:30 PM', subject: 'Physics', topic: 'Motion and force', tone: 'physics' },
  ],
  4: [
    { time: '04:00 PM', end: '05:30 PM', subject: 'Mathematics', topic: 'Coordinate geometry', tone: 'math' },
    { time: '06:00 PM', end: '07:30 PM', subject: 'Biology', topic: 'Cell structure', tone: 'biology' },
  ],
  5: [
    { time: '04:30 PM', end: '06:00 PM', subject: 'Biology', topic: 'Human physiology', tone: 'biology' },
  ],
  6: [
    { time: '10:00 AM', end: '11:30 AM', subject: 'Revision workshop', topic: 'Weekly problem solving', tone: 'workshop' },
  ],
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const monthName = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selectedLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const classList = classesByWeekday[selectedDate.getDay()]
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingWeekday = new Date(year, month, 1).getDay()
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))

  function changeMonth(offset) {
    const nextMonth = new Date(year, month + offset, 1)
    setVisibleMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  return (
    <>
      <section className="month-calendar" aria-label="Schedule calendar">
        <div className="calendar-heading">
          <h1>Schedule</h1>
          <div className="month-controls">
            <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}><FiChevronLeft aria-hidden="true" /></button>
            <strong>{monthName}</strong>
            <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}><FiChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        <div className="calendar-grid" role="group" aria-label={monthName}>
          {weekDays.map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}
          {Array.from({ length: startingWeekday }, (_, index) => (
            <span className="calendar-empty" key={`empty-${index}`} aria-hidden="true" />
          ))}
          {calendarDays.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString()
            const hasClasses = classesByWeekday[date.getDay()].length > 0
            return (
              <button
                className={`calendar-date${isSelected ? ' date-selected' : ''}`}
                key={date.toISOString()}
                type="button"
                aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                aria-pressed={isSelected}
                onClick={() => setSelectedDate(date)}
              >
                <span>{date.getDate()}</span>
                <i className={hasClasses ? 'has-classes' : ''} />
              </button>
            )
          })}
        </div>
      </section>
      <section className="section-block schedule-section">
        <div className="section-heading schedule-heading">
          <h2>{selectedLabel}</h2>
        </div>
        {classList.length > 0 ? (
          <div className="class-list">
            {classList.map((session) => (
              <article className="class-card" key={`${session.time}-${session.subject}`}>
                <div className={`class-accent ${session.tone}`} />
                <div className="class-card-body">
                  <div className="class-session-heading">
                    <div className="class-time"><FiClock aria-hidden="true" /><span>{session.time} <small>— {session.end}</small></span></div>
                    <h3>{session.subject}</h3>
                  </div>
                  <p className="class-topic">{session.topic}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="schedule-empty">No classes scheduled for this date.</p>
        )}
      </section>
    </>
  )
}