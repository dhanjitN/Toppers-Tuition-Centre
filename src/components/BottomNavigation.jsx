import { FiCalendar, FiAward, FiCheckCircle } from 'react-icons/fi'

const items = [
  { id: 'leaderboard', label: 'Leaderboard', icon: FiAward },
  { id: 'attendance', label: 'Attendance', icon: FiCheckCircle },
  { id: 'schedule', label: 'Schedule', icon: FiCalendar },
]

export default function BottomNavigation({ activePage, onNavigate }) {
  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      {items.map(({ id, label, icon: Icon }) => (
        <button
          className={`nav-item${activePage === id ? ' is-active' : ''}`}
          key={id}
          type="button"
          aria-current={activePage === id ? 'page' : undefined}
          onClick={() => onNavigate(id)}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}