import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Grupo from './pages/Grupo'
import CrearTarea from './pages/CrearTarea'
import SubirTareas from './pages/SubirTareas'
import ProtectedRoute from './components/ProtectedRoute'

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/grupos/:id" element={<Protected><Grupo /></Protected>} />
      <Route path="/tareas/nueva" element={<Protected><CrearTarea /></Protected>} />
      <Route path="/tareas/:id/subir" element={<Protected><SubirTareas /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
