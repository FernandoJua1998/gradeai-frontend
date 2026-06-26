import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getGrupo } from '../api/grupos'
import { getTareas } from '../api/tareas'

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
    return <Layout><p className="text-gray-400 text-sm">Cargando...</p></Layout>
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
          <p className="text-lg font-medium text-gray-500">Sin tareas aún</p>
          <p className="text-sm mt-1">Crea la primera tarea para este grupo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tareas.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.criterios?.length ?? 0} criterios · IA: {t.config_ia?.modo ?? 'desactivado'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/tareas/${t.id}/subir`)}
                className="text-sm text-brand border border-brand px-3 py-1.5 rounded-lg hover:bg-brand hover:text-white transition-colors"
              >
                Subir tareas
              </button>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
