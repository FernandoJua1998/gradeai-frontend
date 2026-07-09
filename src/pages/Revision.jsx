import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { iniciarRevision, getStatus } from '../api/revision'

export default function Revision() {
  const { tareaId } = useParams()
  const navigate = useNavigate()
  const initialCheckDone = useRef(false)

  const { mutate: startRevision } = useMutation({
    mutationFn: () => iniciarRevision(tareaId),
  })

  const { data } = useQuery({
    queryKey: ['revision-status', tareaId],
    queryFn: () => getStatus(tareaId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'completado' || status === 'con_errores' ? false : 3000
    },
  })

  const status = data?.status

  useEffect(() => {
    if (!status || initialCheckDone.current) return
    initialCheckDone.current = true

    if (status === 'completado' || status === 'con_errores') {
      navigate(`/tareas/${tareaId}/resultados`, { replace: true })
    } else if (status === 'pendiente') {
      startRevision()
    }
    // 'en_progreso' → el polling continúa sin llamar a iniciarRevision
  }, [status, navigate, startRevision, tareaId])

  const total = data?.total ?? 0
  const completadas = data?.completadas ?? 0
  const errores = data?.errores ?? 0
  const progreso = total > 0 ? Math.round(((completadas + errores) / total) * 100) : 0
  const done = status === 'completado' || status === 'con_errores'

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => {
        navigate(`/tareas/${tareaId}/resultados`)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [done, navigate, tareaId])

  return (
    <Layout>
      <div className="max-w-lg mx-auto mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisando entregas</h2>

        {status === 'con_errores' && (
          <div className="mb-4 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-lg px-4 py-3">
            Algunas entregas tuvieron errores. Revisa los resultados para más detalle.
          </div>
        )}

        <div className="flex justify-center mb-6">
          <svg
            className="animate-spin h-12 w-12 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>

        <p className="text-gray-600 text-sm">
          {done
            ? 'Completado. Redirigiendo...'
            : `Revisando ${completadas + errores} de ${total} entregas...`}
        </p>
        <p className="text-gray-400 text-xs mt-1">{progreso}%</p>
      </div>
    </Layout>
  )
}
