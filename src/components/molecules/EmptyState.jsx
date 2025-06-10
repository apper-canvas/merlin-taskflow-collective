import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({
  iconName,
  title,
  description,
  buttonText,
  onButtonClick,
  showButton = false,
  className,
}) => {
  return (
<motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`text-center py-16 px-8 ${className || ''}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="mb-6"
      >
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-soft">
          <ApperIcon name={iconName} className="w-10 h-10 text-slate-400" />
        </div>
      </motion.div>
      <h3 className="text-xl font-display font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed max-w-sm mx-auto">{description}</p>
      {showButton && (
        <Button
          onClick={onButtonClick}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 font-semibold"
        >
          {buttonText}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;