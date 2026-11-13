import { AnimatePresence, motion } from 'motion/react'
import { FiDownload, FiMoon, FiSun } from 'react-icons/fi'

export default function Header({ theme, onHome, onInstall, showInstall, onToggleTheme }) {
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#home"
        aria-label="Toppers Tuition Centre home"
        onClick={(event) => {
          event.preventDefault()
          onHome()
        }}
      >
        <img className="brand-logo" src="/logo.jpeg" alt="" />
        <span className="brand-copy">
          <strong>TOPPERS</strong>
          <small>Tuition Centre</small>
        </span>
      </a>
      <div className="header-actions">
        {showInstall && (
          <button className="download-button" type="button" onClick={onInstall}>
            <FiDownload aria-hidden="true" />
            Download
          </button>
        )}
        <motion.button
          className="icon-button theme-toggle"
          type="button"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          aria-pressed={theme === 'dark'}
          title={`${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          onClick={onToggleTheme}
          whileTap={{ scale: 0.86, rotate: 12 }}
          transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        >
          <AnimatePresence mode="sync" initial={false}>
            <motion.span
              key={theme}
              className="theme-icon"
              initial={{ opacity: 0, rotate: -70, scale: 0.65 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 70, scale: 0.65 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  )
}