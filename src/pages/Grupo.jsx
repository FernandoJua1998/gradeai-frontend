import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { getGrupo } from '../api/grupos'
import { getTareas } from '../api/tareas'
import { getStatus } from '../api/revision'

function TareaStatusDot({ tareaId }) {
  const { data } = useQuery({
    queryKey: ['revision-status', String(tareaId)],
    queryFn: () => getStatus(tareaId),
    staleTime: 30_000,
  })

  if (!data || data.total === 0) {
    return <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" title="Sin revisiones" />
  }
  if (data.status === 'completado') {
    return <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" title="Revisión completada" />
  }
  if (data.status === 'en_progreso' || data.status === 'pendiente') {
    return <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse inline-block" title="En revisión" />
  }
  if (data.status === 'con_errores') {
    return <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" title="Con errores" />
  }
  return <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" title="Sin revisar" />
}

export default function Grupo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const grupoId = Number(id)

  const { data: grupo, isLoading: loadingGrupo } = useQuery({
    queryKey: ['grupo', grupoId],
    queryFn: () => getGrupo(grupoId),
  })

  const { data: tareas = [], isLoading: loadingTareas } = useQuery({
    queryKey: ['tareas', grupoId],
    queryFn: () => getTareas(grupoId),
  })

  if (loadingGrupo) {
    return <Layout><LoadingSpinner message="Cargando grupo..." /></Layout>
  }

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="text-sm text-brand hover:underline mb-2 inline-block">
          ← Volver a grupos
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{grupo?.nombre}</h2>
        <p className="text-gray-500 text-sm mt-0.5">{grupo?.materia} · {grupo?.ciclo}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tareas</h3>
        <button
          onClick={() => navigate(`/tareas/nueva?grupoId=${grupoId}`)}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          + Nueva tarea
        </button>
      </div>

      {loadingTareas ? (
        <p className="text-gray-400 text-sm">Cargando tareas...</p>
      ) : tareas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
          <p className="text-lg font-medium text-gray-500">Aún no hay tareas en este grupo.</p>
          <p className="text-sm mt-1">Crea la primera tarea usando el botón de arriba.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tareas.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <TareaStatusDot tareaId={t.id} />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{t.titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.criterios?.length ?? 0} criterios · IA: {t.config_ia?.modo ?? 'desactivado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => navigate(`/tareas/${t.id}/subir`)}
                  className="text-sm text-brand border border-brand px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors"
                >
                  Subir tareas
                </button>
                <button
                  onClick={() => navigate(`/tareas/${t.id}/revision`)}
                  className="text-sm text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Iniciar revisión
                </button>
                <button
                  onClick={() => navigate(`/tareas/${t.id}/resultados`)}
                  className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
