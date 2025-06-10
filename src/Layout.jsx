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
<div className="h-screen flex flex-col overflow-hidden bg-slate-50/50">
      {/* Mobile Header */}
      <header className="flex-shrink-0 h-16 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 flex items-center justify-between px-4 lg:hidden z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
            <ApperIcon name="CheckSquare" className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-display font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            WorkItemFlow
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-5 h-5 text-slate-600" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white/95 backdrop-blur-lg border-r border-slate-200/60 flex-col z-40 shadow-smooth">
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                <ApperIcon name="CheckSquare" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                WorkItemFlow
              </span>
            </div>
          </div>
          
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {routeArray.map((route) => (
                <NavLink
                  key={route.id}
                  to={route.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 transform scale-[1.02]'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 hover:scale-[1.02] hover:shadow-sm'
}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <ApperIcon name={route.icon} className={`w-5 h-5 transition-transform ${!isActive ? 'group-hover:scale-110' : ''}`} />
                      <span className="font-medium">{route.label}</span>
                    </>
                  )}
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
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={closeMobileMenu}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="fixed top-16 left-0 bottom-0 w-64 bg-white/95 backdrop-blur-lg border-r border-slate-200/60 z-50 lg:hidden shadow-large"
              >
                <nav className="p-4">
                  <div className="space-y-1">
                    {routeArray.map((route) => (
                      <NavLink
                        key={route.id}
                        to={route.path}
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                            isActive
                              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                              : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 hover:scale-[1.02]'
}`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <ApperIcon name={route.icon} className={`w-5 h-5 transition-transform ${!isActive ? 'group-hover:scale-110' : ''}`} />
                            <span className="font-medium">{route.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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