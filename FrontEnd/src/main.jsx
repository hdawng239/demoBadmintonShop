import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setupAxiosInterceptors } from './services/axiosConfig.js'

// Tự động làm mới access token khi hết hạn (401) và đăng xuất khi 403/refresh lỗi.
setupAxiosInterceptors();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
