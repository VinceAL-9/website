import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { OrderProvider } from './context';
import { Home, About, Events, Merchandise } from './pages';

function App() {
  return (
    <OrderProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/merchandise" element={<Merchandise />} />
        </Routes>
      </Router>
    </OrderProvider>
  );
}

export default App;
