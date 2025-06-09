import React from 'react';

const Select = ({ value, onChange, children, error, className, ...props }) => {
  const baseClasses = "px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all w-full";
  const normalClasses = "border-gray-300 focus:ring-primary";
  const errorClasses = "border-red-300 focus:ring-red-500 bg-red-50";
  
  return (
    <select
      value={value}
      onChange={onChange}
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;