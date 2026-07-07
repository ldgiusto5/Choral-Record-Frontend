const API_URL = import.meta.env.VITE_API_URL

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
})

export const loginUser = async (credentials) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')
    return data
}

export const registerUser = async (userData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al registrarse')
    return data
}

export const getProfile = async () => {
    const res = await fetch(`${API_URL}/auth/profile`, {
        headers: getAuthHeaders()
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al obtener perfil')
    return data
}
