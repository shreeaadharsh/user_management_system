import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import UserDetail from './pages/UserDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2040',
              color: '#f0f2ff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              fontSize: 14,
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#1a2040' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1a2040' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected: requires auth */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin + Manager only */}
              <Route element={<RoleRoute allowedRoles={['admin', 'manager']} />}>
                <Route path="/users" element={<UserList />} />
                <Route path="/users/:id" element={<UserDetail />} />
              </Route>
            </Route>
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
