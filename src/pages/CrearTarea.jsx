import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { createTarea } from '../api/tareas'
import { getRubricas } from '../api/rubricas'

const MODOS_IA = [
  { value: 'informativo', label: 'Informativo (no afecta calificación)' },
  { value: 'penalizacion_auto', label: 'Penalización automática' },
  { value: 'penalizacion_manual', label: 'Revisión manual por la maestra' },
]

export default function CrearTarea() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const grupoId = Number(searchParams.get('grupoId'))

  const [rubricas, setRubricas] = useState([])
  const [rubricaSeleccionada, setRubricaSeleccionada] = useState('')

  const [titulo, setTitulo] = useState('')
  const [criterios, setCriterios] = useState([{ nombre: '', ponderacion: '' }])
  const [iaActivo, setIaActivo] = useState(false)
  const [modoIA, setModoIA] = useState('informativo')
  const [penalizacionPct, setPenalizacionPct] = useState(10)
  const [error, setError] = useState('')

  useEffect(() => {
    getRubricas().then(r => setRubricas(r.data)).catch(() => {})
  }, [])

  const mutation = useMutation({
    mutationFn: createTarea,
    onSuccess: () => navigate(`/grupos/${grupoId}`),
    onError: () => setError('Error al crear la tarea. Verifica los datos.'),
  })

  const addCriterio = () => setCriterios(c => [...c, { nombre: '', ponderacion: '' }])
  const removeCriterio = (i) => setCriterios(c => c.filter((_, idx) => idx !== i))
  const updateCriterio = (i, field, value) =>
    setCriterios(c => c.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const totalPonderacion = criterios.reduce((sum, c) => sum + (parseFloat(c.ponderacion) || 0), 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (Math.abs(totalPonderacion - 100) > 0.01) {
      setError(`Las ponderaciones suman ${totalPonderacion}%. Deben sumar exactamente 100%.`)
      return
    }

    const payload = {
      titulo,
      grupo_id: grupoId,
      criterios: criterios.map(c => ({ nombre: c.nombre, ponderacion: parseFloat(c.ponderacion) })),
      config_ia: iaActivo
        ? { modo: modoIA, penalizacion_porcentaje: modoIA === 'penalizacion_auto' ? penalizacionPct : 0 }
        : { modo: 'desactivado', penalizacion_porcentaje: 0 },
    }
    mutation.mutate(payload)
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-brand hover:underline mb-4 inline-block">
          ← Volver
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nueva tarea</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título de la tarea</label>
            <input
              value={titulo} onChange={e => setTitulo(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Ej: Ensayo sobre la Revolución Francesa"
            />
          </div>

          {/* Selector de rúbrica */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usar rúbrica guardada <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <select
                value={rubricaSeleccionada}
                onChange={(e) => setRubricaSeleccionada(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">— Selecciona una rúbrica —</option>
                {rubricas.map(r => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const r = rubricas.find(x => x.id === parseInt(rubricaSeleccionada))
                  if (r) setCriterios(r.criterios.map(c => ({ nombre: c.nombre, ponderacion: String(c.ponderacion) })))
                }}
                disabled={!rubricaSeleccionada}
                className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-dark transition-colors"
              >
                Autocompletar
              </button>
              <a href="/rubricas" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                Gestionar rúbricas
              </a>
            </div>
          </div>

          {/* Criterios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Criterios de evaluación</label>
              <span className={`text-xs font-medium ${Math.abs(totalPonderacion - 100) < 0.01 ? 'text-green-600' : 'text-orange-500'}`}>
                Total: {totalPonderacion}%
              </span>
            </div>
            <div className="space-y-2">
              {criterios.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={c.nombre} onChange={e => updateCriterio(i, 'nombre', e.target.value)} required
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Nombre del criterio"
                  />
                  <input
                    type="number" min="0" max="100" value={c.ponderacion}
                    onChange={e => updateCriterio(i, 'ponderacion', e.target.value)} required
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="%"
                  />
                  {criterios.length > 1 && (
                    <button type="button" onClick={() => removeCriterio(i)}
                      className="text-red-400 hover:text-red-600 px-2">✕</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addCriterio}
              className="mt-2 text-sm text-brand hover:underline">
              + Agregar criterio
            </button>
          </div>

          {/* Detección IA */}
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Detección de IA</span>
              <button
                type="button"
                onClick={() => setIaActivo(v => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${iaActivo ? 'bg-brand' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${iaActivo ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {iaActivo && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Modo</label>
                  <select value={modoIA} onChange={e => setModoIA(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand">
                    {MODOS_IA.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                {modoIA === 'penalizacion_auto' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Porcentaje de penalización por nivel de riesgo alto
                    </label>
                    <input
                      type="number" min="0" max="100" value={penalizacionPct}
                      onChange={e => setPenalizacionPct(Number(e.target.value))}
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    <span className="ml-2 text-sm text-gray-500">%</span>
                  </div>
                )}
              </>
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-brand text-white py-2.5 rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {mutation.isPending ? 'Guardando...' : 'Crear tarea'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
