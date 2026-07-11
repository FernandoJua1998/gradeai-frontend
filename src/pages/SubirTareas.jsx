import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import Layout from '../components/Layout'
import { subirEntregasLote } from '../api/entregas'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function SubirTareas() {
  const { id: tareaId } = useParams()
  const navigate = useNavigate()
  const [archivos, setArchivos] = useState([])
  const [subiendo, setSubiendo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted) => {
    setArchivos(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      const nuevos = accepted.filter(f => !existingNames.has(f.name))
      return [...prev, ...nuevos]
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'application/msword': ['.doc'] },
    multiple: true,
  })

  const removeFile = (name) => setArchivos(prev => prev.filter(f => f.name !== name))

  const handleSubir = async () => {
    if (subiendo) return  // prevenir doble click
    if (archivos.length === 0) return
    setSubiendo(true)
    setError('')
    setProgreso(10)
    try {
      setProgreso(50)
      const entregas = await subirEntregasLote(tareaId, archivos)
      setProgreso(100)
      setResultado(entregas)
      setArchivos([])
    } catch {
      setError('Error al subir los archivos. Verifica que sean PDF o Word.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-brand hover:underline mb-4 inline-block">
          ← Volver
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Subir tareas de alumnos</h2>

        {!resultado ? (
          <>
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-brand bg-blue-50' : 'border-gray-300 hover:border-brand hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 font-medium">
                {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz click para seleccionar'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF y Word (.docx, .doc). El nombre del archivo = nombre del alumno.</p>
            </div>

            {/* File list */}
            {archivos.length > 0 && (
              <div className="mt-4 space-y-2">
                {archivos.map(f => (
                  <div key={f.name} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{f.name}</p>
                      <p className="text-xs text-gray-400">{formatBytes(f.size)}</p>
                    </div>
                    <button onClick={() => removeFile(f.name)} className="text-gray-400 hover:text-red-500 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Progress bar */}
            {subiendo && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">Subiendo archivos...</p>
              </div>
            )}

            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

            <button
              onClick={handleSubir}
              disabled={archivos.length === 0 || subiendo}
              className="mt-5 w-full bg-brand text-white py-2.5 rounded-lg font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {subiendo ? 'Subiendo...' : `Subir ${archivos.length} archivo${archivos.length !== 1 ? 's' : ''}`}
            </button>
          </>
        ) : (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-green-700 font-medium">✓ {resultado.length} entrega{resultado.length !== 1 ? 's' : ''} registrada{resultado.length !== 1 ? 's' : ''} correctamente</p>
            </div>
            <div className="space-y-2">
              {resultado.map(e => (
                <div key={e.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-gray-900">{e.archivo_path.split('/').pop()}</p>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{e.status}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-5 w-full border border-brand text-brand py-2.5 rounded-lg font-semibold hover:bg-brand hover:text-white transition-colors"
            >
              Volver al grupo
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
