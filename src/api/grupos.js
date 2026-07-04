import client from './client'

export const getGrupos = () => client.get('/grupos').then(r => r.data)
export const createGrupo = (data) => client.post('/grupos', data).then(r => r.data)
export const getGrupo = (id) => client.get(`/grupos/${id}`).then(r => r.data)
export const updateGrupo = (id, data) => client.put(`/grupos/${id}`, data).then(r => r.data)
export const deleteGrupo = (id) => client.delete(`/grupos/${id}`)
