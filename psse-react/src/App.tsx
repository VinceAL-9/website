import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrderProvider } from './context';
import { Home, About, Events, Merchandise, AdminLogin, AdminDashboard } from './pages';
import { ProtectedRoute } from './components/common';

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
            path="/admin/dashboard/*"
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
