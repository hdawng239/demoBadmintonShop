import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setupAxiosInterceptors } from './services/axiosConfig'
import { themeService } from './services/themeService'

themeService.initTheme()
setupAxiosInterceptors()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
