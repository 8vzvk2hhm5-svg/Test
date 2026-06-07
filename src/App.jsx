import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { PicksProvider } from './context/PicksContext.jsx'
import AuthPage from './pages/AuthPage.jsx'
import HomePage from './pages/HomePage.jsx'
import GroupStagePage from './pages/GroupStagePage.jsx'
import KnockoutPage from './pages/KnockoutPage.jsx'
import MyGroupsPage from './pages/MyGroupsPage.jsx'
import GroupDetailPage from './pages/GroupDetailPage.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }
  return <Navigate to={user ? '/home' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <PicksProvider>
              <HomePage />
            </PicksProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/picks/group-stage"
        element={
          <ProtectedRoute>
            <PicksProvider>
              <GroupStagePage />
            </PicksProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/picks/knockout"
        element={
          <ProtectedRoute>
            <PicksProvider>
              <KnockoutPage />
            </PicksProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <PicksProvider>
              <MyGroupsPage />
            </PicksProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <PicksProvider>
              <GroupDetailPage />
            </PicksProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
