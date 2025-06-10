import React from 'react';
import { motion } from 'framer-motion';

const Spinner = ({ message = 'Loading...', count = 5, size = 'default' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (size !== 'default') {
    return (
      <div className="flex items-center justify-center">
        <div className={`
          ${sizeClasses[size]} border-2 border-slate-200 border-t-primary-500 
          rounded-full animate-spin
        `} />
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl w-1/4 mb-6 animate-pulse"></div>
      <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-soft border border-slate-100"
          >
            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-3/4 mb-3 animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-1/2 animate-pulse"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Spinner;