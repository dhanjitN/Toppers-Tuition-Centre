import { useState } from 'react'
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi'
import { rankStudents } from '../utils/rankStudents.js'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function normalizeDate(value) {
  if (typeof value !== 'string') return ''
  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value)
  if (!match) return ''
  const [, day, month, year] = match
  return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
}

function getDateKey(date) {
  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear(),
  ].join('-')
}

export default function StudentDetailPage({ studentId, students, attendance, schedule, onBack }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const student = students.find((item) => item.student_id === studentId)
  const classRank = student
    ? rankStudents(students.filter((item) => item.grade === student.grade))
      .find(({ student: rankedStudent }) => rankedStudent.student_id === studentId)?.rank
    : null
  const classRankStyle = classRank === 1 ? 'first' : classRank === 2 ? 'second' : classRank === 3 ? 'third' : 'other'
  const attendanceEntries = attendance.flatMap((record) => {
    const studentRecord = record.students.find((item) => item.student_id === studentId)
    if (!studentRecord) return []
    return [{
      date: normalizeDate(record.date),
      grade: record.grade,
      points: studentRecord.points,
    }]
  }).filter((entry) => entry.date)
  const attendedDates = new Set(attendanceEntries.map(({ date }) => date))
  const selectedEntry = attendanceEntries.find(({ date }) => date === getDateKey(selectedDate))
  const selectedSessions = selectedEntry
    ? schedule.filter((session) => (
      normalizeDate(session.date) === selectedEntry.date
      && session.grade === selectedEntry.grade
    ))
    : []
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const monthName = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const selectedLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingWeekday = new Date(year, month, 1).getDay()
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))
  function changeMonth(offset) {
    const nextMonth = new Date(year, month + offset, 1)
    setVisibleMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  if (!student) {
    return (
      <section className="student-not-found" role="alert">
        <p>Student not found.</p>
        <button className="student-back-button" type="button" onClick={onBack}>
          <FiArrowLeft aria-hidden="true" /> Back to leaderboard
        </button>
      </section>
    )
  }

  return (
    <div className="student-detail-page">
      <section className="student-profile" aria-labelledby="student-name">
        <button className="student-back-button" type="button" onClick={onBack}>
          <FiArrowLeft aria-hidden="true" />
          <span>Leaderboard</span>
        </button>
        <div className="student-profile-heading">
          <div className="student-identity">
            <div className="student-grade-rank">
              <span className="student-grade">Grade {student.grade}</span>
              <span className={`student-rank student-rank-${classRankStyle}`}>Rank - {classRank}</span>
            </div>
            <h1 id="student-name">{student.name}</h1>
          </div>
          <div className="student-attendance-total">
            <strong>{attendedDates.size}</strong>
            <span>days attended</span>
          </div>
        </div>
      </section>

      <section className="month-calendar student-calendar" aria-label={`${student.name}'s attendance calendar`}>
        <div className="calendar-heading">
          <h2>Attendance</h2>
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
            const isAttended = attendedDates.has(getDateKey(date))
            return (
              <button
                className={`calendar-date${isSelected ? ' date-selected' : ''}${isAttended ? ' date-has-classes' : ''}`}
                key={date.toISOString()}
                type="button"
                aria-label={`${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}${isAttended ? ', attended' : ''}`}
                aria-pressed={isSelected}
                onClick={() => setSelectedDate(date)}
              >
                <span>{date.getDate()}</span>
                <i className={isAttended ? 'has-classes' : ''} />
              </button>
            )
          })}
        </div>
      </section>

      <section className="section-block student-day-section" aria-labelledby="student-day-heading">
        <div className="section-heading schedule-heading">
          <h2 id="student-day-heading">{selectedLabel}</h2>
        </div>
        {selectedEntry ? (
          <>
            <article className="student-points-card">
              <span>Points earned</span>
              <strong>{selectedEntry.points}</strong>
            </article>
            <h3 className="student-class-heading">Class details</h3>
            {selectedSessions.length > 0 ? (
              <div className="class-list">
                {selectedSessions.map((session) => (
                  <article
                    className={`class-card${session.tone === 'test' ? ' test-session' : ''}`}
                    key={`${session.date}-${session.time}-${session.grade}-${session.class}`}
                  >
                    <div className={`class-accent ${session.tone}`} />
                    <div className="class-card-body">
                      <div className="class-session-heading">
                        <div className="class-session-meta">
                          <div className="class-time"><FiClock aria-hidden="true" /><span>{session.time}</span></div>
                          <span className="class-grade">Grade {session.grade}</span>
                        </div>
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
              <p className="schedule-empty">No class details available for this date.</p>
            )}
          </>
        ) : (
          <p className="schedule-empty">No attendance recorded for this date.</p>
        )}
      </section>
    </div>
  )
}
