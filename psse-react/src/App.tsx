import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrderProvider } from './context';
import { Home, About, Events, Merchandise, AdminLogin } from './pages';
import { ProtectedRoute } from './components/common';

// Placeholder for admin dashboard - to be implemented
const AdminDashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-psse-primary">Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome to the admin panel</p>
      <button
        onClick={() => {
          localStorage.removeItem('access_token');
          window.location.href = '/admin/login';
        }}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  </div>
);

function App() {
  return (
    <OrderProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/merchandise" element={<Merchandise />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </OrderProvider>
  );
}

export default App;
