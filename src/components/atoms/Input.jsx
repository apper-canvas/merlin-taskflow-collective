import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, className, ...props }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${className || ''}`}
      {...props}
    />
  );
};

export default Input;