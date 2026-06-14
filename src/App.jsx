import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout'

export default function App() {
  const [user, setUser] = useState({ id: 'demo', email: 'demo@app.local' })

  return (
    <Router>
      <MainLayout user={user} />
    </Router>
  )
}
