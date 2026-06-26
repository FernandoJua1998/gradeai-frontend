import client from './client'

export const getAlumnos = (grupoId) => client.get(`/grupos/${grupoId}/alumnos`).then(r => r.data)
export const createAlumno = (grupoId, data) => client.post(`/grupos/${grupoId}/alumnos`, data).then(r => r.data)
export const updateAlumno = (id, data) => client.put(`/alumnos/${id}`, data).then(r => r.data)
export const deleteAlumno = (id) => client.delete(`/alumnos/${id}`)
