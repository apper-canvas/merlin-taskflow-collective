import React from 'react';

const Textarea = ({ value, onChange, placeholder, error, className, rows = 3, ...props }) => {
const baseClasses = "w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200 resize-none text-sm font-medium placeholder:text-gray-400 shadow-sm hover:shadow-md";
  const normalClasses = "border-gray-200 bg-white hover:border-gray-300 focus:bg-white";
  const errorClasses = "border-red-300 focus:ring-red-500/20 bg-red-50 focus:border-red-500";
  
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className || ''}`}
      {...props}
    />
  );
};

export default Textarea;