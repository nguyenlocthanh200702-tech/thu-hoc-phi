import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()
  const path = location.pathname

  const tabs = [
    { id: 'home', label: 'Trang chủ', path: '/', icon: '🏠' },
    { id: 'classes', label: 'Lớp học', path: '/lop-hoc', icon: '📚' },
    { id: 'students', label: 'Học sinh', path: '/hoc-sinh', icon: '👥' },
    { id: 'reports', label: 'Báo cáo', path: '/bao-cao', icon: '📊' },
    { id: 'settings', label: 'Cài đặt', path: '/cai-dat', icon: '⚙️' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto px-0">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const isActive = path === tab.path
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 text-center transition-colors ${
                  isActive
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-emerald-500'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
