import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import './App.css'
import Home from './pages/Home'
import ExpensePage from './pages/ExpensePage'
import CalendarPage from './pages/CalendarPage'
import Subscriptions from './pages/Subscriptions'
import Login from './pages/Login'
import Register from './pages/Register'
import Lock from './components/Lock'
import api from './api'
import { logout } from './utils/auth'

function Logout() {
    logout(api)
    return <Navigate to="/login" />
}

function RegisterAndLogout() {
    localStorage.clear()
    return <Register />
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Lock><Home /></Lock>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterAndLogout />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/expenses" element={<Lock><ExpensePage /></Lock>} />
                <Route path="/subscriptions" element={<Lock><Subscriptions /></Lock>} />
                <Route path="/calendar" element={<Lock><CalendarPage /></Lock>} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
