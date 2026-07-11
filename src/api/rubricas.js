import client from './client'

export const getRubricas = () => client.get('/rubricas')
export const createRubrica = (data) => client.post('/rubricas', data)
export const getRubrica = (id) => client.get(`/rubricas/${id}`)
export const updateRubrica = (id, data) => client.put(`/rubricas/${id}`, data)
export const deleteRubrica = (id) => client.delete(`/rubricas/${id}`)
export const extraerRubrica = (file) => {
  const form = new FormData()
  form.append('file', file)
  return client.post('/rubricas/extraer', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const sugerirRubrica = (data) => client.post('/rubricas/sugerir', data)
