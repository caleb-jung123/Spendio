import {Navigate} from "react-router-dom"
import api from "../api"
import { useState, useEffect } from "react"
import Chat from "./Chat"
import { isAuthenticated, refreshToken } from "../utils/auth"

function Lock({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null)

    useEffect(() => {
        checkAccess()
    }, [])

    const checkAccess = async () => {
        try {
            const authenticated = await isAuthenticated(api)
            if (authenticated) {
                setIsAuthorized(true)
                return
            }
            
            const refreshed = await refreshToken(api)
            if (refreshed) {
                setIsAuthorized(true)
                return
            }
            
            setIsAuthorized(false)
        } catch (error) {
            setIsAuthorized(false)
        }
    }

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Awaiting Authorization...</p>
                </div>
            </div>
        )
    }

    if (isAuthorized === true) {
        return (
            <>
                {children}
                <Chat />
            </>
        )
    }
    else {
        return <Navigate to="/login" />
    }
}

export default Lock