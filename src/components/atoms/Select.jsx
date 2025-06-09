import React from 'react';

const Select = ({ value, onChange, children, className, ...props }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  );
};

export default Select;