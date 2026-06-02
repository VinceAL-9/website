import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt, FaUser, FaShoppingBag } from 'react-icons/fa';
import { useUserAuth } from '../../context';

interface NavLink {
  path: string;
  label: string;
}

const navLinks: NavLink[] = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/events', label: 'Events' },
  { path: '/merchandise', label: 'Merchandise' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useUserAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-psse-dark/95 backdrop-blur-sm border-b border-psse-light/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <img
              src="/images/psse-icon.ico"
              alt="PSSE Logo"
              className="w-8 h-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="sr-only">PSSE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? 'bg-psse-accent/20 text-psse-accent'
                    : 'text-gray-300 hover:bg-psse-light/30 hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* User Info & Logout */}
            {isAuthenticated && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-psse-light/30">
                <div className="flex items-center gap-2 text-gray-300 min-w-0">
                  <FaUser className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate max-w-[150px]">{user?.name}</span>
                </div>
                <Link
                  to="/user/transactions"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-psse-accent/20 hover:text-psse-accent transition-all duration-200"
                >
                  <FaShoppingBag className="w-4 h-4 flex-shrink-0" />
                  <span>My Orders</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                  aria-label="Logout"
                >
                  <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-psse-light/30 hover:text-white transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out
            ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive(link.path)
                    ? 'bg-psse-accent/20 text-psse-accent'
                    : 'text-gray-300 hover:bg-psse-light/30 hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile User Info & Logout */}
            {isAuthenticated && (
              <div className="pt-3 mt-3 border-t border-psse-light/30">
                <div className="flex items-center gap-2 px-4 py-2 text-gray-300 min-w-0">
                  <FaUser className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{user?.name}</span>
                </div>
                <Link
                  to="/user/transactions"
                  onClick={closeMenu}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-psse-accent/20 hover:text-psse-accent transition-all duration-200"
                >
                  <FaShoppingBag className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
