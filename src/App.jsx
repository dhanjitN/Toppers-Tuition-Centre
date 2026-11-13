import { useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { FiDownload, FiX } from 'react-icons/fi'
import BottomNavigation from './components/BottomNavigation.jsx'
import Header from './components/Header.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import SchedulePage from './pages/SchedulePage.jsx'
import StudentDetailPage from './pages/StudentDetailPage.jsx'

const pages = {
  leaderboard: LeaderboardPage,
  attendance: AttendancePage,
  schedule: SchedulePage,
}

export default function App() {
  const [activePage, setActivePage] = useState('leaderboard')
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [centreData, setCentreData] = useState(null)
  const [dataError, setDataError] = useState('')
  const [installPromptEvent, setInstallPromptEvent] = useState(null)
  const [installMessage, setInstallMessage] = useState('')
  const [installPromptDismissed, setInstallPromptDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(() => (
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  ))
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
    const dataBaseUrl = (import.meta.env.VITE_DATA_BASE_URL || 'https://dhanjitn.github.io/Tuition-Data').replace(/\/+$/, '')
    let activeController
    let hasLoadedData = false

    async function loadCentreData() {
      activeController?.abort()
      const controller = new AbortController()
      activeController = controller
      try {
        const [studentsResponse, scheduleResponse, attendanceResponse] = await Promise.all([
          fetch(`${dataBaseUrl}/students.json`, { signal: controller.signal }),
          fetch(`${dataBaseUrl}/schedule.json`, { signal: controller.signal }),
          fetch(`${dataBaseUrl}/attendance.json`, { signal: controller.signal }),
        ])

        const responses = {
          students: studentsResponse,
          schedule: scheduleResponse,
          attendance: attendanceResponse,
        }
        const failedRequests = Object.entries(responses)
          .filter(([, response]) => !response.ok)
          .map(([name, response]) => `${name}: ${response.status}`)
        if (failedRequests.length > 0) throw new Error(`Data request failed (${failedRequests.join(', ')}).`)

        const [students, schedule, attendance] = await Promise.all([
          studentsResponse.json(),
          scheduleResponse.json(),
          attendanceResponse.json(),
        ])

        if (![students, schedule, attendance].every(Array.isArray)) {
          throw new Error('The student, schedule, and attendance data files must each contain a JSON array.')
        }

        setCentreData({ students, schedule, attendance })
        setDataError('')
        hasLoadedData = true
      } catch (error) {
        if (error.name !== 'AbortError' && !hasLoadedData) {
          setDataError(error.message || 'Unable to load centre data.')
        }
      }
    }

    loadCentreData()

    window.addEventListener('online', loadCentreData)
    return () => {
      window.removeEventListener('online', loadCentreData)
      activeController?.abort()
    }
  }, [])

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    const updateStandalone = () => {
      setIsStandalone(standaloneQuery.matches || window.navigator.standalone === true)
    }

    function handleInstallAvailable(event) {
      event.preventDefault()
      setInstallPromptEvent(event)
      setInstallPromptDismissed(false)
      setInstallMessage('')
    }

    function handleInstalled() {
      setIsStandalone(true)
      setInstallPromptEvent(null)
      setInstallPromptDismissed(true)
      setInstallMessage('')
    }

    if (standaloneQuery.addEventListener) {
      standaloneQuery.addEventListener('change', updateStandalone)
    } else {
      standaloneQuery.addListener(updateStandalone)
    }
    window.addEventListener('beforeinstallprompt', handleInstallAvailable)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      if (standaloneQuery.removeEventListener) {
        standaloneQuery.removeEventListener('change', updateStandalone)
      } else {
        standaloneQuery.removeListener(updateStandalone)
      }
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function installApp() {
    if (!installPromptEvent) return

    try {
      await installPromptEvent.prompt()
      await installPromptEvent.userChoice
      setInstallPromptEvent(null)
      setInstallMessage('')
    } catch {
      setInstallMessage('Could not open the browser install dialog. Refresh the page and try again.')
      setInstallPromptEvent(null)
    }
  }

  function handleInstallClick() {
    if (installPromptEvent) {
      installApp()
      return
    }

    setInstallMessage('The browser install dialog is not available for this page yet.')
  }

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
        <Header
          theme={theme}
          onHome={() => {
            setSelectedStudentId(null)
            setActivePage('leaderboard')
          }}
          onInstall={handleInstallClick}
          showInstall={!isStandalone}
          onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        />
        <main className="main-content" key={selectedStudentId || activePage}>
          {dataError ? (
            <p role="alert">Could not load centre data: {dataError}</p>
          ) : !centreData ? (
            <p role="status">Loading centre data...</p>
          ) : selectedStudentId ? (
            <StudentDetailPage
              studentId={selectedStudentId}
              students={centreData.students}
              attendance={centreData.attendance}
              schedule={centreData.schedule}
              onBack={() => setSelectedStudentId(null)}
            />
          ) : (
            <Page
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
              onStudentSelect={setSelectedStudentId}
              students={centreData.students}
              schedule={centreData.schedule}
              attendance={centreData.attendance}
            />
          )}
        </main>
        <BottomNavigation
          activePage={activePage}
          onNavigate={(page) => {
            setSelectedStudentId(null)
            setActivePage(page)
          }}
        />
        {installPromptEvent && !installPromptDismissed && !isStandalone && (
          <aside className="install-prompt" aria-label="Install Toppers Tuition Centre">
            <div className="install-prompt-copy">
              <strong>Install Toppers</strong>
              <span>Add it to your home screen and use it offline.</span>
            </div>
            <button className="install-action" type="button" onClick={installApp}>
              <FiDownload aria-hidden="true" />
              Install
            </button>
            <button
              className="install-dismiss"
              type="button"
              aria-label="Dismiss install prompt"
              onClick={() => setInstallPromptDismissed(true)}
            >
              <FiX aria-hidden="true" />
            </button>
          </aside>
        )}
        {installMessage && <p className="install-message" role="status">{installMessage}</p>}
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