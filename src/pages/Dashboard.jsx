import Layout from '../components/Layout'
import useAuthStore from '../store/authStore'

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenida, {user?.nombre ?? 'Maestra'}
        </h2>
        <p className="text-gray-500 mt-1">Panel de control de GradeAI</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-lg font-medium text-gray-500">Proximamente: lista de tareas</p>
        <p className="text-sm mt-1">Aqui apareceran tus grupos y tareas pendientes de revision.</p>
      </div>
    </Layout>
  )
}
