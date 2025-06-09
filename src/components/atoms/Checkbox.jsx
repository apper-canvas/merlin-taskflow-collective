import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Checkbox = ({ checked, onChange, className, ...props }) => {
  return (
    <label className={`relative flex items-center justify-center cursor-pointer ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden" // Hide native checkbox
        {...props}
      />
      <div className={`
        w-5 h-5 rounded-full border-2 transition-all duration-200 ease-in-out
        ${checked ? 'bg-success border-success' : 'bg-white border-gray-300'}
        flex items-center justify-center
      `}>
        {checked && <ApperIcon name="Check" className="w-3 h-3 text-white" />}
      </div>
    </label>
  );
};

export default Checkbox;