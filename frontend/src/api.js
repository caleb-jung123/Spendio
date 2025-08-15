import axios from "axios"
import { getCSRFToken } from "./utils/auth"

const api = axios.create({
    baseURL: import.meta.env.VITE_URL || "http://localhost:8000",
    withCredentials: true  
})

api.interceptors.request.use(
    (config) => {
        if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
            const csrfToken = getCSRFToken()
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

export default api