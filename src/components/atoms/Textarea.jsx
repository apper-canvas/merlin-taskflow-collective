import React from 'react';

const Textarea = ({ value, onChange, placeholder, error, className, rows = 3, ...props }) => {
  const baseClasses = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all resize-none";
  const normalClasses = "border-gray-300 focus:ring-primary";
  const errorClasses = "border-red-300 focus:ring-red-500 bg-red-50";
  
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