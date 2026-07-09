import client from './client';

export const getUsuarios = () => client.get('/admin/usuarios');
export const getUsuarioStats = (userId) => client.get(`/admin/usuarios/${userId}/stats`);
export const toggleUsuarioStatus = (userId) => client.patch(`/admin/usuarios/${userId}/toggle-status`);
export const deleteUsuario = (userId) => client.delete(`/admin/usuarios/${userId}`);
export const getGlobalStats = () => client.get('/admin/stats/global');
export const getMisStats = () => client.get('/auth/mis-stats');
