import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getDetalleAlumno } from '../api/revision'

const NIVEL_BADGE = {
  bajo: 'bg-green-100 text-green-800',
  medio: 'bg-yellow-100 text-yellow-800',
  alto: 'bg-red-100 text-red-800',
}

const BAR_COLOR = (prob) => {
  if (prob < 40) return 'bg-green-500'
  if (prob <= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function DetalleAlumno() {
  const { entregaId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['detalle-alumno', entregaId],
    queryFn: () => getDetalleAlumno(entregaId),
  })

  if (isLoading) {
    return <Layout><p className="text-gray-400 text-sm">Cargando detalle...</p></Layout>
  }

  if (isError || !data) {
    return <Layout><p className="text-red-500 text-sm">Error al cargar el detalle.</p></Layout>
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="text-sm text-brand hover:underline">
          ← Volver a resultados
        </button>
        <button
          onClick={() => window.print()}
          className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          🖨 Exportar detalle PDF
        </button>
      </div>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{data.alumno}</h2>
          {data.ia_nivel_riesgo && (
            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${NIVEL_BADGE[data.ia_nivel_riesgo] ?? 'bg-gray-100 text-gray-600'}`}>
              IA: {data.ia_nivel_riesgo}
            </span>
          )}
        </div>
        <div className="text-center sm:text-right">
          <p className="text-5xl font-bold text-blue-700">{data.calificacion_total?.toFixed(1) ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-1">Calificación total</p>
        </div>
      </div>

      {/* Desglose */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Desglose por criterio</h3>
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-2 font-semibold text-gray-600">Criterio</th>
              <th className="text-left pb-2 font-semibold text-gray-600">Ponderación</th>
              <th className="text-left pb-2 font-semibold text-gray-600">Puntos</th>
              <th className="text-left pb-2 font-semibold text-gray-600">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {(data.desglose ?? []).map((item, idx) => {
              const porcentaje = item.ponderacion > 0
                ? Math.min(100, Math.round((item.puntos / item.ponderacion) * 100))
                : 0
              return (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-3 pr-4 font-medium text-gray-900 align-top">{item.criterio}</td>
                  <td className="py-3 pr-4 text-gray-600 align-top">{item.ponderacion}</td>
                  <td className="py-3 pr-4 align-top">
                    <div>
                      <span className="font-semibold text-gray-800">{item.puntos?.toFixed(1)}</span>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600 text-xs align-top">{item.comentario}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Retroalimentación */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl" role="img" aria-label="robot">🤖</span>
          <h3 className="text-lg font-semibold text-gray-800">Retroalimentación generada por IA</h3>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{data.retroalimentacion}</p>
        </div>
      </div>

      {/* Detección de IA */}
      {data.ia_probabilidad != null && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detección de contenido IA</h3>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Probabilidad de uso de IA</span>
              <span className="font-semibold">{data.ia_probabilidad.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${BAR_COLOR(data.ia_probabilidad)}`}
                style={{ width: `${data.ia_probabilidad}%` }}
              />
            </div>
          </div>

          {data.ia_fragmentos?.length > 0 && (
            <div className="space-y-3 mt-4">
              <p className="text-sm font-medium text-gray-700">Fragmentos sospechosos:</p>
              {data.ia_fragmentos.map((f, idx) => (
                <div key={idx}>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                    <p className="text-sm text-gray-800 italic">"{f.texto}"</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-1">{f.razon}</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 italic mt-6">
            Este análisis es una estimación probabilística. La decisión final corresponde al/a la docente.
          </p>
        </div>
      )}
    </Layout>
  )
}
