import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Grupo from './pages/Grupo'
import CrearTarea from './pages/CrearTarea'
import SubirTareas from './pages/SubirTareas'
import Revision from './pages/Revision'
import Resultados from './pages/Resultados'
import DetalleAlumno from './pages/DetalleAlumno'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminPanel from './pages/admin/AdminPanel'

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

function Admin({ children }) {
  return <AdminRoute>{children}</AdminRoute>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/grupos/:id" element={<Protected><Grupo /></Protected>} />
      <Route path="/tareas/nueva" element={<Protected><CrearTarea /></Protected>} />
      <Route path="/tareas/:id/subir" element={<Protected><SubirTareas /></Protected>} />
      <Route path="/tareas/:tareaId/revision" element={<Protected><Revision /></Protected>} />
      <Route path="/tareas/:tareaId/resultados" element={<Protected><Resultados /></Protected>} />
      <Route path="/entregas/:entregaId/detalle" element={<Protected><DetalleAlumno /></Protected>} />
      <Route path="/admin" element={<Admin><AdminPanel /></Admin>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
