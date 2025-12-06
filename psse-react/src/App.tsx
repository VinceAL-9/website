import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { OrderProvider, UserAuthProvider } from './context';
import { Home, About, Events, Merchandise, AdminLogin, AdminRegister, AdminDashboard, UserLogin, UserRegister, VerifyEmail } from './pages';
import { ProtectedRoute } from './components/common';

function App() {
  return (
    <UserAuthProvider>
      <OrderProvider>
        <Toaster position="top-right" richColors />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/merchandise" element={<Merchandise />} />

            {/* User Routes */}
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/user/verify" element={<VerifyEmail />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route
              path="/admin/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </OrderProvider>
    </UserAuthProvider>
  );
}

export default App;

