import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { setupAxiosInterceptors } from './services/axiosConfig'

// Tự động duy trì phiên đăng nhập và làm mới token (Refresh Token 7 ngày)
setupAxiosInterceptors()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
