import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function normalizeAttendanceDate(value) {
  if (typeof value !== 'string') return ''
  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(value)
  if (!match) return ''
  const [, day, month, year] = match
  return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`
}

function getAttendanceDate(date) {
  return [
    String(date.getDate()).padStart(2, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    date.getFullYear(),
  ].join('-')
}

export default function AttendancePage({ attendance, students }) {
  const [selectedGrade, setSelectedGrade] = useState('all')
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
  const studentNames = new Map(students.map((student) => [student.student_id, student.name]))
  const selectedAttendance = attendance
    .filter((record) => normalizeAttendanceDate(record.date) === getAttendanceDate(selectedDate))
    .filter((record) => selectedGrade === 'all' || record.grade === Number(selectedGrade))
    .flatMap((record) => record.students.map((student) => ({
      ...student,
      grade: record.grade,
      name: studentNames.get(student.student_id) || student.student_id,
    })))
    .sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  const gradeOptions = [...new Set(attendance.map(({ grade }) => grade))].sort((a, b) => a - b)
  const attendanceByGrade = selectedAttendance.reduce((groups, student) => {
    groups.set(student.grade, [...(groups.get(student.grade) || []), student])
    return groups
  }, new Map())
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingWeekday = new Date(year, month, 1).getDay()
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))

  function hasAttendance(date) {
    const exactDate = getAttendanceDate(date)
    return attendance.some((record) => (
      normalizeAttendanceDate(record.date) === exactDate
      && (selectedGrade === 'all' || record.grade === Number(selectedGrade))
    ))
  }

  function changeMonth(offset) {
    const nextMonth = new Date(year, month + offset, 1)
    setVisibleMonth(nextMonth)
    setSelectedDate(nextMonth)
  }

  return (
    <>
      <section className="month-calendar" aria-label="Attendance calendar">
        <div className="schedule-filters">
          <label className="schedule-filter">
            <span>Grade</span>
            <select aria-label="Filter attendance by grade" value={selectedGrade} onChange={(event) => setSelectedGrade(event.target.value)}>
              <option value="all">All grades</option>
              {gradeOptions.map((grade) => <option value={grade} key={grade}>Grade {grade}</option>)}
            </select>
          </label>
        </div>
        <div className="calendar-heading">
          <h1>Attendance</h1>
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
            const hasRecords = hasAttendance(date)
            return (
              <button
                className={`calendar-date${isSelected ? ' date-selected' : ''}${hasRecords ? ' date-has-classes' : ''}`}
                key={date.toISOString()}
                type="button"
                aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                aria-pressed={isSelected}
                onClick={() => setSelectedDate(date)}
              >
                <span>{date.getDate()}</span>
                <i className={hasRecords ? 'has-classes' : ''} />
              </button>
            )
          })}
        </div>
      </section>
      <section className="section-block schedule-section" aria-labelledby="attendance-date">
        <div className="section-heading schedule-heading">
          <h2 id="attendance-date">{selectedLabel}</h2>
        </div>
        {attendanceByGrade.size > 0 ? (
          <div className="attendance-grades">
            {[...attendanceByGrade].map(([grade, gradeStudents]) => (
              <section className="attendance-grade" key={grade} aria-labelledby={`attendance-grade-${grade}`}>
                <h3 id={`attendance-grade-${grade}`}>Grade {grade}</h3>
                <div className="attendance-list">
                  {gradeStudents.map((student) => (
                    <article className="attendance-card" key={student.student_id}>
                      <div className="attendance-student">
                        <strong>{student.name}</strong>
                      </div>
                      <span className="attendance-points">{student.points} <small>points</small></span>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="schedule-empty">{selectedGrade === 'all' ? 'No attendance recorded for this date.' : `No Grade ${selectedGrade} attendance recorded for this date.`}</p>
        )}
      </section>
    </>
  )
}
