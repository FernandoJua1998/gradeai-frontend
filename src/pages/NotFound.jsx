import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 text-sm mb-6">
        La dirección que buscas no existe o fue movida.
      </p>
      <button
        onClick={() => navigate('/')}
        className="bg-brand text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-dark transition-colors"
      >
        Volver al inicio
      </button>
    </div>
  )
}
