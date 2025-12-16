import api from './api'

export async function register({ name, email, password, role }) {
  const res = await api.post('/auth/register', { name, email, password, role })
  const { token, user } = res.data
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  // Notify listeners about auth change (useful to update UI)
  try { window.dispatchEvent(new Event('authChange')) } catch (err) { }
  return user
}

export async function login({ email, password }) {
  const res = await api.post('/auth/login', { email, password })
  const { token, user } = res.data
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  // Notify listeners about auth change
  try { window.dispatchEvent(new Event('authChange')) } catch (err) { }
  return user
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  // Notify listeners about auth change
  try { window.dispatchEvent(new Event('authChange')) } catch (err) { }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    return null
  }
}
