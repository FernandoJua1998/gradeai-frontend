import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Layout from '../components/Layout'
import { getGrupos, createGrupo } from '../api/grupos'

function GrupoCard({ grupo, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-brand hover:shadow-md transition-all"
    >
      <p className="font-semibold text-gray-900">{grupo.nombre}</p>
      <p className="text-sm text-gray-500 mt-1">{grupo.materia} · {grupo.ciclo}</p>
    </button>
  )
}

function ModalCrearGrupo({ onClose, onCreate }) {
  const [form, setForm] = useState({ nombre: '', materia: '', ciclo: '' })

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreate(form)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Nuevo grupo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grupo</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Ej: 3°A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
            <input name="materia" value={form.materia} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Ej: Matemáticas" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo escolar</label>
            <input name="ciclo" value={form.ciclo} onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Ej: 2024-2025" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 bg-brand text-white py-2 rounded-lg text-sm font-medium hover:bg-brand-dark">
              Crear grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)

  const { data: grupos = [], isLoading } = useQuery({
    queryKey: ['grupos'],
    queryFn: getGrupos,
  })

  const mutation = useMutation({
    mutationFn: createGrupo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grupos'] })
      setShowModal(false)
    },
  })

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis grupos</h2>
          <p className="text-gray-500 text-sm mt-0.5">Selecciona un grupo para ver sus tareas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          + Nuevo grupo
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Cargando grupos...</p>
      ) : grupos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-400">
          <p className="text-lg font-medium text-gray-500">Sin grupos aún</p>
          <p className="text-sm mt-1">Crea tu primer grupo para empezar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map(g => (
            <GrupoCard key={g.id} grupo={g} onClick={() => navigate(`/grupos/${g.id}`)} />
          ))}
        </div>
      )}

      {showModal && (
        <ModalCrearGrupo
          onClose={() => setShowModal(false)}
          onCreate={(data) => mutation.mutate(data)}
        />
      )}
    </Layout>
  )
}
