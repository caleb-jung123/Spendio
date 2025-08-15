import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// Initialize React application with StrictMode for development checks
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
