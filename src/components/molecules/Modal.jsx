import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, children, contentClassName, backdropClassName, zIndex = 50 }) => {
return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm ${backdropClassName || ''}`}
            style={{ zIndex: zIndex }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1],
              type: "spring",
              damping: 20,
              stiffness: 300
            }}
            className={`fixed inset-0 flex items-center justify-center p-4 pointer-events-none ${contentClassName || ''}`}
            style={{ zIndex: zIndex }}
          >
            <div className="pointer-events-auto max-h-[90vh] overflow-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;