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
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`text-center py-12 ${className || ''}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <ApperIcon name={iconName} className="w-16 h-16 text-gray-300 mx-auto" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-gray-500">{description}</p>
      {showButton && (
        <Button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onButtonClick}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow-sm"
        >
          {buttonText}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;