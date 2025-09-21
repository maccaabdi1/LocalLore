import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'  

function App() {
  return (
    <div>
      <nav>
        <Link to="/dashboard">Dashboard</Link> | 
        <Link to="/">Landing</Link>
      </nav>

      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Landing />} />
      </Routes>
    </div>
  )
}

export default App
