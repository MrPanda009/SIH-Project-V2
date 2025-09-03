import React, { useState, useEffect } from 'react'
import { Toaster } from './components/ui/sonner'
import AuthLogin from './components/AuthLogin'
import AuthSignup from './components/AuthSignup'
import RoleSelection from './components/RoleSelection'
import CitizenDashboard from './components/CitizenDashboard'
import AuthorityDashboard from './components/AuthorityDashboard'
import { authAPI } from './utils/api'

type AppState = 'loading' | 'login' | 'signup' | 'role-selection' | 'citizen-dashboard' | 'authority-dashboard'

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [user, setUser] = useState(null as any)

  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      const session = await authAPI.getSession()
      if (session?.user) {
        setUser(session.user)
        
        // Check if user has dual roles or determine portal
        const userRole = session.user.user_metadata?.role
        if (userRole === 'authority') {
          setAppState('authority-dashboard')
        } else if (userRole === 'citizen') {
          setAppState('citizen-dashboard')
        } else {
          // If no specific role or dual role, show role selection
          setAppState('role-selection')
        }
      } else {
        setAppState('login')
      }
    } catch (error) {
      console.error('Error checking session:', error)
      setAppState('login')
    }
  }

  const handleLoginSuccess = async () => {
    try {
      const session = await authAPI.getSession()
      if (session?.user) {
        setUser(session.user)
        
        const userRole = session.user.user_metadata?.role
        if (userRole === 'authority') {
          setAppState('authority-dashboard')
        } else if (userRole === 'citizen') {
          setAppState('citizen-dashboard')
        } else {
          setAppState('role-selection')
        }
      }
    } catch (error) {
      console.error('Error after login:', error)
      setAppState('role-selection')
    }
  }

  const handleSignupSuccess = () => {
    handleLoginSuccess()
  }

  const handleRoleSelect = (role: 'citizen' | 'authority') => {
    if (role === 'citizen') {
      setAppState('citizen-dashboard')
    } else {
      setAppState('authority-dashboard')
    }
  }

  const handleLogout = () => {
    setUser(null)
    setAppState('login')
  }

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl mb-2">Civic Issue Reporting Platform</h2>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Authentication Views */}
      {appState === 'login' && (
        <AuthLogin 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setAppState('signup')}
        />
      )}

      {appState === 'signup' && (
        <AuthSignup 
          onSignupSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setAppState('login')}
        />
      )}

      {/* Role Selection */}
      {appState === 'role-selection' && (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      )}

      {/* Citizen Dashboard */}
      {appState === 'citizen-dashboard' && (
        <CitizenDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Authority Dashboard */}
      {appState === 'authority-dashboard' && (
        <AuthorityDashboard 
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  )
}