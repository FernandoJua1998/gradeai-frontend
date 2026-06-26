import client from './client'

export const subirEntregasLote = (tareaId, archivos) => {
  const form = new FormData()
  archivos.forEach(f => form.append('archivos', f))
  return client.post(`/entregas/lote/${tareaId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const getEntregas = (tareaId) => client.get(`/entregas/${tareaId}`).then(r => r.data)
