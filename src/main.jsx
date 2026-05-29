import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { StockProvider } from './context/StockContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StockProvider>
        <App />
      </StockProvider>
    </AuthProvider>
  </React.StrictMode>
)
