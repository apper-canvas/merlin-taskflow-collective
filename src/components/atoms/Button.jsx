import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  onClick, 
  children, 
  className, 
  whileHover = { scale: 1.02 }, 
  whileTap = { scale: 0.98 }, 
  type = 'button', 
  disabled = false,
  ...props 
}) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium text-sm
    transition-all duration-200 ease-smooth
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    select-none relative overflow-hidden
  `;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${className || ''}`}
      whileHover={!disabled ? whileHover : undefined}
      whileTap={!disabled ? whileTap : undefined}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;