import { create } from 'zustand'
import { login as loginApi, getMe } from '../api/auth'

const storedToken = localStorage.getItem('token')
const storedUser = localStorage.getItem('user')

const useAuthStore = create((set) => ({
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,

  login: async (email, password) => {
    const { access_token } = await loginApi(email, password)
    set({ token: access_token })
    const user = await getMe()
    set({ user })
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  setAuth: (token, user) => {
    set({ token, user })
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  logout: () => {
    set({ token: null, user: null })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('gradeai-auth')
  },
}))

export default useAuthStore
