import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import {
  getUsuarios,
  getUsuarioStats,
  toggleUsuarioStatus,
  deleteUsuario,
  getGlobalStats,
} from '../../api/admin'

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-brand mt-1">{value ?? '—'}</p>
    </div>
  )
}

function RoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
        admin
      </span>
    )
  }
  return (
    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
      teacher
    </span>
  )
}

function StatusBadge({ activo }) {
  if (activo) {
    return (
      <span className="inline-block bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
        Activo
      </span>
    )
  }
  return (
    <span className="inline-block bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
      Inactivo
    </span>
  )
}

function ModalStats({ usuario, stats, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Stats de {usuario.nombre}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {!stats ? (
          <p className="text-gray-400 text-sm">Cargando estadísticas...</p>
        ) : stats.por_mes && stats.por_mes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 text-gray-600 font-medium">Mes</th>
                  <th className="text-right py-2 pr-4 text-gray-600 font-medium">Revisiones</th>
                  <th className="text-right py-2 pr-4 text-gray-600 font-medium">Tokens Input</th>
                  <th className="text-right py-2 pr-4 text-gray-600 font-medium">Tokens Output</th>
                  <th className="text-right py-2 text-gray-600 font-medium">Costo (USD)</th>
                </tr>
              </thead>
              <tbody>
                {stats.por_mes.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-700">{row.mes}</td>
                    <td className="py-2 pr-4 text-right text-gray-700">{row.revisiones ?? '—'}</td>
                    <td className="py-2 pr-4 text-right text-gray-700">{row.tokens_input?.toLocaleString() ?? '—'}</td>
                    <td className="py-2 pr-4 text-right text-gray-700">{row.tokens_output?.toLocaleString() ?? '—'}</td>
                    <td className="py-2 text-right text-gray-700">
                      {row.costo != null ? `$${Number(row.costo).toFixed(6)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Sin datos de uso por el momento.</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [usuarios, setUsuarios] = useState([])
  const [globalStats, setGlobalStats] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const cargarDatos = async () => {
    try {
      setLoading(true)
      setError(null)
      const [usuariosRes, statsRes] = await Promise.all([
        getUsuarios(),
        getGlobalStats(),
      ])
      setUsuarios(usuariosRes.data)
      setGlobalStats(statsRes.data)
    } catch (err) {
      setError('Error al cargar los datos del panel de administración.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleVerStats = async (usuario) => {
    setSelectedUser(usuario)
    setUserStats(null)
    try {
      const res = await getUsuarioStats(usuario.id)
      setUserStats(res.data)
    } catch {
      setUserStats({ por_mes: [] })
    }
  }

  const handleToggle = async (userId) => {
    try {
      await toggleUsuarioStatus(userId)
      setUsuarios(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: !u.is_active } : u
      ))
    } catch {
      alert('Error al cambiar el estado del usuario.')
    }
  }

  const handleEliminar = async (usuario) => {
    const confirmar = window.confirm(`¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)
    if (!confirmar) return
    try {
      await deleteUsuario(usuario.id)
      await cargarDatos()
    } catch {
      alert('Error al eliminar el usuario.')
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Panel de Administración</h2>
        <p className="text-gray-500 text-sm mt-0.5">Gestión de usuarios y métricas globales</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando datos...</p>
      ) : (
        <>
          {/* Stats globales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total usuarios" value={globalStats?.total_usuarios} />
            <StatCard label="Total tareas" value={globalStats?.total_tareas} />
            <StatCard label="Total entregas" value={globalStats?.total_entregas} />
            <StatCard
              label="Costo total estimado"
              value={
                globalStats?.costo_total != null
                  ? `$${Number(globalStats.costo_total).toFixed(6)}`
                  : '—'
              }
            />
          </div>

          {/* Tabla de usuarios */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Usuarios</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Estado</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Tareas</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Entregas</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Tokens</th>
                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Costo</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                        Sin usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    usuarios.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{u.nombre}</td>
                        <td className="px-4 py-3 text-gray-600">{u.email}</td>
                        <td className="px-4 py-3">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge activo={u.is_active !== false} />
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{u.total_tareas ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{u.total_entregas ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {u.tokens_consumidos != null ? u.tokens_consumidos.toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {u.costo_estimado != null ? `$${Number(u.costo_estimado).toFixed(6)}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerStats(u)}
                              className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                            >
                              Ver stats
                            </button>
                            <button
                              onClick={() => handleToggle(u.id)}
                              className="text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                            >
                              {u.is_active !== false ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                              onClick={() => handleEliminar(u)}
                              className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedUser && (
        <ModalStats
          usuario={selectedUser}
          stats={userStats}
          onClose={() => {
            setSelectedUser(null)
            setUserStats(null)
          }}
        />
      )}
    </Layout>
  )
}
