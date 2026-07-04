import client from './client'

export const iniciarRevision = (tareaId) =>
  client.post(`/revision/${tareaId}`).then(r => r.data)

export const getStatus = (tareaId) =>
  client.get(`/revision/status/${tareaId}`).then(r => r.data)

export const getResultados = (tareaId) =>
  client.get(`/resultados/${tareaId}`).then(r => r.data)

export const getDetalleAlumno = (entregaId) =>
  client.get(`/resultados/alumno/${entregaId}`).then(r => r.data)

export const exportarExcel = async (tareaId) => {
  const response = await client.get(`/exportar/${tareaId}`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `resultados_${tareaId}.xlsx`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
