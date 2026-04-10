import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import Layout from './components/Layout'
import './index.css'

function PrivateRoute({ children, requireRole }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (requireRole === 'admin'   && user.role !== 'admin')  return <Navigate to="/app/transactions" replace />
  if (requireRole === 'analyst' && user.role === 'viewer') return <Navigate to="/app/transactions" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/"         element={user ? <Navigate to="/app" replace /> : <Landing />} />
      <Route path="/login"    element={user ? <Navigate to="/app" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/app" replace /> : <Register />} />
      <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to={user?.role === 'viewer' ? '/app/transactions' : '/app/dashboard'} replace />} />
        <Route path="dashboard"    element={<PrivateRoute requireRole="analyst"><Dashboard /></PrivateRoute>} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="users"        element={<PrivateRoute requireRole="admin"><Users /></PrivateRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
