import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getResultados, exportarExcel } from '../api/revision'

const NIVEL_BADGE = {
  bajo: 'bg-green-100 text-green-800',
  medio: 'bg-yellow-100 text-yellow-800',
  alto: 'bg-red-100 text-red-800',
}

export default function Resultados() {
  const { tareaId } = useParams()
  const navigate = useNavigate()
  const [sortAsc, setSortAsc] = useState(false)
  const [exporting, setExporting] = useState(false)

  const { data: resultados = [], isLoading } = useQuery({
    queryKey: ['resultados', tareaId],
    queryFn: () => getResultados(tareaId),
  })

  const sorted = [...resultados].sort((a, b) =>
    sortAsc
      ? (a.calificacion ?? 0) - (b.calificacion ?? 0)
      : (b.calificacion ?? 0) - (a.calificacion ?? 0)
  )

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportarExcel(tareaId)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-brand hover:underline mb-1 inline-block">
            ← Volver
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Resultados</h2>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {exporting ? 'Exportando...' : '↓ Exportar Excel'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Cargando resultados...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Alumno</th>
                <th
                  className="text-left px-4 py-3 font-semibold text-gray-700 cursor-pointer hover:text-brand select-none"
                  onClick={() => setSortAsc(v => !v)}
                >
                  Calificación {sortAsc ? '↑' : '↓'}
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">IA %</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nivel IA</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.entrega_id}
                  className={`border-b border-gray-100 last:border-0 ${row.status === 'error' ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{row.alumno}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.status === 'error' ? (
                      <span className="text-red-600 text-xs font-medium">Error en revisión</span>
                    ) : row.calificacion != null ? (
                      row.calificacion.toFixed(1)
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.ia_probabilidad != null ? `${row.ia_probabilidad.toFixed(0)}%` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {row.ia_nivel_riesgo ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${NIVEL_BADGE[row.ia_nivel_riesgo] ?? 'bg-gray-100 text-gray-600'}`}>
                        {row.ia_nivel_riesgo}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {row.status !== 'error' && (
                      <button
                        onClick={() => navigate(`/entregas/${row.entrega_id}/detalle`)}
                        className="text-brand text-xs font-medium hover:underline"
                      >
                        Ver detalle
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
