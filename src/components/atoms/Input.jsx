import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, error, className, ...props }) => {
  const baseClasses = "px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all w-full";
  const normalClasses = "border-gray-300 focus:ring-primary";
  const errorClasses = "border-red-300 focus:ring-red-500 bg-red-50";
  
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className || ''}`}
      {...props}
    />
  );
};

export default Input;