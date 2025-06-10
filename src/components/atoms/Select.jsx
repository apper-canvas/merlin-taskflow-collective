import React from 'react';

const Select = ({ value, onChange, children, error, className, ...props }) => {
const baseClasses = "px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 w-full text-sm font-medium shadow-sm hover:shadow-md cursor-pointer";
  const normalClasses = "border-gray-200 bg-white hover:border-gray-300 focus:bg-white";
  const errorClasses = "border-red-300 focus:ring-red-500/20 bg-red-50 focus:border-red-500";
  
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