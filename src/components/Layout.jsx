import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-brand shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-white text-xl font-bold tracking-wide hover:opacity-80 transition-opacity">GradeAI</Link>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-blue-100 text-sm">{user.nombre}</span>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm text-white bg-brand-dark hover:bg-brand-light px-3 py-1.5 rounded transition-colors"
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-white bg-brand-dark hover:bg-brand-light px-3 py-1.5 rounded transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
