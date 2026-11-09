import { AnimatePresence, motion } from 'motion/react'

const students = [
  { name: 'Aarav Sharma', grade: 10, points: 2480 },
  { name: 'Mira Patel', grade: 10, points: 2315 },
  { name: 'Kabir Singh', grade: 10, points: 2190 },
  { name: 'Anaya Das', grade: 10, points: 2045 },
  { name: 'Ishaan Mehta', grade: 10, points: 1980 },
  { name: 'Rohan Kapoor', grade: 9, points: 2260 },
  { name: 'Sara Khan', grade: 9, points: 2110 },
  { name: 'Dev Malhotra', grade: 9, points: 1890 },
  { name: 'Tara Iyer', grade: 8, points: 2215 },
  { name: 'Neil Thomas', grade: 8, points: 2050 },
  { name: 'Zoya Ali', grade: 8, points: 1925 },
  { name: 'Reyansh Bose', grade: 11, points: 2390 },
  { name: 'Myra Joseph', grade: 11, points: 2175 },
  { name: 'Aditya Roy', grade: 11, points: 1995 },
  { name: 'Aisha Verma', grade: 12, points: 2440 },
  { name: 'Arjun Nair', grade: 12, points: 2230 },
  { name: 'Kiara Sen', grade: 12, points: 2010 },
]

const grades = [...new Set(students.map((student) => student.grade))].sort((a, b) => a - b)
const rankArtwork = ['fire', 'water', 'forest', 'stone', 'sunrise']

export default function LeaderboardPage({ selectedGrade, onGradeChange, students }) {
  const rankedStudents = students
    .filter((student) => selectedGrade === 'all' || student.grade === Number(selectedGrade))
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)

  return (
    <section className="leaderboard-page" aria-labelledby="leaderboard-title">
      <div className="leaderboard-heading">
        <h1 id="leaderboard-title">Leaderboard</h1>
        <label className="grade-filter">
          <span className="visually-hidden">Filter by grade</span>
          <select value={selectedGrade} onChange={(event) => onGradeChange(event.target.value)} aria-label="Filter leaderboard by grade">
            <option value="all">All grades</option>
            {grades.map((grade) => <option value={grade} key={grade}>Grade {grade}</option>)}
          </select>
        </label>
      </div>
      <div className="leaderboard-caption">
        <span className="points-heading">Points</span>
      </div>
      <div className="leaderboard-list" aria-label="Top five students ranked by points">
        <AnimatePresence mode="popLayout" initial={false}>
          {rankedStudents.map((student, index) => (
            <motion.article
              className={`leader-card rank-${index + 1}${selectedGrade === 'all' ? ' all-grades' : ' filtered-leader-card'}`}
              key={`${selectedGrade}-${student.name}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, delay: index * 0.035 }}
            >
              {selectedGrade === 'all' && (
                <span className={`leader-art leader-art-${rankArtwork[index]}`} aria-hidden="true" />
              )}
              <span className="leader-rank">{String(index + 1).padStart(2, '0')}</span>
              <span className="leader-person">
                <strong>{student.name}</strong>
                <small>Grade {student.grade}</small>
              </span>
              <span className="leader-points">{student.points.toLocaleString()}</span>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}