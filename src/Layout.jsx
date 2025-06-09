import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from './components/ApperIcon';
import { routeArray } from './config/routes';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Mobile Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:hidden z-40">
        <div className="flex items-center space-x-3">
          <ApperIcon name="CheckSquare" className="w-8 h-8 text-primary" />
          <span className="text-xl font-display font-bold text-gray-900">TaskFlow</span>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col z-40">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <ApperIcon name="CheckSquare" className="w-8 h-8 text-primary" />
              <span className="text-xl font-display font-bold text-gray-900">TaskFlow</span>
            </div>
          </div>
          
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {routeArray.map((route) => (
                <NavLink
                  key={route.id}
                  to={route.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-surface hover:text-gray-900'
                    }`
                  }
                >
                  <ApperIcon name={route.icon} className="w-5 h-5" />
                  <span>{route.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={closeMobileMenu}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 lg:hidden"
              >
                <nav className="p-4">
                  <div className="space-y-2">
                    {routeArray.map((route) => (
                      <NavLink
                        key={route.id}
                        to={route.path}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            isActive
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-surface hover:text-gray-900'
                          }`
                        }
                      >
                        <ApperIcon name={route.icon} className="w-5 h-5" />
                        <span>{route.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default Layout;