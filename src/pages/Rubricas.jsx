import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import {
  getRubricas,
  createRubrica,
  updateRubrica,
  deleteRubrica,
  extraerRubrica,
  sugerirRubrica,
} from '../api/rubricas'

const TIPOS_TAREA = ['Ensayo', 'Examen', 'Ejercicio', 'Proyecto', 'Presentación', 'Otro']

function CriteriosEditor({ criterios, setCriterios }) {
  const total = criterios.reduce((sum, c) => sum + (parseFloat(c.ponderacion) || 0), 0)
  const isValid = Math.abs(total - 100) < 0.01

  const addCriterio = () => setCriterios(prev => [...prev, { nombre: '', ponderacion: '' }])
  const removeCriterio = (i) => setCriterios(prev => prev.filter((_, idx) => idx !== i))
  const updateCriterio = (i, field, value) =>
    setCriterios(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">Criterios</label>
        <span className={`text-xs font-medium ${isValid ? 'text-green-600' : 'text-red-500'}`}>
          Total: {total}% de 100%
        </span>
      </div>
      <div className="space-y-2">
        {criterios.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={c.nombre}
              onChange={e => updateCriterio(i, 'nombre', e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Nombre del criterio"
            />
            <input
              type="number" min="0" max="100"
              value={c.ponderacion}
              onChange={e => updateCriterio(i, 'ponderacion', e.target.value)}
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
  )
}

function EditableRubricaForm({ nombre, setNombre, descripcion, setDescripcion, criterios, setCriterios, onSave, onBack, backLabel }) {
  const total = criterios.reduce((sum, c) => sum + (parseFloat(c.ponderacion) || 0), 0)
  const isValid = Math.abs(total - 100) < 0.01 && nombre.trim()

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="Ej: Rúbrica de ensayo"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
        <input
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="Breve descripción de la rúbrica"
        />
      </div>
      <CriteriosEditor criterios={criterios} setCriterios={setCriterios} />
      <div className="flex gap-3 pt-2">
        {onBack && (
          <button type="button" onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            {backLabel || 'Volver'}
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="flex-1 bg-brand text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-dark transition-colors"
        >
          Guardar Rúbrica
        </button>
      </div>
    </div>
  )
}

export default function Rubricas() {
  const [rubricas, setRubricas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('manual')
  const [expandedId, setExpandedId] = useState(null)

  // Form manual
  const [formNombre, setFormNombre] = useState('')
  const [formDescripcion, setFormDescripcion] = useState('')
  const [formCriterios, setFormCriterios] = useState([{ nombre: '', ponderacion: '' }])

  // Subir archivo
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [extractedRubrica, setExtractedRubrica] = useState(null)

  // Sugerir IA
  const [sugerirForm, setSugerirForm] = useState({ nombre_tarea: '', materia: '', nivel_escolar: '', tipo_tarea: '' })
  const [suggesting, setSuggesting] = useState(false)
  const [suggestedRubrica, setSuggestedRubrica] = useState(null)

  // Eliminación
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Edit mode
  const [editingId, setEditingId] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editCriterios, setEditCriterios] = useState([])

  const loadRubricas = () => {
    setLoading(true)
    getRubricas()
      .then(r => setRubricas(r.data))
      .catch(() => setRubricas([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadRubricas()
  }, [])

  const resetModal = () => {
    setActiveTab('manual')
    setFormNombre('')
    setFormDescripcion('')
    setFormCriterios([{ nombre: '', ponderacion: '' }])
    setUploadFile(null)
    setUploading(false)
    setExtractedRubrica(null)
    setSugerirForm({ nombre_tarea: '', materia: '', nivel_escolar: '', tipo_tarea: '' })
    setSuggesting(false)
    setSuggestedRubrica(null)
  }

  const handleSaveManual = () => {
    createRubrica({
      nombre: formNombre,
      descripcion: formDescripcion,
      criterios: formCriterios.map(c => ({ nombre: c.nombre, ponderacion: parseFloat(c.ponderacion) })),
    })
      .then(() => {
        setShowModal(false)
        resetModal()
        loadRubricas()
      })
      .catch(() => {})
  }

  const handleExtraer = () => {
    if (!uploadFile) return
    setUploading(true)
    extraerRubrica(uploadFile)
      .then(r => {
        const data = r.data
        setFormNombre(data.nombre || '')
        setFormDescripcion(data.descripcion || '')
        setFormCriterios(
          (data.criterios || []).map(c => ({ nombre: c.nombre, ponderacion: String(c.ponderacion) }))
        )
        setExtractedRubrica(data)
      })
      .catch(() => {})
      .finally(() => setUploading(false))
  }

  const handleSugerir = () => {
    if (!sugerirForm.nombre_tarea || !sugerirForm.materia || !sugerirForm.nivel_escolar || !sugerirForm.tipo_tarea) return
    setSuggesting(true)
    sugerirRubrica(sugerirForm)
      .then(r => {
        const data = r.data
        setFormNombre(data.nombre || '')
        setFormDescripcion(data.descripcion || '')
        setFormCriterios(
          (data.criterios || []).map(c => ({ nombre: c.nombre, ponderacion: String(c.ponderacion) }))
        )
        setSuggestedRubrica(data)
      })
      .catch(() => {})
      .finally(() => setSuggesting(false))
  }

  const handleSaveExtracted = () => {
    createRubrica({
      nombre: formNombre,
      descripcion: formDescripcion,
      criterios: formCriterios.map(c => ({ nombre: c.nombre, ponderacion: parseFloat(c.ponderacion) })),
    })
      .then(() => {
        setShowModal(false)
        resetModal()
        loadRubricas()
      })
      .catch(() => {})
  }

  const handleDelete = (id) => {
    deleteRubrica(id)
      .then(() => {
        setDeleteConfirm(null)
        loadRubricas()
      })
      .catch(() => setDeleteConfirm(null))
  }

  const startEdit = (r) => {
    setEditingId(r.id)
    setEditNombre(r.nombre)
    setEditDescripcion(r.descripcion || '')
    setEditCriterios((r.criterios || []).map(c => ({ nombre: c.nombre, ponderacion: String(c.ponderacion) })))
  }

  const handleSaveEdit = (id) => {
    updateRubrica(id, {
      nombre: editNombre,
      descripcion: editDescripcion,
      criterios: editCriterios.map(c => ({ nombre: c.nombre, ponderacion: parseFloat(c.ponderacion) })),
    })
      .then(() => {
        setEditingId(null)
        loadRubricas()
      })
      .catch(() => {})
  }

  const tabs = [
    { key: 'manual', label: 'Crear manualmente' },
    { key: 'subir', label: 'Subir PDF/Word' },
    { key: 'sugerir', label: 'Sugerir con IA' },
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Rúbricas</h2>
          <p className="text-gray-500 text-sm mt-0.5">Gestiona tus rúbricas de evaluación reutilizables</p>
        </div>
        <button
          onClick={() => { resetModal(); setShowModal(true) }}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          + Nueva Rúbrica
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : rubricas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
          <p className="text-lg font-medium text-gray-500">Sin rúbricas aún</p>
          <p className="text-sm mt-1">Crea tu primera rúbrica.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rubricas.map(r => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {editingId === r.id ? (
                <div className="p-5 space-y-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Editar rúbrica</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <input
                      value={editDescripcion}
                      onChange={e => setEditDescripcion(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <CriteriosEditor criterios={editCriterios} setCriterios={setEditCriterios} />
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(r.id)}
                      className="flex-1 bg-brand text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-dark transition-colors"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">{r.nombre}</p>
                        {r.descripcion && (
                          <p className="text-sm text-gray-500 mt-0.5 truncate">{r.descripcion}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2.5 py-0.5 font-medium">
                        {(r.criterios || []).length} criterios
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); startEdit(r) }}
                        className="text-sm text-brand hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setDeleteConfirm(r.id) }}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                      <span className="text-gray-300 ml-1 select-none">
                        {expandedId === r.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {expandedId === r.id && (
                    <div className="px-5 pb-5">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 text-gray-500 font-medium">Criterio</th>
                            <th className="text-right py-2 text-gray-500 font-medium w-32">Ponderación (%)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(r.criterios || []).map((c, i) => (
                            <tr key={i} className="border-b border-gray-50 last:border-0">
                              <td className="py-2 text-gray-700">{c.nombre}</td>
                              <td className="py-2 text-right text-gray-700">{c.ponderacion}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Rúbrica */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Nueva Rúbrica</h3>
              <button
                onClick={() => { setShowModal(false); resetModal() }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === t.key
                      ? 'text-brand border-b-2 border-brand'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-6">
              {/* Tab: Crear manualmente */}
              {activeTab === 'manual' && (
                <EditableRubricaForm
                  nombre={formNombre}
                  setNombre={setFormNombre}
                  descripcion={formDescripcion}
                  setDescripcion={setFormDescripcion}
                  criterios={formCriterios}
                  setCriterios={setFormCriterios}
                  onSave={handleSaveManual}
                />
              )}

              {/* Tab: Subir PDF/Word */}
              {activeTab === 'subir' && (
                <>
                  {!extractedRubrica ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF o Word</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={e => setUploadFile(e.target.files[0] || null)}
                          className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand file:text-white hover:file:bg-brand-dark"
                        />
                      </div>
                      {uploading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="animate-spin h-4 w-4 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Extrayendo rúbrica con IA...
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleExtraer}
                          disabled={!uploadFile}
                          className="w-full bg-brand text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-dark transition-colors"
                        >
                          Extraer Rúbrica
                        </button>
                      )}
                    </div>
                  ) : (
                    <EditableRubricaForm
                      nombre={formNombre}
                      setNombre={setFormNombre}
                      descripcion={formDescripcion}
                      setDescripcion={setFormDescripcion}
                      criterios={formCriterios}
                      setCriterios={setFormCriterios}
                      onSave={handleSaveExtracted}
                      onBack={() => { setExtractedRubrica(null); setUploadFile(null) }}
                      backLabel="Volver a subir"
                    />
                  )}
                </>
              )}

              {/* Tab: Sugerir con IA */}
              {activeTab === 'sugerir' && (
                <>
                  {!suggestedRubrica ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la tarea</label>
                        <input
                          value={sugerirForm.nombre_tarea}
                          onChange={e => setSugerirForm(f => ({ ...f, nombre_tarea: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          placeholder="Ej: Ensayo sobre la Revolución Francesa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                        <input
                          value={sugerirForm.materia}
                          onChange={e => setSugerirForm(f => ({ ...f, materia: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          placeholder="Ej: Historia"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel escolar</label>
                        <input
                          value={sugerirForm.nivel_escolar}
                          onChange={e => setSugerirForm(f => ({ ...f, nivel_escolar: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                          placeholder="Ej: Preparatoria"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de tarea</label>
                        <select
                          value={sugerirForm.tipo_tarea}
                          onChange={e => setSugerirForm(f => ({ ...f, tipo_tarea: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                        >
                          <option value="">— Selecciona —</option>
                          {TIPOS_TAREA.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      {suggesting ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg className="animate-spin h-4 w-4 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Generando sugerencia con IA...
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSugerir}
                          disabled={!sugerirForm.nombre_tarea || !sugerirForm.materia || !sugerirForm.nivel_escolar || !sugerirForm.tipo_tarea}
                          className="w-full bg-brand text-white py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-brand-dark transition-colors"
                        >
                          Sugerir Rúbrica
                        </button>
                      )}
                    </div>
                  ) : (
                    <EditableRubricaForm
                      nombre={formNombre}
                      setNombre={setFormNombre}
                      descripcion={formDescripcion}
                      setDescripcion={setFormDescripcion}
                      criterios={formCriterios}
                      setCriterios={setFormCriterios}
                      onSave={handleSaveExtracted}
                      onBack={() => setSuggestedRubrica(null)}
                      backLabel="Generar otra sugerencia"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <p className="font-semibold text-gray-900 mb-4">¿Eliminar esta rúbrica?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
