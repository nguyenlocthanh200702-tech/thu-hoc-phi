import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import LoginPage from './pages/LoginPage'
import MainLayout from './components/MainLayout'
import LoadingSpinner from './components/LoadingSpinner'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      {user ? (
        <MainLayout user={user} />
      ) : (
        <LoginPage setUser={setUser} />
      )}
    </Router>
  )
}
