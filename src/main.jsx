import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // <--- CORRECCIÓN: Apuntando directamente al archivo en src

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)