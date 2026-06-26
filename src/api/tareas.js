import client from './client'

export const getTareas = (grupoId) => client.get(`/grupos/${grupoId}/tareas`).then(r => r.data)
export const createTarea = (data) => client.post('/tareas', data).then(r => r.data)
export const getTarea = (id) => client.get(`/tareas/${id}`).then(r => r.data)
export const updateTarea = (id, data) => client.put(`/tareas/${id}`, data).then(r => r.data)
export const deleteTarea = (id) => client.delete(`/tareas/${id}`)
