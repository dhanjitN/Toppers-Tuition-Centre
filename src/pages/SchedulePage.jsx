import { useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiClock, FiSun } from 'react-icons/fi'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getSessions(date, selectedGrade, schedule) {
  return schedule.filter((session) => (
    session.date === weekdayNames[date.getDay()]
    && (selectedGrade === 'all' || session.grade === Number(selectedGrade))
  ))
}

export default function SchedulePage({ schedule }) {
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [showActiveDays, setShowActiveDays] = useState(false)
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
  const gradeOptions = [...new Set(schedule.map(({ grade }) => grade))].sort((a, b) => a - b)
  const classList = getSessions(selectedDate, selectedGrade, schedule)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingWeekday = new Date(year, month, 1).getDay()
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))
  const activeDayCount = calendarDays.filter((date) => getSessions(date, selectedGrade, schedule).length > 0).length

  function changeMonth(offset) {
    const nextMonth = new Date(year, month + offset, 1)
    setVisibleMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  return (
    <>
      <section className="month-calendar" aria-label="Schedule calendar">
        <div className="schedule-filters">
          <label className="schedule-filter">
            <span>Grade</span>
            <select aria-label="Filter by grade" value={selectedGrade} onChange={(event) => setSelectedGrade(event.target.value)}>
              <option value="all">All grades</option>
              {gradeOptions.map((grade) => <option value={grade} key={grade}>Grade {grade}</option>)}
            </select>
          </label>
          <button
            className={`active-days-toggle${showActiveDays ? ' is-selected' : ''}`}
            type="button"
            aria-pressed={showActiveDays}
            onClick={() => setShowActiveDays((active) => !active)}
          >
            <FiSun aria-hidden="true" />
            <span>Active days</span>
            <strong>{activeDayCount}</strong>
          </button>
        </div>
        <div className="calendar-heading">
          <h1>Schedule</h1>
          <div className="month-controls">
            <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}><FiChevronLeft aria-hidden="true" /></button>
            <strong>{monthName}</strong>
            <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}><FiChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        <div className={`calendar-grid${showActiveDays ? ' active-days-view' : ''}`} role="group" aria-label={monthName}>
          {weekDays.map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}
          {Array.from({ length: startingWeekday }, (_, index) => (
            <span className="calendar-empty" key={`empty-${index}`} aria-hidden="true" />
          ))}
          {calendarDays.map((date) => {
            const isSelected = date.toDateString() === selectedDate.toDateString()
            const hasClasses = getSessions(date, selectedGrade, schedule).length > 0
            return (
              <button
                className={`calendar-date${isSelected ? ' date-selected' : ''}${hasClasses ? ' date-has-classes' : ''}`}
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
              <article className="class-card" key={`${session.time}-${session.class}`}>
                <div className={`class-accent ${session.tone}`} />
                <div className="class-card-body">
                  <div className="class-session-heading">
                    <div className="class-time"><FiClock aria-hidden="true" /><span>{session.time}</span></div>
                    <div className="class-details">
                      <h3>{session.class}</h3>
                      <p className="class-topic">{session.topic}</p>
                    </div>
                  </div>
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