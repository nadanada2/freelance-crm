import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'

import Login     from './pages/Login'
import Register  from './pages/Register'
import Dashboard from './pages/Dashboard'
import Clients   from './pages/Clients'
import Projects  from './pages/Projects'
import Invoices  from './pages/Invoices'
import Reminders from './pages/Reminders'

import Profile from './pages/Profile'

import Pipeline      from './pages/Pipeline'
import ClientDetail  from './pages/ClientDetail'
import TimeTracking  from './pages/TimeTracking'



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/clients"   element={<PrivateRoute><Layout><Clients /></Layout></PrivateRoute>} />
          <Route path="/projects"  element={<PrivateRoute><Layout><Projects /></Layout></PrivateRoute>} />
          <Route path="/invoices"  element={<PrivateRoute><Layout><Invoices /></Layout></PrivateRoute>} />
          <Route path="/reminders" element={<PrivateRoute><Layout><Reminders /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          
          <Route path="/pipeline"        element={<PrivateRoute><Layout><Pipeline /></Layout></PrivateRoute>} />
          <Route path="/clients/:id"     element={<PrivateRoute><Layout><ClientDetail /></Layout></PrivateRoute>} />
          <Route path="/time-tracking"   element={<PrivateRoute><Layout><TimeTracking /></Layout></PrivateRoute>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App