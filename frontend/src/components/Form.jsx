import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../api"

function Form({action}) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()
    
    const isRegister = action === "Register"
    const isLogin = action === "Login"

    const apiCall = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        
        try {
            if (isLogin) {
                const res = await api.post("api/token/", {username, password})
                localStorage.setItem("username", username)
                navigate("/home")
            }
            else {
                await api.post("api/user/register/", {username, password})
                navigate("/login")
            }
        }
        catch (error) {
            if (error.response?.data) {
                const errorData = error.response.data
                if (errorData.username) {
                    setError(errorData.username[0])
                } else if (errorData.non_field_errors) {
                    setError(errorData.non_field_errors[0])
                } else {
                    const firstError = Object.values(errorData)[0]
                    setError(Array.isArray(firstError) ? firstError[0] : firstError)
                }
            } else {
                setError('An error occurred. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    } 

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 bg-black rounded-xl flex items-center justify-center mb-4">🔒</div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {isRegister ? "Create Account" : "Welcome Back"}
                        </h2>
                        <p className="text-gray-600">
                            {isRegister ? "Sign up to start tracking your finances" : "Sign in to your account"}
                        </p>
                    </div>

                    <form onSubmit={apiCall} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">❌</div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-black">👤</span>
                                </div>
                                <input 
                                    id="username"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                    type="text" 
                                    placeholder="Enter your username"
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-black">🔒</span>
                                </div>
                                <input 
                                    id="password"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-gray-900 placeholder-gray-500"
                                    type="password" 
                                    placeholder="Enter your password"
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    {isRegister ? "Creating Account..." : "Signing In..."}
                                </div>
                            ) : (
                                isRegister ? "Create Account" : "Sign In"
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                {isRegister ? "Already have an account?" : "Don't have an account?"}
                                <Link 
                                    to={isRegister ? "/login" : "/register"} 
                                    className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                                >
                                    {isRegister ? "Sign in" : "Sign up"}
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Form