import { useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import BottomNavigation from './components/BottomNavigation.jsx'
import Header from './components/Header.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import SchedulePage from './pages/SchedulePage.jsx'

const pages = {
  leaderboard: LeaderboardPage,
  schedule: SchedulePage,
}

export default function App() {
  const [activePage, setActivePage] = useState('leaderboard')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [centreData, setCentreData] = useState(null)
  const [dataError, setDataError] = useState('')
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('toppers-theme') || 'light'
    } catch {
      return 'light'
    }
  })
  const Page = pages[activePage]

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoadingScreen(false), 850)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const dataBaseUrl = (
      import.meta.env.VITE_DATA_BASE_URL || 'https://tuition-data.dhanjitxnath.workers.dev'
    ).replace(/\/+$/, '')

    async function loadCentreData() {
      try {
        const [studentsResponse, scheduleResponse] = await Promise.all([
          fetch(`${dataBaseUrl}/students.json`, { signal: controller.signal }),
          fetch(`${dataBaseUrl}/schedule.json`, { signal: controller.signal }),
        ])

        if (!studentsResponse.ok || !scheduleResponse.ok) {
          throw new Error(`Data request failed (students: ${studentsResponse.status}, schedule: ${scheduleResponse.status}).`)
        }

        const [students, schedule] = await Promise.all([
          studentsResponse.json(),
          scheduleResponse.json(),
        ])

        if (!Array.isArray(students) || !Array.isArray(schedule)) {
          throw new Error('The student and schedule data files must each contain a JSON array.')
        }

        setCentreData({ students, schedule })
      } catch (error) {
        if (error.name !== 'AbortError') {
          setDataError(error.message || 'Unable to load centre data.')
        }
      }
    }

    loadCentreData()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('toppers-theme', theme)
    } catch {
      // Theme still works for the current session when storage is unavailable.
    }
  }, [theme])

  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <Header theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />
        <main className="main-content" key={activePage}>
          {dataError ? (
            <p role="alert">Could not load centre data: {dataError}</p>
          ) : !centreData ? (
            <p role="status">Loading centre data...</p>
          ) : (
            <Page
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
              students={centreData.students}
              schedule={centreData.schedule}
            />
          )}
        </main>
        <BottomNavigation activePage={activePage} onNavigate={setActivePage} />
        <AnimatePresence>
          {showLoadingScreen && (
            <motion.div
              className="loading-screen"
              role="status"
              aria-label="Loading Toppers Tuition Centre"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="loading-content">
                <motion.img
                  className="loading-logo"
                  src="/logo.jpeg"
                  alt=""
                  initial={{ opacity: 0, scale: 0.82, y: 8 }}
                  animate={{ opacity: 1, scale: [0.82, 1.04, 1], y: 0 }}
                  transition={{ duration: 0.62, ease: [0.22, 0.7, 0.25, 1] }}
                />
                <motion.p
                  className="loading-label"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.16 }}
                >
                  Loading...
                </motion.p>
                <div className="loading-track" aria-hidden="true">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.72, delay: 0.08, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}