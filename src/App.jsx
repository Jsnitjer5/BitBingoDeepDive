import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/home'
import Register from './pages/register'
import Quiz from './pages/quiz'
import Admin from './pages/admin'
import ThankYou from './pages/bedankt'

function App() {
  useEffect(() => {
    if (!localStorage.getItem('teams')) {
      localStorage.setItem('teams', JSON.stringify([]));
    }
    if (!localStorage.getItem('submissions')) {
      localStorage.setItem('submissions', JSON.stringify([]));
    }
  }, []);

  return (
    <div className="bg-black min-h-screen w-full">
      <Router>
        <Routes>
          <Route path="/home" element={<Home />} />
          {/* Standaard link */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/bedankt" element={<ThankYou />} />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App