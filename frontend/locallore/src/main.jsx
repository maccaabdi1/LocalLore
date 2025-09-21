import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import 'primereact/resources/themes/lara-light-blue/theme.css';  // pick one theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)