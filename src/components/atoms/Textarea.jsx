import React from 'react';

const Textarea = ({ value, onChange, placeholder, className, rows = 3, ...props }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none ${className || ''}`}
      {...props}
    />
  );
};

export default Textarea;