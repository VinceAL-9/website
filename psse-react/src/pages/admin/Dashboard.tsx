import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaShoppingCart, FaUsers, FaSignOutAlt, FaBox } from 'react-icons/fa';
import { useUserAuth } from '../../context';
import { EventsView } from './events';
import { OrdersView } from './orders';
import { OfficersView } from './officers';
import { ProductsView } from './products';

type AdminView = 'events' | 'orders' | 'officers' | 'products';

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useUserAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentView: AdminView = (() => {
    const path = location.pathname;
    if (path.includes('orders')) return 'orders';
    if (path.includes('officers')) return 'officers';
    if (path.includes('products')) return 'products';
    return 'events';
  })();

  const navItems = [
    { id: 'events' as AdminView, label: 'Manage Events', icon: FaCalendarAlt },
    { id: 'orders' as AdminView, label: 'View Orders', icon: FaShoppingCart },
    { id: 'officers' as AdminView, label: 'Update Officers', icon: FaUsers },
    { id: 'products' as AdminView, label: 'Manage Products', icon: FaBox },
  ];

  const handleLogout = () => { logout(); navigate('/admin/login'); };
  const handleViewChange = (view: AdminView) => navigate(`/admin/dashboard/${view}`);

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-psse-primary text-white transition-all duration-300 flex flex-col h-full`}>
        <div className="p-4 border-b border-psse-light"><h1 className={`font-bold ${sidebarOpen ? 'text-xl' : 'text-sm text-center'}`}>{sidebarOpen ? 'PSSE Admin' : 'PSSE'}</h1></div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => handleViewChange(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === item.id ? 'bg-psse-accent text-white' : 'text-gray-200 hover:bg-psse-light'}`}>
              <item.icon className="text-lg shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-psse-light space-y-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full px-4 py-2 text-sm text-gray-200 hover:bg-psse-light rounded-lg">{sidebarOpen ? '← Collapse' : '→'}</button>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"><FaSignOutAlt />{sidebarOpen && <span>Logout</span>}</button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 px-8 overflow-y-auto">
          {currentView === 'events' && <EventsView />}
          {currentView === 'orders' && <OrdersView />}
          {currentView === 'officers' && <OfficersView />}
          {currentView === 'products' && <ProductsView />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
