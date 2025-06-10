import React from 'react';
import ApperIcon from '@/components/ApperIcon';

const Checkbox = ({ checked, onChange, className, ...props }) => {
  return (
<label className={`relative flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden" // Hide native checkbox
        {...props}
      />
      <div className={`
        w-5 h-5 rounded-md border-2 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md
        ${checked ? 'bg-primary border-primary scale-110' : 'bg-white border-gray-300 hover:border-gray-400'}
        flex items-center justify-center
      `}>
        {checked && <ApperIcon name="Check" className="w-3 h-3 text-white" />}
      </div>
    </label>
  );
};

export default Checkbox;