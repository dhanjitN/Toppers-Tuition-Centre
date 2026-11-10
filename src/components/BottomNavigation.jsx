import { FiBookOpen, FiCalendar, FiClipboard, FiAward } from 'react-icons/fi'

const items = [
  { id: 'leaderboard', label: 'Leaderboard', icon: FiAward },
  { id: 'homework', label: 'Homework', icon: FiBookOpen },
  { id: 'plan', label: 'Study Plan', icon: FiClipboard },
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