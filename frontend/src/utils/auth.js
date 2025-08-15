export const isAuthenticated = async (api) => {
    try {
        const response = await api.get('/api/expenses/')
        return response.status === 200
    } catch (error) {
        return false
    }
}

export const refreshToken = async (api) => {
    try {
        const response = await api.post('api/token/refresh/')
        return response.status === 200
    } catch (error) {
        return false
    }
}

export const logout = async (api) => {
    try {
        await api.post('/api/logout/')
    } catch (error) {
        // Continue with logout even if the request fails
    } finally {
        localStorage.clear()
    }
}

export const getCSRFToken = () => {
    const name = 'csrftoken'
    let cookieValue = null
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim()
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
                break
            }
        }
    }
    return cookieValue
}
