import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'  

function App() {
  return (
    <div>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </div>
  )
}

export default App
